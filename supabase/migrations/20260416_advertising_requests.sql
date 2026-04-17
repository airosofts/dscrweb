-- =========================================================================
-- advertising_requests
-- Stores submissions from the public /advertise form.
-- Written by landing-site API (service role). Read from admin-portal.
-- Schema mirrors dscr_calculator_app.advertisement_requests so the admin
-- inbox can unify both sources if you merge them later.
-- =========================================================================

create table if not exists public.advertising_requests (
  id                    uuid         primary key default gen_random_uuid(),

  -- Company / contact
  company_name          text         not null,
  contact_person        text         not null,
  email                 text         not null,
  phone                 text         not null,
  website               text,

  -- Ad details
  ad_type               text         not null check (ad_type in ('banner','popup')),
  ad_description        text         not null,
  target_audience       text,
  preferred_placement   text         not null check (preferred_placement in ('homepage','calculator_page','results_section','other')),

  -- Budget & timeline
  budget_range          text         check (budget_range in ('under_500','500_1000','1000_5000','5000_plus','custom')),
  budget_custom         numeric(10,2),
  start_date            date,
  duration_months       int,

  -- Free-form
  additional_notes      text,

  -- Server-captured metadata
  user_ip               text,
  user_agent            text,

  -- Admin workflow
  status                text         not null default 'pending' check (status in ('pending','reviewed','approved','rejected','completed')),
  admin_notes           text,

  -- Automation
  notification_sent_at  timestamptz,
  followup_scheduled_at timestamptz,
  followup_resend_id    text,

  created_at            timestamptz  not null default now(),
  updated_at            timestamptz  not null default now()
);

create index if not exists advertising_requests_status_idx
  on public.advertising_requests (status, created_at desc);

create index if not exists advertising_requests_created_at_idx
  on public.advertising_requests (created_at desc);

create index if not exists advertising_requests_email_idx
  on public.advertising_requests (email);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists advertising_requests_set_updated_at on public.advertising_requests;
create trigger advertising_requests_set_updated_at
  before update on public.advertising_requests
  for each row execute function public.set_updated_at();

-- RLS intentionally NOT enabled; only the service-role key ever touches this table.
