-- ═══════════════════════════════════════════════════════════════════════
-- Behavior-driven email journey (replaces the fixed-timer sequence for
-- NEW leads; existing leads keep journey_mode='legacy' and finish the old
-- timed sequence untouched).
-- ═══════════════════════════════════════════════════════════════════════

-- Every behavioral signal, from every source, in one ledger.
create table if not exists public.journey_events (
  id                       uuid primary key default gen_random_uuid(),
  advertising_request_id   uuid references public.advertising_requests(id) on delete cascade,
  event_type               text not null,   -- form_submitted | email_sent | email_delivered
                                            -- | email_opened | email_clicked | email_bounced
                                            -- | pricing_viewed | checkout_started | paid
                                            -- | rule_fired
  attribution              text not null default 'certain',  -- certain | strong | probable
  metadata                 jsonb,
  created_at               timestamptz not null default now()
);
create index if not exists journey_events_request_idx
  on public.journey_events (advertising_request_id, event_type, created_at desc);

-- Which scheduling brain drives each lead.
alter table public.advertising_requests
  add column if not exists journey_mode text not null default 'legacy'
  check (journey_mode in ('legacy', 'dynamic'));

-- Why the engine sent an email — shown in the admin timeline.
alter table public.pipeline_emails
  add column if not exists trigger_reason text;

-- Per-rule knobs the admin can tune without a deploy. Logic lives in code
-- (src/lib/journey.ts); these rows only enable/disable and set wait times.
create table if not exists public.journey_rules (
  rule_key      text primary key,
  enabled       boolean not null default true,
  wait_minutes  integer not null,
  updated_at    timestamptz not null default now()
);

insert into public.journey_rules (rule_key, enabled, wait_minutes) values
  ('no_open_resend',     true, 2880),  -- no open 48h → resend w/ new subject
  ('opened_no_click',    true, 1440),  -- opened, no click 24h → nudge
  ('sticker_shock',      true, 1440),  -- clicked/viewed pricing, no checkout 24h
  ('checkout_abandoned', true,  360),  -- started checkout, not paid 6h
  ('fallback_ladder',    true, 5760)   -- silence → classic follow-up every 4d
on conflict (rule_key) do nothing;
