-- Geo targeting for ads: an ad with target_states runs only in those US
-- states (full names, e.g. {"Texas","Florida"}); NULL/empty = nationwide.
-- Old app versions ignore these columns and show every active ad — accepted.
-- The new app filters using the user's IP-derived state (/api/geo).

alter table public.banner_ads
  add column if not exists target_states text[];

alter table public.popup_ads
  add column if not exists target_states text[];

-- What the advertiser asked for on the form (admin copies it into the ad).
alter table public.advertising_requests
  add column if not exists target_states text[];

-- Which state each impression was served in (per-state delivery reporting).
alter table public.ad_impressions
  add column if not exists region text;
