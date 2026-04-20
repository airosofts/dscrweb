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

  // ── CREATIVE REMINDER: 24h after payment, no creative submitted ──────
  let creativeSent = 0;
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: pendingCreative } = await supabaseAdmin
      .from("ad_subscriptions")
      .select("id, email, contact_name, company_name, submission_token")
      .eq("status", "paid")
      .is("creative_submitted_at", null)
      .is("creative_reminder_sent_at", null)
      .lte("paid_at", twentyFourHoursAgo)
      .limit(50);

    if (pendingCreative && pendingCreative.length > 0) {
      for (const sub of pendingCreative) {
        if (!sub.submission_token || !sub.email) continue;

        const submitUrl = `${PUBLIC_SITE_URL}/submit-creative?token=${encodeURIComponent(sub.submission_token)}&sid=${encodeURIComponent(sub.id)}`;
        const firstName = (sub.contact_name ?? sub.email).split(" ")[0];

        try {
          await resend.emails.send({
            from: FROM_ADDRESS,
            to: sub.email,
            replyTo: "hamza@airosofts.com",
            subject: "Submit your ad creative — DSCR Calculator Pro",
            html: buildCreativeReminderEmail(firstName, sub.company_name ?? "", submitUrl),
          });

          await supabaseAdmin
            .from("ad_subscriptions")
            .update({ creative_reminder_sent_at: new Date().toISOString() })
            .eq("id", sub.id);

          creativeSent++;
        } catch (err) {
          console.error(`[pipeline] creative reminder failed for ${sub.id}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("[pipeline] creative reminder section error:", err);
  }

  return Response.json({ processed: dueEmails.length, sent, skipped, creativeSent });
}

/* ─── Creative Reminder Email ─── */

function buildCreativeReminderEmail(firstName: string, companyName: string, submitUrl: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">Reminder</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Submit your ad creative</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 24px;">
  Hey ${firstName}, thanks again for your payment${companyName ? ` for ${companyName}` : ""}. To get your ad live on DSCR Calculator Pro, we need your creative assets — banner images, logos, and campaign details.
</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 24px;">
  It only takes a few minutes. Click below to upload your files and we'll have your ad reviewed within 1-2 business days.
</p>
<table role="presentation" cellpadding="0" cellspacing="0">
<tr><td style="background:#9B7B4E;padding:14px 28px;">
<a href="${submitUrl}" style="color:#FFFFFF;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.04em;text-transform:uppercase;font-family:'DM Sans',Helvetica,Arial,sans-serif;">Submit Creative →</a>
</td></tr>
</table>
<p style="margin:24px 0 0;font-size:13px;color:#A09888;">
  Or copy this link:<br/>
  <a href="${submitUrl}" style="color:#9B7B4E;word-break:break-all;font-size:12px;">${submitUrl}</a>
</p>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;">dscrcalculator.pro</div>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
