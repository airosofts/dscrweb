-- =========================================================================
-- contact_submissions
-- Stores every message sent from the public /contact form.
-- Written from landing-site API with service-role key. Read from admin-portal.
-- =========================================================================

create table if not exists public.contact_submissions (
  id              uuid         primary key default gen_random_uuid(),
  name            text         not null,
  email           text         not null,
  company         text,
  topic           text         not null check (topic in ('Support','Advertising','Press','Partnership','Other')),
  message         text         not null,

  -- metadata captured server-side
  ip_address      text,
  user_agent      text,

  -- admin workflow
  status          text         not null default 'new' check (status in ('new','responded','archived')),
  responded_at    timestamptz,
  responded_by    uuid,        -- references admin_users(id) if you have that table
  admin_notes     text,

  created_at      timestamptz  not null default now()
);

create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status, created_at desc);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

-- RLS intentionally NOT enabled on this table.
-- Only the service-role key (used by landing-site API route and admin-portal) touches it.
-- The anon key is never used against this table from the public site.
