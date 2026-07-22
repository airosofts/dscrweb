-- On-site engagement per visit, attributable to the email a recipient clicked.
-- One row per browser session (session_key), overwritten with the latest
-- cumulative snapshot the client sends (client is source of truth for its
-- own session — monotonic time/scroll, merged section dwell).

create table if not exists public.engagement_sessions (
  id                     uuid primary key default gen_random_uuid(),
  session_key            text not null unique,          -- client-generated per visit
  source_email_id        uuid references public.pipeline_emails(id) on delete set null,       -- the email they clicked (?et=)
  advertising_request_id uuid references public.advertising_requests(id) on delete set null,  -- pipeline lead (?rid=), if any
  path                   text,
  active_seconds         integer not null default 0,    -- attention time (tab-visible only)
  scroll_pct             integer not null default 0,    -- deepest scroll reached
  sections               jsonb,                         -- { "how": 30, "apply": 48 } seconds per section
  form_started           boolean not null default false,
  form_last_field        text,                          -- last field they focused
  submitted              boolean not null default false,
  ip                     text,
  country                text,
  region                 text,
  city                   text,
  user_agent             text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists engagement_sessions_source_email_idx
  on public.engagement_sessions (source_email_id) where source_email_id is not null;
create index if not exists engagement_sessions_request_idx
  on public.engagement_sessions (advertising_request_id) where advertising_request_id is not null;

alter table public.engagement_sessions enable row level security;
-- Server-only (service role). No public policies.
