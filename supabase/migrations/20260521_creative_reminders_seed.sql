-- =========================================================================
-- Seed — customer reminder templates + sequences
--
-- Templates use {{firstName}}, {{companyName}}, {{submitCreativeUrl}}.
-- {{submitCreativeUrl}} resolves to the customer's gated creative form.
-- =========================================================================

-- ── Fix the existing creative-reminder template to use submitCreativeUrl ──
-- (The v2 seed pointed its CTA at {{pricingUrl}} by mistake.)
update public.email_templates
set html = replace(html, '{{pricingUrl}}', '{{submitCreativeUrl}}'),
    variables = ARRAY['firstName','companyName','submitCreativeUrl']
where slug = 'creative-reminder';

-- ── New templates ────────────────────────────────────────────────────────
insert into public.email_templates (slug, name, category, subject, preview, variables, html) values

-- Creative reminder #2 — firmer
('creative-pending-2', 'Creative Reminder — Second', 'reminder',
 'Your ad is ready to go — we just need your creative',
 'A quick second nudge to upload your assets, {{firstName}}.',
 ARRAY['firstName','companyName','submitCreativeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Second Reminder</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Let&rsquo;s get your ad live, {{firstName}}</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">Your placement for {{companyName}} is paid and reserved — the only thing between you and going live is your creative. It takes about five minutes to upload.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">Banner images, a logo, and a landing URL is all we need.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{submitCreativeUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Upload Creative →</a></td></tr></table>
<p style="margin:24px 0 0;font-size:13px;color:#A09888;">Stuck on anything? Just reply to this email.</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;">dscrcalculator.pro</td></tr>
</table></td></tr></table></body></html>$TPL$),

-- Creative reminder #3 — final
('creative-pending-final', 'Creative Reminder — Final', 'reminder',
 'Final reminder: your paid ad placement is waiting',
 'We don&rsquo;t want your placement to go unused, {{firstName}}.',
 ARRAY['firstName','companyName','submitCreativeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Final Reminder</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Don&rsquo;t let your placement go to waste</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">Hi {{firstName}}, this is our last automated reminder. You&rsquo;ve already paid for {{companyName}}&rsquo;s ad placement — we just need your creative assets to put it live.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">If something&rsquo;s holding you up — assets not ready, a question about formats — reply to this email and a human will help directly.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{submitCreativeUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Submit Creative Now →</a></td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;">dscrcalculator.pro</td></tr>
</table></td></tr></table></body></html>$TPL$),

-- Landing URL missing
('landing-url-missing', 'Landing URL — Missing', 'reminder',
 'One thing missing from your ad: a landing link',
 'We need the URL your ad should point to, {{firstName}}.',
 ARRAY['firstName','companyName','submitCreativeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Almost There</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">We need your landing link, {{firstName}}</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">Your creative for {{companyName}} looks good — but it&rsquo;s missing one thing: the <strong>landing URL</strong> your ad should send people to when they tap it.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">Re-open your submission below and add the link. Without it, we can&rsquo;t put your ad live.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{submitCreativeUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Add Landing URL →</a></td></tr></table>
<p style="margin:24px 0 0;font-size:13px;color:#A09888;">Or just reply to this email with the link and we&rsquo;ll add it for you.</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;">dscrcalculator.pro</td></tr>
</table></td></tr></table></body></html>$TPL$)

on conflict (slug) do nothing;

-- ── creative_pending sequence — paid, no creative submitted ──────────────
insert into public.email_sequences (id, name, description, kind, is_default, is_active)
values (
  '00000000-0000-0000-0000-0000000c0001',
  'Default Creative Reminder Sequence',
  'Paid → 1d reminder → +2d firmer → +4d final',
  'creative_pending', true, true
)
on conflict (id) do nothing;

insert into public.email_sequence_steps (sequence_id, step_order, template_id, delay_minutes, send_condition, label)
select '00000000-0000-0000-0000-0000000c0001'::uuid, v.step_order, t.id, v.delay_minutes, '{}'::jsonb, v.label
from (values
  (1, 'creative-reminder',      1440,  'First reminder (1d)'),
  (2, 'creative-pending-2',     2880,  'Second reminder (+2d)'),
  (3, 'creative-pending-final', 5760,  'Final reminder (+4d)')
) as v(step_order, slug, delay_minutes, label)
join public.email_templates t on t.slug = v.slug
on conflict (sequence_id, step_order) do nothing;

-- ── landing_missing sequence — creative submitted, no landing URL ────────
insert into public.email_sequences (id, name, description, kind, is_default, is_active)
values (
  '00000000-0000-0000-0000-0000000c0002',
  'Default Landing URL Reminder',
  'Creative submitted without a landing URL → nudge → +3d followup',
  'landing_missing', true, true
)
on conflict (id) do nothing;

insert into public.email_sequence_steps (sequence_id, step_order, template_id, delay_minutes, send_condition, label)
select '00000000-0000-0000-0000-0000000c0002'::uuid, v.step_order, t.id, v.delay_minutes, '{}'::jsonb, v.label
from (values
  (1, 'landing-url-missing', 60,   'Landing URL nudge'),
  (2, 'landing-url-missing', 4320, 'Landing URL followup (+3d)')
) as v(step_order, slug, delay_minutes, label)
join public.email_templates t on t.slug = v.slug
on conflict (sequence_id, step_order) do nothing;
