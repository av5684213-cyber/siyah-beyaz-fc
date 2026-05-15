#!/usr/bin/env python3
"""
Siyah Beyaz FC — Match Simulator (Python Service)
Maç simülasyonu: Gol, asist, sarı/kırmızı kart, sakatlık, oyuncu değişikliği olayları üretir.

Kullanım:
    python match_simulator.py [--fixture-id <id>] [--all-pending]

Supabase REST API (httpx) üzerinden çalışır.
Ortam değişkenleri: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
"""

import os
import sys
import json
import random
import logging
import argparse
from datetime import datetime, timedelta
from typing import Any, Optional

try:
    import httpx
except ImportError:
    print("HATA: httpx kütüphanesi gerekli. 'pip install httpx' ile kurun.")
    sys.exit(1)

# ─── Logging ────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("match_simulator")

# ─── Supabase Yapılandırması ────────────────────────────────────────────────

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://jmxbyaamwbpnvgbnjbmo.supabase.co"),
)
SUPABASE_KEY = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    os.environ.get("SUPABASE_ANON_KEY",
                   os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")),
)

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("SUPABASE_URL ve SUPABASE_KEY ortam değişkenleri gerekli!")
    sys.exit(1)

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

# ─── Sabitler ────────────────────────────────────────────────────────────────

# Sakatlık olasılığı (%5)
INJURY_CHANCE = 0.05

# Sakatlık süresi (1-3 maç = 7-28 gün arası)
INJURY_MIN_MATCHES = 1
INJURY_MAX_MATCHES = 3
DAYS_PER_MATCH = 7  # Her maç arası ~7 gün

# Sakatlık tipleri ve süre aralıkları (gün)
INJURY_TYPES = {
    "hamstring": (7, 21),
    "ankle": (5, 14),
    "knee": (10, 21),
    "shoulder": (7, 14),
    "back": (5, 14),
    "groin": (7, 18),
    "calf": (5, 12),
    "thigh": (7, 14),
    "muscle_strain": (5, 14),
    "ligament": (10, 21),
    "concussion": (7, 14),
}

# Pozisyon bazlı gol/asist olasılıkları
POSITION_GOAL_WEIGHT = {
    "ST": 0.35, "CF": 0.30, "LW": 0.18, "RW": 0.18,
    "CAM": 0.12, "CM": 0.08, "CDM": 0.04,
    "LM": 0.10, "RM": 0.10,
    "LB": 0.03, "RB": 0.03, "LWB": 0.04, "RWB": 0.04,
    "CB": 0.02, "GK": 0.00,
}

POSITION_ASSIST_WEIGHT = {
    "CAM": 0.30, "CM": 0.15, "CDM": 0.08,
    "LW": 0.20, "RW": 0.20, "LM": 0.15, "RM": 0.15,
    "ST": 0.10, "CF": 0.12,
    "LB": 0.10, "RB": 0.10, "LWB": 0.12, "RWB": 0.12,
    "CB": 0.03, "GK": 0.01,
}

# Kart olasılıkları (maç başına ortalama)
YELLOW_CARD_CHANCE = 0.22  # Oyuncu başına ~%22
RED_CARD_CHANCE = 0.02     # Oyuncu başına ~%2

# Oyuncu değişikliği
SUBSTITUTION_CHANCE = 0.60  # Takım başına ~%60 en az 1 değişiklik


# ═══════════════════════════════════════════════════════════════════════
# SUPABASE REST API YARDIMCILARI
# ═══════════════════════════════════════════════════════════════════════

class SupabaseClient:
    """Supabase REST API istemcisi (PostgREST üzerinden)."""

    def __init__(self, url: str, key: str):
        self.url = url.rstrip("/")
        self.key = key
        self.client = httpx.Client(timeout=30.0, headers=HEADERS)

    def _request(self, method: str, table: str, params: Optional[dict] = None,
                 json_data: Optional[dict] = None) -> dict:
        """Genel Supabase REST istek metodu."""
        endpoint = f"{self.url}/rest/v1/{table}"
        try:
            response = self.client.request(
                method, endpoint, params=params, json=json_data
            )
            response.raise_for_status()
            if response.status_code == 204:
                return {}
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Supabase HTTP hatası [{e.response.status_code}]: {e.response.text}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Supabase istek hatası: {e}")
            raise

    def select(self, table: str, query: str = "*", filters: Optional[dict] = None,
               order: Optional[str] = None, limit: Optional[int] = None) -> list:
        """Supabase'den veri çeker (GET)."""
        params = {"select": query}
        if filters:
            for key, val in filters.items():
                params[key] = val
        if order:
            params["order"] = order
        if limit:
            params["limit"] = limit
        return self._request("GET", table, params=params)

    def insert(self, table: str, data: dict) -> dict:
        """Supabase'e veri ekler (POST)."""
        return self._request("POST", table, json_data=data)

    def update(self, table: str, data: dict, filters: Optional[dict] = None) -> dict:
        """Supabase'de veri günceller (PATCH)."""
        params = filters or {}
        return self._request("PATCH", table, params=params, json_data=data)

    def rpc(self, function_name: str, params: Optional[dict] = None) -> dict:
        """Supabase RPC çağrısı (POST)."""
        endpoint = f"{self.url}/rest/v1/rpc/{function_name}"
        try:
            response = self.client.post(endpoint, json=params or {})
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"RPC hatası [{e.response.status_code}]: {e.response.text}")
            raise

    def close(self):
        self.client.close()


# ═══════════════════════════════════════════════════════════════════════
# MAÇ SİMÜLASYONU MOTORU
# ═══════════════════════════════════════════════════════════════════════

def generate_realistic_minutes(count: int, half: int = 1) -> list[int]:
    """
    Gerçekçi dakikalar üretir (0-45 ilk yarı, 46-90+ ikinci yarı).
    Dakikaların dağılımı gerçek futbol istatistiklerine benzer.
    İlk yarıda daha az gol, ikinci yarıda (özellikle 75-90') daha fazla.
    """
    if half == 1:
        # İlk yarı: 1-45 arası, 30-45 arası biraz daha yoğun
        weights = [1.0] * 15 + [1.5] * 15 + [2.0] * 15
        minutes = list(range(1, 46))
    else:
        # İkinci yarı: 46-90+ arası, 75-90 arası daha yoğun
        weights = [1.5] * 15 + [2.0] * 15 + [3.0] * 15
        minutes = list(range(46, 91))
        # Uzatma dakikaları
        minutes.extend([90, 91, 92])
        weights.extend([1.0, 0.5, 0.3])

    result = []
    for _ in range(count):
        chosen = random.choices(minutes, weights=weights[:len(minutes)], k=1)[0]
        # Aynı dakikaya çok yakın olaylar olmaması için küçük rastgelelik
        minute = max(1, min(chosen + random.randint(-1, 1), 92))
        result.append(minute)

    result.sort()
    return result


def calculate_team_strength(players: list[dict]) -> float:
    """Takım gücünü hesaplar (rating ortalaması + form faktörü)."""
    if not players:
        return 50.0
    ratings = [p.get("rating", 50) for p in players if p.get("rating")]
    if not ratings:
        return 50.0
    avg_rating = sum(ratings) / len(ratings)
    form_bonus = sum(p.get("form_rating", 0) or 0 for p in players) / len(players) * 0.1
    return avg_rating + form_bonus


def simulate_match_events(
    home_players: list[dict],
    away_players: list[dict],
    home_team_name: str = "Ev Sahibi",
    away_team_name: str = "Deplasman",
) -> dict:
    """
    Bir maçın olaylarını simüle eder.

    Returns:
        {
            "home_score": int,
            "away_score": int,
            "events": [...],
            "card_events": [...],   # kart cezası uygulanacaklar
            "injury_events": [...], # sakatlık uygulanacaklar
        }
    """
    events = []
    card_events = []
    injury_events = []

    # Takım güçleri
    home_strength = calculate_team_strength(home_players)
    away_strength = calculate_team_strength(away_players)

    # Güç farkından gol sayısı tahmini (Poisson benzeri)
    strength_diff = (home_strength - away_strength) / 20  # -3 ile +3 arası
    home_expected_goals = max(0.5, 1.3 + strength_diff * 0.5)
    away_expected_goals = max(0.3, 1.1 - strength_diff * 0.4)

    # Toplam gol sayısını belirle (Poisson benzeri)
    home_goals = 0
    away_goals = 0
    for _ in range(6):  # En fazla 6 deneme (poisson yaklaşımı)
        if random.random() < home_expected_goals / 6:
            home_goals += 1
    for _ in range(6):
        if random.random() < away_expected_goals / 6:
            away_goals += 1

    home_goals = min(home_goals, 7)
    away_goals = min(away_goals, 7)

    # ─── GOL OLAYLARI ────────────────────────────────────────────────
    home_starting = home_players[:11]
    away_starting = away_players[:11]

    def pick_scorer(players: list[dict]) -> dict:
        """Gol atma olasılığına göre oyuncu seçer."""
        weights = []
        for p in players:
            pos = p.get("position", "CM")
            weight = POSITION_GOAL_WEIGHT.get(pos, 0.08)
            # Rating bonusu
            rating = p.get("rating", 50)
            weight *= (rating / 50)
            # Form bonusu
            form = p.get("form_rating", 50) or 50
            weight *= (form / 50)
            weights.append(weight)

        total = sum(weights)
        if total == 0:
            return random.choice(players)
        weights = [w / total for w in weights]
        return random.choices(players, weights=weights, k=1)[0]

    def pick_assister(players: list[dict], scorer_id: str) -> Optional[dict]:
        """Asist yapma olasılığına göre oyuncu seçer (gol atan hariç)."""
        eligible = [p for p in players if p.get("id") != scorer_id]
        if not eligible:
            return None

        # ~%70 ihtimalle asist var
        if random.random() > 0.70:
            return None

        weights = []
        for p in eligible:
            pos = p.get("position", "CM")
            weight = POSITION_ASSIST_WEIGHT.get(pos, 0.08)
            rating = p.get("rating", 50)
            weight *= (rating / 50)
            weights.append(weight)

        total = sum(weights)
        if total == 0:
            return random.choice(eligible)
        weights = [w / total for w in weights]
        return random.choices(eligible, weights=weights, k=1)[0]

    # Ev sahibi golleri
    goal_minutes_home = generate_realistic_minutes(home_goals, half=random.choice([1, 2]))
    for i, minute in enumerate(goal_minutes_home):
        scorer = pick_scorer(home_starting)
        assister = pick_assister(home_starting, scorer.get("id"))

        goal_event = {
            "type": "goal",
            "minute": minute,
            "playerId": scorer.get("id"),
            "playerName": scorer.get("name", "Bilinmeyen"),
            "team": home_team_name,
            "side": "home",
        }
        events.append(goal_event)

        if assister:
            assist_event = {
                "type": "assist",
                "minute": minute,
                "playerId": assister.get("id"),
                "playerName": assister.get("name", "Bilinmeyen"),
                "team": home_team_name,
                "side": "home",
                "assistFor": scorer.get("name", "Bilinmeyen"),
            }
            events.append(assist_event)

    # Deplasman golleri
    goal_minutes_away = generate_realistic_minutes(away_goals, half=random.choice([1, 2]))
    for i, minute in enumerate(goal_minutes_away):
        scorer = pick_scorer(away_starting)
        assister = pick_assister(away_starting, scorer.get("id"))

        goal_event = {
            "type": "goal",
            "minute": minute,
            "playerId": scorer.get("id"),
            "playerName": scorer.get("name", "Bilinmeyen"),
            "team": away_team_name,
            "side": "away",
        }
        events.append(goal_event)

        if assister:
            assist_event = {
                "type": "assist",
                "minute": minute,
                "playerId": assister.get("id"),
                "playerName": assister.get("name", "Bilinmeyen"),
                "team": away_team_name,
                "side": "away",
                "assistFor": scorer.get("name", "Bilinmeyen"),
            }
            events.append(assist_event)

    # ─── KART OLAYLARI ───────────────────────────────────────────────
    all_on_pitch = home_starting + away_starting

    for player in all_on_pitch:
        # Sarı kart
        if random.random() < YELLOW_CARD_CHANCE:
            # Savunma oyuncuları daha fazla kart alır
            pos = player.get("position", "CM")
            card_modifier = 1.5 if pos in ("CB", "CDM", "LB", "RB") else 1.0
            aggression = player.get("aggression", 50) or 50
            card_modifier *= (aggression / 50)

            if random.random() < min(card_modifier * YELLOW_CARD_CHANCE, 0.35):
                minute = random.randint(1, 90)
                team = home_team_name if player in home_starting else away_team_name
                side = "home" if player in home_starting else "away"

                yellow_event = {
                    "type": "yellow_card",
                    "minute": minute,
                    "playerId": player.get("id"),
                    "playerName": player.get("name", "Bilinmeyen"),
                    "team": team,
                    "side": side,
                }
                events.append(yellow_event)
                card_events.append(yellow_event)

                # İkinci sarı → kırmızı (küçük ihtimal)
                if random.random() < 0.08:
                    red_minute = minute + random.randint(5, 30)
                    if red_minute > 90:
                        red_minute = 90
                    second_yellow_event = {
                        "type": "red_card",
                        "minute": red_minute,
                        "playerId": player.get("id"),
                        "playerName": player.get("name", "Bilinmeyen"),
                        "team": team,
                        "side": side,
                        "reason": "İkinci sarı kart",
                    }
                    events.append(second_yellow_event)
                    card_events.append(second_yellow_event)

        # Direkt kırmızı kart (çok düşük ihtimal)
        if random.random() < RED_CARD_CHANCE:
            minute = random.randint(10, 85)
            team = home_team_name if player in home_starting else away_team_name
            side = "home" if player in home_starting else "away"

            red_event = {
                "type": "red_card",
                "minute": minute,
                "playerId": player.get("id"),
                "playerName": player.get("name", "Bilinmeyen"),
                "team": team,
                "side": side,
                "reason": "Direkt kırmızı kart",
            }
            events.append(red_event)
            card_events.append(red_event)

    # ─── SAKATLIK OLAYLARI ───────────────────────────────────────────
    for player in all_on_pitch:
        if random.random() < INJURY_CHANCE:
            minute = random.randint(5, 85)
            team = home_team_name if player in home_starting else away_team_name
            side = "home" if player in home_starting else "away"

            # Sakatlık süresi: 1-3 maç (7-28 gün)
            injury_matches = random.randint(INJURY_MIN_MATCHES, INJURY_MAX_MATCHES)
            injury_days = injury_matches * DAYS_PER_MATCH + random.randint(-2, 5)
            injury_days = max(5, injury_days)

            injury_type = random.choice(list(INJURY_TYPES.keys()))

            injury_event = {
                "type": "injury",
                "minute": minute,
                "playerId": player.get("id"),
                "playerName": player.get("name", "Bilinmeyen"),
                "team": team,
                "side": side,
                "injuryType": injury_type,
                "injuryDays": injury_days,
                "injuryMatches": injury_matches,
            }
            events.append(injury_event)
            injury_events.append(injury_event)

    # ─── OYUNCU DEĞİŞİKLİĞİ ─────────────────────────────────────────
    for team_players, team_name, side in [
        (home_players, home_team_name, "home"),
        (away_players, away_team_name, "away"),
    ]:
        if len(team_players) > 11 and random.random() < SUBSTITUTION_CHANCE:
            num_subs = random.choices([1, 2, 3], weights=[0.4, 0.45, 0.15], k=1)[0]
            num_subs = min(num_subs, len(team_players) - 11)

            starting = team_players[:11]
            bench = team_players[11:]

            sub_minutes = sorted(random.randint(46, 85) for _ in range(num_subs))

            for i in range(min(num_subs, len(bench))):
                out_player = random.choice(starting)
                in_player = bench[i]
                minute = sub_minutes[i]

                sub_event = {
                    "type": "substitution",
                    "minute": minute,
                    "playerOutId": out_player.get("id"),
                    "playerOutName": out_player.get("name", "Bilinmeyen"),
                    "playerInId": in_player.get("id"),
                    "playerInName": in_player.get("name", "Bilinmeyen"),
                    "team": team_name,
                    "side": side,
                }
                events.append(sub_event)

    # ─── DEVRE ARASI VE MAÇ SONU ────────────────────────────────────
    events.append({
        "type": "halftime",
        "minute": 45,
        "score": f"{home_team_name} {sum(1 for e in events if e.get('type') == 'goal' and e.get('side') == 'home')}-{sum(1 for e in events if e.get('type') == 'goal' and e.get('side') == 'away')} {away_team_name}",
    })

    events.append({
        "type": "fulltime",
        "minute": 90,
        "score": f"{home_team_name} {home_goals}-{away_goals} {away_team_name}",
    })

    # Dakikaya göre sırala
    events.sort(key=lambda e: e.get("minute", 0))

    return {
        "home_score": home_goals,
        "away_score": away_goals,
        "events": events,
        "card_events": card_events,
        "injury_events": injury_events,
    }


# ═══════════════════════════════════════════════════════════════════════
# SUPABASE GÜNCELLEMELERİ
# ═══════════════════════════════════════════════════════════════════════

def apply_card_suspensions_to_db(
    db: SupabaseClient,
    card_events: list[dict],
    next_match_date: Optional[str] = None,
) -> dict:
    """
    Kart cezalarını Supabase'deki players tablosuna uygular.
    - 2 sarı kart (aynı maçta) veya direkt kırmızı → suspended_until = sonraki maç tarihi
    """
    if not card_events:
        return {"updated": [], "errors": []}

    updated = []
    errors = []

    # Sonraki maç tarihi (varsayılan: 1 hafta sonra)
    if not next_match_date:
        next_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    else:
        next_date = next_match_date

    # Oyuncu bazında kart sayısını hesapla
    card_counts: dict[str, dict[str, int]] = {}
    for event in card_events:
        pid = event.get("playerId", "")
        if pid not in card_counts:
            card_counts[pid] = {"yellow": 0, "red": 0}

        if event.get("type") == "yellow_card":
            card_counts[pid]["yellow"] += 1
        elif event.get("type") == "red_card":
            card_counts[pid]["red"] += 1

    for pid, cards in card_counts.items():
        should_suspend = False
        reason = ""

        if cards["red"] >= 1:
            should_suspend = True
            reason = f"Kırmızı kart: {cards['red']} kırmızı kart"
        elif cards["yellow"] >= 2:
            should_suspend = True
            reason = f"Çift sarı kart: {cards['yellow']} sarı kart"

        if should_suspend:
            try:
                db.update(
                    "players",
                    {"suspended_until": next_date},
                    {"id": f"eq.{pid}"},
                )
                updated.append(pid)
                logger.info(f"Oyuncu {pid} cezalandırıldı ({next_date}): {reason}")
            except Exception as e:
                err_msg = f"Oyuncu {pid} ceza güncelleme hatası: {e}"
                errors.append(err_msg)
                logger.error(err_msg)

    return {"updated": updated, "errors": errors}


def apply_injuries_to_db(
    db: SupabaseClient,
    injury_events: list[dict],
) -> dict:
    """
    Sakatlıkları Supabase'deki players tablosuna uygular.
    - is_injured = true
    - injury_end_date = bugün + injuryDays
    - injury_history'ye kayıt ekle
    """
    if not injury_events:
        return {"updated": [], "errors": []}

    updated = []
    errors = []
    today = datetime.now().strftime("%Y-%m-%d")

    for event in injury_events:
        pid = event.get("playerId", "")
        injury_days = event.get("injuryDays", 14)
        injury_type = event.get("injuryType", "muscle_strain")

        end_date = (datetime.now() + timedelta(days=injury_days)).strftime("%Y-%m-%d")

        # Sakatlık kaydı
        injury_record = {
            "date": today,
            "duration_days": injury_days,
            "type": injury_type,
        }

        try:
            # Mevcut injury_history'yi çek
            player_data = db.select(
                "players",
                query="injury_history,injury",
                filters={"id": f"eq.{pid}"},
            )

            current_history = []
            if player_data and len(player_data) > 0:
                raw_history = player_data[0].get("injury_history")
                if raw_history:
                    if isinstance(raw_history, str):
                        try:
                            current_history = json.loads(raw_history)
                        except json.JSONDecodeError:
                            current_history = []
                    elif isinstance(raw_history, list):
                        current_history = raw_history

            current_history.append(injury_record)

            # Aktif sakatlık objesi
            injury_obj = {
                "type": "chronic" if injury_type == "ligament" else
                        "risky" if injury_type == "concussion" else "light",
                "remaining_days": injury_days,
                "severity": 3 if injury_days > 14 else 2 if injury_days > 7 else 1,
            }

            db.update(
                "players",
                {
                    "is_injured": True,
                    "injury_end_date": end_date,
                    "injury": json.dumps(injury_obj),
                    "injury_history": json.dumps(current_history),
                },
                {"id": f"eq.{pid}"},
            )

            updated.append(pid)
            logger.info(
                f"Oyuncu {pid} sakatlandı: {injury_type}, {injury_days} gün "
                f"(bitiş: {end_date})"
            )

        except Exception as e:
            err_msg = f"Oyuncu {pid} sakatlık güncelleme hatası: {e}"
            errors.append(err_msg)
            logger.error(err_msg)

    return {"updated": updated, "errors": errors}


def save_events_to_match_history(
    db: SupabaseClient,
    match_id: str,
    events: list[dict],
) -> bool:
    """Maç olaylarını match_history tablosuna kaydeder (events JSONB alanı)."""
    try:
        db.update(
            "match_history",
            {"events": json.dumps(events)},
            {"id": f"eq.{match_id}"},
        )
        logger.info(f"Maç {match_id} olayları kaydedildi ({len(events)} olay)")
        return True
    except Exception as e:
        logger.error(f"Maç {match_id} olay kaydetme hatası: {e}")
        return False


def update_fixture_result(
    db: SupabaseClient,
    fixture_id: str,
    home_score: int,
    away_score: int,
) -> bool:
    """Fikstür sonucunu günceller."""
    try:
        db.update(
            "fixtures",
            {
                "status": "completed",
                "home_score": home_score,
                "away_score": away_score,
            },
            {"id": f"eq.{fixture_id}"},
        )
        logger.info(f"Fikstür {fixture_id} sonucu güncellendi: {home_score}-{away_score}")
        return True
    except Exception as e:
        logger.error(f"Fikstür {fixture_id} güncelleme hatası: {e}")
        return False


def update_league_standings(
    db: SupabaseClient,
    season_id: str,
    home_team_id: str,
    away_team_id: str,
    home_score: int,
    away_score: int,
) -> None:
    """Lig puan tablosunu günceller."""
    for team_id, gf, ga in [
        (home_team_id, home_score, away_score),
        (away_team_id, away_score, home_score),
    ]:
        try:
            data = db.select(
                "league_standings",
                query="*",
                filters={"team_id": f"eq.{team_id}", "season_id": f"eq.{season_id}"},
            )

            if not data:
                logger.warning(f"Puan tablosu bulunamadı: team={team_id}, season={season_id}")
                continue

            standing = data[0]
            is_win = gf > ga
            is_draw = gf == ga

            updated = {
                "played": (standing.get("played") or 0) + 1,
                "won": (standing.get("won") or 0) + (1 if is_win else 0),
                "drawn": (standing.get("drawn") or 0) + (1 if is_draw else 0),
                "lost": (standing.get("lost") or 0) + (1 if not is_win and not is_draw else 0),
                "gf": (standing.get("gf") or 0) + gf,
                "ga": (standing.get("ga") or 0) + ga,
                "points": (standing.get("points") or 0) + (3 if is_win else 1 if is_draw else 0),
            }

            db.update(
                "league_standings",
                updated,
                {"id": f"eq.{standing['id']}"},
            )
            logger.info(f"Puan tablosu güncellendi: team={team_id}")

        except Exception as e:
            logger.error(f"Puan tablosu güncelleme hatası (team={team_id}): {e}")


# ═══════════════════════════════════════════════════════════════════════
# ANA İŞLEYİŞ
# ═══════════════════════════════════════════════════════════════════════

def simulate_fixture(db: SupabaseClient, fixture_id: str) -> dict:
    """Tek bir fikstürü simüle eder."""
    logger.info(f"Fikstür {fixture_id} simülasyonu başlıyor...")

    try:
        # Fikstür verisini çek
        fixtures = db.select("fixtures", query="*", filters={"id": f"eq.{fixture_id}"})
        if not fixtures:
            return {"success": False, "error": f"Fikstür bulunamadı: {fixture_id}"}

        fixture = fixtures[0]
        home_team_id = fixture.get("home_team_id")
        away_team_id = fixture.get("away_team_id")
        season_id = fixture.get("season_id")

        # Takım verilerini çek
        home_team = db.select("league_teams", query="*", filters={"id": f"eq.{home_team_id}"})
        away_team = db.select("league_teams", query="*", filters={"id": f"eq.{away_team_id}"})

        if not home_team or not away_team:
            return {"success": False, "error": "Takım verisi bulunamadı"}

        home_team_name = home_team[0].get("name", "Ev Sahibi")
        away_team_name = away_team[0].get("name", "Deplasman")

        # Oyuncuları çek
        home_players = db.select("players", query="*", filters={"team_name": f"eq.{home_team_name}"})
        away_players = db.select("players", query="*", filters={"team_name": f"eq.{away_team_name}"})

        if not home_players or len(home_players) < 7:
            return {"success": False, "error": f"Ev sahibi oyuncu yetersiz: {len(home_players) if home_players else 0}"}
        if not away_players or len(away_players) < 7:
            return {"success": False, "error": f"Deplasman oyuncu yetersiz: {len(away_players) if away_players else 0}"}

        # Cezalı ve sakat oyuncuları filtrele
        today = datetime.now().strftime("%Y-%m-%d")

        def filter_available(players: list) -> list:
            available = []
            for p in players:
                if p.get("suspended_until") and p["suspended_until"] >= today:
                    continue
                if p.get("is_injured"):
                    continue
                injury = p.get("injury")
                if injury:
                    try:
                        if isinstance(injury, str):
                            injury = json.loads(injury)
                        if injury.get("remaining_days", 0) > 0:
                            continue
                    except (json.JSONDecodeError, AttributeError):
                        pass
                available.append(p)
            return available

        available_home = filter_available(home_players)
        available_away = filter_available(away_players)

        if len(available_home) < 7 or len(available_away) < 7:
            return {
                "success": False,
                "error": f"Uygun oyuncu yetersiz: {len(available_home)} vs {len(available_away)}",
            }

        # Simülasyonu çalıştır
        result = simulate_match_events(
            available_home[:18],  # İlk 11 + yedekler
            available_away[:18],
            home_team_name,
            away_team_name,
        )

        # Fikstür sonucunu güncelle
        update_fixture_result(db, fixture_id, result["home_score"], result["away_score"])

        # Maç olaylarını kaydet
        save_events_to_match_history(db, fixture_id, result["events"])

        # Kart cezalarını uygula
        next_match_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        apply_card_suspensions_to_db(db, result["card_events"], next_match_date)

        # Sakatlıkları uygula
        apply_injuries_to_db(db, result["injury_events"])

        # Lig puan tablosunu güncelle
        update_league_standings(
            db, season_id, home_team_id, away_team_id,
            result["home_score"], result["away_score"],
        )

        logger.info(
            f"Maç sonucu: {home_team_name} {result['home_score']}-"
            f"{result['away_score']} {away_team_name}"
        )

        return {
            "success": True,
            "fixture_id": fixture_id,
            "home_team": home_team_name,
            "away_team": away_team_name,
            "score": f"{result['home_score']}-{result['away_score']}",
            "events_count": len(result["events"]),
            "cards": len(result["card_events"]),
            "injuries": len(result["injury_events"]),
        }

    except Exception as e:
        logger.error(f"Fikstür {fixture_id} simülasyon hatası: {e}")
        return {"success": False, "error": str(e)}


def simulate_all_pending(db: SupabaseClient) -> dict:
    """Tüm bekleyen fikstürleri simüle eder."""
    logger.info("Bekleyen fikstürler aranıyor...")

    today = datetime.now().strftime("%Y-%m-%d")

    try:
        # Bekleyen fikstürleri çek
        # PostgREST: lt=less than, eq=equal
        fixtures = db.select(
            "fixtures",
            query="id,home_team_id,away_team_id,season_id,match_date",
            filters={"status": "eq.scheduled"},
        )

        if not fixtures:
            logger.info("Bekleyen fikstür bulunamadı")
            return {"simulated": 0, "results": [], "errors": []}

        # Tarih filtresi (bugüne kadar olanlar)
        pending = [f for f in fixtures if f.get("match_date", "9999-99-99") <= today]

        if not pending:
            logger.info(f"Bugüne ({today}) kadar oynanacak fikstür yok")
            return {"simulated": 0, "results": [], "errors": []}

        logger.info(f"{len(pending)} bekleyen fikstür bulundu")

        results = []
        errors = []

        for fixture in pending:
            result = simulate_fixture(db, fixture["id"])
            if result.get("success"):
                results.append(result)
            else:
                errors.append(result.get("error", "Bilinmeyen hata"))

        return {
            "simulated": len(results),
            "results": results,
            "errors": errors,
        }

    except Exception as e:
        logger.error(f"Toplu simülasyon hatası: {e}")
        return {"simulated": 0, "results": [], "errors": [str(e)]}


# ═══════════════════════════════════════════════════════════════════════
# CLI GİRİŞ NOKTASI
# ═══════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Siyah Beyaz FC — Maç Simülatörü")
    parser.add_argument(
        "--fixture-id",
        type=str,
        help="Belirli bir fikstür ID'sini simüle et",
    )
    parser.add_argument(
        "--all-pending",
        action="store_true",
        help="Tüm bekleyen fikstürleri simüle et",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simülasyonu çalıştır ama veritabanına yazma (test için)",
    )

    args = parser.parse_args()

    db = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)

    try:
        if args.fixture_id:
            result = simulate_fixture(db, args.fixture_id)
            print(json.dumps(result, indent=2, ensure_ascii=False))

        elif args.all_pending:
            result = simulate_all_pending(db)
            print(json.dumps(result, indent=2, ensure_ascii=False))

        else:
            # Varsayılan: bugünün bekleyen maçlarını simüle et
            logger.info("Varsayılan mod: bugünün bekleyen maçları simüle ediliyor...")
            result = simulate_all_pending(db)
            print(json.dumps(result, indent=2, ensure_ascii=False))

    finally:
        db.close()


if __name__ == "__main__":
    main()
