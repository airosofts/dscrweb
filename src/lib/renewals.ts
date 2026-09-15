/**
 * Renewal offers — the "when did that expire?" fix.
 *
 * A paid placement (ad_subscriptions row) carries starts_at / ends_at. When a
 * subscription enters the RENEWAL_LEAD_DAYS window before ends_at, the
 * processor:
 *   1. creates a renewal offer: a pending ad_subscriptions row (same plan and
 *      geo, RENEWAL_DISCOUNT_PCT off, creative copied over) plus a Stripe
 *      payment link whose PaymentIntent metadata points at that row — so the
 *      existing Stripe webhook flips it to `paid` with no extra plumbing;
 *   2. schedules the default `renewal_offer` email sequence (recap + offer).
 *
 * The same helpers back the admin "Send renewal offer now" button via
 * /api/renewals/offer, so a manual send and an automatic one are identical.
 */

import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { PUBLIC_SITE_URL } from "@/lib/resend";
import { scheduleSubscriptionSequence } from "@/lib/pipeline";

export const RENEWAL_DISCOUNT_PCT = clampPct(Number(process.env.RENEWAL_DISCOUNT_PCT ?? 25));
export const RENEWAL_LEAD_DAYS = Math.max(0, Number(process.env.RENEWAL_LEAD_DAYS ?? 7) || 7);

/** Statuses that mean "this customer paid and the placement ran (or is running)". */
export const RENEWAL_ELIGIBLE_STATUSES = ["paid", "active", "creative_submitted", "completed"] as const;
/** Statuses on the RENEWAL row that mean the customer took the offer. */
export const RENEWAL_PAID_STATUSES = ["paid", "active", "creative_submitted", "completed"] as const;

function clampPct(n: number) {
  if (!Number.isFinite(n)) return 25;
  return Math.min(90, Math.max(0, Math.round(n)));
}

export type PlanRef = { id?: string; name: string; placement: string; duration_months: number } | null;

export type RenewableSubscription = {
  id: string;
  email: string;
  contact_name: string | null;
  company_name: string | null;
  phone: string | null;
  plan_id: string;
  geo_targeting: string;
  price_cents: number;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  creative_url: string | null;
  creative_notes: string | null;
  creative_submitted_at: string | null;
  reminder_stopped_at: string | null;
  renewal_seq_started_at: string | null;
  renewal_offer_url: string | null;
  renewal_price_cents: number | null;
  renewal_subscription_id: string | null;
  ad_plans?: PlanRef;
};

export const RENEWABLE_COLUMNS = `id, email, contact_name, company_name, phone, plan_id, geo_targeting,
  price_cents, status, starts_at, ends_at, creative_url, creative_notes, creative_submitted_at,
  reminder_stopped_at, renewal_seq_started_at, renewal_offer_url, renewal_price_cents,
  renewal_subscription_id, ad_plans(id, name, placement, duration_months)`;

/* ─── Formatting ────────────────────────────────────────────────────────── */

export function fmtUsd(cents: number): string {
  return "$" + Math.round(cents / 100).toLocaleString("en-US");
}

/** "Aug 19, 2026" from a date or ISO string. */
export function fmtLongDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d.length === 10 ? `${d}T12:00:00Z` : d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Whole days from today (UTC) until a YYYY-MM-DD date; negative if past. */
export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  const t0 = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return Math.round((Date.UTC(y, m - 1, d) - t0) / 86_400_000);
}

/** Discounted price, rounded down to the nearest $10 so it reads cleanly. */
export function renewalPriceCents(priceCents: number, pct: number = RENEWAL_DISCOUNT_PCT): number {
  const raw = (priceCents * (100 - pct)) / 100;
  return Math.max(0, Math.floor(raw / 1000) * 1000);
}

/* ─── Performance stats for a placement ─────────────────────────────────── */

export type PlacementStats = { impressions: number; totalClicks: number; uniqueClicks: number };

/**
 * ad_subscriptions has no FK to the ads that ran, so we join on what we have:
 *   subscription.email → advertisers.email → banner_ads / popup_ads
 *     → ad_impressions (by ad id) and tracked_links (by the /r/<code> in click_url)
 * plus any /r/<code> link in the customer's creative_submissions.landing_url.
 * Anything we can't resolve just contributes 0 — the email still goes out.
 */
export async function getPlacementStats(sub: { id: string; email: string }): Promise<PlacementStats> {
  const stats: PlacementStats = { impressions: 0, totalClicks: 0, uniqueClicks: 0 };
  try {
    const { data: advertisers } = await supabaseAdmin
      .from("advertisers")
      .select("id")
      .ilike("email", sub.email.trim());
    const advertiserIds = (advertisers ?? []).map((a) => a.id as string);

    const adIds: string[] = [];
    const clickUrls: string[] = [];
    if (advertiserIds.length > 0) {
      const [{ data: banners }, { data: popups }] = await Promise.all([
        supabaseAdmin.from("banner_ads").select("id, click_url").in("advertiser_id", advertiserIds),
        supabaseAdmin.from("popup_ads").select("id, click_url").in("advertiser_id", advertiserIds),
      ]);
      for (const ad of [...(banners ?? []), ...(popups ?? [])]) {
        adIds.push(ad.id as string);
        if (ad.click_url) clickUrls.push(ad.click_url as string);
      }
    }

    const { data: creatives } = await supabaseAdmin
      .from("creative_submissions")
      .select("landing_url")
      .eq("subscription_id", sub.id)
      .not("landing_url", "is", null);
    for (const c of creatives ?? []) if (c.landing_url) clickUrls.push(c.landing_url as string);

    if (adIds.length > 0) {
      const { count } = await supabaseAdmin
        .from("ad_impressions")
        .select("id", { count: "exact", head: true })
        .in("ad_id", adIds);
      stats.impressions = count ?? 0;
    }

    const codes = Array.from(
      new Set(
        clickUrls
          .map((u) => /\/r\/([a-z0-9]+)/i.exec(u)?.[1] ?? null)
          .filter((c): c is string => !!c),
      ),
    );
    if (codes.length > 0) {
      const { data: links } = await supabaseAdmin
        .from("tracked_link_stats")
        .select("code, total_clicks, unique_visitors")
        .in("code", codes);
      for (const l of links ?? []) {
        stats.totalClicks += Number(l.total_clicks ?? 0);
        stats.uniqueClicks += Number(l.unique_visitors ?? 0);
      }
    }
  } catch (err) {
    console.error("[renewals] stats lookup failed:", err);
  }
  return stats;
}

/* ─── Renewal state ─────────────────────────────────────────────────────── */

/** True once a renewal row pointing back at `originalId` has been paid. */
export async function isRenewalPaid(originalId: string): Promise<boolean> {
  const { count } = await supabaseAdmin
    .from("ad_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("renews_subscription_id", originalId)
    .in("status", [...RENEWAL_PAID_STATUSES]);
  return (count ?? 0) > 0;
}

async function loadPlan(sub: RenewableSubscription): Promise<PlanRef> {
  if (sub.ad_plans) return sub.ad_plans;
  const { data } = await supabaseAdmin
    .from("ad_plans")
    .select("id, name, placement, duration_months")
    .eq("id", sub.plan_id)
    .maybeSingle();
  return (data as PlanRef) ?? null;
}

export type RenewalOffer = { renewalSubscriptionId: string; url: string; priceCents: number };

/**
 * Create (or return the existing) renewal offer for a subscription:
 * pending renewal row + Stripe payment link. Idempotent per original.
 */
export async function createRenewalOffer(sub: RenewableSubscription): Promise<RenewalOffer | null> {
  if (sub.renewal_offer_url && sub.renewal_subscription_id) {
    return {
      renewalSubscriptionId: sub.renewal_subscription_id,
      url: sub.renewal_offer_url,
      priceCents: sub.renewal_price_cents ?? renewalPriceCents(sub.price_cents),
    };
  }

  const plan = await loadPlan(sub);
  if (!plan) {
    console.error(`[renewals] plan ${sub.plan_id} not found for sub ${sub.id}`);
    return null;
  }
  const priceCents = renewalPriceCents(sub.price_cents);
  if (priceCents <= 0) return null;

  const nowISO = new Date().toISOString();
  const hasCreative = !!(sub.creative_url || sub.creative_submitted_at);

  // 1. Pending renewal row. Creative is carried over so the creative_pending
  //    reminder sequence doesn't fire when the renewal is paid.
  const { data: renewal, error: insErr } = await supabaseAdmin
    .from("ad_subscriptions")
    .insert({
      email: sub.email,
      company_name: sub.company_name,
      contact_name: sub.contact_name,
      phone: sub.phone,
      plan_id: sub.plan_id,
      geo_targeting: sub.geo_targeting,
      price_cents: priceCents,
      status: "pending",
      submission_token: crypto.randomUUID(),
      renews_subscription_id: sub.id,
      creative_url: sub.creative_url,
      creative_submitted_at: hasCreative ? nowISO : null,
      creative_notes: hasCreative
        ? `Renewal of ${sub.id} — re-uses the existing approved creative and tracked link. No new upload needed.`
        : null,
      admin_notes: `RENEWAL OFFER (auto) ${nowISO.slice(0, 10)}: ${RENEWAL_DISCOUNT_PCT}% off ${plan.name} ` +
        `(${fmtUsd(priceCents)} vs ${fmtUsd(sub.price_cents)}). Renews ${sub.id}` +
        (sub.ends_at ? `, which ends ${sub.ends_at}.` : "."),
    })
    .select("id")
    .single();
  if (insErr || !renewal) {
    console.error("[renewals] renewal row insert failed:", insErr);
    return null;
  }

  // 2. Stripe price + payment link. metadata.subscription_id is what the
  //    payment_intent.succeeded webhook keys on.
  let url: string;
  try {
    const stripe = getStripe();
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: priceCents,
      product_data: {
        name: `${plan.name} - ${plan.placement}, ${plan.duration_months}-month renewal (${RENEWAL_DISCOUNT_PCT}% off)`,
        metadata: { plan_id: sub.plan_id, kind: "renewal" },
      },
    });
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      payment_intent_data: {
        description: `${plan.name} - ${plan.placement} (${plan.duration_months}mo, ${sub.geo_targeting}) - renewal, ${RENEWAL_DISCOUNT_PCT}% off`,
        metadata: {
          subscription_id: renewal.id,
          plan_id: sub.plan_id,
          geo: sub.geo_targeting,
          renewal_of: sub.id,
        },
      },
      metadata: { subscription_id: renewal.id, kind: "renewal", customer: sub.company_name ?? sub.email },
      after_completion: { type: "redirect", redirect: { url: `${PUBLIC_SITE_URL}/payment-success?renewal=1` } },
    });
    url = link.url;
  } catch (err) {
    console.error("[renewals] Stripe payment link failed:", err);
    // Don't leave a dangling pending row behind.
    await supabaseAdmin.from("ad_subscriptions").delete().eq("id", renewal.id).eq("status", "pending");
    return null;
  }

  // 3. Record the offer on both rows.
  await Promise.all([
    supabaseAdmin
      .from("ad_subscriptions")
      .update({
        renewal_offer_url: url,
        renewal_price_cents: priceCents,
        renewal_subscription_id: renewal.id,
      })
      .eq("id", sub.id),
    supabaseAdmin
      .from("ad_subscriptions")
      .update({ admin_notes: `Payment link: ${url}` })
      .eq("id", renewal.id),
  ]);

  return { renewalSubscriptionId: renewal.id, url, priceCents };
}

/* ─── Scheduling ────────────────────────────────────────────────────────── */

export type ScheduleOfferResult = { scheduled: number; offer: RenewalOffer | null; error?: string };

/**
 * Create the offer and queue the renewal_offer sequence for one subscription.
 * `firstStepImmediate` makes step 1 due now (admin "send now"); otherwise the
 * sequence's own delays apply (step 1 of the default sequence has delay 0
 * anyway, so it goes out on the next processor tick).
 */
export async function scheduleRenewalOffer(
  sub: RenewableSubscription,
  options?: { firstStepImmediate?: boolean; resend?: boolean },
): Promise<ScheduleOfferResult> {
  if (!sub.email) return { scheduled: 0, offer: null, error: "Subscription has no email" };
  if (sub.reminder_stopped_at) return { scheduled: 0, offer: null, error: "Reminders are stopped for this customer" };
  if (!(RENEWAL_ELIGIBLE_STATUSES as readonly string[]).includes(sub.status)) {
    return { scheduled: 0, offer: null, error: `Status "${sub.status}" is not renewable` };
  }
  if (await isRenewalPaid(sub.id)) return { scheduled: 0, offer: null, error: "Already renewed" };

  const offer = await createRenewalOffer(sub);
  if (!offer) return { scheduled: 0, offer: null, error: "Could not create the Stripe payment link" };

  if (options?.resend) {
    // Admin re-send: clear anything still queued so we don't double up.
    await supabaseAdmin
      .from("pipeline_emails")
      .update({ status: "cancelled", cancel_reason: "Renewal offer re-sent by admin" })
      .eq("subscription_id", sub.id)
      .eq("status", "scheduled");
  }

  const { scheduled } = await scheduleSubscriptionSequence(
    { id: sub.id, email: sub.email, contact_name: sub.contact_name },
    "renewal_offer",
    { firstStepImmediate: options?.firstStepImmediate },
  );
  if (scheduled === 0) {
    // Sequence missing/inactive — still stamp so we don't retry every minute,
    // and surface it in the log.
    await supabaseAdmin
      .from("ad_subscriptions")
      .update({ renewal_seq_started_at: new Date().toISOString() })
      .eq("id", sub.id);
    return { scheduled: 0, offer, error: "No active default renewal_offer sequence" };
  }
  return { scheduled, offer };
}

/**
 * Processor sweep: every eligible subscription whose ends_at is within the
 * lead window (and not more than 30 days past — older lapses are stale and
 * were stamped by the migration) gets an offer scheduled once.
 */
export async function scheduleRenewalOffers(): Promise<number> {
  const today = new Date();
  const upper = new Date(today.getTime() + RENEWAL_LEAD_DAYS * 86_400_000).toISOString().slice(0, 10);
  const lower = new Date(today.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);

  const { data: subs, error } = await supabaseAdmin
    .from("ad_subscriptions")
    .select(RENEWABLE_COLUMNS)
    .in("status", [...RENEWAL_ELIGIBLE_STATUSES])
    .is("renewal_seq_started_at", null)
    .is("reminder_stopped_at", null)
    .is("renews_subscription_id", null) // a renewal row gets its own offer only via its own ends_at later
    .not("ends_at", "is", null)
    .gte("ends_at", lower)
    .lte("ends_at", upper)
    .limit(25);
  if (error) {
    console.error("[renewals] sweep query failed:", error);
    return 0;
  }

  let count = 0;
  for (const sub of (subs ?? []) as unknown as RenewableSubscription[]) {
    const res = await scheduleRenewalOffer(sub);
    if (res.scheduled > 0) count++;
    else if (res.error) console.warn(`[renewals] ${sub.id}: ${res.error}`);
  }
  return count;
}

/**
 * Processor sweep: placements past their ends_at become `completed` so the
 * admin list never shows an "Active" campaign that actually ended.
 */
export async function sweepExpiredSubscriptions(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from("ad_subscriptions")
    .update({ status: "completed", expired_at: new Date().toISOString() })
    .in("status", ["active", "creative_submitted"])
    .not("ends_at", "is", null)
    .lt("ends_at", today)
    .select("id");
  if (error) {
    console.error("[renewals] expiry sweep failed:", error);
    return 0;
  }
  return data?.length ?? 0;
}

/** Called by the Stripe webhook when a renewal row is paid. */
export async function onRenewalPaid(renewalId: string, originalId: string): Promise<void> {
  await Promise.all([
    // Stop any remaining offer emails to the original subscription.
    supabaseAdmin
      .from("pipeline_emails")
      .update({ status: "cancelled", cancel_reason: "Renewal paid" })
      .eq("subscription_id", originalId)
      .eq("status", "scheduled"),
    // The original is done; the renewal row is the live one now.
    supabaseAdmin
      .from("ad_subscriptions")
      .update({ renewal_subscription_id: renewalId })
      .eq("id", originalId),
  ]);
}
