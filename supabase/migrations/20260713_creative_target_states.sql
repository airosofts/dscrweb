-- Paying customers confirm their target markets when submitting creative
-- (in addition to the wish captured on the initial advertising request).
-- NULL/empty = nationwide.

alter table public.creative_submissions
  add column if not exists target_states text[];
