-- Track where app users are: IP + IP-derived location on each session.
-- Filled by the Flutter app at session start via GET dscrcalculator.pro/api/geo.

alter table public.app_sessions
  add column if not exists user_ip text,
  add column if not exists country text,
  add column if not exists region  text,   -- US state (e.g. "Texas") or province
  add column if not exists city    text;

create index if not exists app_sessions_region_idx
  on public.app_sessions (region) where region is not null;
