/**
 * DSCR Calculator Pro — Email Templates
 * Brand tokens mirror landing-site globals.css.
 *
 * Tracking:
 *   - Open pixel: 1x1 GIF loaded from /api/track/open?eid=<pipeline_email_id>
 *   - Click wrap: /api/track/click?eid=<pipeline_email_id>&url=<encoded_url>
 */

export type AdvertisingRequestPayload = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string | null;
  adType: string;
  adDescription: string;
  targetAudience?: string | null;
  preferredPlacement: string;
  budgetRange?: string | null;
  budgetCustom?: number | null;
  startDate?: string | null;
  durationMonths?: number | null;
  additionalNotes?: string | null;
  createdAt: string;
};

const LABELS: Record<string, string> = {
  banner: "Banner Ad",
  popup: "Popup Ad",
  homepage: "Homepage",
  calculator_page: "Calculator Page",
  results_section: "Results Section",
  under_500: "Under $500",
  "500_1000": "$500 – $1,000",
  "1000_5000": "$1,000 – $5,000",
  "5000_plus": "$5,000+",
  custom: "Custom",
};

export const label = (v: string | null | undefined, fallback = "—") =>
  (v && LABELS[v]) || v || fallback;

/* ─── Tracking helpers ─── */

function openPixel(baseUrl: string, pipelineEmailId: string) {
  return `<img src="${baseUrl}/api/track/open?eid=${pipelineEmailId}" width="1" height="1" style="display:none;" alt="" />`;
}

function wrapLink(baseUrl: string, pipelineEmailId: string, url: string) {
  return `${baseUrl}/api/track/click?eid=${pipelineEmailId}&url=${encodeURIComponent(url)}`;
}

/* ─── Shared shell ─── */

function shell({
  preview,
  kicker,
  title,
  body,
  trackingPixelHtml,
}: {
  preview: string;
  kicker: string;
  title: string;
  body: string;
  trackingPixelHtml?: string;
}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<!--[if !mso]><!-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<!--<![endif]-->
</head>
<body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;color:#0A1628;-webkit-font-smoothing:antialiased;">
<span style="display:none;max-height:0;overflow:hidden;color:transparent;">${preview}</span>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F2ED;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background:#FFFFFF;border:1px solid #E8E4DD;">
      <tr><td style="height:3px;background:#9B7B4E;line-height:3px;font-size:3px;">&nbsp;</td></tr>

      <!-- masthead -->
      <tr><td style="padding:26px 32px 22px;border-bottom:1px solid #E8E4DD;">
        <div style="font-family:'DM Mono',Menlo,monospace;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;">DSCR Calculator Pro</div>
        <div style="margin-top:4px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#A09888;">Real Estate Investment Tools</div>
      </td></tr>

      <!-- body -->
      <tr><td style="padding:36px 32px 28px;background:#FFFFFF;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="padding-right:12px;"><div style="width:28px;height:1px;background:#9B7B4E;line-height:1px;font-size:1px;">&nbsp;</div></td>
          <td><div style="font-family:'DM Mono',Menlo,monospace;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#9B7B4E;">${kicker}</div></td>
        </tr></table>
        <h1 style="margin:18px 0 18px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:26px;font-weight:800;line-height:1.2;letter-spacing:-0.02em;color:#0A1628;">${title}</h1>
        ${body}
      </td></tr>

      <!-- footer -->
      <tr><td style="padding:20px 32px 26px;border-top:1px solid #E8E4DD;background:#FAF8F4;">
        <div style="font-family:'DM Mono',Menlo,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;">dscrcalculator.pro</div>
        <div style="margin-top:4px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;color:#5A6978;line-height:1.5;">
          You received this because you submitted a form on our site. Reply any time — a human on our team reads every message.
        </div>
      </td></tr>
    </table>

    <div style="margin-top:16px;font-family:'DM Mono',Menlo,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#A09888;">
      © ${new Date().getFullYear()} DSCR Calculator Pro
    </div>
    ${trackingPixelHtml ?? ""}
  </td></tr>
</table>
</body></html>`;
}

/* ═══════════════════════════════════════════════════════════════════════
   1. ADMIN NOTIFICATION (immediate, no tracking)
   ═══════════════════════════════════════════════════════════════════════ */

export function buildAdminNotification(req: AdvertisingRequestPayload) {
  const row = (k: string, v: string | null | undefined) =>
    !v
      ? ""
      : `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #E8E4DD;font-family:'DM Mono',Menlo,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9B7B4E;vertical-align:top;width:150px;">${k}</td>
    <td style="padding:10px 0;border-bottom:1px solid #E8E4DD;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#0A1628;line-height:1.55;">${v}</td>
  </tr>`;

  const budgetDisplay =
    req.budgetRange === "custom" && req.budgetCustom
      ? `$${Number(req.budgetCustom).toLocaleString("en-US")} (custom)`
      : label(req.budgetRange, "—");

  const body = `
    <p style="margin:0 0 22px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#5A6978;">
      A new advertising request just came in. Reply directly to
      <a href="mailto:${req.email}" style="color:#9B7B4E;text-decoration:none;font-weight:600;">${req.email}</a>.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
      <tr><td style="padding:0 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${row("Company", req.companyName)}
          ${row("Contact", req.contactPerson)}
          ${row("Email", `<a href="mailto:${req.email}" style="color:#9B7B4E;text-decoration:none;">${req.email}</a>`)}
          ${row("Phone", req.phone)}
          ${row("Website", req.website ? `<a href="${req.website}" style="color:#9B7B4E;text-decoration:none;">${req.website}</a>` : "")}
          ${row("Ad Type", label(req.adType))}
          ${row("Placement", label(req.preferredPlacement))}
          ${row("Budget", budgetDisplay)}
          ${row("Duration", req.durationMonths ? `${req.durationMonths} month${req.durationMonths === 1 ? "" : "s"}` : "")}
          ${row("Description", req.adDescription)}
          ${row("ID", `<code style="font-family:'DM Mono',Menlo,monospace;font-size:11px;">${req.id}</code>`)}
        </table>
      </td></tr>
    </table>
    <div style="margin-top:22px;">
      <a href="mailto:${req.email}?subject=Re:%20Your%20advertising%20request"
         style="display:inline-block;background:#9B7B4E;color:#FAF8F4;text-decoration:none;padding:12px 22px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
        Reply to ${req.contactPerson.split(" ")[0]} →
      </a>
    </div>`;

  return {
    subject: `New advertising request · ${req.companyName}`,
    html: shell({
      preview: `New advertising request from ${req.companyName}`,
      kicker: "New Submission",
      title: "Advertising Request",
      body,
    }),
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   2. PRICING EMAIL (first pipeline email — NO pricing shown, with tracking)
   ═══════════════════════════════════════════════════════════════════════ */

export function buildPricingEmail(
  req: AdvertisingRequestPayload,
  pricingUrl: string,
  trackingOpts?: { baseUrl: string; pipelineEmailId: string },
) {
  const firstName = req.contactPerson.split(" ")[0] || "there";

  const ctaUrl = trackingOpts
    ? wrapLink(trackingOpts.baseUrl, trackingOpts.pipelineEmailId, pricingUrl)
    : pricingUrl;

  const body = `
    <p style="margin:0 0 16px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#0A1628;">
      ${firstName},
    </p>
    <p style="margin:0 0 16px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#5A6978;">
      Thank you for reaching out about advertising on DSCR Calculator Pro. We appreciate
      your interest in connecting with our investor audience.
    </p>
    <p style="margin:0 0 16px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#5A6978;">
      Our platform places your brand directly inside the tool real estate investors rely on
      to underwrite every deal — reaching them at the point of financial decision-making,
      not while they&rsquo;re passively browsing.
    </p>
    <p style="margin:0 0 28px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#5A6978;">
      I&rsquo;ve put together a summary of our available placements and how they align with
      what you described. You can review everything at the link below.
    </p>

    <!-- primary CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#9B7B4E;">
          <a href="${ctaUrl}"
             style="display:inline-block;padding:14px 28px;color:#FAF8F4;text-decoration:none;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
            Review Placement Options →
          </a>
        </td>
      </tr>
    </table>

    <!-- highlights card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
      <tr><td style="padding:20px 22px;">
        <div style="font-family:'DM Mono',Menlo,monospace;font-size:10px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:#9B7B4E;margin-bottom:14px;">
          At a Glance
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${[
            ["High-Intent Audience", "Investors actively running numbers on live deals"],
            ["Flexible Placements", "Banner ads on the results page or full-screen interstitials"],
            ["Nationwide Coverage", "Reach investors across all active US markets"],
            ["Simple Onboarding", "Select a plan, submit your creative, go live within 24 hours"],
          ]
            .map(
              ([t, d], i, arr) => `
          <tr>
            <td style="padding:10px 0;${i < arr.length - 1 ? "border-bottom:1px solid #E8E4DD;" : ""}">
              <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#0A1628;">${t}</div>
              <div style="margin-top:2px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;color:#5A6978;">${d}</div>
            </td>
          </tr>`,
            )
            .join("")}
        </table>
      </td></tr>
    </table>

    <p style="margin:28px 0 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.65;color:#5A6978;">
      If you have any questions or would like to discuss a custom arrangement, feel free
      to reply directly to this email.
    </p>
    <p style="margin:16px 0 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#0A1628;">
      Best regards,<br/>The DSCR Calculator Pro Team
    </p>`;

  return {
    subject: `Advertising Placement Options · DSCR Calculator Pro`,
    html: shell({
      preview: `${firstName}, your placement options are ready to review.`,
      kicker: "Advertising Inquiry",
      title: `Your placement options are ready, ${firstName}.`,
      body,
      trackingPixelHtml: trackingOpts
        ? openPixel(trackingOpts.baseUrl, trackingOpts.pipelineEmailId)
        : undefined,
    }),
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   3. FOLLOWUP EMAIL (sent if pricing email not opened, with tracking)
   ═══════════════════════════════════════════════════════════════════════ */

export function buildFollowupEmail(
  req: AdvertisingRequestPayload,
  pricingUrl: string,
  trackingOpts?: { baseUrl: string; pipelineEmailId: string },
) {
  const firstName = req.contactPerson.split(" ")[0] || "there";

  const ctaUrl = trackingOpts
    ? wrapLink(trackingOpts.baseUrl, trackingOpts.pipelineEmailId, pricingUrl)
    : pricingUrl;

  const body = `
    <p style="margin:0 0 16px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#0A1628;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 16px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#5A6978;">
      Just following up — we noticed you haven&rsquo;t had a chance to check out the advertising
      options we sent over. No rush at all, but wanted to make sure it didn&rsquo;t get buried.
    </p>
    <p style="margin:0 0 16px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#5A6978;">
      DSCR Calculator Pro reaches real estate investors at the exact moment they&rsquo;re
      underwriting deals. Your ad would be placed directly inside the tool they use
      every day — high intent, not casual scrolling.
    </p>
    <p style="margin:0 0 28px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#5A6978;">
      If advertising is still on your radar, the link below has everything you need.
    </p>

    <!-- primary CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#9B7B4E;">
          <a href="${ctaUrl}"
             style="display:inline-block;padding:14px 28px;color:#FAF8F4;text-decoration:none;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
            View Advertising Options →
          </a>
        </td>
      </tr>
    </table>

    <!-- highlights -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
      <tr><td style="padding:20px 22px;">
        <div style="font-family:'DM Mono',Menlo,monospace;font-size:10px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:#9B7B4E;margin-bottom:14px;">
          Quick Highlights
        </div>
        <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#5A6978;line-height:1.8;">
          &#x2022; Banner ads &amp; full-screen pop-ups available<br/>
          &#x2022; Nationwide reach to active RE investors<br/>
          &#x2022; Self-serve Stripe checkout — live in 24h<br/>
          &#x2022; No contracts, no auto-renewal
        </div>
      </td></tr>
    </table>

    <p style="margin:28px 0 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.65;color:#A09888;">
      Not interested? No worries — just ignore this email and you won&rsquo;t hear from us again.
    </p>
    <p style="margin:16px 0 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#0A1628;">
      — The DSCR Calculator Pro team
    </p>`;

  return {
    subject: `Still interested? Your ad options · DSCR Calculator Pro`,
    html: shell({
      preview: `Following up on your advertising inquiry, ${firstName}.`,
      kicker: "Friendly Follow-up",
      title: `Just checking in, ${firstName}.`,
      body,
      trackingPixelHtml: trackingOpts
        ? openPixel(trackingOpts.baseUrl, trackingOpts.pipelineEmailId)
        : undefined,
    }),
  };
}
