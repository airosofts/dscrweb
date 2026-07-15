import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { recordEvent, type Attribution } from "@/lib/journey";

/**
 * POST /api/track/journey — behavioral beacons from the website.
 * body: { type: 'pricing_viewed' | 'checkout_started', rid, source, meta? }
 *   source 'link'   → rid came from the email link URL     (certain)
 *   source 'stored' → rid came from the browser's storage  (strong)
 */
const TYPES = new Set(["pricing_viewed", "checkout_started"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const type = String(body.type ?? "");
    const rid = String(body.rid ?? "");
    const source = String(body.source ?? "link");
    if (!TYPES.has(type) || !/^[a-f0-9-]{20,}$/i.test(rid)) {
      return Response.json({ ok: false });
    }

    // Only attribute to real leads.
    const { data: lead } = await supabaseAdmin
      .from("advertising_requests")
      .select("id")
      .eq("id", rid)
      .maybeSingle();
    if (!lead) return Response.json({ ok: false });

    const attribution: Attribution = source === "stored" ? "strong" : "certain";
    const meta = typeof body.meta === "object" && body.meta !== null
      ? (body.meta as Record<string, unknown>) : {};

    await recordEvent(rid, type as "pricing_viewed" | "checkout_started", {
      attribution,
      metadata: { ...meta, source },
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
