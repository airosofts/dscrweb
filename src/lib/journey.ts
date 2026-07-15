import { supabaseAdmin } from "@/lib/supabase";

/**
 * Behavior-driven journey engine (v2 — stage cycles).
 *
 * Every lead sits in exactly one STAGE, derived from what they've done:
 *
 *   not_opened          nothing opened yet
 *   opened_no_click     opened an email, never clicked through
 *   considering         clicked / viewed pricing, no checkout yet
 *   checkout_abandoned  started checkout, hasn't paid
 *
 * Each stage keeps sending on its own cadence — rotating through a set of
 * templates so no lead gets the same email twice in a row — until the lead
 * ADVANCES to the next stage or pays (paying exits from any stage). A
 * per-stage max_sends cap plus a weekly cap keep "again and again" from
 * ever becoming spam; when a stage's cap is exhausted the lead is stopped
 * with a visible reason so the admin can take over manually.
 *
 * Signals land in journey_events (recordEvent). The engine writes ordinary
 * pipeline_emails rows, so all send/track/admin machinery is reused as-is.
 */

export type JourneyEventType =
  | "form_submitted" | "email_sent" | "email_delivered" | "email_opened"
  | "email_clicked" | "email_bounced" | "pricing_viewed" | "checkout_started"
  | "paid" | "rule_fired" | "journey_restarted";

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

/* ─── Stage playbook ────────────────────────────────────────────────────── */

export type Stage = "not_opened" | "opened_no_click" | "considering" | "checkout_abandoned";

// Template rotation per stage: attempt N in a stage uses rotation[N % len],
// so repeated sends always vary. Copy references the lead's actual behavior.
const STAGE_ROTATIONS: Record<Stage, string[]> = {
  not_opened:         ["pricing-resend", "unopened-2", "unopened-3", "unopened-4", "unopened-5"],
  opened_no_click:    ["opened-no-click", "noclick-2", "noclick-3", "noclick-4", "noclick-5"],
  considering:        ["sticker-shock", "considering-2", "considering-3", "considering-4", "considering-5"],
  checkout_abandoned: ["checkout-abandon", "abandon-2", "abandon-3", "abandon-4", "abandon-5"],
};

const STAGE_DESCRIPTION: Record<Stage, string> = {
  not_opened:         "hasn't opened any email yet",
  opened_no_click:    "opened but never clicked through",
  considering:        "viewed pricing but hasn't started checkout",
  checkout_abandoned: "started checkout but hasn't paid",
};

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

type RuleCfg = { enabled: boolean; wait_minutes: number; max_sends: number };
type Rules = Partial<Record<Stage, RuleCfg>>;
type Lead = {
  id: string; email: string; contact_person: string; company_name: string;
  unsubscribe_token: string | null; target_states: string[] | null;
  pipeline_stopped_at: string | null;
};

/* ─── Engine ────────────────────────────────────────────────────────────── */

export async function evaluateJourneys(): Promise<{ evaluated: number; queued: number }> {
  const { data: ruleRows } = await supabaseAdmin.from("journey_rules").select("*");
  const rules: Rules = {};
  for (const r of ruleRows ?? []) rules[r.rule_key as Stage] = r;

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
  // Paying exits the journey from any stage.
  const { data: paidSub } = await supabaseAdmin
    .from("ad_subscriptions")
    .select("id")
    .eq("advertising_request_id", lead.id)
    .in("status", ["paid", "active", "creative_submitted"])
    .limit(1)
    .maybeSingle();
  if (paidSub) return false;

  const { data: emails } = await supabaseAdmin
    .from("pipeline_emails")
    .select("id, status, sent_at, opened_at, clicked_at, scheduled_for, trigger_reason")
    .eq("advertising_request_id", lead.id)
    .order("created_at", { ascending: true });
  if (!emails?.length) return false;

  // Dead address — never send again.
  if (emails.some((e) => ["bounced", "failed"].includes(e.status))) return false;

  // An email already handed to Resend / mid-send — wait for it to resolve.
  if (emails.some((e) => ["resend_scheduled", "processing"].includes(e.status))) return false;

  const sentEmails = emails.filter((e) =>
    ["sent", "delivered", "opened", "clicked"].includes(e.status) && (e.sent_at || e.scheduled_for));
  if (!sentEmails.length) return false; // opener not out yet

  // Weekly guardrail.
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const sentThisWeek = sentEmails.filter(
    (e) => new Date(e.sent_at ?? e.scheduled_for).getTime() > weekAgo).length;
  if (sentThisWeek >= MAX_EMAILS_PER_WEEK) return false;

  // ── Which stage is this lead in? ──
  const anyOpened = sentEmails.some((e) => e.opened_at);
  const { data: events } = await supabaseAdmin
    .from("journey_events")
    .select("event_type, created_at")
    .eq("advertising_request_id", lead.id)
    .in("event_type", ["pricing_viewed", "checkout_started", "journey_restarted"])
    .in("attribution", ["certain", "strong"]) // never act on IP guesses
    .limit(50);
  const pricingViewed = (events ?? []).some((e) => e.event_type === "pricing_viewed") ||
    sentEmails.some((e) => e.clicked_at); // a click IS a pricing view
  const checkoutStarted = (events ?? []).some((e) => e.event_type === "checkout_started");

  const stage: Stage = checkoutStarted ? "checkout_abandoned"
    : pricingViewed ? "considering"
    : anyOpened ? "opened_no_click"
    : "not_opened";

  // A journey email is already queued (status 'scheduled'). If it belongs to
  // the lead's CURRENT stage, wait for it. If the lead has since advanced to a
  // new stage (e.g. started checkout while a considering email sat queued),
  // cancel the now-stale email so the new stage takes over immediately.
  const queued = emails.find((e) => e.status === "scheduled");
  if (queued) {
    const queuedStage = queued.trigger_reason?.split(" ")[0] ?? "not_opened";
    if (queuedStage === stage) return false; // still relevant — let it send
    await supabaseAdmin
      .from("pipeline_emails")
      .update({ status: "cancelled", cancel_reason: `Lead advanced to ${stage} before this ${queuedStage} email sent` })
      .eq("id", queued.id)
      .eq("status", "scheduled");
    // fall through and queue the correct email for the new stage
  }

  const cfg = rules[stage];
  if (!cfg?.enabled) return false;

  // ── Cadence: wait_minutes since the last send. ──
  const lastSent = sentEmails[sentEmails.length - 1];
  const lastSentAt = new Date(lastSent.sent_at ?? lastSent.scheduled_for).getTime();
  if (now.getTime() - lastSentAt < cfg.wait_minutes * 60_000) return false;

  // ── Attempt count within this stage. ──
  // Engine sends are stamped "<stage> #n: ...". The rotation index counts
  // ONLY engine sends (so the first re-send is rotation[0]); the cap also
  // counts the initial pricing email for not_opened (it went unopened too).
  // A "journey_restarted" marker (admin's Restart button) resets both: only
  // emails sent after the latest marker count toward the cap and rotation.
  const restartedAt = (events ?? [])
    .filter((e) => e.event_type === "journey_restarted")
    .map((e) => new Date(e.created_at).getTime())
    .sort((a, b) => b - a)[0] ?? 0;
  const countable = sentEmails.filter(
    (e) => new Date(e.sent_at ?? e.scheduled_for).getTime() > restartedAt);
  const engineSends = countable.filter((e) => e.trigger_reason?.startsWith(`${stage} `)).length;
  const stageSends = engineSends
    + (stage === "not_opened" ? countable.filter((e) => !e.trigger_reason).length : 0);

  if (stageSends >= cfg.max_sends) {
    // Cap exhausted — close the journey visibly so the admin can take over.
    await supabaseAdmin
      .from("advertising_requests")
      .update({
        pipeline_stopped_at: new Date().toISOString(),
        pipeline_stop_reason: `Journey complete: ${cfg.max_sends} emails while lead ${STAGE_DESCRIPTION[stage]} — handle manually`,
      })
      .eq("id", lead.id)
      .is("pipeline_stopped_at", null);
    return false;
  }

  const rotation = STAGE_ROTATIONS[stage];
  const templateSlug = rotation[engineSends % rotation.length];
  const reason = `${stage} #${stageSends + 1}: lead ${STAGE_DESCRIPTION[stage]}`;
  return queueEmail(lead, templateSlug, reason, now);
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
