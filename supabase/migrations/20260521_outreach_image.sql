-- =========================================================================
-- Outreach template — show the popup ad image for review.
--
-- Reworks the popup-ad-question template so it can display the recipient's
-- popup ad. The <!--POPUP_IMAGE--> marker is replaced at send time with an
-- <img> block (or removed if no image was attached).
-- =========================================================================

insert into public.email_templates (slug, name, category, subject, preview, variables, html)
values (
  'popup-ad-question',
  'Outreach — Popup Ad Question',
  'custom',
  'A quick look at your popup ad',
  'Take a look at your popup ad, {{firstName}} — two quick questions.',
  ARRAY['firstName'],
  $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Your Popup Ad</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">A quick look at your popup ad</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 16px;">Hi {{firstName}},</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 16px;">We&rsquo;re getting your popup ad ready to go live on DSCR Calculator Pro. Here&rsquo;s what we have so far:</p>
<!--POPUP_IMAGE-->
<p style="font-size:15px;line-height:1.7;color:#0A1628;margin:0 0 12px;"><strong>Two quick things before we publish it:</strong></p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 12px;"><strong style="color:#0A1628;">1. How does it look?</strong> If you&rsquo;d like any changes to the ad, just let us know.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 16px;"><strong style="color:#0A1628;">2. Where should it go?</strong> When someone taps your popup ad, where would you like it to take them? Send us the web address you&rsquo;d like people to go to — your homepage, a specific offer page, a sign-up form, wherever you want the visitors.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 8px;">Simply <strong style="color:#0A1628;">reply to this email</strong> with your answers and we&rsquo;ll take care of the rest.</p>
<p style="font-size:15px;line-height:1.7;color:#0A1628;margin:20px 0 0;">Thanks!<br/>The DSCR Calculator Pro Team</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;">dscrcalculator.pro</td></tr>
</table></td></tr></table></body></html>$TPL$
)
on conflict (slug) do update set
  name      = excluded.name,
  subject   = excluded.subject,
  preview   = excluded.preview,
  html      = excluded.html,
  variables = excluded.variables,
  updated_at = now();
