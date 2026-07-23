import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resend, PUBLIC_SITE_URL, REPLY_TO } from "@/lib/resend";
import { renderTemplate, wrapClick, type TemplateRow, type TemplateVars } from "@/lib/pipeline";

/**
 * Bulk lender-outreach campaign — sends one tracked email per recipient.
 *
 * POST /api/outreach/campaign
 *   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>   (internal — admin portal)
 *   body: {
 *     recipients: Array<string | { email, name?, company? }>,
 *     subject?: string,           // overrides template subject; supports {{firstName}}/{{companyName}}
 *     reply_to?: string[],        // where replies route (defaults to REPLY_TO)
 *     template_slug?: string,     // defaults to 'lender-outreach'
 *     plain?: boolean,            // default TRUE: person-style send — no open pixel,
 *                                 // direct links (no redirect), multipart text+html.
 *                                 // Opens aren't tracked; page visits still stamp the
 *                                 // email as clicked via /api/track/engagement.
 *   }
 *
 * Each recipient gets a targetless pipeline_emails row. In plain mode the body
 * links go straight to /advertise?et=<row.id> so on-site engagement (and the
 * clicked stamp) still attribute to the exact email — Gmail just never sees a
 * tracking pixel or a redirect-wrapped URL, which is what flags Promotions.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SLUG = "lender-outreach";

// Outreach comes from a real person, never a no-reply. Keep the display name
// human ("Marcus"), not brand-y ("Marcus at X") — brand-y from-names are a
// campaign-tool fingerprint.
const OUTREACH_FROM =
  process.env.OUTREACH_FROM_EMAIL || "Marcus <marcus@dscrcalculator.pro>";
const MAX_RECIPIENTS = 200;

type Recip = { email: string; name?: string; company?: string };

// Role inboxes we must never turn into a greeting ("Hi Info,").
const ROLE_ACCOUNTS = new Set([
  "info", "admin", "hello", "hi", "contact", "sales", "team", "support",
  "office", "mail", "marketing", "press", "help", "loans", "lending",
  "inquiries", "enquiries", "billing", "accounts", "partnerships",
]);

/** Greeting name: explicit name wins; else the email local-part only when it
 *  clearly looks like a first name; else "there". Never mangled local-parts. */
function greetingName(r: Recip): string {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (r.name) return cap(r.name.split(/\s+/)[0]);
  const first = r.email.split("@")[0].split(/[.\-_+\d]/)[0].toLowerCase();
  if (first.length >= 2 && first.length <= 10 && /^[a-z]+$/.test(first) && !ROLE_ACCOUNTS.has(first)) {
    return cap(first);
  }
  return "there";
}

function personalize(s: string, vars: { firstName: string; companyName: string }): string {
  return s
    .replace(/\{\{\s*firstName\s*\}\}/g, vars.firstName)
    .replace(/\{\{\s*companyName\s*\}\}/g, vars.companyName)
    .replace(/ {2,}/g, " ")
    .trim();
}

/** Derive the text/plain part from the rendered HTML — a real multipart email
 *  is a strong "sent by a person" signal to inbox classifiers. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, "").trim();
      return href && href.startsWith("http") && text !== href ? `${text} (${href})` : text || href;
    })
    .replace(/<[^>]+>/g, "")
    .replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
    .replace(/&ldquo;|&rdquo;/g, '"').replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&hellip;/g, "…").replace(/&nbsp;/g, " ")
    .replace(/&copy;/g, "©").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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

  // ── Recipients: strings or {email, name, company}; dedupe + validate ──
  const raw = Array.isArray(body.recipients) ? body.recipients : [];
  const seen = new Set<string>();
  const recipients: Recip[] = [];
  let invalid = 0;
  for (const r of raw) {
    const obj = typeof r === "object" && r !== null ? (r as Record<string, unknown>) : null;
    const email = String(obj ? obj.email ?? "" : r).trim().toLowerCase();
    if (!EMAIL_RE.test(email)) { invalid++; continue; }
    if (seen.has(email)) continue;
    seen.add(email);
    recipients.push({
      email,
      name: obj && typeof obj.name === "string" && obj.name.trim() ? obj.name.trim() : undefined,
      company: obj && typeof obj.company === "string" && obj.company.trim() ? obj.company.trim() : undefined,
    });
  }
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

  const subjectRaw = typeof body.subject === "string" && body.subject.trim()
    ? body.subject.trim()
    : tmpl.subject;

  // Person-style send is the default; pass plain:false to restore the pixel
  // and redirect-wrapped links.
  const plain = body.plain !== false;

  const batch = crypto.randomUUID();
  let sent = 0;
  const failed: string[] = [];

  for (const r of recipients) {
    const to = r.email;
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

      const firstName = greetingName(r);
      const vars: TemplateVars = {
        firstName, companyName: r.company ?? "", email: to,
        pricingUrl: "", unsubscribeUrl: "", submitCreativeUrl: "",
        year: String(new Date().getFullYear()),
      };
      // Plain mode: render WITHOUT trackingOpts so no open pixel is injected.
      const rendered = renderTemplate(tmpl as TemplateRow, vars, plain
        ? undefined
        : { baseUrl: PUBLIC_SITE_URL, pipelineEmailId: row.id });

      // The destination carries ?et=<row.id> so on-site engagement attributes
      // back to this exact email. Plain mode links straight there (the
      // engagement endpoint stamps clicked_at); tracked mode goes through the
      // click redirect.
      const advertiseTarget = `${PUBLIC_SITE_URL}/advertise?et=${row.id}`;
      const linkUrl = plain ? advertiseTarget : wrapClick(PUBLIC_SITE_URL, row.id, advertiseTarget);
      const html = rendered.html.replace(/<!--ADVERTISE_URL-->/g, linkUrl);
      const subject = personalize(subjectRaw, { firstName, companyName: r.company ?? "" });

      const result = await resend.emails.send({
        from: OUTREACH_FROM,
        to,
        replyTo,
        subject,
        html,
        text: htmlToText(html),
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
    plain,
    reply_to: replyTo,
  });
}
