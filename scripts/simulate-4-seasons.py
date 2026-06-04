#!/usr/bin/env python3
"""
Siyah-Beyaz FM — 4 Sezonluk Simülasyon Scripti

Tüm ligler için:
1. Mevcut sezon durumunu kontrol eder
2. Eksik fikstürleri oluşturur
3. Tüm maçları simüle eder (gerçekçi skorlarla)
4. Sezon sonu işlemlerini yapar (ödüller, yükselme/düşme, yaşlanma, yeni sezon)
5. 4 sezon tekrar eder
6. Sorunları raporlar
"""

import requests
import json
import random
import uuid
import time
from datetime import datetime, timedelta
from collections import Counter, defaultdict

SUPABASE_URL = "https://jmxbyaamwbpnvgbnjbmo.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteGJ5YWFtd2JwbnZnYm5qYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzA1OTcsImV4cCI6MjA5MzE0NjU5N30.08BRMYj5CrsOdv66E-c38u4BJvo7b3PQ3ltCAKtmBbI"
ADMIN_TOKEN = "Bearer siyah-beyaz-admin-2026"

HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

issues = []  # Global issue tracker

def log_issue(severity, category, message, detail=None):
    """Track issues found during simulation"""
    issue = {
        "severity": severity,  # CRITICAL, HIGH, MEDIUM, LOW
        "category": category,  # schema, data, logic, ui, performance
        "message": message,
        "detail": detail,
        "timestamp": datetime.now().isoformat()
    }
    issues.append(issue)
    icon = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}.get(severity, "⚪")
    print(f"  {icon} [{severity}] {category}: {message}")
    if detail:
        print(f"     Detail: {detail}")

def api_get(table, params=None, limit=1000):
    """GET from Supabase REST API with pagination"""
    all_data = []
    offset = 0
    while True:
        p = dict(params or {})
        p["offset"] = offset
        p["limit"] = min(limit, 1000)
        r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, params=p)
        if r.status_code != 200:
            return None, r.text
        data = r.json()
        if not data:
            break
        all_data.extend(data)
        if len(data) < 1000:
            break
        offset += 1000
    return all_data, None

def api_post(table, data):
    """POST to Supabase REST API"""
    r = requests.post(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, json=data)
    if r.status_code in (200, 201):
        return r.json(), None
    return None, r.text

def api_patch(table, data, params):
    """PATCH to Supabase REST API"""
    r = requests.patch(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, json=data, params=params)
    if r.status_code in (200, 204):
        return True, None
    return False, r.text

def api_delete(table, params):
    """DELETE from Supabase REST API"""
    r = requests.delete(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, params=params)
    if r.status_code in (200, 204):
        return True, None
    return False, r.text

def api_rpc(fn_name, params):
    """Call Supabase RPC function"""
    r = requests.post(f"{SUPABASE_URL}/rest/v1/rpc/{fn_name}", headers=HEADERS, json=params)
    if r.status_code == 200:
        return r.json(), None
    return None, r.text

# ═══════════════════════════════════════════════════════════
# MATCH SIMULATION (Simplified but realistic)
# ═══════════════════════════════════════════════════════════

def simulate_match_score(home_strength, away_strength):
    """Generate realistic football score based on team strengths"""
    home_advantage = 5
    home_eff = home_strength + home_advantage
    away_eff = away_strength
    
    # Poisson-like goal generation
    home_expected = max(0.5, (home_eff / 80) * 1.4)
    away_expected = max(0.3, (away_eff / 80) * 1.1)
    
    home_goals = min(7, int(random.gauss(home_expected, 1.0)))
    away_goals = min(7, int(random.gauss(away_expected, 1.0)))
    
    return max(0, home_goals), max(0, away_goals)

def generate_fixtures(teams, league_id):
    """Generate double round-robin fixtures for a league"""
    n = len(teams)
    if n < 2:
        return []
    
    fixtures = []
    fixture_id = str(uuid.uuid4())
    
    # Simple round-robin scheduling
    tur = 1
    for round_num in range(2):  # Double round-robin
        for i in range(n):
            for j in range(i + 1, n):
                if round_num == 0:
                    home = teams[i]
                    away = teams[j]
                else:
                    home = teams[j]
                    away = teams[i]
                
                fixtures.append({
                    "id": str(uuid.uuid4()),
                    "home_team_id": home["id"],
                    "away_team_id": away["id"],
                    "league_id": league_id,
                    "competition_type": "league",
                    "status": "scheduled",
                    "tur": tur,
                    "match_date": f"2027-{((tur-1) % 9) + 1:02d}-{((tur-1) % 28) + 1:02d}",
                    "home_score": None,
                    "away_score": None,
                })
                tur += 1
    
    return fixtures

# ═══════════════════════════════════════════════════════════
# SEASON SIMULATION
# ═══════════════════════════════════════════════════════════

def check_database_health():
    """Check database schema and data integrity"""
    print("\n" + "="*60)
    print("🏥 VERİTABANI SAĞLIK KONTROLÜ")
    print("="*60)
    
    # Check tables exist
    tables_to_check = [
        "leagues", "league_teams", "seasons", "fixtures", "players",
        "profiles", "match_sessions", "match_events", "league_standings",
        "season_awards", "hall_of_fame", "season_stats", "player_career_stats",
        "cron_locks", "active_tactics", "referees", "notifications",
        "cup_seasons", "match_simulation_queue", "loans"
    ]
    
    for table in tables_to_check:
        data, err = api_get(table, {"select": "id", "limit": "1"})
        if err:
            log_issue("CRITICAL", "schema", f"Tablo erişilemez: {table}", err[:100])
        else:
            print(f"  ✅ {table}")
    
    # Check column existence for key tables
    print("\n📋 Kolon kontrolü:")
    
    # profiles columns
    profiles, err = api_get("profiles", {"select": "*", "limit": "1"})
    if profiles and len(profiles) > 0:
        cols = list(profiles[0].keys())
        required_profile_cols = ["id", "team_name", "money", "is_bot", "manager_name", "stadium_capacity", "fans"]
        for rc in required_profile_cols:
            if rc not in cols:
                log_issue("HIGH", "schema", f"profiles tablosunda eksik kolon: {rc}")
        print(f"  profiles: {len(cols)} kolon ✓")
    else:
        log_issue("CRITICAL", "schema", "profiles tablosundan veri okunamıyor", err)
    
    # league_teams columns
    lt, err = api_get("league_teams", {"select": "*", "limit": "1"})
    if lt and len(lt) > 0:
        cols = list(lt[0].keys())
        required_lt_cols = ["id", "league_id", "name", "played", "won", "drawn", "lost", "gf", "ga", "points", "profile_id"]
        for rc in required_lt_cols:
            if rc not in cols:
                log_issue("HIGH", "schema", f"league_teams tablosunda eksik kolon: {rc}")
        print(f"  league_teams: {len(cols)} kolon ✓")
    
    # players columns
    pl, err = api_get("players", {"select": "*", "limit": "1"})
    if pl and len(pl) > 0:
        cols = list(pl[0].keys())
        required_player_cols = ["id", "name", "position", "rating", "age", "profile_id", "team_name"]
        mental_cols = ["aggression", "bravery", "work_rate", "decisions", "determination", "concentration", 
                       "leadership", "anticipation", "flair", "positioning", "composure", "teamwork"]
        for rc in required_player_cols:
            if rc not in cols:
                log_issue("HIGH", "schema", f"players tablosunda eksik kolon: {rc}")
        missing_mental = [c for c in mental_cols if c not in cols]
        if missing_mental:
            log_issue("MEDIUM", "schema", f"players tablosunda eksik mental kolonlar: {missing_mental}")
        print(f"  players: {len(cols)} kolon ✓")
    
    # fixtures columns
    fx, err = api_get("fixtures", {"select": "*", "limit": "1"})
    if fx and len(fx) > 0:
        cols = list(fx[0].keys())
        required_fx_cols = ["id", "home_team_id", "away_team_id", "status", "home_score", "away_score"]
        for rc in required_fx_cols:
            if rc not in cols:
                log_issue("HIGH", "schema", f"fixtures tablosunda eksik kolon: {rc}")
        print(f"  fixtures: {len(cols)} kolon ✓")

def get_current_state():
    """Get the current game state"""
    print("\n" + "="*60)
    print("📊 MEVCUT OYUN DURUMU")
    print("="*60)
    
    # Leagues
    leagues, _ = api_get("leagues", {"select": "*"})
    print(f"\n🏆 Ligler: {len(leagues)}")
    for l in leagues:
        print(f"  {l['name']} (Tier {l['tier']})")
    
    # Teams per league
    all_teams, _ = api_get("league_teams", {"select": "id,name,league_id,played,won,drawn,lost,gf,ga,points,profile_id,league_name,is_bot"})
    
    league_teams_map = defaultdict(list)
    for t in all_teams:
        league_teams_map[t["league_id"]].append(t)
    
    for l in leagues:
        teams = league_teams_map.get(l["id"], [])
        played = [t for t in teams if (t.get("played") or 0) > 0]
        zero = [t for t in teams if (t.get("played") or 0) == 0]
        print(f"  {l['name']}: {len(teams)} takım ({len(played)} oynadı, {len(zero)} oynamadı)")
    
    # Seasons
    seasons, _ = api_get("seasons", {"select": "*", "order": "created_at.desc", "limit": "20"})
    print(f"\n📅 Sezonlar: {len(seasons)}")
    for s in seasons[:10]:
        league_name = "Bilinmiyor"
        for l in leagues:
            if l["id"] == s["league_id"]:
                league_name = l["name"]
        print(f"  {s['year']} | {league_name} | bitti={s['is_finished']} | tur={s['current_tur']}")
    
    # Players
    players, _ = api_get("players", {"select": "id"}, limit=1)
    player_count_resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/players?select=id&limit=1",
        headers={**HEADERS, "Prefer": "count=exact"}
    )
    player_count = player_count_resp.headers.get("content-range", "").split("/")[-1]
    print(f"\n⚽ Toplam oyuncu: {player_count}")
    
    # Profiles
    profiles, _ = api_get("profiles", {"select": "id,is_bot"})
    bot_count = len([p for p in (profiles or []) if p.get("is_bot")])
    real_count = len([p for p in (profiles or []) if not p.get("is_bot")])
    print(f"\n👥 Profiller: {len(profiles or [])} (Bot: {bot_count}, Gerçek: {real_count})")
    
    # Fixtures
    fixtures_count_resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/fixtures?select=id&limit=1",
        headers={**HEADERS, "Prefer": "count=exact"}
    )
    fixture_count = fixtures_count_resp.headers.get("content-range", "").split("/")[-1]
    print(f"📋 Toplam fikstür: {fixture_count}")
    
    return leagues, all_teams, seasons

def simulate_all_matches_for_league(league_id, league_name):
    """Simulate all pending matches for a league by directly updating the database"""
    # Get active season for this league
    seasons, _ = api_get("seasons", {
        "select": "id",
        "league_id": f"eq.{league_id}",
        "is_finished": "eq.false",
        "order": "created_at.desc",
        "limit": "1"
    })
    
    if not seasons:
        log_issue("HIGH", "data", f"{league_name}: Aktif sezon bulunamadı")
        return 0
    
    season_id = seasons[0]["id"]
    
    # Get scheduled fixtures
    fixtures, _ = api_get("fixtures", {
        "select": "id,home_team_id,away_team_id,tur,home_score,away_score,status",
        "season_id": f"eq.{season_id}",
        "competition_type": "eq.league",
        "status": "eq.scheduled"
    })
    
    if not fixtures:
        return 0
    
    # Get team strengths
    all_teams, _ = api_get("league_teams", {"select": "id,name,strength,rating"})
    team_strengths = {}
    for t in (all_teams or []):
        team_strengths[t["id"]] = t.get("strength") or t.get("rating") or 50
    
    simulated = 0
    for fixture in fixtures:
        home_str = team_strengths.get(fixture["home_team_id"], 50)
        away_str = team_strengths.get(fixture["away_team_id"], 50)
        home_goals, away_goals = simulate_match_score(home_str, away_str)
        
        # Update fixture
        ok, err = api_patch("fixtures", {
            "status": "completed",
            "home_score": home_goals,
            "away_score": away_goals
        }, {"id": f"eq.{fixture['id']}"})
        
        if not ok:
            log_issue("MEDIUM", "data", f"Fikstür güncellenemedi: {fixture['id']}", err[:100] if err else "")
            continue
        
        # Update league standings
        update_standings(season_id, fixture["home_team_id"], fixture["away_team_id"], home_goals, away_goals)
        simulated += 1
    
    return simulated

def update_standings(season_id, home_team_id, away_team_id, home_score, away_score):
    """Update league_standings and league_teams tables after a match"""
    # Update home team standings
    home_standing, _ = api_get("league_standings", {
        "select": "id,played,won,drawn,lost,gf,ga,points",
        "team_id": f"eq.{home_team_id}",
        "season_id": f"eq.{season_id}"
    })
    
    if home_standing and len(home_standing) > 0:
        hs = home_standing[0]
        updated = {
            "played": (hs.get("played") or 0) + 1,
            "won": (hs.get("won") or 0) + (1 if home_score > away_score else 0),
            "drawn": (hs.get("drawn") or 0) + (1 if home_score == away_score else 0),
            "lost": (hs.get("lost") or 0) + (1 if home_score < away_score else 0),
            "gf": (hs.get("gf") or 0) + home_score,
            "ga": (hs.get("ga") or 0) + away_score,
            "points": (hs.get("points") or 0) + (3 if home_score > away_score else (1 if home_score == away_score else 0))
        }
        api_patch("league_standings", updated, {"id": f"eq.{hs['id']}"})
    
    # Update away team standings
    away_standing, _ = api_get("league_standings", {
        "select": "id,played,won,drawn,lost,gf,ga,points",
        "team_id": f"eq.{away_team_id}",
        "season_id": f"eq.{season_id}"
    })
    
    if away_standing and len(away_standing) > 0:
        as_data = away_standing[0]
        updated = {
            "played": (as_data.get("played") or 0) + 1,
            "won": (as_data.get("won") or 0) + (1 if away_score > home_score else 0),
            "drawn": (as_data.get("drawn") or 0) + (1 if away_score == home_score else 0),
            "lost": (as_data.get("lost") or 0) + (1 if away_score < home_score else 0),
            "gf": (as_data.get("gf") or 0) + away_score,
            "ga": (as_data.get("ga") or 0) + home_score,
            "points": (as_data.get("points") or 0) + (3 if away_score > home_score else (1 if away_score == home_score else 0))
        }
        api_patch("league_standings", updated, {"id": f"eq.{as_data['id']}"})
    
    # Update league_teams (same data)
    home_update = {
        "played": (home_standing[0].get("played") or 0) + 1 if home_standing else 1,
        "won": (home_standing[0].get("won") or 0) + (1 if home_score > away_score else 0) if home_standing else (1 if home_score > away_score else 0),
        "drawn": (home_standing[0].get("drawn") or 0) + (1 if home_score == away_score else 0) if home_standing else (1 if home_score == away_score else 0),
        "lost": (home_standing[0].get("lost") or 0) + (1 if home_score < away_score else 0) if home_standing else (1 if home_score < away_score else 0),
        "gf": (home_standing[0].get("gf") or 0) + home_score if home_standing else home_score,
        "ga": (home_standing[0].get("ga") or 0) + away_score if home_standing else away_score,
        "points": (home_standing[0].get("points") or 0) + (3 if home_score > away_score else (1 if home_score == away_score else 0)) if home_standing else (3 if home_score > away_score else (1 if home_score == away_score else 0))
    }
    api_patch("league_teams", home_update, {"id": f"eq.{home_team_id}"})
    
    away_update = {
        "played": (away_standing[0].get("played") or 0) + 1 if away_standing else 1,
        "won": (away_standing[0].get("won") or 0) + (1 if away_score > home_score else 0) if away_standing else (1 if away_score > home_score else 0),
        "drawn": (away_standing[0].get("drawn") or 0) + (1 if away_score == home_score else 0) if away_standing else (1 if away_score == home_score else 0),
        "lost": (away_standing[0].get("lost") or 0) + (1 if away_score < home_score else 0) if away_standing else (1 if away_score < home_score else 0),
        "gf": (away_standing[0].get("gf") or 0) + away_score if away_standing else away_score,
        "ga": (away_standing[0].get("ga") or 0) + home_score if away_standing else home_score,
        "points": (away_standing[0].get("points") or 0) + (3 if away_score > home_score else (1 if away_score == home_score else 0)) if away_standing else (3 if away_score > home_score else (1 if away_score == home_score else 0))
    }
    api_patch("league_teams", away_update, {"id": f"eq.{away_team_id}"})

def process_season_end_for_league(league_id, league_name, league_tier):
    """Process season end for a single league"""
    # Get active season
    seasons, _ = api_get("seasons", {
        "select": "id",
        "league_id": f"eq.{league_id}",
        "is_finished": "eq.false",
        "order": "created_at.desc",
        "limit": "1"
    })
    
    if not seasons:
        log_issue("HIGH", "logic", f"{league_name}: Aktif sezon bulunamadı, sezon sonu atlandı")
        return False
    
    season_id = seasons[0]["id"]
    
    # Mark season as finished
    ok, err = api_patch("seasons", {"is_finished": True, "status": "completed"}, {"id": f"eq.{season_id}"})
    if not ok:
        log_issue("HIGH", "data", f"{league_name}: Sezon tamamlanamadı", err[:100] if err else "")
    
    # Get standings
    standings, _ = api_get("league_standings", {
        "select": "id,team_id,played,won,drawn,lost,gf,ga,points",
        "league_id": f"eq.{league_id}",
        "season_id": f"eq.{season_id}",
        "order": "points.desc"
    })
    
    if not standings or len(standings) == 0:
        log_issue("HIGH", "data", f"{league_name}: Sıralama verisi bulunamadı")
        return False
    
    # Get team details
    all_teams, _ = api_get("league_teams", {"select": "id,name,profile_id,league_id"})
    team_map = {t["id"]: t for t in (all_teams or [])}
    
    champion = standings[0]
    champion_team = team_map.get(champion["team_id"], {})
    champion_name = champion_team.get("name", "Bilinmiyor")
    champion_profile_id = champion_team.get("profile_id")
    
    print(f"  🏆 Şampiyon: {champion_name} ({champion['points']} puan)")
    
    # Champion prize
    prize_pools = {1: 50_000_000, 2: 15_000_000, 3: 5_000_000, 4: 1_500_000}
    champion_prize = prize_pools.get(league_tier, 1_500_000)
    
    if champion_profile_id:
        profile_data, _ = api_get("profiles", {"select": "id,money", "id": f"eq.{champion_profile_id}"})
        if profile_data and len(profile_data) > 0:
            new_money = (profile_data[0].get("money") or 0) + champion_prize
            api_patch("profiles", {"money": new_money}, {"id": f"eq.{champion_profile_id}"})
    
    # Season awards
    season_award_id = f"S2027_{league_id}"
    awards = [
        {
            "id": f"award_{season_award_id}_{league_id}_champion_{int(time.time())}",
            "season_id": season_award_id,
            "profile_id": champion_profile_id,
            "league_name": league_name,
            "award_type": "champion",
            "team_name": champion_name,
            "stat_value": champion["points"]
        }
    ]
    
    for award in awards:
        api_post("season_awards", award)
    
    # Reset league_teams standings for next season
    for standing in standings:
        api_patch("league_teams", {
            "played": 0, "won": 0, "drawn": 0, "lost": 0, "gf": 0, "ga": 0, "points": 0
        }, {"id": f"eq.{standing['team_id']}"})
    
    # Age all players
    players_data, _ = api_get("players", {"select": "id,age", "limit": "5000"})
    if players_data:
        for i in range(0, len(players_data), 100):
            batch = players_data[i:i+100]
            for p in batch:
                current_age = p.get("age") or 20
                api_patch("players", {"age": current_age + 1}, {"id": f"eq.{p['id']}"})
    
    # Create new season
    new_year = "2028/29"
    new_season_id = str(uuid.uuid4())
    api_post("seasons", {
        "id": new_season_id,
        "league_id": league_id,
        "year": new_year,
        "start_date": datetime.now().isoformat(),
        "current_tur": 1,
        "is_finished": False,
        "intake_completed": False
    })
    
    # Generate new fixtures for the new season
    league_teams_list = [t for t in (all_teams or []) if t["league_id"] == league_id]
    if len(league_teams_list) >= 2:
        new_fixtures = []
        tur = 1
        for round_num in range(2):
            for i in range(len(league_teams_list)):
                for j in range(i + 1, len(league_teams_list)):
                    if round_num == 0:
                        home = league_teams_list[i]
                        away = league_teams_list[j]
                    else:
                        home = league_teams_list[j]
                        away = league_teams_list[i]
                    
                    new_fixtures.append({
                        "id": str(uuid.uuid4()),
                        "season_id": new_season_id,
                        "home_team_id": home["id"],
                        "away_team_id": away["id"],
                        "league_id": league_id,
                        "competition_type": "league",
                        "status": "scheduled",
                        "tur": tur,
                        "match_date": f"2028-{((tur-1) % 9) + 1:02d}-{((tur-1) % 28) + 1:02d}",
                    })
                    tur += 1
        
        # Batch insert fixtures
        if new_fixtures:
            for i in range(0, len(new_fixtures), 50):
                batch = new_fixtures[i:i+50]
                api_post("fixtures", batch)
            
            print(f"  📅 {len(new_fixtures)} yeni fikstür oluşturuldu")
    
    # Create league_standings for new season
    for team in league_teams_list:
        api_post("league_standings", {
            "id": str(uuid.uuid4()),
            "team_id": team["id"],
            "league_id": league_id,
            "season_id": new_season_id,
            "played": 0, "won": 0, "drawn": 0, "lost": 0, "gf": 0, "ga": 0, "points": 0
        })
    
    return True

def check_match_day_component():
    """Check MatchDay component issues"""
    print("\n" + "="*60)
    print("⚔️ MAÇ GÜNÜ SEKME KONTROLÜ")
    print("="*60)
    
    # Check match_sessions table
    sessions, err = api_get("match_sessions", {"select": "*", "limit": "5"})
    if err:
        log_issue("CRITICAL", "schema", "match_sessions tablosuna erişilemiyor", err[:100])
    else:
        print(f"  match_sessions: {len(sessions)} kayıt")
        if len(sessions) == 0:
            log_issue("MEDIUM", "data", "match_sessions tablosu boş — maç günü sekmesi canlı maç gösteremez")
    
    # Check live_matches table
    live_matches, err = api_get("live_matches", {"select": "*", "limit": "5"})
    if err:
        log_issue("HIGH", "schema", "live_matches tablosuna erişilemiyor", err[:100])
    else:
        print(f"  live_matches: {len(live_matches)} kayıt")
    
    # Check match_events table
    events, err = api_get("match_events", {"select": "*", "limit": "5"})
    if err:
        log_issue("HIGH", "schema", "match_events tablosuna erişilemiyor", err[:100])
    else:
        print(f"  match_events: {len(events)} kayıt")
    
    # Check match_simulation_queue
    queue, err = api_get("match_simulation_queue", {"select": "*", "limit": "5"})
    if err:
        log_issue("MEDIUM", "schema", "match_simulation_queue tablosuna erişilemiyor", err[:100])
    else:
        pending = [q for q in (queue or []) if q.get("status") == "pending"]
        print(f"  match_simulation_queue: {len(queue or [])} kayıt ({len(pending)} pending)")
    
    # Check if there are any live/scheduled fixtures right now
    live_fx, _ = api_get("fixtures", {"select": "id,status", "status": "eq.live", "limit": "5"})
    scheduled_fx, _ = api_get("fixtures", {"select": "id,status", "status": "eq.scheduled", "limit": "5"})
    in_progress_fx, _ = api_get("fixtures", {"select": "id,status", "status": "eq.in_progress", "limit": "5"})
    
    print(f"\n  Canlı fikstür: {len(live_fx or [])}")
    print(f"  Planlanmış fikstür: {len(scheduled_fx or [])}")
    print(f"  Devam eden fikstür: {len(in_progress_fx or [])}")
    
    if len(scheduled_fx or []) == 0 and len(live_fx or []) == 0:
        log_issue("MEDIUM", "data", "Planlanmış veya canlı fikstür yok — maç günü sekmesi boş görünür")

def check_scouting_tab():
    """Check ScoutingTab component issues"""
    print("\n" + "="*60)
    print("🔭 GÖZLEMCİLİK SEKME KONTROLÜ")
    print("="*60)
    
    # Check players have mental attributes
    players, _ = api_get("players", {"select": "id,name,aggression,bravery,work_rate,decisions,position,team_name", "limit": "5"})
    
    if not players:
        log_issue("CRITICAL", "data", "Oyuncu verisi okunamıyor")
        return
    
    all_same = True
    mental_attrs = ["aggression", "bravery", "work_rate", "decisions", "determination", 
                    "concentration", "leadership", "anticipation", "flair", "positioning", 
                    "composure", "teamwork"]
    
    for p in players[:5]:
        vals = [p.get(attr) for attr in mental_attrs if attr in p]
        if vals and len(set(vals)) > 2:
            all_same = False
        print(f"  {p.get('name', '?')}: aggression={p.get('aggression', 'MISSING')}, bravery={p.get('bravery', 'MISSING')}, work_rate={p.get('work_rate', 'MISSING')}")
    
    if all_same:
        log_issue("HIGH", "data", "Tüm mental nitelikler aynı değerde (50) — gözlemcilik sekmesi doğru göstermez")

def check_data_consistency():
    """Check data consistency across tables"""
    print("\n" + "="*60)
    print("🔍 VERİ TUTARLILIK KONTROLÜ")
    print("="*60)
    
    # Check: teams with 0 played but have completed fixtures
    teams, _ = api_get("league_teams", {"select": "id,name,played,league_id"})
    zero_played = [t for t in (teams or []) if (t.get("played") or 0) == 0]
    if zero_played:
        for t in zero_played[:5]:
            # Check if this team has completed fixtures
            fixtures, _ = api_get("fixtures", {
                "select": "id,status",
                "or": f"(home_team_id.eq.{t['id']},away_team_id.eq.{t['id']})",
                "status": "eq.completed",
                "limit": "3"
            })
            if fixtures and len(fixtures) > 0:
                log_issue("HIGH", "consistency", 
                    f"{t['name']}: 0 maç oynanmış görünüyor ama {len(fixtures)} tamamlanmış fikstür var",
                    f"Team ID: {t['id']}")
    
    # Check: players without team
    free_agents, _ = api_get("players", {"select": "id,name", "is_free_agent": "eq.true", "limit": "5"})
    print(f"  Serbest oyuncular: {len(free_agents or [])}")
    
    # Check: teams without players
    teams, _ = api_get("league_teams", {"select": "id,name", "limit": "200"})
    for t in (teams or [])[:10]:
        players, _ = api_get("players", {"select": "id", "team_name": f"eq.{t['name']}", "limit": "1"})
        if not players or len(players) == 0:
            # Try by profile_id
            profile, _ = api_get("profiles", {"select": "id", "team_name": f"eq.{t['name']}"})
            if profile and len(profile) > 0:
                players2, _ = api_get("players", {"select": "id", "profile_id": f"eq.{profile[0]['id']}", "limit": "1"})
                if not players2 or len(players2) == 0:
                    log_issue("HIGH", "data", f"{t['name']}: Oyuncusu olmayan takım")
            else:
                log_issue("MEDIUM", "data", f"{t['name']}: Takıma ait profil veya oyuncu bulunamadı")
    
    # Check: inconsistent fixture statuses (finished vs completed)
    finished_fx, _ = api_get("fixtures", {"select": "id,status", "status": "eq.finished", "limit": "5"})
    if finished_fx and len(finished_fx) > 0:
        log_issue("MEDIUM", "consistency", 
            f"{len(finished_fx)} fikstür 'finished' durumunda (tutarlı olan 'completed' olmalı)")
    
    # Check: seasons marked as not finished but all fixtures completed
    active_seasons, _ = api_get("seasons", {"select": "id,league_id,is_finished", "is_finished": "eq.false"})
    for s in (active_seasons or []):
        all_fx, _ = api_get("fixtures", {
            "select": "id,status",
            "season_id": f"eq.{s['id']}",
            "limit": "1000"
        })
        if all_fx:
            statuses = Counter(f.get("status") for f in all_fx)
            non_completed = sum(v for k, v in statuses.items() if k != "completed")
            if non_completed == 0 and len(all_fx) > 0:
                log_issue("MEDIUM", "consistency",
                    f"Sezon {s['id'][:8]}...: is_finished=false ama tüm fikstürler completed")

def simulate_season(season_num, leagues):
    """Simulate one complete season for all leagues"""
    print(f"\n{'='*60}")
    print(f"⚽ SEZON {season_num} SİMÜLASYONU")
    print(f"{'='*60}")
    
    for league in leagues:
        league_id = league["id"]
        league_name = league["name"]
        league_tier = league["tier"]
        
        print(f"\n  🏟️ {league_name} (Tier {league_tier})")
        
        # Simulate all pending matches
        matches_simulated = simulate_all_matches_for_league(league_id, league_name)
        print(f"  ⚽ {matches_simulated} maç simüle edildi")
        
        # Process season end
        if matches_simulated > 0 or True:  # Always try season end
            ok = process_season_end_for_league(league_id, league_name, league_tier)
            if ok:
                print(f"  ✅ Sezon sonu işlemleri tamamlandı")
            else:
                print(f"  ❌ Sezon sonu işlemleri başarısız")

# ═══════════════════════════════════════════════════════════
# MAIN SIMULATION
# ═══════════════════════════════════════════════════════════

def main():
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║  🎮 SİYAH-BEYAZ FM — 4 SEZONLUK SİMÜLASYON              ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    
    # Phase 1: Health Check
    check_database_health()
    
    # Phase 2: Current State
    leagues, all_teams, seasons = get_current_state()
    
    # Phase 3: Data Consistency Check
    check_data_consistency()
    
    # Phase 4: Match Day Tab Check
    check_match_day_component()
    
    # Phase 5: Scouting Tab Check
    check_scouting_tab()
    
    # Phase 6: Simulate 4 Seasons
    for season in range(1, 5):
        simulate_season(season, leagues)
        
        # Quick health check after each season
        print(f"\n  📊 Sezon {season} sonrası kontrol:")
        teams_after, _ = api_get("league_teams", {"select": "id,name,played,league_id"})
        leagues_after, _ = api_get("leagues", {"select": "id,name"})
        
        for l in leagues_after:
            lt = [t for t in (teams_after or []) if t.get("league_id") == l["id"]]
            played_teams = [t for t in lt if (t.get("played") or 0) > 0]
            print(f"    {l['name']}: {len(played_teams)}/{len(lt)} takım oynadı")
            
            if len(played_teams) == 0 and len(lt) > 0:
                log_issue("HIGH", "logic", 
                    f"Sezon {season} sonrası {l['name']}: Hiçbir takım maç oynamadı — fikstür oluşturma hatası?")
    
    # Phase 7: Final Report
    print("\n" + "="*60)
    print("📋 SİMÜLASYON SONU RAPORU")
    print("="*60)
    
    if not issues:
        print("  ✅ Hiçbir sorun tespit edilmedi!")
    else:
        severity_counts = Counter(i["severity"] for i in issues)
        category_counts = Counter(i["category"] for i in issues)
        
        print(f"\n  Toplam sorun: {len(issues)}")
        for sev, count in severity_counts.most_common():
            icon = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}.get(sev, "⚪")
            print(f"  {icon} {sev}: {count}")
        
        print(f"\n  Kategorilere göre:")
        for cat, count in category_counts.most_common():
            print(f"  - {cat}: {count}")
        
        print(f"\n  Detaylı sorun listesi:")
        for i, issue in enumerate(issues, 1):
            icon = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}.get(issue["severity"], "⚪")
            print(f"  {i}. {icon} [{issue['severity']}] {issue['category']}: {issue['message']}")
            if issue.get("detail"):
                print(f"     → {issue['detail'][:150]}")
    
    # Save report to file
    report_path = "/home/z/my-project/download/simulation-report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump({
            "simulation_date": datetime.now().isoformat(),
            "seasons_simulated": 4,
            "total_issues": len(issues),
            "severity_breakdown": dict(Counter(i["severity"] for i in issues)),
            "category_breakdown": dict(Counter(i["category"] for i in issues)),
            "issues": issues
        }, f, ensure_ascii=False, indent=2)
    print(f"\n  📄 Rapor kaydedildi: {report_path}")

if __name__ == "__main__":
    main()
