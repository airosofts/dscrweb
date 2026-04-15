/**
 * Brand-matched email templates for DSCR Calculator Pro.
 *
 * Design tokens mirror landing-site/src/app/globals.css:
 *   --color-ink:        #0A1628
 *   --color-ink-mid:    #162236
 *   --color-brass:      #9B7B4E
 *   --color-brass-pale: #D4B896
 *   --color-cream:      #FAF8F4
 *   --color-card-alt:   #F5F2ED
 *   --color-rule:       #E8E4DD
 *   --color-muted:      #A09888
 *   --color-slate:      #5A6978
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
  sponsored_content: "Sponsored Content",
  email_campaign: "Email Campaign",
  other: "Other",
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

/** Shared shell — full-light, cream bg, brass accent. Matches landing-site light surfaces. */
function shell({
  preview,
  kicker,
  title,
  body,
}: {
  preview: string;
  kicker: string;
  title: string;
  body: string;
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
<!-- preview -->
<span style="display:none;max-height:0;overflow:hidden;color:transparent;">${preview}</span>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F2ED;padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background:#FFFFFF;border:1px solid #E8E4DD;">
        <!-- brass accent stripe -->
        <tr><td style="height:3px;background:#9B7B4E;line-height:3px;font-size:3px;">&nbsp;</td></tr>

        <!-- masthead -->
        <tr>
          <td style="padding:26px 32px 22px 32px;border-bottom:1px solid #E8E4DD;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;">
                  <div style="font-family:'DM Mono',Menlo,monospace;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;">
                    DSCR Calculator Pro
                  </div>
                  <div style="margin-top:4px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#A09888;">
                    Real Estate Investment Tools
                  </div>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <!-- tiny editorial mark -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="width:28px;height:28px;background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;text-align:center;vertical-align:middle;">
                        <span style="font-family:'DM Sans',Helvetica,Arial,sans-serif;font-weight:800;font-size:12px;letter-spacing:0;color:#0A1628;">D</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- body -->
        <tr>
          <td style="padding:36px 32px 28px 32px;background:#FFFFFF;">
            <!-- kicker with brass rule -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:12px;">
                  <div style="width:28px;height:1px;background:#9B7B4E;line-height:1px;font-size:1px;">&nbsp;</div>
                </td>
                <td>
                  <div style="font-family:'DM Mono',Menlo,monospace;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#9B7B4E;">
                    ${kicker}
                  </div>
                </td>
              </tr>
            </table>

            <h1 style="margin:18px 0 18px 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:26px;font-weight:800;line-height:1.2;letter-spacing:-0.02em;color:#0A1628;">
              ${title}
            </h1>
            ${body}
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="padding:20px 32px 26px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;">
            <div style="font-family:'DM Mono',Menlo,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;">
              dscrcalculator.pro
            </div>
            <div style="margin-top:4px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;color:#5A6978;line-height:1.5;">
              You received this because you submitted a form on our site. Reply any time — a
              human on our team reads every message.
            </div>
          </td>
        </tr>
      </table>

      <!-- outer caption -->
      <div style="margin-top:16px;font-family:'DM Mono',Menlo,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#A09888;">
        © ${new Date().getFullYear()} DSCR Calculator Pro
      </div>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/* ─────────────────────────── Notification (admin) ─────────────────────────── */

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
    <p style="margin:0 0 22px 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#5A6978;">
      A new advertising request just came in via the public form. Details below — reply directly
      to <a href="mailto:${req.email}" style="color:#9B7B4E;text-decoration:none;font-weight:600;">${req.email}</a>
      or open the admin portal to update the status.
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
          ${row("Start Date", req.startDate || "")}
          ${row("Target Audience", req.targetAudience || "")}
          ${row("Description", req.adDescription)}
          ${row("Notes", req.additionalNotes || "")}
          ${row("Request ID", `<code style="font-family:'DM Mono',Menlo,monospace;font-size:11px;">${req.id}</code>`)}
        </table>
      </td></tr>
    </table>

    <div style="margin-top:22px;">
      <a href="mailto:${req.email}?subject=Re:%20Your%20advertising%20request"
         style="display:inline-block;background:#9B7B4E;color:#FAF8F4;text-decoration:none;padding:12px 22px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
        Reply to ${req.contactPerson.split(" ")[0]} →
      </a>
    </div>
  `;

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

/* ─────────────────────────── Applicant follow-up ─────────────────────────── */

export function buildApplicantFollowup(
  req: AdvertisingRequestPayload,
  pricingUrl: string,
) {
  const firstName = req.contactPerson.split(" ")[0] || "there";

  const body = `
    <p style="margin:0 0 16px 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#0A1628;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 16px 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#5A6978;">
      Thanks for your interest in advertising on DSCR Calculator Pro. We&rsquo;ve reviewed
      your request and put together plan options that match what you described — from
      results-page banners through full-screen placements.
    </p>
    <p style="margin:0 0 28px 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#5A6978;">
      You can review every tier, including national-reach pricing, on the page linked below.
      Self-serve checkout via Stripe — no contracts, no auto-renewal.
    </p>

    <!-- primary CTA -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:#9B7B4E;">
          <a href="${pricingUrl}"
             style="display:inline-block;padding:14px 28px;color:#FAF8F4;text-decoration:none;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
            View Plans &amp; Pricing →
          </a>
        </td>
      </tr>
    </table>

    <!-- tier summary card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
      <tr><td style="padding:20px 22px;">
        <div style="font-family:'DM Mono',Menlo,monospace;font-size:10px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:#9B7B4E;margin-bottom:14px;">
          Plans at a Glance
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${[
            ["Starter", "Results-page banner · 1 month", "$349"],
            ["Growth", "Homepage banner · 3 months", "$897"],
            ["Pro", "Homepage + banner · 6 months", "$1,497"],
            ["Premium", "Full-screen pop-up · 1 month", "$597"],
            ["Premium Plus", "Full-screen pop-up · 3 months", "$1,497"],
          ]
            .map(
              ([name, meta, price], i, arr) => `
          <tr>
            <td style="padding:10px 0;${i < arr.length - 1 ? "border-bottom:1px solid #E8E4DD;" : ""}">
              <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#0A1628;">${name}</div>
              <div style="margin-top:2px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;color:#5A6978;">${meta}</div>
            </td>
            <td align="right" style="padding:10px 0;${i < arr.length - 1 ? "border-bottom:1px solid #E8E4DD;" : ""}font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.02em;color:#0A1628;">
              ${price}
            </td>
          </tr>`,
            )
            .join("")}
        </table>
      </td></tr>
    </table>

    <p style="margin:28px 0 0 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.65;color:#A09888;">
      Questions or want a custom tier? Just reply to this email — we&rsquo;ll get back to you
      within 3–4 business days.
    </p>
    <p style="margin:16px 0 0 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#0A1628;">
      — The DSCR Calculator Pro team
    </p>
  `;

  return {
    subject: `Your advertising plans · DSCR Calculator Pro`,
    html: shell({
      preview: "Your advertising options on DSCR Calculator Pro, with pricing.",
      kicker: "Next Step",
      title: `Here are your plan options, ${firstName}.`,
      body,
    }),
  };
}
