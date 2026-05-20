-- =========================================================================
-- Resend-native scheduling for the first (pricing) email.
--
-- The initial email is unconditional, so it's handed straight to Resend via
-- scheduledAt instead of being polled by the cron processor. Such rows carry
-- status 'resend_scheduled'. If the sequence is later stopped, the processor's
-- reconcile sweep cancels the Resend-side schedule (resend_cancelled_at marks
-- that it's been handled).
-- =========================================================================

-- ── 1. New status: resend_scheduled ──────────────────────────────────────
alter table public.pipeline_emails drop constraint if exists pipeline_emails_status_check;
alter table public.pipeline_emails add constraint pipeline_emails_status_check
  check (status in (
    'scheduled', 'resend_scheduled', 'processing', 'sent', 'delivered',
    'opened', 'clicked', 'bounced', 'failed', 'skipped', 'cancelled'
  ));

-- ── 2. Track that the Resend-side schedule was cancelled ─────────────────
alter table public.pipeline_emails
  add column if not exists resend_cancelled_at timestamptz;

-- ── 3. Refresh pipeline_stats so resend_scheduled counts as scheduled ────
drop view if exists public.pipeline_stats;
create view public.pipeline_stats as
select
  count(*) filter (where status in ('scheduled', 'resend_scheduled')) as scheduled_count,
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
