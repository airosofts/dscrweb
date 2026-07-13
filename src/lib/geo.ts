/**
 * IP → location resolution, shared by /api/geo (mobile app) and
 * /api/track/visit (website visitors).
 *
 * Providers are tried in order; results are cached per IP so repeat
 * requests from the same address don't burn lookup quota.
 */

export type Geo = { ip: string; country: string | null; region: string | null; city: string | null };

const cache = new Map<string, { geo: Geo; at: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 5000;

export function clientIp(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip");
}

async function lookup(ip: string): Promise<Geo> {
  // Provider 1: ipwho.is
  try {
    const res = await fetch(`https://ipwho.is/${ip}`, { signal: AbortSignal.timeout(3000) });
    const d = await res.json();
    if (d?.success !== false && (d.country || d.region)) {
      return { ip, country: d.country ?? null, region: d.region ?? null, city: d.city ?? null };
    }
  } catch { /* fall through */ }

  // Provider 2: ip-api.com
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(3000),
    });
    const d = await res.json();
    if (d?.status === "success") {
      return { ip, country: d.country ?? null, region: d.regionName ?? null, city: d.city ?? null };
    }
  } catch { /* fall through */ }

  return { ip, country: null, region: null, city: null };
}

export async function geolocate(ip: string): Promise<Geo> {
  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.geo;

  const geo = await lookup(ip);
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(ip, { geo, at: Date.now() });
  return geo;
}
