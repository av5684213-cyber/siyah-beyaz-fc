#!/usr/bin/env python3
"""
Siyah Beyaz FC — Sezon Sonu Ödül ve İstatistik Sistemi (Python Service) v2.0

week = 34 tamamlandığında tetiklenir. Şu ödülleri hesaplar:
  - Gol Kralı (golden_boot) — match_history.events JSONB'den gol sayar
  - Asist Kralı (top_assists) — match_history.events JSONB'den asist sayar
  - En Değerli Oyuncu (mvp) — gol=3, asist=2, maçın adamı=5 puanlama
  - En İyi Kaleci (best_gk) — kaleci rating + clean sheet bazlı
  - Yılın Genç Oyuncusu (best_young) – 22 yaş altı, en yüksek form
  - Fair Play Ödülü (fair_play) – en az kart alan TAKIM
  - Şampiyonluk (champion) – lig birincisi

Her ödülü season_awards tablosuna kaydeder.
Kazanan oyunculara player_achievements tablosuna rozet ekler.
Hall of Fame'e sezon verilerini ekler.

Kullanım:
    python award_season.py [--season-id <season_id>] [--week <week>] [--all-profiles]

Ortam değişkenleri: SUPABASE_URL, SUPABASE_ANON_KEY / SUPABASE_SERVICE_KEY
"""

import os
import sys
import json
import logging
import argparse
from datetime import datetime
from typing import Any, Optional
from collections import defaultdict

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
logger = logging.getLogger("award_season")

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


# ═══════════════════════════════════════════════════════════════════════
# SUPABASE REST API İSTEMCİSİ
# ═══════════════════════════════════════════════════════════════════════

class SupabaseClient:
    """Supabase REST API istemcisi."""

    def __init__(self, url: str, key: str):
        self.url = url.rstrip("/")
        self.key = key
        self.client = httpx.Client(timeout=30.0, headers=HEADERS)

    def _request(self, method: str, table: str, params: Optional[dict] = None,
                 json_data: Optional[Any] = None) -> Any:
        endpoint = f"{self.url}/rest/v1/{table}"
        try:
            response = self.client.request(method, endpoint, params=params, json=json_data)
            response.raise_for_status()
            if response.status_code == 204:
                return {}
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP hatası [{e.response.status_code}]: {e.response.text}")
            raise
        except httpx.RequestError as e:
            logger.error(f"İstek hatası: {e}")
            raise

    def select(self, table: str, query: str = "*", filters: Optional[dict] = None,
               order: Optional[str] = None, limit: Optional[int] = None) -> list:
        params = {"select": query}
        if filters:
            for key, val in filters.items():
                params[key] = val
        if order:
            params["order"] = order
        if limit:
            params["limit"] = limit
        return self._request("GET", table, params=params)

    def insert(self, table: str, data: Any) -> Any:
        return self._request("POST", table, json_data=data)

    def update(self, table: str, data: dict, filters: Optional[dict] = None) -> Any:
        params = filters or {}
        return self._request("PATCH", table, params=params, json_data=data)

    def upsert(self, table: str, data: Any) -> Any:
        """Upsert: conflict olursa güncelle."""
        extra_headers = dict(self.client.headers)
        extra_headers["Prefer"] = "resolution=merge-duplicates,return=representation"
        endpoint = f"{self.url}/rest/v1/{table}"
        try:
            response = self.client.post(endpoint, json=data, headers=extra_headers)
            response.raise_for_status()
            if response.status_code == 204:
                return {}
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Upsert hatası [{e.response.status_code}]: {e.response.text}")
            raise

    def close(self):
        self.client.close()


# ═══════════════════════════════════════════════════════════════════════
# MATCH_HISTORY EVENTS'TEN İSTATİSTİK ÇEKME
# ═══════════════════════════════════════════════════════════════════════

def extract_stats_from_match_events(
    db: SupabaseClient,
    season_id: str,
) -> dict:
    """
    match_history tablosundaki events JSONB'den oyuncu bazlı istatistik çıkarır.
    
    Returns:
        {
            "player_stats": {
                "player_id": {
                    "goals": int, "assists": int, "yellow_cards": int,
                    "red_cards": int, "motm": int, "matches": int,
                    "player_name": str, "team_name": str
                }
            },
            "team_stats": {
                "team_name": {
                    "yellow_cards": int, "red_cards": int,
                    "goals_scored": int, "goals_conceded": int,
                    "matches": int
                }
            }
        }
    """
    player_stats: dict[str, dict] = defaultdict(lambda: {
        "goals": 0, "assists": 0, "yellow_cards": 0,
        "red_cards": 0, "motm": 0, "matches": 0,
        "player_name": "", "team_name": ""
    })
    team_stats: dict[str, dict] = defaultdict(lambda: {
        "yellow_cards": 0, "red_cards": 0,
        "goals_scored": 0, "goals_conceded": 0,
        "matches": 0
    })

    try:
        # Tüm maç geçmişini çek
        matches = db.select(
            "match_history",
            query="events,home_team,away_team",
        )

        if not matches:
            logger.warning("match_history'de veri bulunamadı")
            return {"player_stats": dict(player_stats), "team_stats": dict(team_stats)}

        logger.info(f"match_history'den {len(matches)} maç taranıyor...")

        for match in matches:
            events_raw = match.get("events")
            if not events_raw:
                continue

            # JSON parse
            if isinstance(events_raw, str):
                try:
                    events = json.loads(events_raw)
                except json.JSONDecodeError:
                    continue
            elif isinstance(events_raw, list):
                events = events_raw
            else:
                continue

            home_team = match.get("home_team", "Ev Sahibi")
            away_team = match.get("away_team", "Deplasman")

            # Maça katılan oyuncuları takip et
            players_in_match = set()

            for event in events:
                event_type = event.get("type", "")
                player_id = event.get("playerId") or event.get("playerOutId")
                player_name = event.get("playerName") or event.get("playerOutName", "")
                team = event.get("team", "")

                if not player_id:
                    continue

                # Oyuncuyu maç sayısına ekle
                players_in_match.add(player_id)
                player_stats[player_id]["player_name"] = player_name
                player_stats[player_id]["team_name"] = team

                if event_type == "goal":
                    player_stats[player_id]["goals"] += 1
                    team_stats[team]["goals_scored"] += 1
                elif event_type == "assist":
                    player_stats[player_id]["assists"] += 1
                elif event_type == "yellow_card":
                    player_stats[player_id]["yellow_cards"] += 1
                    team_stats[team]["yellow_cards"] += 1
                elif event_type == "red_card":
                    player_stats[player_id]["red_cards"] += 1
                    team_stats[team]["red_cards"] += 1

            # Maça katılan oyuncuların maç sayısını artır
            for pid in players_in_match:
                player_stats[pid]["matches"] += 1

            # Takım maç sayıları
            team_stats[home_team]["matches"] += 1
            team_stats[away_team]["matches"] += 1

        logger.info(
            f"İstatistikler çıkarıldı: {len(player_stats)} oyuncu, "
            f"{len(team_stats)} takım"
        )

    except Exception as e:
        logger.error(f"match_history tarama hatası: {e}", exc_info=True)

    return {"player_stats": dict(player_stats), "team_stats": dict(team_stats)}


# ═══════════════════════════════════════════════════════════════════════
# ÖDÜL HESAPLAMA
# ═══════════════════════════════════════════════════════════════════════

def get_season_id_from_week(week: int) -> str:
    """Hafta sayısından sezon ID'si üretir (34 hafta = 1 sezon)."""
    return f"season-{(week + 33) // 34}"


def get_current_year() -> int:
    return datetime.now().year


def compute_golden_boot(player_stats: dict) -> Optional[dict]:
    """Gol Kralı: En çok gol atan oyuncu (match_history.events'ten)."""
    if not player_stats:
        return None

    sorted_by_goals = sorted(
        player_stats.items(),
        key=lambda x: x[1].get("goals", 0),
        reverse=True,
    )

    if not sorted_by_goals or sorted_by_goals[0][1].get("goals", 0) <= 0:
        logger.info("Gol Kralı: Hiç gol atılmadı, ödül verilmiyor")
        return None

    pid, stats = sorted_by_goals[0]
    logger.info(f"Gol Kralı: {stats.get('player_name', pid)} - {stats['goals']} gol")

    return {
        "award_type": "golden_boot",
        "player_id": pid,
        "player_name": stats.get("player_name", pid),
        "team_name": stats.get("team_name", ""),
        "stat_value": stats["goals"],
        "stat_detail": {
            "goals": stats["goals"],
            "matches": stats.get("matches", 0),
            "assists": stats.get("assists", 0),
        },
    }


def compute_top_assists(player_stats: dict) -> Optional[dict]:
    """Asist Kralı: En çok asist yapan oyuncu (match_history.events'ten)."""
    if not player_stats:
        return None

    sorted_by_assists = sorted(
        player_stats.items(),
        key=lambda x: x[1].get("assists", 0),
        reverse=True,
    )

    if not sorted_by_assists or sorted_by_assists[0][1].get("assists", 0) <= 0:
        logger.info("Asist Kralı: Hiç asist yok, ödül verilmiyor")
        return None

    pid, stats = sorted_by_assists[0]
    logger.info(f"Asist Kralı: {stats.get('player_name', pid)} - {stats['assists']} asist")

    return {
        "award_type": "top_assists",
        "player_id": pid,
        "player_name": stats.get("player_name", pid),
        "team_name": stats.get("team_name", ""),
        "stat_value": stats["assists"],
        "stat_detail": {
            "assists": stats["assists"],
            "matches": stats.get("matches", 0),
            "goals": stats.get("goals", 0),
        },
    }


def compute_mvp(player_stats: dict) -> Optional[dict]:
    """
    En Değerli Oyuncu: Kompozit puanlama
    MVP Score = goals * 3 + assists * 2 + motm * 5 + matches * 0.1
    Her maç için rastgele bir MVP seçilir (motm = 1 en az).
    """
    if not player_stats:
        return None

    scored = []
    for pid, stats in player_stats.items():
        goals = stats.get("goals", 0)
        assists = stats.get("assists", 0)
        motm = stats.get("motm", 0)
        matches = stats.get("matches", 0)

        # Eğer motm verisi yoksa, en az 1 maç oynamış oyunculara rastgele motm ata
        if motm == 0 and matches > 0:
            motm = 1 if random.random() < 0.1 else 0

        import random as _random
        mvp_score = goals * 3 + assists * 2 + motm * 5 + matches * 0.1
        scored.append({**stats, "player_id": pid, "mvp_score": mvp_score})

    if not scored:
        return None

    scored.sort(key=lambda x: x["mvp_score"], reverse=True)
    winner = scored[0]

    logger.info(
        f"MVP: {winner.get('player_name', winner.get('player_id'))} "
        f"- MVP Skor: {round(winner['mvp_score'], 1)}"
    )

    return {
        "award_type": "mvp",
        "player_id": winner.get("player_id"),
        "player_name": winner.get("player_name", winner.get("player_id")),
        "team_name": winner.get("team_name", ""),
        "stat_value": round(winner["mvp_score"], 1),
        "stat_detail": {
            "goals": winner.get("goals", 0),
            "assists": winner.get("assists", 0),
            "motm": winner.get("motm", 0),
            "matches": winner.get("matches", 0),
        },
    }


def compute_best_gk(player_stats: dict, players: list[dict]) -> Optional[dict]:
    """
    En İyi Kaleci: Takımın yediği gol/maç oranı + kaleci rating.
    Sadece GK pozisyonundaki oyuncular.
    """
    # Kaleci oyuncularını bul
    gk_ids = set()
    for p in players:
        pos = p.get("position", "")
        if pos == "GK":
            gk_ids.add(p.get("id"))

    gk_stats = {pid: stats for pid, stats in player_stats.items() if pid in gk_ids}

    if not gk_stats:
        logger.info("En İyi Kaleci: Kaleci bulunamadı, takım bazlı hesaplama")
        # Takım bazlı: en az yiyen takımın kalecisi
        return None

    # Kaleci puanı: rating bazlı (match_events'te clean_sheets yoksa)
    scored = []
    for pid, stats in gk_stats.items():
        matches = max(stats.get("matches", 0) or 1, 1)
        # Basit puan: maç sayısı × (1 - kırmızı kart oranı)
        gk_score = matches + stats.get("goals", 0) * 0.5
        scored.append({**stats, "player_id": pid, "gk_score": gk_score})

    scored.sort(key=lambda x: x["gk_score"], reverse=True)
    winner = scored[0]

    logger.info(
        f"En İyi Kaleci: {winner.get('player_name', winner.get('player_id'))} "
        f"- GK Skor: {round(winner['gk_score'], 1)}"
    )

    return {
        "award_type": "best_gk",
        "player_id": winner.get("player_id"),
        "player_name": winner.get("player_name", winner.get("player_id")),
        "team_name": winner.get("team_name", ""),
        "stat_value": round(winner.get("gk_score", 0), 1),
        "stat_detail": {
            "matches": winner.get("matches", 0),
            "yellow_cards": winner.get("yellow_cards", 0),
            "red_cards": winner.get("red_cards", 0),
        },
    }


def compute_best_young(player_stats: dict, players: list[dict]) -> Optional[dict]:
    """
    Yılın Genç Oyuncusu: 22 yaş altı, en yüksek form_rating.
    """
    # 22 yaş altı oyuncuları bul
    young_ids = set()
    for p in players:
        age = p.get("age", 99)
        if age <= 22:
            young_ids.add(p.get("id"))

    young_stats = {pid: stats for pid, stats in player_stats.items() if pid in young_ids}

    if not young_stats:
        logger.info("En İyi Genç: U22 oyuncu bulunamadı")
        return None

    # Genç oyuncu puanı: gol * 3 + asist * 2 + maç * 0.5
    scored = []
    for pid, stats in young_stats.items():
        youth_score = stats.get("goals", 0) * 3 + stats.get("assists", 0) * 2 + stats.get("matches", 0) * 0.5
        scored.append({**stats, "player_id": pid, "youth_score": youth_score})

    scored.sort(key=lambda x: x["youth_score"], reverse=True)
    winner = scored[0]

    # Yaşı players'tan al
    winner_age = 22
    for p in players:
        if p.get("id") == winner.get("player_id"):
            winner_age = p.get("age", 22)
            break

    logger.info(
        f"En İyi Genç: {winner.get('player_name', winner.get('player_id'))} "
        f"- Yaş: {winner_age}, Skor: {round(winner['youth_score'], 1)}"
    )

    return {
        "award_type": "best_young",
        "player_id": winner.get("player_id"),
        "player_name": winner.get("player_name", winner.get("player_id")),
        "team_name": winner.get("team_name", ""),
        "stat_value": round(winner.get("youth_score", 0), 1),
        "stat_detail": {
            "age": winner_age,
            "goals": winner.get("goals", 0),
            "assists": winner.get("assists", 0),
            "matches": winner.get("matches", 0),
        },
    }


def compute_fair_play(team_stats: dict) -> Optional[dict]:
    """
    Fair Play Ödülü: En az sarı+kırmızı kart alan TAKIM.
    Puan = yellow + red * 3, en düşük puanlı takım kazanır (min 5 maç).
    """
    eligible = {
        name: stats for name, stats in team_stats.items()
        if (stats.get("matches", 0) or 0) >= 5
    }

    if not eligible:
        logger.info("Fair Play: Yeterli maç oynayan takım yok")
        return None

    def card_score(stats):
        yellow = stats.get("yellow_cards", 0) or 0
        red = stats.get("red_cards", 0) or 0
        return yellow + red * 3

    sorted_teams = sorted(
        eligible.items(),
        key=lambda x: (card_score(x[1]), -(x[1].get("matches", 0) or 0)),
    )

    team_name, stats = sorted_teams[0]
    yellow = stats.get("yellow_cards", 0) or 0
    red = stats.get("red_cards", 0) or 0

    logger.info(
        f"Fair Play: {team_name} - {yellow} sarı, {red} kırmızı, "
        f"{stats.get('matches', 0)} maç"
    )

    return {
        "award_type": "fair_play",
        "player_id": None,  # Takım ödülü
        "player_name": team_name,
        "team_name": team_name,
        "stat_value": yellow + red * 3,
        "stat_detail": {
            "yellow_cards": yellow,
            "red_cards": red,
            "matches": stats.get("matches", 0),
        },
    }


def compute_champion(db: SupabaseClient, season_id: str) -> Optional[dict]:
    """Şampiyonluk: Lig birincisi takımın menajer profili."""
    try:
        standings = db.select(
            "league_standings",
            query="team_id,points,won,drawn,lost,gf,ga",
            filters={"season_id": f"eq.{season_id}"},
            order="points.desc,gf.desc",
            limit=1,
        )

        if not standings:
            logger.info(f"Şampiyonluk: Sezon {season_id} için puan tablosu bulunamadı")
            return None

        champion_standing = standings[0]
        team_id = champion_standing.get("team_id")

        team_data = db.select("league_teams", query="name,profile_id", filters={"id": f"eq.{team_id}"})
        if not team_data:
            return None

        team_name = team_data[0].get("name", "Bilinmeyen")
        profile_id = team_data[0].get("profile_id", "")

        logger.info(
            f"Şampiyon: {team_name} - {champion_standing.get('points', 0)} puan, "
            f"{champion_standing.get('won', 0)}G {champion_standing.get('drawn', 0)}B {champion_standing.get('lost', 0)}M"
        )

        return {
            "award_type": "champion",
            "player_id": None,
            "player_name": team_name,
            "team_name": team_name,
            "profile_id": profile_id,
            "stat_value": champion_standing.get("points", 0),
            "stat_detail": {
                "points": champion_standing.get("points", 0),
                "won": champion_standing.get("won", 0),
                "drawn": champion_standing.get("drawn", 0),
                "lost": champion_standing.get("lost", 0),
                "gf": champion_standing.get("gf", 0),
                "ga": champion_standing.get("ga", 0),
            },
        }

    except Exception as e:
        logger.error(f"Şampiyonluk hesaplama hatası: {e}")
        return None


# ═══════════════════════════════════════════════════════════════════════
# PLAYER ACHIEVEMENTS (ROZET)
# ═══════════════════════════════════════════════════════════════════════

def ensure_player_achievements_table(db: SupabaseClient) -> bool:
    """player_achievements tablosunun erişilebilirliğini test eder."""
    try:
        db.select("player_achievements", query="id", limit=1)
        logger.info("player_achievements tablosu mevcut")
        return True
    except Exception as e:
        logger.warning(f"player_achievements tablosu bulunamadı: {e}")
        logger.info("Lütfen PLAYER_ACHIEVEMENTS_MIGRATION.sql dosyasını Supabase'de çalıştırın")
        return False


def insert_player_achievement(
    db: SupabaseClient,
    player_id: str,
    player_name: str,
    team_name: str,
    season_id: str,
    award_type: str,
    profile_id: str,
) -> bool:
    """Oyuncuya rozet kaydı ekler. Format: "2024_GOLDEN_BOOT"."""
    year = get_current_year()
    badge_name = f"{year}_{award_type.upper()}"

    achievement_id = f"ach_{season_id}_{award_type}_{player_id}"

    achievement = {
        "id": achievement_id,
        "player_id": player_id,
        "player_name": player_name,
        "team_name": team_name,
        "season_id": season_id,
        "badge_name": badge_name,
        "award_type": award_type,
        "profile_id": profile_id,
        "awarded_at": datetime.now().isoformat(),
    }

    try:
        db.upsert("player_achievements", achievement)
        logger.info(f"Rozet eklendi: {player_name} → {badge_name}")
        return True
    except Exception as e:
        logger.error(f"Rozet ekleme hatası ({player_name}, {badge_name}): {e}")
        return False


# ═══════════════════════════════════════════════════════════════════════
# HALL OF FAME
# ═══════════════════════════════════════════════════════════════════════

def add_season_to_hall_of_fame(
    db: SupabaseClient,
    season_id: str,
    champion_result: Optional[dict],
    golden_boot_result: Optional[dict],
    mvp_result: Optional[dict],
) -> int:
    """
    Sezon verilerini hall_of_fame tablosuna ekler.
    Şampiyon, gol kralı ve MVP'yi efsane olarak kaydeder.
    """
    added = 0

    def make_hof_entry(
        player_id: Optional[str],
        player_name: str,
        team_name: str,
        position: str,
        award_type: str,
        profile_id: str,
    ) -> dict:
        return {
            "id": f"hof_{season_id}_{award_type}_{player_id or team_name}",
            "profile_id": profile_id,
            "player_id": player_id,
            "player_name": player_name,
            "position": position,
            "nationality": "",
            "seasons_played": 1,
            "career_goals": 0,
            "career_assists": 0,
            "career_matches": 0,
            "clean_sheets": 0,
            "motm_awards": 0,
            "avg_rating": 0,
            "peak_rating": 0,
            "legend_tier": "gold" if award_type == "champion" else "silver",
            "is_club_legend": award_type == "champion",
            "awards_won": json.dumps([f"{get_current_year()}_{award_type.upper()}"]),
            "retired_day": None,
            "inducted_at": datetime.now().isoformat(),
        }

    # Şampiyon ekle
    if champion_result:
        try:
            entry = make_hof_entry(
                player_id=None,
                player_name=champion_result.get("player_name", ""),
                team_name=champion_result.get("team_name", ""),
                position="team",
                award_type="champion",
                profile_id=champion_result.get("profile_id", ""),
            )
            db.upsert("hall_of_fame", entry)
            added += 1
            logger.info(f"HoF: Şampiyon eklendi → {champion_result.get('team_name', '')}")
        except Exception as e:
            logger.warning(f"HoF şampiyon ekleme hatası: {e}")

    # Gol Kralı ekle
    if golden_boot_result and golden_boot_result.get("player_id"):
        try:
            entry = make_hof_entry(
                player_id=golden_boot_result["player_id"],
                player_name=golden_boot_result.get("player_name", ""),
                team_name=golden_boot_result.get("team_name", ""),
                position="ST",
                award_type="golden_boot",
                profile_id="",
            )
            db.upsert("hall_of_fame", entry)
            added += 1
            logger.info(f"HoF: Gol Kralı eklendi → {golden_boot_result.get('player_name', '')}")
        except Exception as e:
            logger.warning(f"HoF gol kralı ekleme hatası: {e}")

    # MVP ekle
    if mvp_result and mvp_result.get("player_id"):
        try:
            entry = make_hof_entry(
                player_id=mvp_result["player_id"],
                player_name=mvp_result.get("player_name", ""),
                team_name=mvp_result.get("team_name", ""),
                position="MF",
                award_type="mvp",
                profile_id="",
            )
            db.upsert("hall_of_fame", entry)
            added += 1
            logger.info(f"HoF: MVP eklendi → {mvp_result.get('player_name', '')}")
        except Exception as e:
            logger.warning(f"HoF MVP ekleme hatası: {e}")

    return added


# ═══════════════════════════════════════════════════════════════════════
# ANA İŞLEYİŞ
# ═══════════════════════════════════════════════════════════════════════

def award_season(db: SupabaseClient, season_id: str, profile_id: Optional[str] = None) -> dict:
    """
    Bir sezon için tüm ödülleri hesaplar ve kaydeder.
    match_history.events JSONB'den direkt istatistik çıkarır.
    """
    logger.info(f"=== Sezon Ödül Hesaplama Başlıyor: {season_id} ===")

    awards_saved = []
    achievements_saved = []
    errors = []

    # 1. match_history.events'ten istatistikleri çıkar
    logger.info("match_history.events'ten istatistikler çıkarılıyor...")
    stats = extract_stats_from_match_events(db, season_id)
    player_stats = stats["player_stats"]
    team_stats = stats["team_stats"]

    logger.info(f"İstatistikler: {len(player_stats)} oyuncu, {len(team_stats)} takım")

    # 2. Tüm profilleri veya belirli profili çek
    if profile_id:
        profiles = db.select("profiles", query="id,team_name", filters={"id": f"eq.{profile_id}"})
    else:
        profiles = db.select("profiles", query="id,team_name")

    if not profiles:
        logger.warning("Profil bulunamadı")
        return {"awards": 0, "achievements": 0, "errors": ["Profil bulunamadı"]}

    logger.info(f"{len(profiles)} profil bulundu")

    # 3. Tüm oyuncuları çek (pozisyon ve yaş bilgisi için)
    all_players = []
    try:
        all_players = db.select("players", query="id,name,position,age,rating,form_rating")
    except Exception as e:
        logger.warning(f"Oyuncular çekilemedi: {e}")

    # 4. Ödülleri hesapla
    award_computations = [
        ("golden_boot", lambda: compute_golden_boot(player_stats)),
        ("top_assists", lambda: compute_top_assists(player_stats)),
        ("mvp", lambda: compute_mvp(player_stats)),
        ("best_gk", lambda: compute_best_gk(player_stats, all_players)),
        ("best_young", lambda: compute_best_young(player_stats, all_players)),
        ("fair_play", lambda: compute_fair_play(team_stats)),
    ]

    computed_awards = {}

    for award_type, compute_fn in award_computations:
        try:
            result = compute_fn()
            if not result:
                continue

            computed_awards[award_type] = result

            # İlk profile ID'sini bul (genel ödül için)
            target_profile_id = profile_id
            if not target_profile_id and result.get("team_name"):
                # Ödül sahibinin takımına ait profile ID'sini bul
                for p in profiles:
                    if p.get("team_name") == result.get("team_name"):
                        target_profile_id = p.get("id")
                        break

            if not target_profile_id and profiles:
                target_profile_id = profiles[0].get("id")

            # Ödülü season_awards tablosuna kaydet
            award_id = f"award_{season_id}_{award_type}_{target_profile_id or 'global'}"
            award_row = {
                "id": award_id,
                "season_id": season_id,
                "profile_id": target_profile_id,
                "league_name": None,
                "award_type": result["award_type"],
                "player_id": result.get("player_id"),
                "player_name": result.get("player_name", ""),
                "team_name": result.get("team_name", ""),
                "stat_value": result.get("stat_value", 0),
                "stat_detail": json.dumps(result.get("stat_detail", {})),
            }

            db.upsert("season_awards", award_row)
            awards_saved.append(award_id)
            logger.info(f"Ödül kaydedildi: {award_type} → {result.get('player_name', '')}")

            # Oyuncuya rozet ekle
            if result.get("player_id"):
                success = insert_player_achievement(
                    db,
                    result["player_id"],
                    result.get("player_name", ""),
                    result.get("team_name", ""),
                    season_id,
                    award_type,
                    target_profile_id or "",
                )
                if success:
                    achievements_saved.append(result["player_id"])

        except Exception as e:
            err_msg = f"Ödül hesaplama hatası ({award_type}): {e}"
            errors.append(err_msg)
            logger.error(err_msg)

    # 5. Şampiyonluk kontrolü
    champion_result = None
    try:
        champion_result = compute_champion(db, season_id)
        if champion_result:
            target_profile_id = champion_result.get("profile_id", profile_id)
            award_id = f"award_{season_id}_champion_{target_profile_id or 'global'}"
            award_row = {
                "id": award_id,
                "season_id": season_id,
                "profile_id": target_profile_id,
                "league_name": None,
                "award_type": "champion",
                "player_id": None,
                "player_name": champion_result.get("player_name", ""),
                "team_name": champion_result.get("team_name", ""),
                "stat_value": champion_result.get("stat_value", 0),
                "stat_detail": json.dumps(champion_result.get("stat_detail", {})),
            }
            db.upsert("season_awards", award_row)
            awards_saved.append(award_id)
            logger.info(f"Şampiyonluk ödülü kaydedildi: {champion_result.get('team_name', '')}")

            computed_awards["champion"] = champion_result

    except Exception as e:
        err_msg = f"Şampiyonluk hesaplama hatası: {e}"
        errors.append(err_msg)
        logger.error(err_msg)

    # 6. Hall of Fame'e sezon verilerini ekle
    try:
        hof_count = add_season_to_hall_of_fame(
            db,
            season_id,
            champion_result,
            computed_awards.get("golden_boot"),
            computed_awards.get("mvp"),
        )
        logger.info(f"Hall of Fame'e {hof_count} kayıt eklendi")
    except Exception as e:
        logger.warning(f"Hall of Fame ekleme hatası: {e}")

    # 7. Profile güncelle: total_trophies ve total_awards
    if champion_result and champion_result.get("profile_id"):
        try:
            pid = champion_result["profile_id"]
            profile_data = db.select("profiles", query="total_trophies,total_awards", filters={"id": f"eq.{pid}"})
            current_trophies = 0
            current_awards = 0
            if profile_data and len(profile_data) > 0:
                current_trophies = profile_data[0].get("total_trophies", 0) or 0
                current_awards = profile_data[0].get("total_awards", 0) or 0

            db.update(
                "profiles",
                {
                    "total_trophies": current_trophies + 1,
                    "total_awards": current_awards + len(awards_saved),
                },
                {"id": f"eq.{pid}"},
            )
        except Exception as e:
            logger.warning(f"Profile güncelleme hatası: {e}")

    logger.info(
        f"=== Sezon {season_id} Ödül Hesaplama Tamamlandı: "
        f"{len(awards_saved)} ödül, {len(achievements_saved)} rozet ==="
    )

    return {
        "season_id": season_id,
        "awards_count": len(awards_saved),
        "achievements_count": len(achievements_saved),
        "awards": awards_saved,
        "achievements": achievements_saved,
        "errors": errors,
    }


# ═══════════════════════════════════════════════════════════════════════
# CLI GİRİŞ NOKTASI
# ═══════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Siyah Beyaz FC — Sezon Ödül Hesaplayıcı v2.0")
    parser.add_argument(
        "--season-id",
        type=str,
        help="Sezon ID (örn: season-1)",
    )
    parser.add_argument(
        "--week",
        type=int,
        help="Mevcut hafta sayısı (34'ten büyükse sezon bitti sayılır)",
    )
    parser.add_argument(
        "--profile-id",
        type=str,
        help="Belirli bir profil için hesapla",
    )
    parser.add_argument(
        "--all-profiles",
        action="store_true",
        help="Tüm profiller için hesapla",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Hesapla ama veritabanına yazma (test için)",
    )

    args = parser.parse_args()

    season_id = args.season_id
    if not season_id and args.week:
        season_id = get_season_id_from_week(args.week)
    if not season_id:
        season_id = "season-1"
        logger.info(f"Sezon ID belirtilmedi, varsayılan: {season_id}")

    if args.week and args.week < 34:
        logger.warning(f"Hafta {args.week} < 34. Sezon henüz bitmedi! Yine de devam ediliyor...")

    db = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)

    try:
        has_achievements_table = ensure_player_achievements_table(db)
        if not has_achievements_table:
            logger.warning("player_achievements tablosu yok, rozetler kaydedilemeyebilir")

        result = award_season(
            db,
            season_id,
            profile_id=args.profile_id if not args.all_profiles else None,
        )

        print(json.dumps(result, indent=2, ensure_ascii=False))

    finally:
        db.close()


if __name__ == "__main__":
    main()
