/**
 * Pipeline v2 — template rendering, scheduling, and condition evaluation.
 *
 * Variables are HTML-escaped at render time except for the URL vars
 * (pricingUrl, unsubscribeUrl, submitCreativeUrl), which we build server-side
 * from trusted inputs and so leave URL-encoded but not HTML-escaped — they're
 * placed inside href="..." which expects raw URL text.
 */

import { supabaseAdmin } from "@/lib/supabase";
import { resend, FROM_ADDRESS, PUBLIC_SITE_URL } from "@/lib/resend";

/* ─── Allowed variables ─────────────────────────────────────────────────── */

export const ALLOWED_VARIABLES = [
  "firstName",
  "companyName",
  "email",
  "pricingUrl",
  "unsubscribeUrl",
  "submitCreativeUrl",
  "targetStates",
  "year",
] as const;

export type TemplateVar = (typeof ALLOWED_VARIABLES)[number];
export type TemplateVars = Partial<Record<TemplateVar, string>>;

const URL_VARS: ReadonlySet<TemplateVar> = new Set([
  "pricingUrl",
  "unsubscribeUrl",
  "submitCreativeUrl",
]);

/* ─── HTML escape ───────────────────────────────────────────────────────── */

export function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ─── Tracking wraps ────────────────────────────────────────────────────── */

export function wrapClick(
  baseUrl: string,
  pipelineEmailId: string,
  destinationUrl: string,
): string {
  return `${baseUrl}/api/track/click?eid=${encodeURIComponent(pipelineEmailId)}&url=${encodeURIComponent(destinationUrl)}`;
}

export function openPixelTag(baseUrl: string, pipelineEmailId: string): string {
  return `<img src="${baseUrl}/api/track/open?eid=${encodeURIComponent(pipelineEmailId)}" width="1" height="1" style="display:none;" alt="" />`;
}

/* ─── Variable substitution ─────────────────────────────────────────────── */

/**
 * Replace {{var}} placeholders. Unknown variables become empty strings.
 * URL vars are not HTML-escaped (they're already URL-encoded and go into href).
 */
export function substitute(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_match, name: string) => {
    if (!(ALLOWED_VARIABLES as readonly string[]).includes(name)) return "";
    const value = vars[name as TemplateVar] ?? "";
    if (URL_VARS.has(name as TemplateVar)) return value;
    return htmlEscape(value);
  });
}

/* ─── Build the lead vars block (with tracking wrap on pricing URL) ─────── */

export type LeadVarsInput = {
  pipelineEmailId: string;
  advertisingRequestId: string;
  contactPerson: string;
  companyName: string;
  email: string;
  unsubscribeToken: string | null;
  targetStates?: string[] | null;
  /** Optional override (used by creative reminders) */
  submitCreativeUrl?: string;
};

export type SubscriptionVarsInput = {
  pipelineEmailId: string;
  contactName: string | null;
  companyName: string | null;
  email: string;
  /** ad_subscriptions.id + submission_token — used to build the gated form URL */
  subscriptionId: string;
  submissionToken: string | null;
};

export function buildLeadVars(input: LeadVarsInput): TemplateVars {
  const baseUrl = PUBLIC_SITE_URL;
  const firstName = (input.contactPerson || "").trim().split(/\s+/)[0] || "there";
  const rawPricing = `${baseUrl}/pricing?ref=pipeline&rid=${encodeURIComponent(input.advertisingRequestId)}`;
  const unsubUrl = input.unsubscribeToken
    ? `${baseUrl}/api/unsubscribe?token=${encodeURIComponent(input.unsubscribeToken)}`
    : `${baseUrl}/`;

  return {
    firstName,
    companyName: input.companyName ?? "",
    email: input.email ?? "",
    pricingUrl: wrapClick(baseUrl, input.pipelineEmailId, rawPricing),
    unsubscribeUrl: unsubUrl,
    submitCreativeUrl: input.submitCreativeUrl ?? "",
    targetStates: input.targetStates?.length ? input.targetStates.join(", ") : "Nationwide",
    year: String(new Date().getFullYear()),
  };
}

/**
 * Variable block for a paid customer (creative_pending / landing_missing).
 * The CTA always points at the gated creative form. pricingUrl/unsubscribeUrl
 * are intentionally blank — these are transactional, not marketing emails.
 */
export function buildSubscriptionVars(input: SubscriptionVarsInput): TemplateVars {
  const baseUrl = PUBLIC_SITE_URL;
  const firstName =
    (input.contactName || input.email || "").trim().split(/\s+/)[0] || "there";
  const submitUrl = input.submissionToken
    ? `${baseUrl}/submit-creative?token=${encodeURIComponent(input.submissionToken)}&sid=${encodeURIComponent(input.subscriptionId)}`
    : `${baseUrl}/`;
  return {
    firstName,
    companyName: input.companyName ?? "",
    email: input.email ?? "",
    pricingUrl: "",
    unsubscribeUrl: "",
    submitCreativeUrl: wrapClick(baseUrl, input.pipelineEmailId, submitUrl),
    year: String(new Date().getFullYear()),
  };
}

/* ─── Render a full template ────────────────────────────────────────────── */

export type RenderedEmail = {
  subject: string;
  html: string;
  preview: string;
};

export type TemplateRow = {
  id: string;
  slug: string;
  subject: string;
  html: string;
  preview: string | null;
};

export function renderTemplate(
  tmpl: TemplateRow,
  vars: TemplateVars,
  trackingOpts?: { baseUrl: string; pipelineEmailId: string },
): RenderedEmail {
  let html = substitute(tmpl.html, vars);
  if (trackingOpts) {
    const pixel = openPixelTag(trackingOpts.baseUrl, trackingOpts.pipelineEmailId);
    // Inject before </body> if present, else append.
    html = html.includes("</body>") ? html.replace("</body>", `${pixel}</body>`) : html + pixel;
  }
  return {
    subject: substitute(tmpl.subject, vars),
    html,
    preview: substitute(tmpl.preview ?? "", vars),
  };
}

/* ─── Send conditions ───────────────────────────────────────────────────── */

export type SendCondition = {
  /** If true, no other checks apply; always send. */
  always?: boolean;
  /** Skip if the *previous* pipeline email for this lead was opened. */
  previous_opened?: boolean;
  /** Skip if the *previous* pipeline email for this lead was clicked. */
  previous_clicked?: boolean;
  /** Skip if a paid ad_subscriptions row matches this lead. */
  not_paid?: boolean;
  /** Skip if recipient has been marked unsubscribed/stopped. */
  not_stopped?: boolean;
  /** Hard-stop the rest of the sequence on payment (sets pipeline_stopped_at). */
  stop_after_paid?: boolean;
};

export type ConditionContext = {
  advertisingRequestId: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  previousEmail: { opened_at: string | null; clicked_at: string | null } | null;
  paidMatch: boolean;
  stopped: boolean;
};

export type ConditionResult =
  | { send: true }
  | { send: false; reason: string };

/** Evaluate a step's send_condition. */
export function evaluateCondition(
  cond: SendCondition,
  ctx: ConditionContext,
): ConditionResult {
  if (cond.always) return { send: true };

  if (ctx.stopped) return { send: false, reason: "Lead has been stopped/unsubscribed" };

  if (cond.not_paid !== false && ctx.paidMatch) {
    return { send: false, reason: "Lead has already converted (paid)" };
  }

  if (cond.previous_opened === false && ctx.previousEmail?.opened_at) {
    return { send: false, reason: "Previous email was opened" };
  }

  if (cond.previous_clicked === false && ctx.previousEmail?.clicked_at) {
    return { send: false, reason: "Previous email was clicked" };
  }

  return { send: true };
}

/* ─── Paid-match lookup (handles "paid with different email") ───────────── */

/**
 * Returns true if any ad_subscriptions row is paid for this lead.
 * Match order (cheapest → fuzziest):
 *   1. advertising_request_id (set by our /pricing → /checkout handoff)
 *   2. email exact match
 *   3. phone exact match (digits-only) if phone present
 *   4. company_name case-insensitive trim match if present
 */
export async function isLeadPaid(req: {
  id: string;
  email: string;
  phone: string | null;
  company_name: string | null;
}): Promise<boolean> {
  // 1. Direct link via rid
  {
    const { count } = await supabaseAdmin
      .from("ad_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("advertising_request_id", req.id)
      .in("status", ["paid", "active", "creative_submitted", "completed"]);
    if ((count ?? 0) > 0) return true;
  }

  // 2. Email match
  if (req.email) {
    const { count } = await supabaseAdmin
      .from("ad_subscriptions")
      .select("id", { count: "exact", head: true })
      .ilike("email", req.email.trim())
      .in("status", ["paid", "active", "creative_submitted", "completed"]);
    if ((count ?? 0) > 0) return true;
  }

  // 3. Phone match (digits-only)
  if (req.phone) {
    const digits = req.phone.replace(/\D/g, "");
    if (digits.length >= 7) {
      const { data } = await supabaseAdmin
        .from("ad_subscriptions")
        .select("phone, status")
        .in("status", ["paid", "active", "creative_submitted", "completed"])
        .not("phone", "is", null);
      const hit = (data ?? []).some(
        (r) => (r.phone ?? "").replace(/\D/g, "") === digits,
      );
      if (hit) return true;
    }
  }

  // 4. Company match (case-insensitive, trimmed)
  if (req.company_name && req.company_name.trim().length >= 3) {
    const { count } = await supabaseAdmin
      .from("ad_subscriptions")
      .select("id", { count: "exact", head: true })
      .ilike("company_name", req.company_name.trim())
      .in("status", ["paid", "active", "creative_submitted", "completed"]);
    if ((count ?? 0) > 0) return true;
  }

  return false;
}

/* ─── Schedule a fresh chain at submission time ─────────────────────────── */

export type SequenceStepRow = {
  id: string;
  step_order: number;
  template_id: string;
  delay_minutes: number;
  send_condition: SendCondition;
  is_active: boolean;
};

/**
 * Schedule a lead's followup sequence.
 *
 *  - Step 1 (the pricing/initial email) is unconditional, so it's handed
 *    straight to Resend via scheduledAt. Its row carries status
 *    'resend_scheduled' and the resend_email_id (so a later stop can cancel it).
 *  - Steps 2+ carry conditions (not_opened / not_clicked / not_paid) so they
 *    stay as 'scheduled' rows for the cron processor to evaluate at fire time.
 */
export async function scheduleSequenceForRequest(
  req: {
    id: string;
    email: string;
    contact_person: string;
    company_name: string;
    unsubscribe_token: string | null;
    target_states?: string[] | null;
  },
  options?: { sequenceId?: string; baseTime?: Date },
): Promise<{ scheduled: number; sequenceId: string | null }> {
  const base = options?.baseTime ?? new Date();

  // Pick sequence: explicit id, else the default ad_inquiry sequence.
  let sequenceId = options?.sequenceId ?? null;
  if (!sequenceId) {
    const { data: seq } = await supabaseAdmin
      .from("email_sequences")
      .select("id")
      .eq("kind", "ad_inquiry")
      .eq("is_default", true)
      .eq("is_active", true)
      .maybeSingle();
    sequenceId = seq?.id ?? null;
  }
  if (!sequenceId) return { scheduled: 0, sequenceId: null };

  const { data: steps } = await supabaseAdmin
    .from("email_sequence_steps")
    .select("id, step_order, template_id, delay_minutes, send_condition, is_active")
    .eq("sequence_id", sequenceId)
    .eq("is_active", true)
    .order("step_order", { ascending: true });

  if (!steps || steps.length === 0) return { scheduled: 0, sequenceId };

  let scheduledCount = 0;
  let cumulative = 0;

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    cumulative += s.delay_minutes;
    const scheduledFor = new Date(base.getTime() + cumulative * 60_000).toISOString();

    if (i === 0) {
      // Step 1 → Resend-scheduled.
      const ok = await scheduleFirstStepViaResend(req, sequenceId, s, scheduledFor);
      if (ok) scheduledCount++;
    } else {
      // Steps 2+ → cron-processed row.
      const { error } = await supabaseAdmin.from("pipeline_emails").insert({
        advertising_request_id: req.id,
        to_email: req.email,
        to_name: req.contact_person,
        template_id: s.template_id,
        sequence_id: sequenceId,
        sequence_step_id: s.id,
        step_order: s.step_order,
        send_condition: s.send_condition ?? {},
        scheduled_for: scheduledFor,
        status: "scheduled",
      });
      if (!error) scheduledCount++;
      else console.error("[pipeline] step insert failed:", error);
    }
  }

  await supabaseAdmin
    .from("advertising_requests")
    .update({ pipeline_sequence_id: sequenceId })
    .eq("id", req.id);

  return { scheduled: scheduledCount, sequenceId };
}

/**
 * Insert the first step's row, render it, and hand it to Resend via
 * scheduledAt. On any failure the row is left as 'scheduled' so the cron
 * processor picks it up as a fallback.
 */
async function scheduleFirstStepViaResend(
  req: {
    id: string;
    email: string;
    contact_person: string;
    company_name: string;
    unsubscribe_token: string | null;
    target_states?: string[] | null;
  },
  sequenceId: string,
  step: { id: string; step_order: number; template_id: string; send_condition: SendCondition },
  scheduledFor: string,
): Promise<boolean> {
  // Insert the row first so we have an id for tracking pixels/links.
  const { data: row, error: insErr } = await supabaseAdmin
    .from("pipeline_emails")
    .insert({
      advertising_request_id: req.id,
      to_email: req.email,
      to_name: req.contact_person,
      template_id: step.template_id,
      sequence_id: sequenceId,
      sequence_step_id: step.id,
      step_order: step.step_order,
      send_condition: step.send_condition ?? {},
      scheduled_for: scheduledFor,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (insErr || !row) {
    console.error("[pipeline] first-step insert failed:", insErr);
    return false;
  }

  // Load the template.
  const { data: tmpl } = await supabaseAdmin
    .from("email_templates")
    .select("id, slug, subject, preview, html, is_active")
    .eq("id", step.template_id)
    .maybeSingle();

  if (!tmpl || !tmpl.is_active) {
    // Leave the row 'scheduled' — the cron processor will surface the error.
    return true;
  }

  const vars = buildLeadVars({
    pipelineEmailId: row.id,
    advertisingRequestId: req.id,
    contactPerson: req.contact_person,
    companyName: req.company_name,
    email: req.email,
    unsubscribeToken: req.unsubscribe_token,
    targetStates: req.target_states,
  });
  const rendered = renderTemplate(tmpl as TemplateRow, vars, {
    baseUrl: PUBLIC_SITE_URL,
    pipelineEmailId: row.id,
  });

  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: req.email,
      replyTo: "hamza@airosofts.com",
      subject: rendered.subject,
      html: rendered.html,
      scheduledAt: scheduledFor,
      headers: req.unsubscribe_token
        ? {
            "List-Unsubscribe": `<${PUBLIC_SITE_URL}/api/unsubscribe?token=${req.unsubscribe_token}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          }
        : undefined,
    });

    await supabaseAdmin
      .from("pipeline_emails")
      .update({
        status: "resend_scheduled",
        resend_email_id: result.data?.id ?? null,
        subject: rendered.subject,
      })
      .eq("id", row.id);
    return true;
  } catch (err) {
    // Fall back to cron delivery — leave the row 'scheduled'.
    console.error("[pipeline] Resend scheduledAt failed, falling back to cron:", err);
    return true;
  }
}

/* ─── Schedule a reminder chain for a paid subscription ─────────────────── */

export type SubscriptionSequenceKind = "creative_pending" | "landing_missing";

/**
 * Insert one pipeline_emails row per active step of the default sequence for
 * the given `kind`, targeting an ad_subscription instead of an
 * advertising_request. Used by the processor's lazy-scheduler and by the
 * admin "request landing URL" action.
 */
export async function scheduleSubscriptionSequence(
  sub: { id: string; email: string; contact_name: string | null },
  kind: SubscriptionSequenceKind,
  options?: { baseTime?: Date; firstStepImmediate?: boolean },
): Promise<{ scheduled: number; sequenceId: string | null }> {
  const base = options?.baseTime ?? new Date();

  const { data: seq } = await supabaseAdmin
    .from("email_sequences")
    .select("id")
    .eq("kind", kind)
    .eq("is_default", true)
    .eq("is_active", true)
    .maybeSingle();

  const sequenceId = seq?.id ?? null;
  if (!sequenceId) return { scheduled: 0, sequenceId: null };

  const { data: steps } = await supabaseAdmin
    .from("email_sequence_steps")
    .select("id, step_order, template_id, delay_minutes, is_active")
    .eq("sequence_id", sequenceId)
    .eq("is_active", true)
    .order("step_order", { ascending: true });

  if (!steps || steps.length === 0) return { scheduled: 0, sequenceId };

  let cumulative = 0;
  const rows = steps.map((s, idx) => {
    cumulative += idx === 0 && options?.firstStepImmediate ? 0 : s.delay_minutes;
    return {
      subscription_id: sub.id,
      advertising_request_id: null,
      to_email: sub.email,
      to_name: sub.contact_name,
      template_id: s.template_id,
      sequence_id: sequenceId,
      sequence_step_id: s.id,
      step_order: s.step_order,
      send_condition: {},
      scheduled_for: new Date(base.getTime() + cumulative * 60_000).toISOString(),
      status: "scheduled",
    };
  });

  const { error } = await supabaseAdmin.from("pipeline_emails").insert(rows);
  if (error) {
    console.error("[pipeline] scheduleSubscriptionSequence insert failed:", error);
    return { scheduled: 0, sequenceId };
  }

  // Stamp idempotency marker so the lazy-scheduler doesn't double-schedule.
  const nowISO = new Date().toISOString();
  const stamp =
    kind === "creative_pending"
      ? { creative_seq_started_at: nowISO }
      : { landing_seq_started_at: nowISO };
  await supabaseAdmin.from("ad_subscriptions").update(stamp).eq("id", sub.id);

  return { scheduled: rows.length, sequenceId };
}
