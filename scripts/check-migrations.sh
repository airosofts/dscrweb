#!/usr/bin/env bash
# Checks that every column/table added by the three pending geo migrations
# actually exists in the Supabase database:
#
#   20260713_app_sessions_geo.sql   → app_sessions: user_ip, country, region, city
#   20260713_site_visits.sql        → site_visits table (+ its columns)
#   20260713_ad_geo_targeting.sql   → banner_ads.target_states, popup_ads.target_states,
#                                     advertising_requests.target_states, ad_impressions.region
#
# Usage:  ./scripts/check-migrations.sh [path-to-env-file]
# The env file must contain NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
# Defaults to the landing-site .env.local next to this script.

set -euo pipefail

ENV_FILE="${1:-"$(dirname "$0")/../.env.local"}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "env file not found: $ENV_FILE" >&2
  exit 1
fi

URL=$(grep -E "^NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE" | cut -d= -f2- | tr -d '"')
KEY=$(grep -E "^SUPABASE_SERVICE_ROLE_KEY=" "$ENV_FILE" | cut -d= -f2- | tr -d '"')
if [[ -z "$URL" || -z "$KEY" ]]; then
  echo "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in $ENV_FILE" >&2
  exit 1
fi

PASS=0; FAIL=0

check() { # table column
  local table="$1" col="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    "$URL/rest/v1/$table?select=$col&limit=0" \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY")
  if [[ "$code" == "200" ]]; then
    printf "  ✅ %-24s %s\n" "$table" "$col"; PASS=$((PASS+1))
  else
    printf "  ❌ %-24s %s   (HTTP %s — run the migration)\n" "$table" "$col" "$code"; FAIL=$((FAIL+1))
  fi
}

echo "— 20260713_app_sessions_geo.sql"
check app_sessions user_ip
check app_sessions country
check app_sessions region
check app_sessions city

echo "— 20260713_site_visits.sql"
check site_visits ip
check site_visits country
check site_visits region
check site_visits city
check site_visits path
check site_visits referrer
check site_visits user_agent

echo "— 20260713_ad_geo_targeting.sql"
check banner_ads target_states
check popup_ads target_states
check advertising_requests target_states
check ad_impressions region

echo "— 20260713_creative_target_states.sql"
check creative_submissions target_states

echo "— 20260715_journey_engine.sql"
check journey_events event_type
check journey_rules rule_key
check advertising_requests journey_mode
check pipeline_emails trigger_reason

echo
if [[ $FAIL -eq 0 ]]; then
  echo "All $PASS checks passed — every migration is applied. ✅"
else
  echo "$FAIL missing, $PASS present. Run the failing migrations in the Supabase SQL editor, then re-run this script."
  exit 1
fi
