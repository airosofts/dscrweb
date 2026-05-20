-- =========================================================================
-- Pipeline v2 — Seed default templates + default sequence
-- All templates use the {{variable}} system. Available variables:
--   {{firstName}}, {{fullName}}, {{companyName}}, {{email}}, {{phone}},
--   {{adType}}, {{placement}}, {{pricingUrl}}, {{unsubscribeUrl}}, {{currentYear}}
-- =========================================================================

-- A shared shell snippet repeated across templates (kept inline so admins
-- can edit each template independently). All templates wrap the same masthead
-- + footer and a "Reply or unsubscribe" link.

-- Helper: rebuild_template_body(kicker, title, body_html) is not used; we
-- inline the shell per template so each is self-contained and editable.

insert into public.email_templates (slug, name, category, subject, preview, variables, html) values

-- ────────────────────────────────────────────────────────────────────────
-- 1. PRICING-INITIAL — first email, sent shortly after submission
-- ────────────────────────────────────────────────────────────────────────
('pricing-initial', 'Pricing — Initial', 'initial',
 'Advertising Placement Options · DSCR Calculator Pro',
 '{{firstName}}, your placement options are ready to review.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Your placement options</title></head>
<body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<span style="display:none;max-height:0;overflow:hidden;color:transparent;">{{firstName}}, your placement options are ready to review.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background:#FFFFFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;line-height:3px;font-size:3px;">&nbsp;</td></tr>
<tr><td style="padding:26px 32px 22px;border-bottom:1px solid #E8E4DD;">
<div style="font-family:monospace;font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;">DSCR Calculator Pro</div>
<div style="margin-top:4px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#A09888;">Real Estate Investment Tools</div>
</td></tr>
<tr><td style="padding:36px 32px 28px;">
<div style="font-family:monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9B7B4E;margin-bottom:14px;">— Advertising Inquiry</div>
<h1 style="margin:0 0 18px;font-size:26px;font-weight:800;line-height:1.2;letter-spacing:-0.02em;color:#0A1628;">Your placement options are ready, {{firstName}}.</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#5A6978;">Thank you for reaching out about advertising on DSCR Calculator Pro. We&rsquo;ve put together a summary of placements that align with what you described.</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#5A6978;">Our platform places your brand directly inside the tool real estate investors rely on to underwrite every deal — at the point of decision-making, not while passively browsing.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#9B7B4E;">
<a href="{{pricingUrl}}" style="display:inline-block;padding:14px 28px;color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Review Placement Options →</a>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;">
<tr><td style="padding:20px 22px;">
<div style="font-family:monospace;font-size:10px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:#9B7B4E;margin-bottom:14px;">At a Glance</div>
<div style="font-size:14px;color:#5A6978;line-height:1.8;">
&#x2022; <strong style="color:#0A1628;">High-Intent Audience</strong> — Investors actively running numbers<br/>
&#x2022; <strong style="color:#0A1628;">Flexible Placements</strong> — Banner + interstitial<br/>
&#x2022; <strong style="color:#0A1628;">Nationwide Reach</strong> — Active US markets<br/>
&#x2022; <strong style="color:#0A1628;">Simple Onboarding</strong> — Live in 24 hours after creative
</div>
</td></tr></table>
<p style="margin:28px 0 0;font-size:13px;line-height:1.65;color:#5A6978;">Reply anytime — a human on our team reads every message.</p>
<p style="margin:16px 0 0;font-size:13px;color:#0A1628;">Best regards,<br/>The DSCR Calculator Pro Team</p>
</td></tr>
<tr><td style="padding:20px 32px 26px;border-top:1px solid #E8E4DD;background:#FAF8F4;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#9B7B4E;">dscrcalculator.pro</div>
<div style="margin-top:6px;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></div>
</td></tr></table>
</td></tr></table></body></html>$TPL$),

-- ────────────────────────────────────────────────────────────────────────
-- 2. GENTLE-NUDGE-1D — 1 day, soft check-in
-- ────────────────────────────────────────────────────────────────────────
('gentle-nudge-1d', 'Gentle Nudge — 1 Day', 'followup',
 'Did our placement options land? · DSCR Calculator Pro',
 'Just making sure our email made it through, {{firstName}}.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Just Checking</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Did the email arrive, {{firstName}}?</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">Following up on the advertising options we sent yesterday — sometimes emails like ours end up in a Promotions tab or a busy inbox.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">If you didn&rsquo;t get a chance to look yet, here&rsquo;s the link again:</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{pricingUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">View Options →</a></td></tr></table>
<p style="margin:24px 0 0;font-size:13px;color:#A09888;">No pressure at all — happy to discuss whenever works for you.</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>$TPL$),

-- ────────────────────────────────────────────────────────────────────────
-- 3. VALUE-PROP-3D — 3 days, lean on positioning
-- ────────────────────────────────────────────────────────────────────────
('value-prop-3d', 'Value Prop — 3 Days', 'followup',
 'Why investors notice ads inside DSCR Pro',
 'High-intent placement, not casual scrolling.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— The Pitch</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Why investors actually see our ads</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 16px;">Hi {{firstName}},</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 16px;">Most ad placements compete with cat photos and recipe blogs. Ours don&rsquo;t. Investors open DSCR Calculator Pro when they&rsquo;ve already found a property and want to know whether the numbers work.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">That&rsquo;s the moment your offer lands — between &ldquo;maybe I should buy this&rdquo; and &ldquo;let me run it.&rdquo; You&rsquo;re a step in their workflow, not an interruption.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{pricingUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">See Placement Options →</a></td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>$TPL$),

-- ────────────────────────────────────────────────────────────────────────
-- 4. SOCIAL-PROOF-7D — 7 days, mention reach
-- ────────────────────────────────────────────────────────────────────────
('social-proof-7d', 'Social Proof — 7 Days', 'followup',
 'Where active real estate investors run their numbers',
 'Thousands of underwriting sessions every month.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Audience Snapshot</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">{{firstName}}, here&rsquo;s who you&rsquo;d be reaching</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">DSCR Calculator Pro is used by individual investors, small portfolio owners, and brokers who run scenarios on real properties. Not researchers, not students — buyers and refi candidates.</p>
<table role="presentation" width="100%" style="background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;margin-bottom:24px;">
<tr><td style="padding:18px 20px;font-size:14px;line-height:1.85;color:#5A6978;">
<strong style="color:#0A1628;">High intent.</strong> 70%+ of calcs include a specific loan amount.<br/>
<strong style="color:#0A1628;">Repeat usage.</strong> Investors come back per deal, not once a year.<br/>
<strong style="color:#0A1628;">National coverage.</strong> All US markets — geo-targeting available.
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{pricingUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">View Plans →</a></td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>$TPL$),

-- ────────────────────────────────────────────────────────────────────────
-- 5. URGENCY-14D — 14 days, capacity/availability tone
-- ────────────────────────────────────────────────────────────────────────
('urgency-14d', 'Urgency / Capacity — 14 Days', 'followup',
 'Limited placements left this month',
 'Only a handful of slots open per month, {{firstName}}.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Heads Up</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Slots filling up, {{firstName}}</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">We keep monthly placement counts limited so ads don&rsquo;t crowd the experience. A few of this cycle&rsquo;s slots are still open — wanted to flag it before they&rsquo;re gone.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">If timing is off, no worries — happy to slot you into a future month.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{pricingUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Reserve a Slot →</a></td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>$TPL$),

-- ────────────────────────────────────────────────────────────────────────
-- 6. SOFT-CLOSE-28D — 28 days, final friendly close
-- ────────────────────────────────────────────────────────────────────────
('soft-close-28d', 'Soft Close — 28 Days', 'followup',
 'Closing the loop · DSCR Calculator Pro',
 'Last note from us, {{firstName}} — promise.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Closing the Loop</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Last note, {{firstName}}</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">I won&rsquo;t keep pinging you. If advertising on DSCR Calculator Pro isn&rsquo;t a fit right now, totally understood — timing&rsquo;s a real thing.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">If anything changes down the road, the door is open. You can always come back to the page below or just reply to this email and I&rsquo;ll pick it up.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{pricingUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Bookmark the Options →</a></td></tr></table>
<p style="margin:24px 0 0;font-size:13px;color:#A09888;">Best of luck out there.</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>$TPL$),

-- ────────────────────────────────────────────────────────────────────────
-- 7. CASE-STUDY — case-study oriented (no fixed day)
-- ────────────────────────────────────────────────────────────────────────
('case-study', 'Case Study / Example', 'followup',
 'How a lender ran the same play, {{firstName}}',
 'A short example of what this looks like in practice.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Example</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">{{firstName}}, here&rsquo;s a quick example</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">A regional DSCR lender placed a results-page banner with us. Within 30 days they were getting 3–4 qualified inbound conversations per week — investors who had already run their numbers and wanted financing.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">That&rsquo;s the pattern. You meet investors in the workflow, not the funnel.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{pricingUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">See Options →</a></td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>$TPL$),

-- ────────────────────────────────────────────────────────────────────────
-- 8. CUSTOM-OFFER — leave room for a custom note
-- ────────────────────────────────────────────────────────────────────────
('custom-offer', 'Custom Offer (Editable)', 'followup',
 'A custom angle for {{companyName}}',
 'Tailored idea for your team.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— For {{companyName}}</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">A custom angle, {{firstName}}</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">Edit this template in the admin portal to add a custom pitch for specific advertisers. Anything from a discount to an exclusivity option works.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">When you&rsquo;re ready, click through:</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{pricingUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">View Custom Offer →</a></td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>$TPL$),

-- ────────────────────────────────────────────────────────────────────────
-- 9. REENGAGE-60D — re-engagement, far out
-- ────────────────────────────────────────────────────────────────────────
('reengage-60d', 'Re-engagement — 60 Days', 'reengagement',
 'Still on the fence about advertising?',
 'A quiet check-in from DSCR Calculator Pro.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Quiet Check-in</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Hey {{firstName}}, still curious?</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">It&rsquo;s been a couple of months. If advertising on DSCR Calculator Pro is back on your radar, the options are still here — and we&rsquo;ve added new geo-targeting in the meantime.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{pricingUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Refresh My Memory →</a></td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>$TPL$),

-- ────────────────────────────────────────────────────────────────────────
-- 10. CREATIVE-REMINDER — paid but no creative submitted
-- ────────────────────────────────────────────────────────────────────────
('creative-reminder', 'Creative Submission Reminder', 'reminder',
 'Submit your ad creative — DSCR Calculator Pro',
 'A quick reminder to upload your creative assets.',
 ARRAY['firstName','companyName','pricingUrl','unsubscribeUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Reminder</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Submit your ad creative</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">Hey {{firstName}}, thanks for your payment. To get your ad live on DSCR Calculator Pro, we need your creative assets — banner images, logos, and campaign details.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{pricingUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Submit Creative →</a></td></tr></table>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;"><a href="{{unsubscribeUrl}}" style="color:#A09888;">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>$TPL$)

on conflict (slug) do nothing;

-- ── Default sequence ────────────────────────────────────────────────────
insert into public.email_sequences (id, name, description, is_default, is_active)
values (
  '00000000-0000-0000-0000-00000000d0d0',
  'Default Ad Inquiry Sequence',
  'Pricing → 1d nudge → 3d value → 7d social proof → 14d urgency → 28d soft close',
  true, true
)
on conflict (id) do nothing;

-- Steps for the default sequence
insert into public.email_sequence_steps (sequence_id, step_order, template_id, delay_minutes, send_condition, label)
select
  '00000000-0000-0000-0000-00000000d0d0'::uuid,
  v.step_order,
  t.id,
  v.delay_minutes,
  v.send_condition::jsonb,
  v.label
from (values
  (1, 'pricing-initial', 1,      '{"not_paid":true}',                           'Initial pricing'),
  (2, 'gentle-nudge-1d', 1440,   '{"previous_opened":false,"not_paid":true}',   '1d nudge if not opened'),
  (3, 'value-prop-3d',   2880,   '{"previous_clicked":false,"not_paid":true}',  '3d value if not clicked'),
  (4, 'social-proof-7d', 5760,   '{"previous_clicked":false,"not_paid":true}',  '7d social proof'),
  (5, 'urgency-14d',     10080,  '{"previous_clicked":false,"not_paid":true}',  '14d urgency'),
  (6, 'soft-close-28d',  20160,  '{"previous_clicked":false,"not_paid":true}',  '28d soft close')
) as v(step_order, slug, delay_minutes, send_condition, label)
join public.email_templates t on t.slug = v.slug
on conflict (sequence_id, step_order) do nothing;
