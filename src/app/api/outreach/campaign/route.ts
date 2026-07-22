import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend, FROM_ADDRESS, PUBLIC_SITE_URL, REPLY_TO } from "@/lib/resend";
import { renderTemplate, wrapClick, type TemplateRow, type TemplateVars } from "@/lib/pipeline";

/**
 * Bulk lender-outreach campaign — sends one tracked email per recipient.
 *
 * POST /api/outreach/campaign
 *   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>   (internal — admin portal)
 *   body: {
 *     recipients: string[],       // email addresses
 *     subject?: string,           // overrides the template subject
 *     reply_to?: string[],        // where replies route (defaults to REPLY_TO)
 *     template_slug?: string,     // defaults to 'lender-outreach'
 *   }
 *
 * Each recipient gets a targetless pipeline_emails row (so the existing
 * open-pixel + click-redirect tracking works), the Advertise button is
 * rewritten to a click-tracked URL, and replies route to reply_to.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SLUG = "lender-outreach";
const MAX_RECIPIENTS = 200;

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

  // ── Recipients: dedupe + validate ────────────────────────────────────
  const raw = Array.isArray(body.recipients) ? body.recipients : [];
  const recipients = [...new Set(
    raw.map((r) => String(r).trim().toLowerCase()).filter((r) => EMAIL_RE.test(r)),
  )];
  const invalid = raw.length - recipients.length;
  if (recipients.length === 0) {
    return Response.json({ error: "No valid recipient emails" }, { status: 400 });
  }
  if (recipients.length > MAX_RECIPIENTS) {
    return Response.json({ error: `Too many recipients (max ${MAX_RECIPIENTS})` }, { status: 400 });
  }

  // ── Reply-to: validated list, falls back to the team default ─────────
  const replyToInput = Array.isArray(body.reply_to)
    ? body.reply_to.map((r) => String(r).trim().toLowerCase()).filter((r) => EMAIL_RE.test(r))
    : [];
  const replyTo = replyToInput.length > 0 ? replyToInput : REPLY_TO;

  // ── Template ─────────────────────────────────────────────────────────
  const slug = typeof body.template_slug === "string" ? body.template_slug : DEFAULT_SLUG;
  const { data: tmpl } = await supabaseAdmin
    .from("email_templates")
    .select("id, slug, subject, preview, html, is_active")
    .eq("slug", slug)
    .maybeSingle();
  if (!tmpl || !tmpl.is_active) {
    return Response.json({ error: `Template "${slug}" not found or inactive` }, { status: 400 });
  }

  const subject = typeof body.subject === "string" && body.subject.trim()
    ? body.subject.trim()
    : tmpl.subject;

  const batch = crypto.randomUUID();
  let sent = 0;
  const failed: string[] = [];

  for (const to of recipients) {
    try {
      // Tracking record.
      const { data: row, error: insErr } = await supabaseAdmin
        .from("pipeline_emails")
        .insert({
          advertising_request_id: null,
          subscription_id: null,
          template_id: tmpl.id,
          to_email: to,
          send_condition: {},
          scheduled_for: new Date().toISOString(),
          status: "processing",
          outreach_batch: batch,
          outreach_reply_to: replyTo.join(", "),
        })
        .select("id")
        .single();
      if (insErr || !row) { failed.push(to); continue; }

      const firstName = to.split("@")[0].split(/[.\-_]/)[0].replace(/^\w/, (c) => c.toUpperCase());
      const vars: TemplateVars = {
        firstName, companyName: "", email: to,
        pricingUrl: "", unsubscribeUrl: "", submitCreativeUrl: "",
        year: String(new Date().getFullYear()),
      };
      // renderTemplate injects the open-pixel and substitutes vars; we use our
      // own `subject` for the actual send (the template subject is ignored).
      const rendered = renderTemplate(tmpl as TemplateRow, vars, {
        baseUrl: PUBLIC_SITE_URL,
        pipelineEmailId: row.id,
      });
      // Rewrite the Advertise button to a click-tracked URL for THIS recipient.
      // The destination carries ?et=<row.id> so on-site engagement attributes
      // back to this exact email.
      const advertiseTarget = `${PUBLIC_SITE_URL}/advertise?et=${row.id}`;
      const html = rendered.html.replace(
        /<!--ADVERTISE_URL-->/g,
        wrapClick(PUBLIC_SITE_URL, row.id, advertiseTarget),
      );

      const result = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        replyTo,
        subject,
        html,
      });

      await supabaseAdmin
        .from("pipeline_emails")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          resend_email_id: result.data?.id ?? null,
          subject,
        })
        .eq("id", row.id);
      sent++;
    } catch (err) {
      console.error(`[campaign] send failed for ${to}:`, err);
      failed.push(to);
      await supabaseAdmin
        .from("pipeline_emails")
        .update({ status: "failed", skip_reason: String(err).slice(0, 300) })
        .eq("outreach_batch", batch)
        .eq("to_email", to)
        .eq("status", "processing");
    }
  }

  return Response.json({
    ok: true,
    batch,
    sent,
    failed: failed.length,
    invalid,
    reply_to: replyTo,
  });
}
