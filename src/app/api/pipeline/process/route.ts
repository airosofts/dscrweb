/**
 * Pipeline v2 — Processor.
 *
 * Called every minute by the cron-worker. Handles two row types in one queue
 * (pipeline_emails):
 *   advertising_request_id set → ad-inquiry followups (lead hasn't paid)
 *   subscription_id set        → customer reminders (creative / landing URL)
 *
 * Per tick:
 *   1. Lazy-schedule reminder sequences for subscriptions that need them.
 *   2. Claim each due row (status: scheduled → processing) so two workers
 *      can't double-send.
 *   3. Evaluate stop conditions against the latest state.
 *   4. Render the template + tracking, send via Resend, update the row.
 */

import { supabaseAdmin } from "@/lib/supabase";
import { evaluateJourneys } from "@/lib/journey";
import { resend, FROM_ADDRESS, PUBLIC_SITE_URL, REPLY_TO } from "@/lib/resend";
import {
  buildLeadVars,
  buildSubscriptionVars,
  evaluateCondition,
  isLeadPaid,
  renderTemplate,
  scheduleSubscriptionSequence,
  type SendCondition,
  type TemplateRow,
  type TemplateVars,
} from "@/lib/pipeline";

const PER_TICK_LIMIT = 25;

type DueEmail = {
  id: string;
  advertising_request_id: string | null;
  subscription_id: string | null;
  sequence_id: string | null;
  template_id: string | null;
  step_order: number | null;
  send_condition: SendCondition;
  to_email: string;
  to_name: string | null;
  scheduled_for: string;
};

type AdvertisingRequest = {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string | null;
  pipeline_stopped_at: string | null;
  pipeline_stop_reason: string | null;
  unsubscribe_token: string;
  target_states?: string[] | null;
};

type Subscription = {
  id: string;
  email: string;
  contact_name: string | null;
  company_name: string | null;
  status: string;
  submission_token: string | null;
  creative_submitted_at: string | null;
  reminder_stopped_at: string | null;
  reminder_stop_reason: string | null;
};

export async function GET() {
  const now = new Date().toISOString();

  // ── 0a. Cancel Resend-side schedules for stopped emails ────────────────
  let resendCancelled = 0;
  try {
    resendCancelled = await reconcileResendCancellations();
  } catch (err) {
    console.error("[pipeline] resend cancel reconcile failed:", err);
  }

  // ── 0b. Lazy-schedule customer reminder sequences ──────────────────────
  let creativeScheduled = 0;
  let landingScheduled = 0;
  try {
    creativeScheduled = await scheduleCreativePending();
    landingScheduled = await scheduleLandingMissing();
  } catch (err) {
    console.error("[pipeline] reminder scheduling failed:", err);
  }

  // ── 0c. Behavior-driven journey engine: decide next emails for dynamic
  // leads from their events. Runs before the due fetch so decisions queued
  // inside the send window go out on this same tick. ─────────────────────
  let journeyQueued = 0;
  try {
    const j = await evaluateJourneys();
    journeyQueued = j.queued;
  } catch (err) {
    console.error("[pipeline] journey evaluation failed:", err);
  }

  // ── 1. Fetch due rows ──────────────────────────────────────────────────
  const { data: dueEmails, error } = await supabaseAdmin
    .from("pipeline_emails")
    .select(
      `id, advertising_request_id, subscription_id, sequence_id, template_id,
       step_order, send_condition, to_email, to_name, scheduled_for`,
    )
    .eq("status", "scheduled")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(PER_TICK_LIMIT);

  if (error) {
    console.error("[pipeline] fetch failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!dueEmails || dueEmails.length === 0) {
    return Response.json({
      processed: 0,
      sent: 0,
      skipped: 0,
      creativeScheduled,
      landingScheduled,
      resendCancelled,
      journeyQueued,
    });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const pe of dueEmails as DueEmail[]) {
    // Atomic claim.
    const { data: claimed } = await supabaseAdmin
      .from("pipeline_emails")
      .update({ status: "processing", processing_started_at: new Date().toISOString() })
      .eq("id", pe.id)
      .eq("status", "scheduled")
      .select("id")
      .maybeSingle();
    if (!claimed) continue; // another worker took it

    const outcome = pe.subscription_id
      ? await processSubscriptionRow(pe)
      : pe.advertising_request_id
        ? await processAdInquiryRow(pe)
        : await processDirectRow(pe);

    if (outcome === "sent") sent++;
    else if (outcome === "failed") failed++;
    else skipped++; // skipped | cancelled
  }

  return Response.json({
    processed: dueEmails.length,
    sent,
    skipped,
    failed,
    creativeScheduled,
    landingScheduled,
    resendCancelled,
    journeyQueued,
  });
}

/* ═══════════════════ Resend-side cancellation reconcile ══════════════════ */

/**
 * Emails handed to Resend (status 'resend_scheduled') that were later stopped
 * get status 'cancelled' in our DB — but Resend still holds the schedule.
 * This sweep calls resend.emails.cancel() for any cancelled row that still has
 * a resend_email_id and hasn't been reconciled yet.
 */
async function reconcileResendCancellations(): Promise<number> {
  const { data: rows } = await supabaseAdmin
    .from("pipeline_emails")
    .select("id, resend_email_id")
    .eq("status", "cancelled")
    .not("resend_email_id", "is", null)
    .is("resend_cancelled_at", null)
    .limit(50);

  if (!rows || rows.length === 0) return 0;

  let count = 0;
  for (const r of rows) {
    try {
      await resend.emails.cancel(r.resend_email_id as string);
      count++;
    } catch (err) {
      // Already sent / not cancellable — log and move on. We still mark it
      // reconciled below so we don't retry forever.
      console.error(`[pipeline] resend cancel failed for ${r.id}:`, err);
    }
    await supabaseAdmin
      .from("pipeline_emails")
      .update({ resend_cancelled_at: new Date().toISOString() })
      .eq("id", r.id);
  }
  return count;
}

/* ═══════════════════════════ Ad-inquiry rows ═══════════════════════════ */

async function processAdInquiryRow(
  pe: DueEmail,
): Promise<"sent" | "skipped" | "failed"> {
  const { data: req } = await supabaseAdmin
    .from("advertising_requests")
    .select(
      `id, company_name, contact_person, email, phone, target_states,
       pipeline_stopped_at, pipeline_stop_reason, unsubscribe_token`,
    )
    .eq("id", pe.advertising_request_id!)
    .maybeSingle();

  if (!req) {
    await markFailed(pe.id, "Missing advertising_request");
    return "failed";
  }
  const lead = req as AdvertisingRequest;

  // Bounce/complaint guard — abort whole chain if a prior email bounced.
  const { data: bounceRow } = await supabaseAdmin
    .from("pipeline_emails")
    .select("id")
    .eq("advertising_request_id", lead.id)
    .in("status", ["bounced", "failed"])
    .limit(1)
    .maybeSingle();
  if (bounceRow) {
    await markSkipped(pe.id, "Earlier email bounced/failed");
    return "skipped";
  }

  // Previous step lookup (for previous_opened / previous_clicked).
  const { data: previousEmail } = await supabaseAdmin
    .from("pipeline_emails")
    .select("opened_at, clicked_at")
    .eq("advertising_request_id", lead.id)
    .lt("step_order", pe.step_order ?? 999_999)
    .order("step_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cond = (pe.send_condition ?? {}) as SendCondition;
  const paidMatch =
    cond.not_paid !== false
      ? await isLeadPaid({
          id: lead.id,
          email: lead.email,
          phone: lead.phone,
          company_name: lead.company_name,
        })
      : false;

  const decision = evaluateCondition(cond, {
    advertisingRequestId: lead.id,
    email: lead.email,
    phone: lead.phone,
    companyName: lead.company_name,
    previousEmail,
    paidMatch,
    stopped: !!lead.pipeline_stopped_at,
  });

  if (!decision.send) {
    if (paidMatch && !lead.pipeline_stopped_at) {
      await supabaseAdmin
        .from("advertising_requests")
        .update({
          pipeline_stopped_at: new Date().toISOString(),
          pipeline_stop_reason: "Auto-stop: lead converted (paid)",
        })
        .eq("id", lead.id)
        .is("pipeline_stopped_at", null);
    }
    await markSkipped(pe.id, decision.reason);
    return "skipped";
  }

  const tpl = await loadTemplate(pe.template_id);
  if (!tpl) {
    await markFailed(pe.id, "Template missing or inactive");
    return "failed";
  }

  try {
    const vars = buildLeadVars({
      pipelineEmailId: pe.id,
      advertisingRequestId: lead.id,
      contactPerson: lead.contact_person,
      companyName: lead.company_name,
      email: lead.email,
      unsubscribeToken: lead.unsubscribe_token,
      targetStates: lead.target_states,
    });
    const rendered = renderTemplate(tpl, vars, {
      baseUrl: PUBLIC_SITE_URL,
      pipelineEmailId: pe.id,
    });

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: pe.to_email,
      replyTo: "hamza@airosofts.com",
      subject: rendered.subject,
      html: rendered.html,
      headers: {
        "List-Unsubscribe": `<${PUBLIC_SITE_URL}/api/unsubscribe?token=${lead.unsubscribe_token}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    await supabaseAdmin
      .from("pipeline_emails")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        resend_email_id: result.data?.id ?? null,
        subject: rendered.subject,
      })
      .eq("id", pe.id);
    return "sent";
  } catch (err) {
    console.error(`[pipeline] ad-inquiry send failed for ${pe.id}:`, err);
    await markFailed(pe.id, String(err));
    return "failed";
  }
}

/* ═══════════════════════ Subscription reminder rows ═══════════════════════ */

async function processSubscriptionRow(
  pe: DueEmail,
): Promise<"sent" | "skipped" | "failed"> {
  const { data: sub } = await supabaseAdmin
    .from("ad_subscriptions")
    .select(
      `id, email, contact_name, company_name, status, submission_token,
       creative_submitted_at, reminder_stopped_at, reminder_stop_reason`,
    )
    .eq("id", pe.subscription_id!)
    .maybeSingle();

  if (!sub) {
    await markFailed(pe.id, "Missing subscription");
    return "failed";
  }
  const s = sub as Subscription;

  if (s.reminder_stopped_at) {
    await cancelRow(pe.id, `Reminders stopped: ${s.reminder_stop_reason ?? "unspecified"}`);
    return "skipped";
  }

  // Sequence kind drives the auto-stop condition.
  const { data: seq } = await supabaseAdmin
    .from("email_sequences")
    .select("kind")
    .eq("id", pe.sequence_id!)
    .maybeSingle();
  const kind = seq?.kind as string | undefined;

  if (kind === "creative_pending" && s.creative_submitted_at) {
    await cancelRow(pe.id, "Creative already submitted");
    await cancelRemainingForSubscription(s.id, "Creative submitted");
    return "skipped";
  }
  if (kind === "landing_missing" && (await subscriptionHasLandingUrl(s.id))) {
    await cancelRow(pe.id, "Landing URL already provided");
    await cancelRemainingForSubscription(s.id, "Landing URL provided");
    return "skipped";
  }

  const tpl = await loadTemplate(pe.template_id);
  if (!tpl) {
    await markFailed(pe.id, "Template missing or inactive");
    return "failed";
  }

  try {
    const vars = buildSubscriptionVars({
      pipelineEmailId: pe.id,
      contactName: s.contact_name,
      companyName: s.company_name,
      email: s.email,
      subscriptionId: s.id,
      submissionToken: s.submission_token,
    });
    const rendered = renderTemplate(tpl, vars, {
      baseUrl: PUBLIC_SITE_URL,
      pipelineEmailId: pe.id,
    });

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: pe.to_email,
      replyTo: "hamza@airosofts.com",
      subject: rendered.subject,
      html: rendered.html,
    });

    await supabaseAdmin
      .from("pipeline_emails")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        resend_email_id: result.data?.id ?? null,
        subject: rendered.subject,
      })
      .eq("id", pe.id);
    return "sent";
  } catch (err) {
    console.error(`[pipeline] subscription send failed for ${pe.id}:`, err);
    await markFailed(pe.id, String(err));
    return "failed";
  }
}

/** True if the subscription has at least one creative submission with a landing URL. */
async function subscriptionHasLandingUrl(subscriptionId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("creative_submissions")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .not("landing_url", "is", null)
    .limit(1);
  return !!data && data.length > 0;
}

/* ═══════════════════════ Direct outreach rows ═══════════════════════════ */

/**
 * A pipeline_emails row with no advertising_request and no subscription — a
 * one-off email sent from the admin Outreach page to a hand-entered recipient.
 */
async function processDirectRow(
  pe: DueEmail,
): Promise<"sent" | "skipped" | "failed"> {
  const tpl = await loadTemplate(pe.template_id);
  if (!tpl) {
    await markFailed(pe.id, "Template missing or inactive");
    return "failed";
  }

  const firstName =
    (pe.to_name || pe.to_email || "").trim().split(/\s+/)[0] || "there";
  const vars: TemplateVars = {
    firstName,
    companyName: "",
    email: pe.to_email,
    pricingUrl: "",
    unsubscribeUrl: "",
    submitCreativeUrl: "",
    year: String(new Date().getFullYear()),
  };
  const rendered = renderTemplate(tpl, vars, {
    baseUrl: PUBLIC_SITE_URL,
    pipelineEmailId: pe.id,
  });

  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: pe.to_email,
      replyTo: REPLY_TO,
      subject: rendered.subject,
      html: rendered.html,
    });

    await supabaseAdmin
      .from("pipeline_emails")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        resend_email_id: result.data?.id ?? null,
        subject: rendered.subject,
      })
      .eq("id", pe.id);
    return "sent";
  } catch (err) {
    console.error(`[pipeline] direct send failed for ${pe.id}:`, err);
    await markFailed(pe.id, String(err));
    return "failed";
  }
}

/* ═══════════════════════ Lazy reminder scheduling ═══════════════════════ */

/** Schedule creative_pending sequences for paid subs with no creative yet. */
async function scheduleCreativePending(): Promise<number> {
  const { data: subs } = await supabaseAdmin
    .from("ad_subscriptions")
    .select("id, email, contact_name")
    .eq("status", "paid")
    .is("creative_submitted_at", null)
    .is("reminder_stopped_at", null)
    .is("creative_seq_started_at", null)
    .limit(25);

  if (!subs || subs.length === 0) return 0;

  let count = 0;
  for (const sub of subs) {
    if (!sub.email) continue;
    const { scheduled } = await scheduleSubscriptionSequence(sub, "creative_pending");
    if (scheduled > 0) count++;
  }
  return count;
}

/** Schedule landing_missing sequences for subs whose creative lacks a landing URL. */
async function scheduleLandingMissing(): Promise<number> {
  const { data: nullRows } = await supabaseAdmin
    .from("creative_submissions")
    .select("subscription_id")
    .is("landing_url", null)
    .limit(200);

  if (!nullRows || nullRows.length === 0) return 0;
  const candidateIds = Array.from(
    new Set(nullRows.map((r) => r.subscription_id as string).filter(Boolean)),
  );
  if (candidateIds.length === 0) return 0;

  const { data: subs } = await supabaseAdmin
    .from("ad_subscriptions")
    .select("id, email, contact_name")
    .in("id", candidateIds)
    .is("reminder_stopped_at", null)
    .is("landing_seq_started_at", null)
    .limit(25);

  if (!subs || subs.length === 0) return 0;

  let count = 0;
  for (const sub of subs) {
    if (!sub.email) continue;
    // Skip if some OTHER submission for this sub already has a landing URL.
    if (await subscriptionHasLandingUrl(sub.id)) {
      await supabaseAdmin
        .from("ad_subscriptions")
        .update({ landing_seq_started_at: new Date().toISOString() })
        .eq("id", sub.id);
      continue;
    }
    const { scheduled } = await scheduleSubscriptionSequence(sub, "landing_missing");
    if (scheduled > 0) count++;
  }
  return count;
}

/* ═══════════════════════════════ Helpers ═══════════════════════════════ */

async function loadTemplate(
  templateId: string | null,
): Promise<TemplateRow | null> {
  if (!templateId) return null;
  const { data } = await supabaseAdmin
    .from("email_templates")
    .select("id, slug, subject, preview, html, is_active")
    .eq("id", templateId)
    .maybeSingle();
  if (!data || !data.is_active) return null;
  return data as TemplateRow;
}

async function markSkipped(id: string, reason: string) {
  await supabaseAdmin
    .from("pipeline_emails")
    .update({ status: "skipped", skip_reason: reason })
    .eq("id", id);
}

async function markFailed(id: string, reason: string) {
  await supabaseAdmin
    .from("pipeline_emails")
    .update({ status: "failed", skip_reason: reason })
    .eq("id", id);
}

async function cancelRow(id: string, reason: string) {
  await supabaseAdmin
    .from("pipeline_emails")
    .update({ status: "cancelled", cancel_reason: reason })
    .eq("id", id);
}

async function cancelRemainingForSubscription(subscriptionId: string, reason: string) {
  await supabaseAdmin
    .from("pipeline_emails")
    .update({ status: "cancelled", cancel_reason: reason })
    .eq("subscription_id", subscriptionId)
    .eq("status", "scheduled");
}
