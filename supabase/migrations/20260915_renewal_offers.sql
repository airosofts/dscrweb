-- =========================================================================
-- Renewal offers — never let a paid placement lapse unnoticed again.
--
-- Adds a fourth sequence kind, `renewal_offer`, to the pipeline engine:
--   renewal_offer → paid customers whose campaign ends within RENEWAL_LEAD_DAYS
--                   (7) get an automatic recap + discounted-renewal email.
--
-- The processor (landing-site /api/pipeline/process, run every minute):
--   1. Sweeps ad_subscriptions with an ends_at inside the lead window and no
--      renewal_seq_started_at → creates a pending renewal subscription + a
--      Stripe payment link at RENEWAL_DISCOUNT_PCT (25%) off, and schedules
--      the default renewal_offer sequence.
--   2. Marks active subscriptions whose ends_at has passed as 'completed'.
--   3. Cancels remaining renewal emails the moment the renewal is paid.
--
-- Run in the Supabase SQL editor, then `scripts/check-migrations.sh`.
-- =========================================================================

-- ── 1. email_sequences.kind gains 'renewal_offer' ───────────────────────
alter table public.email_sequences drop constraint if exists email_sequences_kind_check;
alter table public.email_sequences
  add constraint email_sequences_kind_check
  check (kind in ('ad_inquiry', 'creative_pending', 'landing_missing', 'renewal_offer'));

-- ── 2. ad_subscriptions renewal bookkeeping ──────────────────────────────
alter table public.ad_subscriptions
  -- On the ORIGINAL (expiring) subscription:
  add column if not exists renewal_seq_started_at timestamptz,   -- idempotency: offer sequence scheduled
  add column if not exists renewal_offer_url      text,          -- Stripe payment link the customer was sent
  add column if not exists renewal_price_cents    int,           -- discounted price offered
  add column if not exists renewal_subscription_id uuid
    references public.ad_subscriptions(id) on delete set null,   -- the pending/paid renewal row
  add column if not exists expired_at             timestamptz,   -- when the processor marked it completed
  -- On the RENEWAL subscription:
  add column if not exists renews_subscription_id uuid
    references public.ad_subscriptions(id) on delete set null;   -- points back at the original

create index if not exists ad_subscriptions_renewal_due_idx
  on public.ad_subscriptions (ends_at)
  where renewal_seq_started_at is null and ends_at is not null;

create index if not exists ad_subscriptions_renews_idx
  on public.ad_subscriptions (renews_subscription_id)
  where renews_subscription_id is not null;

-- ── 3. Backfill: campaigns that already expired were handled by hand ─────
-- (United Lending's May–Aug 2026 campaign got a manual recap + offer on
-- 2026-09-15.) Stamp them so the automation only chases FUTURE expirations.
update public.ad_subscriptions
set renewal_seq_started_at = coalesce(renewal_seq_started_at, now())
where ends_at is not null
  and ends_at < current_date
  and renewal_seq_started_at is null;

-- Link the hand-made United Lending renewal row to its original, if present.
update public.ad_subscriptions r
set renews_subscription_id = 'a960bb44-7ea6-4c23-954d-3d783d5e940d'
where r.id = '993f0d2e-d627-4e13-a232-61788923f3f2'
  and exists (select 1 from public.ad_subscriptions o where o.id = 'a960bb44-7ea6-4c23-954d-3d783d5e940d');

update public.ad_subscriptions o
set renewal_subscription_id = '993f0d2e-d627-4e13-a232-61788923f3f2',
    renewal_offer_url       = 'https://buy.stripe.com/9B63cv2Jn8j7eZAfhR2sM0s',
    renewal_price_cents     = 112000,
    status                  = case when o.status in ('active','creative_submitted') then 'completed' else o.status end,
    expired_at              = coalesce(o.expired_at, o.ends_at::timestamptz)
where o.id = 'a960bb44-7ea6-4c23-954d-3d783d5e940d'
  and exists (select 1 from public.ad_subscriptions r where r.id = '993f0d2e-d627-4e13-a232-61788923f3f2');

-- ── 4. Templates ─────────────────────────────────────────────────────────
-- New variables (see landing-site src/lib/pipeline.ts ALLOWED_VARIABLES):
--   {{planName}} {{placement}} {{startsAt}} {{endsAt}} {{daysLeft}}
--   {{impressions}} {{totalClicks}} {{uniqueClicks}}
--   {{originalPrice}} {{renewalPrice}} {{renewalDiscount}} {{renewalUrl}}
insert into public.email_templates (slug, name, category, subject, preview, variables, html) values

-- Step 1 — 7 days before expiry: recap + offer
('renewal-offer', 'Renewal Offer — 7 Days Before Expiry', 'reengagement',
 'Your {{companyName}} campaign ends {{endsAt}} — results + a renewal offer',
 '{{uniqueClicks}} investors clicked through so far. Here''s the recap, {{firstName}}.',
 ARRAY['firstName','companyName','planName','endsAt','daysLeft','impressions','totalClicks','uniqueClicks','originalPrice','renewalPrice','renewalDiscount','renewalUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:26px 32px 22px;border-bottom:1px solid #E8E4DD;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;">DSCR Calculator Pro</div>
<div style="margin-top:4px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#A09888;">Real Estate Investment Tools</div></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Campaign Recap</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Your placement wraps up in {{daysLeft}} days, {{firstName}}.</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">Your {{planName}} placement for <strong style="color:#0A1628;">{{companyName}}</strong> ends on <strong style="color:#0A1628;">{{endsAt}}</strong>. Before anything else, here are the numbers so far.</p>
<table role="presentation" width="100%" style="margin:0 0 22px;background:#FAF8F4;border:1px solid #E8E4DD;border-left:3px solid #9B7B4E;"><tr><td style="padding:18px 22px;">
<table role="presentation" width="100%"><tr>
<td width="33%" style="vertical-align:top;padding-right:8px;"><div style="font-size:28px;font-weight:800;color:#0A1628;">{{impressions}}</div><div style="font-size:12px;color:#5A6978;">times your ad was shown</div></td>
<td width="33%" style="vertical-align:top;padding:0 8px;"><div style="font-size:28px;font-weight:800;color:#0A1628;">{{totalClicks}}</div><div style="font-size:12px;color:#5A6978;">taps on your ad</div></td>
<td width="33%" style="vertical-align:top;padding-left:8px;"><div style="font-size:28px;font-weight:800;color:#9B7B4E;">{{uniqueClicks}}</div><div style="font-size:12px;color:#5A6978;">unique investors on your landing page</div></td>
</tr></table></td></tr></table>
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:12px;">— Renewal Offer</div>
<h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#0A1628;">Keep it running: 3 more months at {{renewalDiscount}} off.</h2>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">Your creative and tracked link are already built and approved, so a renewal costs us very little to set up and we&rsquo;d rather pass that on. Renew the same placement for <strong style="color:#0A1628;">{{renewalPrice}}</strong> instead of <span style="text-decoration:line-through;">{{originalPrice}}</span> and there&rsquo;s no gap: the new term starts the day your current one ends. Nothing to re-upload.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{renewalUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Renew for {{renewalPrice}} →</a></td></tr></table>
<p style="margin:24px 0 0;font-size:13px;color:#5A6978;line-height:1.6;">Want to swap the creative, change the landing page, or talk about a different plan? Just reply to this email.</p>
<p style="margin:16px 0 0;font-size:13px;color:#0A1628;">Thanks for advertising with us,<br/>The DSCR Calculator Pro team</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;">dscrcalculator.pro · You&rsquo;re receiving this because you run an ad campaign with DSCR Calculator Pro.</td></tr>
</table></td></tr></table></body></html>$TPL$),

-- Step 2 — on the expiry day
('renewal-offer-expiry', 'Renewal Offer — Expiry Day', 'reengagement',
 'Your {{companyName}} ad comes down today — renew at {{renewalDiscount}} off',
 'Today is the last day of your placement, {{firstName}}. The renewal offer is still open.',
 ARRAY['firstName','companyName','planName','endsAt','impressions','totalClicks','uniqueClicks','originalPrice','renewalPrice','renewalDiscount','renewalUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Last Day</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Your {{companyName}} placement ends today, {{firstName}}.</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">Your {{planName}} campaign has reached the end of its term. Final tally: <strong style="color:#0A1628;">{{impressions}}</strong> impressions, <strong style="color:#0A1628;">{{totalClicks}}</strong> taps, and <strong style="color:#0A1628;">{{uniqueClicks}}</strong> unique investors sent to your landing page.</p>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 22px;">The renewal offer we sent last week is still open: 3 more months for <strong style="color:#0A1628;">{{renewalPrice}}</strong> instead of <span style="text-decoration:line-through;">{{originalPrice}}</span>, back live within 24 hours of payment, using the creative you already have.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{renewalUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Renew for {{renewalPrice}} →</a></td></tr></table>
<p style="margin:24px 0 0;font-size:13px;color:#5A6978;">Questions, or want to change anything first? Just reply.</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;">dscrcalculator.pro</td></tr>
</table></td></tr></table></body></html>$TPL$),

-- Step 3 — one week after expiry
('renewal-offer-final', 'Renewal Offer — Final (1 Week After)', 'reengagement',
 'Should we keep your spot open, {{firstName}}?',
 'A last note about renewing your DSCR Calculator Pro placement.',
 ARRAY['firstName','companyName','uniqueClicks','originalPrice','renewalPrice','renewalDiscount','renewalUrl'],
 $TPL$<!doctype html><html><body style="margin:0;padding:0;background:#F5F2ED;font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#0A1628;">
<table role="presentation" width="100%" style="background:#F5F2ED;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="560" style="max-width:560px;background:#FFF;border:1px solid #E8E4DD;">
<tr><td style="height:3px;background:#9B7B4E;"></td></tr>
<tr><td style="padding:32px;">
<div style="font-family:monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9B7B4E;margin-bottom:18px;">— Last Note</div>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0A1628;">Should we keep your spot open, {{firstName}}?</h1>
<p style="font-size:15px;line-height:1.7;color:#5A6978;margin:0 0 18px;">It&rsquo;s been a week since the {{companyName}} placement came down. The rotation is small on purpose, so we&rsquo;ll be offering the slot to the next lender on the list soon. If you&rsquo;d like to keep it, the {{renewalDiscount}}-off renewal ({{renewalPrice}} instead of {{originalPrice}}) is one click away.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#9B7B4E;padding:14px 28px;"><a href="{{renewalUrl}}" style="color:#FAF8F4;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Renew for {{renewalPrice}} →</a></td></tr></table>
<p style="margin:24px 0 0;font-size:13px;color:#A09888;">Not the right time? No problem, this is our last automated note. Reply any time if that changes.</p>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #E8E4DD;background:#FAF8F4;font-size:11px;color:#A09888;">dscrcalculator.pro</td></tr>
</table></td></tr></table></body></html>$TPL$)

on conflict (slug) do nothing;

-- ── 5. Default renewal_offer sequence ────────────────────────────────────
-- Step 1 fires the moment the sub enters the 7-day window (delay 0);
-- step 2 lands on the expiry day (+7d); step 3 one week after (+7d).
insert into public.email_sequences (id, name, description, kind, is_default, is_active)
values (
  '00000000-0000-0000-0000-0000000c0003',
  'Default Renewal Offer Sequence',
  '7 days before expiry: recap + 25% off → expiry day → +7d final. Auto-stops when the renewal is paid.',
  'renewal_offer', true, true
)
on conflict (id) do nothing;

insert into public.email_sequence_steps (sequence_id, step_order, template_id, delay_minutes, send_condition, label)
select '00000000-0000-0000-0000-0000000c0003'::uuid, v.step_order, t.id, v.delay_minutes, '{}'::jsonb, v.label
from (values
  (1, 'renewal-offer',        0,     'Recap + offer (7 days before expiry)'),
  (2, 'renewal-offer-expiry', 10080, 'Expiry day (+7d)'),
  (3, 'renewal-offer-final',  10080, 'Final note (+7d after expiry)')
) as v(step_order, slug, delay_minutes, label)
join public.email_templates t on t.slug = v.slug
on conflict (sequence_id, step_order) do nothing;
