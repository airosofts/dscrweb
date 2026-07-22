import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { clientIp, geolocate } from "@/lib/geo";

/**
 * POST /api/track/engagement — on-site engagement summary for one visit.
 *
 * The client sends its full cumulative snapshot (via sendBeacon on heartbeat
 * and on exit); we upsert by session_key so the row always reflects the
 * latest state. Attributed to the clicked email (et) and/or pipeline lead (rid).
 *
 * body: { session_key, et?, rid?, path?, active_seconds, scroll_pct,
 *         sections?, form_started?, form_last_field?, submitted? }
 */

const UUID_RE = /^[a-f0-9-]{20,}$/i;

export async function POST(request: NextRequest) {
  try {
    const b = await request.json().catch(() => ({} as Record<string, unknown>));
    const sessionKey = String(b.session_key ?? "").slice(0, 80);
    if (!sessionKey) return Response.json({ ok: false });

    const et = typeof b.et === "string" && UUID_RE.test(b.et) ? b.et : null;
    const rid = typeof b.rid === "string" && UUID_RE.test(b.rid) ? b.rid : null;

    // Geo/IP only needs resolving once per session; cheap + cached.
    const ip = clientIp(request.headers);
    const geo = ip ? await geolocate(ip) : null;

    const row = {
      session_key: sessionKey,
      source_email_id: et,
      advertising_request_id: rid,
      path: typeof b.path === "string" ? b.path.slice(0, 300) : null,
      active_seconds: Math.max(0, Math.min(86_400, Number(b.active_seconds) || 0)),
      scroll_pct: Math.max(0, Math.min(100, Number(b.scroll_pct) || 0)),
      sections: (b.sections && typeof b.sections === "object") ? b.sections : null,
      form_started: b.form_started === true,
      form_last_field: typeof b.form_last_field === "string" ? b.form_last_field.slice(0, 60) : null,
      submitted: b.submitted === true,
      ip: ip ?? null,
      country: geo?.country ?? null,
      region: geo?.region ?? null,
      city: geo?.city ?? null,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      updated_at: new Date().toISOString(),
    };

    await supabaseAdmin
      .from("engagement_sessions")
      .upsert(row, { onConflict: "session_key" });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
