-- Optional internal label for lender-outreach campaigns (shown in the
-- admin portal's Campaigns list; not visible to recipients).
alter table public.pipeline_emails
  add column if not exists outreach_name text;
