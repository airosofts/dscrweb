-- Deleting an ad_subscription failed with FK violation 23503 because
-- creative_submissions.subscription_id had no ON DELETE behavior.
-- Bring it in line with pipeline_emails (20260521): cascade with the parent.

alter table public.creative_submissions
  drop constraint if exists creative_submissions_subscription_id_fkey;

alter table public.creative_submissions
  add constraint creative_submissions_subscription_id_fkey
  foreign key (subscription_id)
  references public.ad_subscriptions(id)
  on delete cascade;
