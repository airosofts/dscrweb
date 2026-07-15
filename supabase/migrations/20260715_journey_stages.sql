-- ═══════════════════════════════════════════════════════════════════════
-- Journey v2: stage-based CYCLES instead of fire-once rules.
--
-- A lead sits in exactly one stage (not_opened → opened_no_click →
-- considering → checkout_abandoned) and keeps receiving emails on that
-- stage's cadence — a different template each time — until they advance.
-- Paying exits the journey from any stage. The classic timed ladder is
-- retired, and ALL leads (including previous ones) move to the smart
-- journey.
-- ═══════════════════════════════════════════════════════════════════════

-- Per-stage safety cap so "again and again" can't become spam forever.
alter table public.journey_rules
  add column if not exists max_sends integer not null default 5;

-- Replace the v1 fire-once rules with the four cycling stages.
delete from public.journey_rules;
insert into public.journey_rules (rule_key, enabled, wait_minutes, max_sends) values
  ('not_opened',         true, 2880, 5),  -- every 2d until they open (incl. the initial email)
  ('opened_no_click',    true, 1440, 5),  -- every 1d until they click through
  ('considering',        true, 2880, 6),  -- viewed pricing: every 2d until checkout/payment
  ('checkout_abandoned', true, 1440, 4);  -- every 1d until they pay

-- Previous clients: retire the old timed pipeline. Everyone becomes a
-- smart-journey lead; their not-yet-sent timed sequence emails are
-- cancelled (sent history is preserved and the engine reads it).
update public.advertising_requests
  set journey_mode = 'dynamic'
  where journey_mode = 'legacy';

update public.pipeline_emails
  set status = 'cancelled',
      cancel_reason = 'Replaced by the smart journey engine'
  where status = 'scheduled'
    and advertising_request_id is not null
    and sequence_step_id is not null;
