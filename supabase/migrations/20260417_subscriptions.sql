-- =========================================================================
-- Ad Subscriptions + Payments
-- Tracks Stripe checkout sessions, payments, and subscription lifecycle.
-- Written by landing-site webhook. Read from admin-portal.
-- =========================================================================

-- ── 1. Ad Plans (reference data) ────────────────────────────────────────
create table if not exists public.ad_plans (
  id              text        primary key,  -- e.g. 'starter', 'pro'
  name            text        not null,
  placement       text        not null,
  duration_months int         not null,
  price_national  int         not null,     -- cents
  price_state     int,
  price_metro     int,
  features        text[],                   -- array of feature strings
  badge           text,                     -- 'Best Value', 'Popular', null
  is_recommended  boolean     not null default false,
  savings_label   text,                     -- 'Save 58% vs monthly'
  sort_order      int         not null default 0,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now()
);

-- Seed plans
insert into public.ad_plans (id, name, placement, duration_months, price_national, price_state, price_metro, features, badge, is_recommended, savings_label, sort_order) values
  ('starter',      'Starter',      'Results Page Banner',  1, 34900, 11900, 6900,  '{"Banner ad","Impression reporting","320×50 format"}',                              null,         false, null,                    1),
  ('premium',      'Premium',      'Full-Screen Pop-Up',   1, 59700, 19900, 11900, '{"Full-screen interstitial","Click analytics","Custom creative"}',                  null,         false, null,                    2),
  ('growth',       'Growth',       'Homepage Banner',      3, 89700, 29900, 17900, '{"Homepage placement","Tap reporting","Priority position"}',                        null,         false, null,                    3),
  ('pro',          'Pro',          'Homepage + Banner',    6, 149700, 49700, 29700, '{"Dual placement","Full dashboard","A/B testing","Dedicated support"}',             'Best Value', true,  'Save 58% vs monthly',   4),
  ('premium-plus', 'Premium Plus', 'Full-Screen Pop-Up',   3, 149700, 49700, 29700, '{"Category exclusivity","Monthly reviews","Account rep"}',                          'Popular',    false, 'Save 16% vs monthly',   5)
on conflict (id) do nothing;

-- ── 2. Ad Subscriptions ─────────────────────────────────────────────────
create table if not exists public.ad_subscriptions (
  id                    uuid         primary key default gen_random_uuid(),

  -- Who
  email                 text         not null,
  company_name          text,
  contact_name          text,
  phone                 text,

  -- What
  plan_id               text         not null references public.ad_plans(id),
  geo_targeting         text         not null default 'national' check (geo_targeting in ('national','state','metro')),
  price_cents           int          not null,

  -- Stripe
  stripe_checkout_id    text         unique,
  stripe_payment_intent text,
  stripe_customer_id    text,

  -- Lifecycle
  status                text         not null default 'pending'
                        check (status in ('pending','paid','active','creative_submitted','paused','completed','cancelled','refunded')),
  paid_at               timestamptz,
  starts_at             date,
  ends_at               date,

  -- Creative (advertiser submits after payment)
  creative_url          text,
  creative_notes        text,
  creative_submitted_at timestamptz,
  creative_approved_at  timestamptz,

  -- Admin
  admin_notes           text,

  created_at            timestamptz  not null default now(),
  updated_at            timestamptz  not null default now()
);

create index if not exists ad_subscriptions_status_idx on public.ad_subscriptions (status, created_at desc);
create index if not exists ad_subscriptions_email_idx on public.ad_subscriptions (email);
create index if not exists ad_subscriptions_stripe_checkout_idx on public.ad_subscriptions (stripe_checkout_id);

-- ── 3. Payment Events (webhook log) ─────────────────────────────────────
create table if not exists public.ad_payment_events (
  id                    uuid         primary key default gen_random_uuid(),
  subscription_id       uuid         references public.ad_subscriptions(id) on delete cascade,
  stripe_event_id       text         unique not null,
  event_type            text         not null,    -- 'checkout.session.completed', 'payment_intent.succeeded', etc.
  amount_cents          int,
  currency              text         default 'usd',
  raw_data              jsonb,
  created_at            timestamptz  not null default now()
);

create index if not exists ad_payment_events_sub_idx on public.ad_payment_events (subscription_id, created_at desc);

-- ── 4. Updated_at trigger ────────────────────────────────────────────────
-- Reuse the function from advertising_requests if it exists, else create
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ad_subscriptions_set_updated_at on public.ad_subscriptions;
create trigger ad_subscriptions_set_updated_at
  before update on public.ad_subscriptions
  for each row execute function public.set_updated_at();
