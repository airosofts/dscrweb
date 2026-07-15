import { supabaseAdmin } from "@/lib/supabase";

/**
 * Behavior-driven journey engine.
 *
 * Signals land in journey_events (recordEvent). Each processor tick,
 * evaluateJourneys() looks at every dynamic-mode lead and decides the next
 * email from what the lead actually did — writing an ordinary
 * pipeline_emails row so the existing send/track/admin machinery is reused
 * unchanged.
 *
 * The playbook lives here in code; journey_rules rows only toggle rules
 * on/off and tune wait times (admin "Journey" page).
 */

export type JourneyEventType =
  | "form_submitted" | "email_sent" | "email_delivered" | "email_opened"
  | "email_clicked" | "email_bounced" | "pricing_viewed" | "checkout_started"
  | "paid" | "rule_fired";

export type Attribution = "certain" | "strong" | "probable";

export async function recordEvent(
  advertisingRequestId: string | null,
  eventType: JourneyEventType,
  opts?: { attribution?: Attribution; metadata?: Record<string, unknown> },
): Promise<void> {
  if (!advertisingRequestId) return;
  try {
    await supabaseAdmin.from("journey_events").insert({
      advertising_request_id: advertisingRequestId,
      event_type: eventType,
      attribution: opts?.attribution ?? "certain",
      metadata: opts?.metadata ?? null,
    });
  } catch (err) {
    console.error("[journey] recordEvent failed:", err);
  }
}

/* ─── Playbook ──────────────────────────────────────────────────────────── */

// Behavior rules fire at most once per lead, in priority order, and only on
// certain/strong attribution. The fallback ladder keeps silent leads warm.
const BEHAVIOR_RULES = [
  { key: "checkout_abandoned", template: "checkout-abandon" },
  { key: "sticker_shock",      template: "sticker-shock" },
  { key: "opened_no_click",    template: "opened-no-click" },
  { key: "no_open_resend",     template: "pricing-resend" },
] as const;

// Classic nudges for leads generating no signals at all, sent in order,
// one per fallback_ladder wait period.
const FALLBACK_LADDER = [
  "value-prop-3d", "social-proof-7d", "urgency-14d", "soft-close-28d",
] as const;

const MAX_EMAILS_PER_WEEK = 3;

// Queue sends into a 9:00–18:00 US/Eastern window (13:00–22:00 UTC) so a
// 3 a.m. trigger doesn't fire a 3 a.m. email.
function nextSendTime(now: Date): string {
  const h = now.getUTCHours();
  if (h >= 13 && h < 22) return new Date(now.getTime() - 1000).toISOString();
  const next = new Date(now);
  if (h >= 22) next.setUTCDate(next.getUTCDate() + 1);
  next.setUTCHours(13, 0, 0, 0);
  return next.toISOString();
}

type Rules = Record<string, { enabled: boolean; wait_minutes: number }>;
type Lead = {
  id: string; email: string; contact_person: string; company_name: string;
  unsubscribe_token: string | null; target_states: string[] | null;
  pipeline_stopped_at: string | null;
};

/* ─── Engine ────────────────────────────────────────────────────────────── */

export async function evaluateJourneys(): Promise<{ evaluated: number; queued: number }> {
  const { data: ruleRows } = await supabaseAdmin.from("journey_rules").select("*");
  const rules: Rules = {};
  for (const r of ruleRows ?? []) rules[r.rule_key] = r;

  // Active dynamic leads only.
  const { data: leads } = await supabaseAdmin
    .from("advertising_requests")
    .select("id, email, contact_person, company_name, unsubscribe_token, target_states, pipeline_stopped_at")
    .eq("journey_mode", "dynamic")
    .is("pipeline_stopped_at", null)
    .limit(500);
  if (!leads?.length) return { evaluated: 0, queued: 0 };

  const now = new Date();
  let queued = 0;

  for (const lead of leads as Lead[]) {
    try {
      if (await evaluateLead(lead, rules, now)) queued++;
    } catch (err) {
      console.error(`[journey] evaluate failed for ${lead.id}:`, err);
    }
  }
  return { evaluated: leads.length, queued };
}

async function evaluateLead(lead: Lead, rules: Rules, now: Date): Promise<boolean> {
  // Paid leads are done with marketing (creative reminders handle the rest).
  const { data: paidSub } = await supabaseAdmin
    .from("ad_subscriptions")
    .select("id")
    .eq("advertising_request_id", lead.id)
    .in("status", ["paid", "active", "creative_submitted"])
    .limit(1)
    .maybeSingle();
  if (paidSub) return false;

  // Full email history for this lead.
  const { data: emails } = await supabaseAdmin
    .from("pipeline_emails")
    .select("id, status, sent_at, opened_at, clicked_at, scheduled_for, trigger_reason, email_templates(slug)")
    .eq("advertising_request_id", lead.id)
    .order("created_at", { ascending: true });
  if (!emails?.length) return false;

  // Anything still pending? Then a decision is already queued — wait.
  if (emails.some((e) => ["scheduled", "resend_scheduled", "processing"].includes(e.status))) return false;
  // Hard stops.
  if (emails.some((e) => ["bounced", "failed"].includes(e.status))) return false;

  const sentEmails = emails.filter((e) =>
    ["sent", "delivered", "opened", "clicked"].includes(e.status) && (e.sent_at || e.scheduled_for));
  if (!sentEmails.length) return false; // first email not out yet

  // Frequency cap.
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const sentThisWeek = sentEmails.filter(
    (e) => new Date(e.sent_at ?? e.scheduled_for).getTime() > weekAgo).length;
  if (sentThisWeek >= MAX_EMAILS_PER_WEEK) return false;

  const firedRules = new Set(
    emails.map((e) => e.trigger_reason?.split(":")[0]).filter(Boolean) as string[]);

  const lastSent = sentEmails[sentEmails.length - 1];
  const lastSentAt = new Date(lastSent.sent_at ?? lastSent.scheduled_for).getTime();
  const anyOpened = sentEmails.some((e) => e.opened_at);
  const anyClicked = sentEmails.some((e) => e.clicked_at);

  // Behavioral signals (certain/strong only — never act on IP guesses).
  const { data: events } = await supabaseAdmin
    .from("journey_events")
    .select("event_type, attribution, created_at")
    .eq("advertising_request_id", lead.id)
    .in("event_type", ["pricing_viewed", "checkout_started", "paid"])
    .in("attribution", ["certain", "strong"])
    .order("created_at", { ascending: true });
  const firstOf = (t: string) => events?.find((e) => e.event_type === t)?.created_at ?? null;
  const pricingViewedAt = firstOf("pricing_viewed") ??
    sentEmails.find((e) => e.clicked_at)?.clicked_at ?? null; // a click IS a pricing view
  const checkoutStartedAt = firstOf("checkout_started");

  const olderThan = (iso: string | null, minutes: number) =>
    iso != null && now.getTime() - new Date(iso).getTime() > minutes * 60_000;

  // ── Behavior rules, priority order, once each ──
  for (const rule of BEHAVIOR_RULES) {
    const cfg = rules[rule.key];
    if (!cfg?.enabled || firedRules.has(rule.key)) continue;

    let fire = false;
    let detail = "";
    switch (rule.key) {
      case "checkout_abandoned":
        fire = !!checkoutStartedAt && olderThan(checkoutStartedAt, cfg.wait_minutes);
        detail = "started checkout but didn't complete payment";
        break;
      case "sticker_shock":
        fire = !checkoutStartedAt && !!pricingViewedAt && olderThan(pricingViewedAt, cfg.wait_minutes);
        detail = "viewed pricing but didn't start checkout";
        break;
      case "opened_no_click":
        fire = anyOpened && !anyClicked && !pricingViewedAt &&
          olderThan(sentEmails.find((e) => e.opened_at)?.opened_at ?? null, cfg.wait_minutes);
        detail = "opened the email but never clicked the link";
        break;
      case "no_open_resend":
        fire = !anyOpened && !anyClicked && sentEmails.length === 1 &&
          olderThan(lastSent.sent_at ?? lastSent.scheduled_for, cfg.wait_minutes);
        detail = "first email never opened";
        break;
    }
    if (fire) {
      return queueEmail(lead, rule.template, `${rule.key}: ${detail}`, now);
    }
  }

  // ── Fallback ladder for silent leads ──
  const ladder = rules["fallback_ladder"];
  if (ladder?.enabled && now.getTime() - lastSentAt > ladder.wait_minutes * 60_000) {
    const sentSlugs = new Set(emails.map((e) =>
      (e.email_templates as { slug?: string } | null)?.slug).filter(Boolean));
    const next = FALLBACK_LADDER.find((slug) => !sentSlugs.has(slug));
    if (next) {
      return queueEmail(lead, next, "fallback_ladder: no engagement signals — classic follow-up", now);
    }
  }

  return false;
}

async function queueEmail(lead: Lead, templateSlug: string, reason: string, now: Date): Promise<boolean> {
  const { data: tpl } = await supabaseAdmin
    .from("email_templates")
    .select("id")
    .eq("slug", templateSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (!tpl) {
    console.error(`[journey] template missing: ${templateSlug}`);
    return false;
  }

  const { error } = await supabaseAdmin.from("pipeline_emails").insert({
    advertising_request_id: lead.id,
    to_email: lead.email,
    to_name: lead.contact_person,
    template_id: tpl.id,
    send_condition: { always: true }, // the engine already decided
    scheduled_for: nextSendTime(now),
    status: "scheduled",
    trigger_reason: reason,
  });
  if (error) {
    console.error("[journey] queue insert failed:", error);
    return false;
  }
  await recordEvent(lead.id, "rule_fired", { metadata: { reason, template: templateSlug } });
  return true;
}
