-- =========================================================================
-- Outreach — one-off tracked emails.
--
-- A pipeline_emails row can now target NOTHING (no advertising_request, no
-- subscription) — a "direct" email sent to a hand-entered recipient from the
-- admin Outreach page. Open/click tracking reuses the existing pixel + click
-- routes (keyed on pipeline_emails.id), so direct emails get tracking for free.
-- =========================================================================

-- ── 1. Allow targetless rows ─────────────────────────────────────────────
-- Was: exactly one of advertising_request_id / subscription_id.
-- Now: never BOTH — but zero is allowed (a direct email).
alter table public.pipeline_emails
  drop constraint if exists pipeline_emails_one_target_chk;
alter table public.pipeline_emails
  add constraint pipeline_emails_one_target_chk
  check (not (advertising_request_id is not null and subscription_id is not null));

-- ── 2. Premade outreach template ─────────────────────────────────────────
-- Reply-driven (no link) — replies route to hamza@ + info@airosofts.com.
insert into public.email_templates (slug, name, category, subject, preview, variables, html)
values (
  'popup-ad-question',
  'Outreach — Popup Ad Question',
  'custom',
  'Quick question about your popup ad',
  'We''re getting your popup ad ready, {{firstName}} — one quick thing.',
  ARRAY['firstName'],
  $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Quick Question</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">A quick question about your popup ad</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 16px;">Hi {{firstName}},</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 16px;">We&rsquo;re getting your popup ad ready to go live on DSCR Calculator Pro. One quick thing before we publish it:</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 16px;"><strong style="color:#0A1628;">When someone taps your popup ad, where would you like it to take them?</strong> Just send us the web address you&rsquo;d like people to go to — your homepage, a specific offer page, a sign-up form, wherever you want the visitors.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 16px;">Simply <strong style="color:#0A1628;">reply to this email</strong> with the link and we&rsquo;ll take care of the rest.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 8px;">If there&rsquo;s anything you&rsquo;d like to adjust about the popup ad itself, mention it in your reply too — happy to help.</p>
<p style="font-size:15px;line-height:1.7;color:#0A1628;margin:20px 0 0;">Thanks!<br/>The DSCR Calculator Pro Team</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;">dscrcalculator.pro</td></tr>
</table></td></tr></table></body></html>$TPL$
)
on conflict (slug) do nothing;
