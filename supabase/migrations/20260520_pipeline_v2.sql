-- =========================================================================
-- Pipeline v2 — Templates × Sequences × Steps
--
-- Replaces the rigid pricing+followup pair with a composable system:
--   email_templates       = library of HTML templates with {{variables}}
--   email_sequences       = named recipes (e.g. "Aggressive 5-step")
--   email_sequence_steps  = ordered steps inside a sequence (template + delay + condition)
--   pipeline_stops        = manual stop / skip / send-now actions per lead
--
-- pipeline_emails gains: template_id, sequence_id, sequence_step_id,
-- step_order, send_condition snapshot, processing_started_at, and a
-- "cancelled" status. The legacy email_type column is retained (nullable) for
-- backward-compat with existing rows and the pipeline_stats view.
-- =========================================================================

-- ── 1. email_templates ────────────────────────────────────────────────────
create table if not exists public.email_templates (
  id           uuid         primary key default gen_random_uuid(),
  slug         text         not null unique,         -- 'pricing-initial', 'gentle-nudge-1d', ...
  name         text         not null,                -- display name
  category     text         not null default 'followup'
               check (category in ('initial','followup','reminder','reengagement','custom')),
  subject      text         not null,                -- supports {{variables}}
  preview      text,                                 -- inbox preview text
  html         text         not null,                -- supports {{variables}}
  variables    text[]       not null default '{}',   -- declared vars (informational)
  is_active    boolean      not null default true,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);

create index if not exists email_templates_category_idx on public.email_templates (category, is_active);

drop trigger if exists email_templates_set_updated_at on public.email_templates;
create trigger email_templates_set_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();

-- ── 2. email_sequences ────────────────────────────────────────────────────
create table if not exists public.email_sequences (
  id           uuid         primary key default gen_random_uuid(),
  name         text         not null,                -- 'Default ad inquiry sequence'
  description  text,
  is_default   boolean      not null default false,
  is_active    boolean      not null default true,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);

-- Only one default at a time
create unique index if not exists email_sequences_one_default_idx
  on public.email_sequences (is_default) where is_default = true;

drop trigger if exists email_sequences_set_updated_at on public.email_sequences;
create trigger email_sequences_set_updated_at
  before update on public.email_sequences
  for each row execute function public.set_updated_at();

-- ── 3. email_sequence_steps ───────────────────────────────────────────────
create table if not exists public.email_sequence_steps (
  id             uuid        primary key default gen_random_uuid(),
  sequence_id    uuid        not null references public.email_sequences(id) on delete cascade,
  step_order     int         not null,                 -- 1, 2, 3, ...
  template_id    uuid        not null references public.email_templates(id) on delete restrict,
  delay_minutes  int         not null default 1440,    -- delay relative to PREVIOUS step (or submission for step 1)
  send_condition jsonb       not null default '{}'::jsonb,
  -- Example send_condition keys:
  --   { "previous_opened": false }   -- skip if previous email was opened
  --   { "previous_clicked": false }  -- skip if previous email was clicked
  --   { "not_paid": true }           -- skip if a paid subscription matches (by rid/email/phone/company)
  --   { "stop_after_paid": true }    -- (terminal) any future step also skipped
  --   { "always": true }             -- ignore other checks
  is_active      boolean     not null default true,
  label          text,                                  -- optional admin label
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (sequence_id, step_order)
);

create index if not exists email_sequence_steps_seq_idx on public.email_sequence_steps (sequence_id, step_order);

drop trigger if exists email_sequence_steps_set_updated_at on public.email_sequence_steps;
create trigger email_sequence_steps_set_updated_at
  before update on public.email_sequence_steps
  for each row execute function public.set_updated_at();

-- ── 4. pipeline_emails extensions ────────────────────────────────────────
alter table public.pipeline_emails
  add column if not exists template_id            uuid references public.email_templates(id) on delete set null,
  add column if not exists sequence_id            uuid references public.email_sequences(id) on delete set null,
  add column if not exists sequence_step_id       uuid references public.email_sequence_steps(id) on delete set null,
  add column if not exists step_order             int,
  add column if not exists subject                text,
  add column if not exists send_condition         jsonb not null default '{}'::jsonb,
  add column if not exists processing_started_at  timestamptz,
  add column if not exists cancel_reason          text;

-- Make email_type nullable + allow 'cancelled' status
alter table public.pipeline_emails alter column email_type drop not null;
alter table public.pipeline_emails drop constraint if exists pipeline_emails_status_check;
alter table public.pipeline_emails add constraint pipeline_emails_status_check
  check (status in ('scheduled','processing','sent','delivered','opened','clicked','bounced','failed','skipped','cancelled'));

create index if not exists pipeline_emails_due_idx
  on public.pipeline_emails (status, scheduled_for)
  where status = 'scheduled';

-- ── 5. pipeline_stops ────────────────────────────────────────────────────
create table if not exists public.pipeline_stops (
  id                    uuid        primary key default gen_random_uuid(),
  advertising_request_id uuid       not null references public.advertising_requests(id) on delete cascade,
  action                text        not null
                        check (action in ('stop_all','resume','skip_next','cancel_specific','send_now')),
  scope_email_id        uuid        references public.pipeline_emails(id) on delete cascade,
  reason                text,
  admin_email           text,
  created_at            timestamptz not null default now()
);

create index if not exists pipeline_stops_request_idx on public.pipeline_stops (advertising_request_id, created_at desc);

-- ── 6. advertising_requests extensions ───────────────────────────────────
alter table public.advertising_requests
  add column if not exists pipeline_sequence_id   uuid references public.email_sequences(id) on delete set null,
  add column if not exists pipeline_stopped_at    timestamptz,
  add column if not exists pipeline_stop_reason   text,
  add column if not exists unsubscribe_token      uuid not null default gen_random_uuid();

create index if not exists advertising_requests_unsub_idx on public.advertising_requests (unsubscribe_token);

-- ── 7. ad_subscriptions ←→ advertising_requests link ─────────────────────
-- Lets us answer "did this lead pay?" even when the buyer used a different email.
alter table public.ad_subscriptions
  add column if not exists advertising_request_id uuid references public.advertising_requests(id) on delete set null;

create index if not exists ad_subscriptions_request_idx on public.ad_subscriptions (advertising_request_id);

-- ── 8. Refresh pipeline_stats view ───────────────────────────────────────
drop view if exists public.pipeline_stats;
create view public.pipeline_stats as
select
  count(*) filter (where status = 'scheduled')   as scheduled_count,
  count(*) filter (where status = 'sent')         as sent_count,
  count(*) filter (where status = 'delivered')    as delivered_count,
  count(*) filter (where status = 'opened')       as opened_count,
  count(*) filter (where status = 'clicked')      as clicked_count,
  count(*) filter (where status = 'bounced')      as bounced_count,
  count(*) filter (where status = 'failed')       as failed_count,
  count(*) filter (where status = 'skipped')      as skipped_count,
  count(*) filter (where status = 'cancelled')    as cancelled_count,
  count(*) filter (where email_type = 'pricing')  as pricing_total,
  count(*) filter (where email_type = 'followup') as followup_total,
  count(*)                                        as total
from public.pipeline_emails;
