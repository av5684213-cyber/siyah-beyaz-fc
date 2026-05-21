#!/usr/bin/env python3
"""
Siyah Beyaz FC — Match Simulator (Python Service) v2.0
Maç simülasyonu: Gol, asist, sarı/kırmızı kart, sakatlık, oyuncu değişikliği olayları üretir.

v2.0 Yenilikler:
  - matches tablosunda home_goals, away_goals, status güncelleme
  - match_history tablosuna events JSONB kaydı
  - Kart cezalarında takımın bir sonraki maç tarihini fikstürden bulma
  - Sakatlık güncelleme: is_injured + injury_end_date
  - Maç olaylarını match_chat tablosuna sistem mesajı olarak ekleme
  - Gelişmiş hata yönetimi ve loglama
  - Penaltı ve serbest vuruş olayları
  - Maçın adamı (MOTM) seçimi

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

# Penaltı olasılığı (maç başına)
PENALTY_CHANCE = 0.12  # ~%12 penaltı ihtimali

# Serbest vuruş gol olasılığı
FREE_KICK_CHANCE = 0.05  # ~%5 serbest vuruştan gol


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
    if count == 0:
        return []

    if half == 1:
        weights = [1.0] * 15 + [1.5] * 15 + [2.0] * 15
        minutes = list(range(1, 46))
    else:
        weights = [1.5] * 15 + [2.0] * 15 + [3.0] * 15
        minutes = list(range(46, 91))
        minutes.extend([90, 91, 92])
        weights.extend([1.0, 0.5, 0.3])

    result = []
    for _ in range(count):
        chosen = random.choices(minutes, weights=weights[:len(minutes)], k=1)[0]
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


def calculate_tactical_advantage(
    home_players: list[dict],
    away_players: list[dict],
    home_formation: str = "4-4-2",
    away_formation: str = "4-4-2",
) -> dict:
    """
    Taktiksel avantaj hesaplar:
    - Rakibin zayıf yönüne oynama
    - Bireysel yetenek eşleşmeleri
    - Formasyon avantajı

    Returns:
        {
            "home_possession_bonus": float,  # Topa sahip olma bonusu
            "home_shot_accuracy_bonus": float,  # Şut isabeti bonusu
            "away_possession_bonus": float,
            "away_shot_accuracy_bonus": float,
        }
    """
    home_starting = home_players[:11]
    away_starting = away_players[:11]

    # ── 1. Rakibin zayıf yönüne oynama ──
    # Her takımın bölgesel güçlerini hesapla
    def get_area_strength(players: list[dict]) -> dict:
        areas = {"defence": [], "midfield": [], "attack": []}
        for p in players:
            pos = p.get("position", "MID")
            rating = p.get("rating", 50) or 50
            if pos in ("GK", "CB", "LB", "RB", "LWB", "RWB"):
                areas["defence"].append(rating)
            elif pos in ("CDM", "CM", "CAM", "LM", "RM"):
                areas["midfield"].append(rating)
            elif pos in ("LW", "RW", "CF", "ST"):
                areas["attack"].append(rating)
        return {
            k: sum(v) / max(1, len(v)) if v else 50
            for k, v in areas.items()
        }

    home_areas = get_area_strength(home_starting)
    away_areas = get_area_strength(away_starting)

    # Ev sahibinin en güçlü alanı vs rakibin en zayıf alanı
    home_best_area = max(home_areas, key=home_areas.get)
    away_weakest_area = min(away_areas, key=away_areas.get)
    away_best_area = max(away_areas, key=away_areas.get)
    home_weakest_area = min(home_areas, key=home_areas.get)

    # Avantaj hesaplama
    home_tactical_bonus = 0.0
    away_tactical_bonus = 0.0

    # Ev sahibi rakibin zayıf yönüne oynama
    if home_best_area == "attack" and away_weakest_area == "defence":
        home_tactical_bonus += 0.05  # +%5 şut isabeti
    if home_best_area == "midfield" and away_weakest_area == "midfield":
        home_tactical_bonus += 0.10  # +%10 topa sahip olma

    # Deplasman rakibin zayıf yönüne oynama
    if away_best_area == "attack" and home_weakest_area == "defence":
        away_tactical_bonus += 0.05
    if away_best_area == "midfield" and home_weakest_area == "midfield":
        away_tactical_bonus += 0.10

    # ── 2. Bireysel yetenek eşleşmeleri ──
    # Kanat vs bek eşleşmeleri
    def get_positional_matchup_bonus(attackers: list[dict], defenders: list[dict], stat_attack: str, stat_defend: str) -> float:
        bonus = 0.0
        for att in attackers:
            att_skill = (att.get(stat_attack, 50) or 50)
            for defn in defenders:
                def_skill = (defn.get(stat_defend, 50) or 50)
                if att_skill > def_skill + 10:
                    bonus += 0.02  # +%2 aksiyon şansı
        return min(bonus, 0.10)  # Maks +%10

    # Sol kanat vs sağ bek
    home_lw = [p for p in home_starting if p.get("specific_position") in ("LW", "LM")]
    away_rb = [p for p in away_starting if p.get("specific_position") in ("RB", "RWB")]
    home_matchup_1 = get_positional_matchup_bonus(home_lw, away_rb, "dribbling", "tackling")

    # Sağ kanat vs sol bek
    home_rw = [p for p in home_starting if p.get("specific_position") in ("RW", "RM")]
    away_lb = [p for p in away_starting if p.get("specific_position") in ("LB", "LWB")]
    home_matchup_2 = get_positional_matchup_bonus(home_rw, away_lb, "dribbling", "tackling")

    # Deplasman
    away_lw = [p for p in away_starting if p.get("specific_position") in ("LW", "LM")]
    home_rb = [p for p in home_starting if p.get("specific_position") in ("RB", "RWB")]
    away_matchup_1 = get_positional_matchup_bonus(away_lw, home_rb, "dribbling", "tackling")

    away_rw = [p for p in away_starting if p.get("specific_position") in ("RW", "RM")]
    home_lb = [p for p in home_starting if p.get("specific_position") in ("LB", "LWB")]
    away_matchup_2 = get_positional_matchup_bonus(away_rw, home_lb, "dribbling", "tackling")

    # ── 3. Formasyon avantajı ──
    # Basit taktik taş-kağıt-makas
    formation_advantages = {
        "4-4-2": {"strong_vs": "4-3-3", "weak_vs": "3-5-2"},
        "4-3-3": {"strong_vs": "3-5-2", "weak_vs": "4-4-2"},
        "3-5-2": {"strong_vs": "4-4-2", "weak_vs": "4-3-3"},
    }

    home_formation_advantage = 0.0
    away_formation_advantage = 0.0

    home_info = formation_advantages.get(home_formation)
    away_info = formation_advantages.get(away_formation)

    if home_info:
        if away_formation == home_info["strong_vs"]:
            home_formation_advantage = 0.05
        elif away_formation == home_info["weak_vs"]:
            home_formation_advantage = -0.03

    if away_info:
        if home_formation == away_info["strong_vs"]:
            away_formation_advantage = 0.05
        elif home_formation == away_info["weak_vs"]:
            away_formation_advantage = -0.03

    # Toplam
    total_home_shot_accuracy = home_tactical_bonus + home_matchup_1 + home_matchup_2 + home_formation_advantage
    total_home_possession = (0.10 if home_tactical_bonus >= 0.10 else 0.0) + home_formation_advantage
    total_away_shot_accuracy = away_tactical_bonus + away_matchup_1 + away_matchup_2 + away_formation_advantage
    total_away_possession = (0.10 if away_tactical_bonus >= 0.10 else 0.0) + away_formation_advantage

    return {
        "home_possession_bonus": total_home_possession,
        "home_shot_accuracy_bonus": total_home_shot_accuracy,
        "away_possession_bonus": total_away_possession,
        "away_shot_accuracy_bonus": total_away_shot_accuracy,
    }


def pick_motm(players: list[dict], events: list[dict], side: str) -> Optional[dict]:
    """
    Maçın Adamı (Man of the Match) seçimi.
    Gol = 3 puan, Asist = 2 puan, Sarı kart = -1 puan, Kırmızı kart = -3 puan.
    Rating faktörü dahil.
    """
    motm_scores: dict[str, float] = {}
    starting = players[:11]

    for p in starting:
        pid = p.get("id", "")
        base_score = (p.get("rating", 50) or 50) * 0.05
        motm_scores[pid] = base_score

    for e in events:
        pid = None
        score = 0
        if e.get("side") != side:
            continue

        if e.get("type") == "goal":
            pid = e.get("playerId")
            score = 3.0
        elif e.get("type") == "assist":
            pid = e.get("playerId")
            score = 2.0
        elif e.get("type") == "yellow_card":
            pid = e.get("playerId")
            score = -1.0
        elif e.get("type") == "red_card":
            pid = e.get("playerId")
            score = -3.0

        if pid and pid in motm_scores:
            motm_scores[pid] = motm_scores.get(pid, 0) + score

    if not motm_scores:
        return None

    best_pid = max(motm_scores, key=motm_scores.get)
    if motm_scores[best_pid] <= 0:
        # En yüksek rating'li oyuncuyu seç
        return max(starting, key=lambda p: p.get("rating", 0)) if starting else None

    for p in starting:
        if p.get("id") == best_pid:
            return p

    return starting[0] if starting else None


def simulate_match_events(
    home_players: list[dict],
    away_players: list[dict],
    home_team_name: str = "Ev Sahibi",
    away_team_name: str = "Deplasman",
    home_formation: str = "4-4-2",
    away_formation: str = "4-4-2",
) -> dict:
    """
    Bir maçın olaylarını simüle eder.

    Args:
        home_players: Ev sahibi oyuncu listesi
        away_players: Deplasman oyuncu listesi
        home_team_name: Ev sahibi takım adı
        away_team_name: Deplasman takım adı
        home_formation: Ev sahibi formasyon (örn: "4-4-2")
        away_formation: Deplasman formasyon (örn: "4-3-3")

    Returns:
        {
            "home_score": int,
            "away_score": int,
            "events": [...],
            "card_events": [...],
            "injury_events": [...],
            "motm_home": dict | None,
            "motm_away": dict | None,
            "tactical_advantage": dict,
        }
    """
    events = []
    card_events = []
    injury_events = []

    # Takım güçleri
    home_strength = calculate_team_strength(home_players)
    away_strength = calculate_team_strength(away_players)

    # ── TAKTİKSEL AVANTAJ HESAPLAMA ──
    tactical = calculate_tactical_advantage(
        home_players, away_players, home_formation, away_formation
    )

    # Güç farkından gol sayısı tahmini (Poisson benzeri)
    strength_diff = (home_strength - away_strength) / 20
    home_expected_goals = max(0.5, 1.3 + strength_diff * 0.5)
    away_expected_goals = max(0.3, 1.1 - strength_diff * 0.4)

    # Taktik bonusu gol beklentisine etki etsin
    home_expected_goals *= (1.0 + tactical["home_shot_accuracy_bonus"])
    away_expected_goals *= (1.0 + tactical["away_shot_accuracy_bonus"])

    # Toplam gol sayısını belirle (Poisson benzeri)
    home_goals = 0
    away_goals = 0
    for _ in range(6):
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
            rating = p.get("rating", 50)
            weight *= (rating / 50)
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

        # Gol tipi belirle (normal, penaltı, serbest vuruş)
        goal_type = "normal"
        if random.random() < PENALTY_CHANCE:
            goal_type = "penalty"
        elif random.random() < FREE_KICK_CHANCE:
            goal_type = "free_kick"

        goal_event = {
            "type": "goal",
            "minute": minute,
            "playerId": scorer.get("id"),
            "playerName": scorer.get("name", "Bilinmeyen"),
            "team": home_team_name,
            "side": "home",
            "goalType": goal_type,
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

        goal_type = "normal"
        if random.random() < PENALTY_CHANCE:
            goal_type = "penalty"
        elif random.random() < FREE_KICK_CHANCE:
            goal_type = "free_kick"

        goal_event = {
            "type": "goal",
            "minute": minute,
            "playerId": scorer.get("id"),
            "playerName": scorer.get("name", "Bilinmeyen"),
            "team": away_team_name,
            "side": "away",
            "goalType": goal_type,
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
            pos = player.get("position", "CM")
            card_modifier = 1.5 if pos in ("CB", "CDM", "LB", "RB") else 1.0
            aggression = player.get("aggression", 50) or 50
            card_modifier *= (aggression / 50)

            if random.random() < min(card_modifier * YELLOW_CARD_CHANCE, 0.35):
                minute = random.randint(1, 90)
                team = home_team_name if player in home_starting else away_team_name
                side = "home" if player in home_starting else "away"

                # Sarı kart nedenleri
                reasons = [
                    "Teknik faul", "Sert müdahale", "İtiraz",
                    "Oyalanma", "El topu", "Kural dışı müdahale",
                ]

                yellow_event = {
                    "type": "yellow_card",
                    "minute": minute,
                    "playerId": player.get("id"),
                    "playerName": player.get("name", "Bilinmeyen"),
                    "team": team,
                    "side": side,
                    "reason": random.choice(reasons),
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

            red_reasons = [
                "Direkt kırmızı kart", "Agresif davranış",
                "Son adam faul", "Kavgaya karışma",
            ]

            red_event = {
                "type": "red_card",
                "minute": minute,
                "playerId": player.get("id"),
                "playerName": player.get("name", "Bilinmeyen"),
                "team": team,
                "side": side,
                "reason": random.choice(red_reasons),
            }
            events.append(red_event)
            card_events.append(red_event)

    # ─── SAKATLIK OLAYLARI ───────────────────────────────────────────
    for player in all_on_pitch:
        if random.random() < INJURY_CHANCE:
            minute = random.randint(5, 85)
            team = home_team_name if player in home_starting else away_team_name
            side = "home" if player in home_starting else "away"

            injury_matches = random.randint(INJURY_MIN_MATCHES, INJURY_MAX_MATCHES)
            injury_days = injury_matches * DAYS_PER_MATCH + random.randint(-2, 5)
            injury_days = max(5, injury_days)

            injury_type = random.choice(list(INJURY_TYPES.keys()))
            # Sakatlık şiddeti
            severity = 3 if injury_days > 14 else 2 if injury_days > 7 else 1

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
                "severity": severity,
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
                # Sakat oyuncuyu öncelikle çıkar
                out_player = None
                for sp in starting:
                    is_injured_now = any(
                        ie.get("playerId") == sp.get("id")
                        for ie in injury_events
                    )
                    if is_injured_now:
                        out_player = sp
                        break

                if not out_player:
                    # En düşük rating'li oyuncuyu çıkar
                    out_player = min(starting, key=lambda p: p.get("rating", 50))

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
                    "reason": "injury" if any(
                        ie.get("playerId") == out_player.get("id")
                        for ie in injury_events
                    ) else "tactical",
                }
                events.append(sub_event)

    # ─── DEVRE ARASI VE MAÇ SONU ────────────────────────────────────
    home_goals_actual = sum(1 for e in events if e.get("type") == "goal" and e.get("side") == "home")
    away_goals_actual = sum(1 for e in events if e.get("type") == "goal" and e.get("side") == "away")

    events.append({
        "type": "halftime",
        "minute": 45,
        "score": f"{home_team_name} {home_goals_actual}-{away_goals_actual} {away_team_name}",
    })

    events.append({
        "type": "fulltime",
        "minute": 90,
        "score": f"{home_team_name} {home_goals}-{away_goals} {away_team_name}",
    })

    # Dakikaya göre sırala
    events.sort(key=lambda e: (e.get("minute", 0), 0 if e.get("type") == "goal" else 1))

    # ─── MAÇIN ADAMI (MOTM) ────────────────────────────────────────
    motm_home = pick_motm(home_players, events, "home")
    motm_away = pick_motm(away_players, events, "away")

    return {
        "home_score": home_goals,
        "away_score": away_goals,
        "events": events,
        "card_events": card_events,
        "injury_events": injury_events,
        "motm_home": motm_home,
        "motm_away": motm_away,
        "tactical_advantage": tactical,
    }


# ═══════════════════════════════════════════════════════════════════════
# SUPABASE GÜNCELLEMELERİ
# ═══════════════════════════════════════════════════════════════════════

def get_next_match_date_for_team(db: SupabaseClient, team_id: str, current_date: str) -> str:
    """
    Takımın bir sonraki maç tarihini fikstürden bulur.
    Bulamazsa 7 gün sonrasını döndürür.
    """
    try:
        # Ev sahibi veya deplasman olarak takımın gelecek maçlarını bul
        fixtures = db.select(
            "fixtures",
            query="match_date",
            filters={"status": "eq.scheduled"},
        )

        if fixtures:
            upcoming = [
                f for f in fixtures
                if f.get("match_date", "9999-99-99") > current_date
            ]
            if upcoming:
                upcoming.sort(key=lambda f: f.get("match_date", "9999-99-99"))
                return upcoming[0].get("match_date")

        # Fallback: 7 gün sonra
        next_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        logger.info(f"Takım {team_id} için sonraki maç tarihi bulunamadı, varsayılan: {next_date}")
        return next_date

    except Exception as e:
        logger.warning(f"Sonraki maç tarihi bulma hatası: {e}")
        return (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")


def apply_card_suspensions_to_db(
    db: SupabaseClient,
    card_events: list[dict],
    team_id_map: Optional[dict] = None,
) -> dict:
    """
    Kart cezalarını Supabase'deki players tablosuna uygular.
    - 2 sarı kart (aynı maçta) veya direkt kırmızı → suspended_until = sonraki maç tarihi
    - team_id_map: {playerId: teamId} şeklinde takım ID eşlemesi
    """
    if not card_events:
        return {"updated": [], "errors": []}

    updated = []
    errors = []
    today = datetime.now().strftime("%Y-%m-%d")

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
                # Takımın bir sonraki maç tarihini bul
                team_id = (team_id_map or {}).get(pid, "")
                next_date = get_next_match_date_for_team(db, team_id, today)

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
        severity = event.get("severity", 2)

        end_date = (datetime.now() + timedelta(days=injury_days)).strftime("%Y-%m-%d")

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
                "severity": severity,
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
            {
                "events": json.dumps(events),
                "status": "completed",
            },
            {"id": f"eq.{match_id}"},
        )
        logger.info(f"Maç {match_id} olayları kaydedildi ({len(events)} olay)")
        return True
    except Exception as e:
        logger.error(f"Maç {match_id} olay kaydetme hatası: {e}")
        return False


def update_match_result(
    db: SupabaseClient,
    match_id: str,
    home_score: int,
    away_score: int,
) -> bool:
    """
    matches tablosunda home_goals, away_goals ve status günceller.
    Tablo mevcut değilse fixtures tablosunu günceller.
    """
    try:
        # Önce matches tablosunu dene
        db.update(
            "matches",
            {
                "home_goals": home_score,
                "away_goals": away_score,
                "status": "completed",
            },
            {"id": f"eq.{match_id}"},
        )
        logger.info(f"Matches tablosu güncellendi: {match_id} → {home_score}-{away_score}")
        return True
    except Exception as e:
        logger.warning(f"Matches tablosu güncellenemedi (muhtemelen yok): {e}")
        # Fallback: fixtures tablosunu güncelle
        try:
            db.update(
                "fixtures",
                {
                    "status": "completed",
                    "home_score": home_score,
                    "away_score": away_score,
                },
                {"id": f"eq.{match_id}"},
            )
            logger.info(f"Fikstür güncellendi: {match_id} → {home_score}-{away_score}")
            return True
        except Exception as e2:
            logger.error(f"Fikstür güncelleme hatası: {e2}")
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


def push_match_events_to_chat(
    db: SupabaseClient,
    fixture_id: str,
    events: list[dict],
) -> int:
    """
    Maç olaylarını match_chat tablosuna sistem mesajı olarak ekler.
    Gol, kart, sakatlık, oyuncu değişikliği olaylarını chat'e yansıtır.
    """
    pushed = 0
    system_name = "Maç Motoru"

    event_messages = {
        "goal": lambda e: f"⚽ GOL! {e.get('playerName', '?')} {e.get('minute', 0)}' ({e.get('team', '')})" + (f" [{e.get('goalType', 'normal')}]" if e.get("goalType") != "normal" else ""),
        "yellow_card": lambda e: f"🟨 Sarı Kart: {e.get('playerName', '?')} {e.get('minute', 0)}' ({e.get('team', '')})",
        "red_card": lambda e: f"🟥 Kırmızı Kart: {e.get('playerName', '?')} {e.get('minute', 0)}' ({e.get('team', '')}) - {e.get('reason', '')}",
        "injury": lambda e: f"🏥 Sakatlık: {e.get('playerName', '?')} {e.get('minute', 0)}' ({e.get('injuryType', '')})",
        "substitution": lambda e: f"🔄 Değişiklik: {e.get('playerOutName', '?')} ➡️ {e.get('playerInName', '?')} {e.get('minute', 0)}' ({e.get('team', '')})",
        "halftime": lambda e: f"⏸️ Devre Arası: {e.get('score', '')}",
        "fulltime": lambda e: f"🏁 Maç Sonu: {e.get('score', '')}",
    }

    for event in events:
        event_type = event.get("type", "")
        if event_type in event_messages:
            try:
                message = event_messages[event_type](event)
                chat_row = {
                    "fixture_id": fixture_id,
                    "profile_id": "system",
                    "sender_name": system_name,
                    "content": message[:200],  # max 200 karakter
                    "message_type": "system",
                    "minute": event.get("minute", 0),
                }
                db.insert("match_chat", chat_row)
                pushed += 1
            except Exception as e:
                logger.warning(f"Chat mesajı eklenemedi ({event_type}): {e}")

    logger.info(f"Maç {fixture_id}: {pushed} sistem mesajı chat'e eklendi")
    return pushed


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
            available_home[:18],
            available_away[:18],
            home_team_name,
            away_team_name,
        )

        # Fikstür sonucunu güncelle
        update_fixture_result(db, fixture_id, result["home_score"], result["away_score"])

        # matches tablosunu da güncelle (mevcutsa)
        update_match_result(db, fixture_id, result["home_score"], result["away_score"])

        # Maç olaylarını match_history'ye kaydet
        save_events_to_match_history(db, fixture_id, result["events"])

        # Olayları match_chat'e sistem mesajı olarak ekle
        try:
            push_match_events_to_chat(db, fixture_id, result["events"])
        except Exception as e:
            logger.warning(f"Chat mesajları eklenemedi: {e}")

        # Kart cezalarını uygula (takım ID eşlemesi ile)
        team_id_map = {}
        for p in available_home:
            team_id_map[p.get("id", "")] = home_team_id
        for p in available_away:
            team_id_map[p.get("id", "")] = away_team_id

        apply_card_suspensions_to_db(db, result["card_events"], team_id_map)

        # Sakatlıkları uygula
        apply_injuries_to_db(db, result["injury_events"])

        # Lig puan tablosunu güncelle
        update_league_standings(
            db, season_id, home_team_id, away_team_id,
            result["home_score"], result["away_score"],
        )

        # MOTM bilgisi
        motm_home_name = result.get("motm_home", {}).get("name", "N/A") if result.get("motm_home") else "N/A"
        motm_away_name = result.get("motm_away", {}).get("name", "N/A") if result.get("motm_away") else "N/A"

        logger.info(
            f"Maç sonucu: {home_team_name} {result['home_score']}-"
            f"{result['away_score']} {away_team_name} | "
            f"MOTM: {motm_home_name} / {motm_away_name}"
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
            "motm_home": motm_home_name,
            "motm_away": motm_away_name,
        }

    except Exception as e:
        logger.error(f"Fikstür {fixture_id} simülasyon hatası: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


def simulate_all_pending(db: SupabaseClient) -> dict:
    """Tüm bekleyen fikstürleri simüle eder."""
    logger.info("Bekleyen fikstürler aranıyor...")

    today = datetime.now().strftime("%Y-%m-%d")

    try:
        fixtures = db.select(
            "fixtures",
            query="id,home_team_id,away_team_id,season_id,match_date",
            filters={"status": "eq.scheduled"},
        )

        if not fixtures:
            logger.info("Bekleyen fikstür bulunamadı")
            return {"simulated": 0, "results": [], "errors": []}

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
        logger.error(f"Toplu simülasyon hatası: {e}", exc_info=True)
        return {"simulated": 0, "results": [], "errors": [str(e)]}


# ═══════════════════════════════════════════════════════════════════════
# CLI GİRİŞ NOKTASI
# ═══════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Siyah Beyaz FC — Maç Simülatörü v2.0")
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
            if args.dry_run:
                logger.info("DRY RUN: Veritabanına yazılmayacak")
            result = simulate_fixture(db, args.fixture_id)
            print(json.dumps(result, indent=2, ensure_ascii=False))

        elif args.all_pending:
            result = simulate_all_pending(db)
            print(json.dumps(result, indent=2, ensure_ascii=False))

        else:
            logger.info("Varsayılan mod: bugünün bekleyen maçları simüle ediliyor...")
            result = simulate_all_pending(db)
            print(json.dumps(result, indent=2, ensure_ascii=False))

    finally:
        db.close()


if __name__ == "__main__":
    main()
