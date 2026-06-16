#!/bin/bash
# Touchline Manager - Game Data Reset Script
# Deletes all user data (teams, players, fixtures)

set -e

SUPABASE_URL="https://jmxbyaamwbpnvgbnjbmo.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI"

AUTH_HEADERS=(-H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY")

echo "=================================================="
echo "  Touchline Manager - Reset Game Data"
echo "=================================================="
echo ""

truncate_table() {
  local table=$1
  local filter=$2
  echo -n "  > $table ... "
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
    "$SUPABASE_URL/rest/v1/$table?$filter" \
    "${AUTH_HEADERS[@]}" \
    -H "Prefer: return=minimal" 2>/dev/null)
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  
  if [ "$HTTP_CODE" = "204" ]; then
    echo "OK (204)"
  elif [ "$HTTP_CODE" = "409" ]; then
    echo "SKIP (409 FK constraint)"
  else
    echo "WARN ($HTTP_CODE)"
  fi
}

count_table() {
  local table=$1
  COUNT=$(curl -s "$SUPABASE_URL/rest/v1/$table?select=id&limit=1" \
    "${AUTH_HEADERS[@]}" \
    -H "Prefer: count=exact" -I 2>/dev/null | grep -i content-range | awk -F'/' '{print $2}' | tr -d '\r\n')
  echo "  $table: $COUNT records"
}

echo "=================================================="
echo "  BEFORE RESET - RECORD COUNTS"
echo "=================================================="
count_table "players"
count_table "profiles"
count_table "league_teams"
count_table "fixtures"
count_table "seasons"
count_table "match_sessions"
count_table "active_operations"
echo ""

echo "=================================================="
echo "  STEP 1: CHILD TABLES (FK dependency order)"
echo "=================================================="
truncate_table "match_events" "id=neq.00000000-0000-0000-0000-000000000000"
truncate_table "active_operations" "id=neq.00000000-0000-0000-0000-000000000000"
truncate_table "notifications" "id=neq.00000000-0000-0000-0000-000000000000"
truncate_table "daily_tasks" "id=neq.00000000-0000-0000-0000-000000000000"
truncate_table "user_facilities" "profile_id=neq.nonexistent-id"
truncate_table "scouted_players" "id=neq.00000000-0000-0000-0000-000000000000"
truncate_table "player_career_stats" "id=neq.00000000-0000-0000-0000-000000000000"
truncate_table "transfer_market" "id=neq.00000000-0000-0000-0000-000000000000"
truncate_table "training_state" "profile_id=neq.nonexistent-id"
truncate_table "active_tactics" "profile_id=neq.nonexistent-id"
truncate_table "staff" "id=neq.00000000-0000-0000-0000-000000000000"
echo ""

echo "=================================================="
echo "  STEP 2: FIXTURES AND SEASONS"
echo "=================================================="
truncate_table "fixtures" "id=neq.00000000-0000-0000-0000-000000000000"
truncate_table "seasons" "id=neq.00000000-0000-0000-0000-000000000000"
echo ""

echo "=================================================="
echo "  STEP 3: PLAYERS"
echo "=================================================="
truncate_table "players" "id=neq.00000000-0000-0000-0000-000000000000"
echo ""

echo "=================================================="
echo "  STEP 4: LEAGUE TEAMS (before profiles - FK)"
echo "=================================================="
truncate_table "league_teams" "id=neq.00000000-0000-0000-0000-000000000000"
echo ""

echo "=================================================="
echo "  STEP 5: PROFILES (bots + real users)"
echo "=================================================="
truncate_table "profiles" "is_bot=eq.false"
truncate_table "profiles" "is_bot=eq.true"
echo ""

echo "=================================================="
echo "  AFTER RESET - RECORD COUNTS"
echo "=================================================="
count_table "players"
count_table "profiles"
count_table "league_teams"
count_table "fixtures"
count_table "seasons"
count_table "match_sessions"
count_table "active_operations"
echo ""

echo "=================================================="
echo "  DONE - Game data reset complete!"
echo "=================================================="
