-- Bulk lender-outreach campaigns. Each recipient is a targetless
-- pipeline_emails row (so the existing open-pixel / click-redirect tracking
-- works unchanged); outreach_batch groups one send, outreach_reply_to records
-- where replies were routed.

alter table public.pipeline_emails
  add column if not exists outreach_batch    uuid,
  add column if not exists outreach_reply_to text;

create index if not exists pipeline_emails_outreach_batch_idx
  on public.pipeline_emails (outreach_batch) where outreach_batch is not null;
