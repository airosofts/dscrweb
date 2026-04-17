-- =========================================================================
-- Advertising Pipeline + Email Tracking
-- Manages timed email sequences for advertising form submissions.
-- Tracks opens and clicks via pixel + link wrapping.
-- =========================================================================

-- ── 1. Pipeline Settings (singleton config row) ─────────────────────────
create table if not exists public.pipeline_settings (
  id                          int          primary key default 1 check (id = 1),  -- singleton
  -- First email (pricing)
  pricing_email_delay_minutes int          not null default 1,       -- delay after form submission
  pricing_email_enabled       boolean      not null default true,

  -- Followup email (sent if pricing email not opened)
  followup_email_enabled      boolean      not null default true,
  followup_delay_minutes      int          not null default 1440,    -- default 24 hours
  followup_check_condition    text         not null default 'not_opened'
                              check (followup_check_condition in ('not_opened','not_clicked','always')),

  updated_at                  timestamptz  not null default now()
);

-- Seed default config
insert into public.pipeline_settings (id) values (1) on conflict (id) do nothing;

-- ── 2. Pipeline Emails (each email sent per advertising request) ────────
create table if not exists public.pipeline_emails (
  id                    uuid         primary key default gen_random_uuid(),
  advertising_request_id uuid       not null references public.advertising_requests(id) on delete cascade,

  -- Email type
  email_type            text         not null check (email_type in ('pricing','followup')),

  -- Recipient
  to_email              text         not null,
  to_name               text,

  -- Scheduling
  scheduled_for         timestamptz  not null,     -- when this email should be sent
  sent_at               timestamptz,               -- when actually sent
  resend_email_id       text,                      -- Resend's ID for webhook correlation

  -- Status
  status                text         not null default 'scheduled'
                        check (status in ('scheduled','sent','delivered','opened','clicked','bounced','failed','skipped')),

  -- Tracking
  opened_at             timestamptz,
  clicked_at            timestamptz,
  bounce_reason         text,

  -- Skip reason (e.g., "user already opened pricing email")
  skip_reason           text,

  created_at            timestamptz  not null default now()
);

create index if not exists pipeline_emails_status_idx
  on public.pipeline_emails (status, scheduled_for);
create index if not exists pipeline_emails_request_idx
  on public.pipeline_emails (advertising_request_id, email_type);
create index if not exists pipeline_emails_resend_idx
  on public.pipeline_emails (resend_email_id);

-- ── 3. Pipeline Stats View ──────────────────────────────────────────────
create or replace view public.pipeline_stats as
select
  count(*) filter (where status = 'scheduled')  as scheduled_count,
  count(*) filter (where status = 'sent')        as sent_count,
  count(*) filter (where status = 'delivered')    as delivered_count,
  count(*) filter (where status = 'opened')       as opened_count,
  count(*) filter (where status = 'clicked')      as clicked_count,
  count(*) filter (where status = 'bounced')      as bounced_count,
  count(*) filter (where status = 'failed')       as failed_count,
  count(*) filter (where status = 'skipped')      as skipped_count,
  count(*) filter (where email_type = 'pricing')  as pricing_total,
  count(*) filter (where email_type = 'followup') as followup_total,
  count(*)                                        as total
from public.pipeline_emails;
