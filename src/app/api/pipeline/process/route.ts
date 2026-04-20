import { supabaseAdmin } from "@/lib/supabase";
import { resend, FROM_ADDRESS, PUBLIC_SITE_URL } from "@/lib/resend";
import {
  buildPricingEmail,
  buildFollowupEmail,
  type AdvertisingRequestPayload,
} from "@/lib/email-templates";

/**
 * Pipeline processor — call this on a schedule (every 1 minute via cron/Vercel cron).
 * GET /api/pipeline/process
 *
 * Finds followup emails where scheduled_for <= now AND status = 'scheduled'.
 * Pricing emails are sent via Resend scheduledAt at submission time — this
 * processor only handles followups (which need the open-check condition).
 */
export async function GET() {
  const now = new Date().toISOString();

  // Fetch due followup emails only (pricing is handled by Resend scheduledAt)
  const { data: dueEmails, error } = await supabaseAdmin
    .from("pipeline_emails")
    .select("*, advertising_requests(*)")
    .eq("status", "scheduled")
    .eq("email_type", "followup")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[pipeline] fetch failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!dueEmails || dueEmails.length === 0) {
    return Response.json({ processed: 0 });
  }

  // Fetch pipeline settings for followup condition
  const { data: settings } = await supabaseAdmin
    .from("pipeline_settings")
    .select("*")
    .eq("id", 1)
    .single();

  const followupCondition = settings?.followup_check_condition ?? "not_opened";

  let sent = 0;
  let skipped = 0;

  for (const pe of dueEmails) {
    const req = pe.advertising_requests as Record<string, unknown> | null;
    if (!req) {
      await supabaseAdmin
        .from("pipeline_emails")
        .update({ status: "failed", skip_reason: "Missing advertising request" })
        .eq("id", pe.id);
      continue;
    }

    const payload: AdvertisingRequestPayload = {
      id: req.id as string,
      companyName: req.company_name as string,
      contactPerson: req.contact_person as string,
      email: req.email as string,
      phone: req.phone as string,
      website: req.website as string | null,
      adType: req.ad_type as string,
      adDescription: req.ad_description as string,
      targetAudience: req.target_audience as string | null,
      preferredPlacement: req.preferred_placement as string,
      budgetRange: req.budget_range as string | null,
      budgetCustom: req.budget_custom as number | null,
      startDate: req.start_date as string | null,
      durationMonths: req.duration_months as number | null,
      additionalNotes: req.additional_notes as string | null,
      createdAt: req.created_at as string,
    };

    const baseUrl = PUBLIC_SITE_URL;
    const pricingUrl = `${baseUrl}/pricing?ref=pipeline&rid=${encodeURIComponent(payload.id)}`;
    const trackingOpts = { baseUrl, pipelineEmailId: pe.id };

    // ── FOLLOWUP: check if pricing email was opened/clicked ────────
    if (pe.email_type === "followup") {
      // Find the pricing email for same request
      const { data: pricingEmail } = await supabaseAdmin
        .from("pipeline_emails")
        .select("opened_at, clicked_at")
        .eq("advertising_request_id", pe.advertising_request_id)
        .eq("email_type", "pricing")
        .maybeSingle();

      let shouldSkip = false;
      let skipReason = "";

      if (followupCondition === "not_opened" && pricingEmail?.opened_at) {
        shouldSkip = true;
        skipReason = "Pricing email was already opened";
      } else if (followupCondition === "not_clicked" && pricingEmail?.clicked_at) {
        shouldSkip = true;
        skipReason = "Pricing email was already clicked";
      }
      // 'always' never skips

      if (shouldSkip) {
        await supabaseAdmin
          .from("pipeline_emails")
          .update({ status: "skipped", skip_reason: skipReason })
          .eq("id", pe.id);
        skipped++;
        continue;
      }
    }

    // ── Build and send ────────────────────────────────────────────
    try {
      const emailData =
        pe.email_type === "pricing"
          ? buildPricingEmail(payload, pricingUrl, trackingOpts)
          : buildFollowupEmail(payload, pricingUrl, trackingOpts);

      const result = await resend.emails.send({
        from: FROM_ADDRESS,
        to: pe.to_email,
        replyTo: "hamza@airosofts.com",
        subject: emailData.subject,
        html: emailData.html,
      });

      await supabaseAdmin
        .from("pipeline_emails")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          resend_email_id: result.data?.id ?? null,
        })
        .eq("id", pe.id);

      sent++;
    } catch (err) {
      console.error(`[pipeline] send failed for ${pe.id}:`, err);
      await supabaseAdmin
        .from("pipeline_emails")
        .update({ status: "failed", skip_reason: String(err) })
        .eq("id", pe.id);
    }
  }

  return Response.json({ processed: dueEmails.length, sent, skipped });
}
