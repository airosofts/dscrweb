-- =========================================================================
-- Tracked links — click-tracking redirects.
--
-- A tracked_link wraps a destination URL behind dscrcalculator.pro/r/<code>.
-- Each hit logs a row in tracked_link_clicks (raw IP, user agent, referer)
-- then 302-redirects to the destination. Used to wrap popup/banner ad links,
-- the brochure, etc. and measure clicks + unique visitors.
-- =========================================================================

-- ── 1. tracked_links ─────────────────────────────────────────────────────
create table if not exists public.tracked_links (
  id              uuid         primary key default gen_random_uuid(),
  code            text         not null unique,         -- short code in the URL
  destination_url text         not null,                -- where it redirects to
  label           text,                                 -- admin-facing name
  is_active       boolean      not null default true,
  created_at      timestamptz  not null default now()
);

create index if not exists tracked_links_code_idx on public.tracked_links (code);

-- ── 2. tracked_link_clicks ───────────────────────────────────────────────
create table if not exists public.tracked_link_clicks (
  id          uuid         primary key default gen_random_uuid(),
  link_id     uuid         not null references public.tracked_links(id) on delete cascade,
  ip          text,                                     -- raw client IP
  user_agent  text,
  referer     text,
  created_at  timestamptz  not null default now()
);

create index if not exists tracked_link_clicks_link_idx
  on public.tracked_link_clicks (link_id, created_at desc);

-- ── 3. Aggregate stats view ──────────────────────────────────────────────
create or replace view public.tracked_link_stats as
select
  l.id,
  l.code,
  l.destination_url,
  l.label,
  l.is_active,
  l.created_at,
  count(c.id)                          as total_clicks,
  count(distinct c.ip)                 as unique_visitors,
  max(c.created_at)                    as last_click_at
from public.tracked_links l
left join public.tracked_link_clicks c on c.link_id = l.id
group by l.id;
