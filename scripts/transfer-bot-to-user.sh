#!/bin/bash
# Transfer a bot team to Onur Fc user
# - Updates league_teams row: name, is_bot=false
# - Updates players row: profile_id -> Onur Fc
# - Updates profiles row: league_name, team_id
# - Deletes the bot profile row

set -e

SUPABASE_URL="https://jmxbyaamwbpnvgbnjbmo.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI"

AUTH_HEADERS=(-H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY")

USER_ID="00000000-0000-0000-0000-000000000001"
BOT_PROFILE="4c025f02-cfcc-4836-8506-13fd0594a120"
BOT_TEAM_ID="8f007b4a-d472-4c9c-9e5d-86ade4099f8f"

echo "=== Step 1: Transfer players to Onur Fc ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "$SUPABASE_URL/rest/v1/players?profile_id=eq.$BOT_PROFILE" \
  "${AUTH_HEADERS[@]}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"profile_id\":\"$USER_ID\"}")
echo "  Players: $(echo $RESPONSE | tail -1)"

echo "=== Step 2: Update league_teams row (Onur Fc takeover) ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "$SUPABASE_URL/rest/v1/league_teams?id=eq.$BOT_TEAM_ID" \
  "${AUTH_HEADERS[@]}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"profile_id\":\"$USER_ID\",\"is_bot\":false,\"name\":\"Onur Fc\",\"league_name\":\"4. Lig\"}")
echo "  League team: $(echo $RESPONSE | tail -1)"

echo "=== Step 3: Update Onur Fc profile (set league_name and team_id) ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "$SUPABASE_URL/rest/v1/profiles?id=eq.$USER_ID" \
  "${AUTH_HEADERS[@]}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "{\"league_name\":\"4. Lig\",\"team_id\":\"$BOT_TEAM_ID\"}")
echo "  Profile: $(echo $RESPONSE | tail -1)"

echo "=== Step 4: Delete bot profile ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
  "$SUPABASE_URL/rest/v1/profiles?id=eq.$BOT_PROFILE" \
  "${AUTH_HEADERS[@]}" \
  -H "Prefer: return=minimal")
echo "  Bot profile deleted: $(echo $RESPONSE | tail -1)"

echo ""
echo "=== Verification ==="
echo "Onur Fc players:"
curl -s "$SUPABASE_URL/rest/v1/players?select=id,name,position,rating&profile_id=eq.$USER_ID&limit=5" \
  "${AUTH_HEADERS[@]}" 2>/dev/null | python3 -m json.tool 2>/dev/null

echo "Onur Fc fixtures (first 5):"
curl -s "$SUPABASE_URL/rest/v1/fixtures?select=id,home_team_id,away_team_id,match_date,match_time,tur,status&or=(home_team_id.eq.$BOT_TEAM_ID,away_team_id.eq.$BOT_TEAM_ID)&order=match_date.asc&limit=5" \
  "${AUTH_HEADERS[@]}" 2>/dev/null | python3 -m json.tool 2>/dev/null

echo "Onur Fc league_team:"
curl -s "$SUPABASE_URL/rest/v1/league_teams?select=id,league_id,profile_id,name,is_bot,league_name&profile_id=eq.$USER_ID" \
  "${AUTH_HEADERS[@]}" 2>/dev/null | python3 -m json.tool 2>/dev/null
