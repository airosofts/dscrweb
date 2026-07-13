import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { clientIp, geolocate } from "@/lib/geo";

/**
 * POST /api/track/visit — record a website visit with IP-derived location.
 * Fired once per browser session by the VisitTracker component.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const ip = clientIp(request.headers);
    const geo = ip ? await geolocate(ip) : null;

    await supabaseAdmin.from("site_visits").insert({
      ip,
      country: geo?.country ?? null,
      region: geo?.region ?? null,
      city: geo?.city ?? null,
      path: typeof body.path === "string" ? body.path.slice(0, 500) : null,
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null,
      user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
    });

    return Response.json({ ok: true });
  } catch {
    // Analytics must never surface errors to visitors.
    return Response.json({ ok: false });
  }
}
