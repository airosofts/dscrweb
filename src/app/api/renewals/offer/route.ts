import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  RENEWABLE_COLUMNS,
  RENEWAL_DISCOUNT_PCT,
  getPlacementStats,
  scheduleRenewalOffer,
  type RenewableSubscription,
} from "@/lib/renewals";

/**
 * Renewal offer — manual trigger (admin portal "Send renewal offer now").
 *
 * POST /api/renewals/offer
 *   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>   (internal — admin portal)
 *   body: { subscription_id: string }
 *
 * Creates the discounted Stripe payment link (idempotent) and queues the
 * default renewal_offer sequence with step 1 due immediately, so the cron
 * processor sends it within about a minute. Re-sending cancels any renewal
 * emails still queued for that customer first.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = typeof body.subscription_id === "string" ? body.subscription_id : "";
  if (!UUID_RE.test(id)) return Response.json({ error: "subscription_id required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("ad_subscriptions")
    .select(RENEWABLE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "Subscription not found" }, { status: 404 });

  const sub = data as unknown as RenewableSubscription;
  const result = await scheduleRenewalOffer(sub, {
    firstStepImmediate: true,
    resend: !!sub.renewal_seq_started_at,
  });
  if (result.error && result.scheduled === 0) {
    return Response.json({ error: result.error, offer: result.offer }, { status: 400 });
  }

  const stats = await getPlacementStats(sub);
  return Response.json({
    ok: true,
    scheduled: result.scheduled,
    sendsWithin: "~1 minute",
    offer: result.offer,
    discount_pct: RENEWAL_DISCOUNT_PCT,
    stats,
  });
}
