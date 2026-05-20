import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend, FROM_ADDRESS, PUBLIC_SITE_URL, REPLY_TO } from "@/lib/resend";
import { renderTemplate, type TemplateRow, type TemplateVars } from "@/lib/pipeline";

/**
 * Outreach — send a one-off tracked email immediately via Resend.
 *
 * POST /api/outreach/send
 *   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>   (internal — admin portal)
 *   body: { to_email, to_name?, template_id?, template_slug? }
 *
 * Inserts a targetless pipeline_emails row (the tracking record), renders the
 * template with an open pixel, hands it straight to Resend, and marks the row
 * sent. No cron involved — the email goes out on the spot.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SLUG = "popup-ad-question";

export async function POST(request: NextRequest) {
  // ── Internal auth: shared service-role key ───────────────────────────
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

  const toEmail = typeof body.to_email === "string" ? body.to_email.trim().toLowerCase() : "";
  const toName = typeof body.to_name === "string" ? body.to_name.trim() : "";
  const templateId = typeof body.template_id === "string" ? body.template_id : null;
  const templateSlug = typeof body.template_slug === "string" ? body.template_slug : DEFAULT_SLUG;

  if (!EMAIL_RE.test(toEmail)) {
    return Response.json({ error: "A valid recipient email is required" }, { status: 400 });
  }

  // ── Resolve the template ─────────────────────────────────────────────
  const tmplQuery = supabaseAdmin
    .from("email_templates")
    .select("id, slug, subject, preview, html, is_active");
  const { data: tmpl } = templateId
    ? await tmplQuery.eq("id", templateId).maybeSingle()
    : await tmplQuery.eq("slug", templateSlug).maybeSingle();

  if (!tmpl || !tmpl.is_active) {
    return Response.json({ error: "Outreach template not found or inactive" }, { status: 400 });
  }

  // ── Insert the tracking record (status 'processing' so the cron skips it) ──
  const { data: row, error: insErr } = await supabaseAdmin
    .from("pipeline_emails")
    .insert({
      advertising_request_id: null,
      subscription_id: null,
      template_id: tmpl.id,
      to_email: toEmail,
      to_name: toName || null,
      send_condition: {},
      scheduled_for: new Date().toISOString(),
      status: "processing",
    })
    .select("id")
    .single();

  if (insErr || !row) {
    console.error("[outreach] insert failed:", insErr);
    return Response.json({ error: "Could not create email record" }, { status: 500 });
  }

  // ── Render with tracking pixel ───────────────────────────────────────
  const firstName = (toName || toEmail).trim().split(/\s+/)[0] || "there";
  const vars: TemplateVars = {
    firstName,
    companyName: "",
    email: toEmail,
    pricingUrl: "",
    unsubscribeUrl: "",
    submitCreativeUrl: "",
    year: String(new Date().getFullYear()),
  };
  const rendered = renderTemplate(tmpl as TemplateRow, vars, {
    baseUrl: PUBLIC_SITE_URL,
    pipelineEmailId: row.id,
  });

  // ── Hand straight to Resend ──────────────────────────────────────────
  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
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
      .eq("id", row.id);

    return Response.json({
      ok: true,
      email: { id: row.id, to_email: toEmail, to_name: toName || null, status: "sent" },
    });
  } catch (err) {
    console.error("[outreach] Resend send failed:", err);
    await supabaseAdmin
      .from("pipeline_emails")
      .update({ status: "failed", skip_reason: String(err) })
      .eq("id", row.id);
    return Response.json({ error: "Resend failed to send the email" }, { status: 502 });
  }
}
