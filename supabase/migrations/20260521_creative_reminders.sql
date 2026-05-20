-- =========================================================================
-- Customer reminders — extend the pipeline engine to also nudge PAID customers.
--
-- Adds a `kind` to email_sequences so the same sequence/step/template/processor
-- machinery serves three audiences:
--   ad_inquiry       → leads who submitted the ad form, haven't paid (existing)
--   creative_pending → customers who paid but haven't submitted creative
--   landing_missing  → customers whose creative submission has no landing URL
--
-- pipeline_emails rows can now target EITHER an advertising_request
-- (ad_inquiry) OR an ad_subscription (creative_pending / landing_missing).
-- =========================================================================

-- ── 1. email_sequences.kind ──────────────────────────────────────────────
alter table public.email_sequences
  add column if not exists kind text not null default 'ad_inquiry'
  check (kind in ('ad_inquiry', 'creative_pending', 'landing_missing'));

-- One default sequence PER kind (was: one default overall).
drop index if exists public.email_sequences_one_default_idx;
create unique index if not exists email_sequences_default_per_kind_idx
  on public.email_sequences (kind) where is_default = true;


-- ── 2. pipeline_emails can target a subscription ─────────────────────────
alter table public.pipeline_emails
  alter column advertising_request_id drop not null;

alter table public.pipeline_emails
  add column if not exists subscription_id uuid
    references public.ad_subscriptions(id) on delete cascade;

create index if not exists pipeline_emails_subscription_idx
  on public.pipeline_emails (subscription_id) where subscription_id is not null;

-- Every row must point at exactly one target.
alter table public.pipeline_emails
  drop constraint if exists pipeline_emails_one_target_chk;
alter table public.pipeline_emails
  add constraint pipeline_emails_one_target_chk
  check (
    (advertising_request_id is not null and subscription_id is null) or
    (advertising_request_id is null and subscription_id is not null)
  );

-- ── 3. ad_subscriptions reminder bookkeeping ─────────────────────────────
alter table public.ad_subscriptions
  add column if not exists reminder_stopped_at      timestamptz,  -- manual/auto hard stop
  add column if not exists reminder_stop_reason     text,
  add column if not exists creative_seq_started_at  timestamptz,  -- idempotency: creative_pending scheduled
  add column if not exists landing_seq_started_at   timestamptz;  -- idempotency: landing_missing scheduled
