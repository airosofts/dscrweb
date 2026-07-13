-- Website visitor tracking: one row per browser session on dscrcalculator.pro,
-- with IP-derived location. Written server-side by /api/track/visit.

create table if not exists public.site_visits (
  id          uuid primary key default gen_random_uuid(),
  ip          text,
  country     text,
  region      text,          -- US state (e.g. "Texas") or province
  city        text,
  path        text,
  referrer    text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists site_visits_ip_idx on public.site_visits (ip);
create index if not exists site_visits_created_idx on public.site_visits (created_at desc);

alter table public.site_visits enable row level security;
-- No policies: only the service role (server-side) reads/writes this table.
