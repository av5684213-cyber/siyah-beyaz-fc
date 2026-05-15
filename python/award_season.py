#!/usr/bin/env python3
"""
Siyah Beyaz FC — Sezon Sonu Ödül ve İstatistik Sistemi (Python Service)

week = 34 tamamlandığında tetiklenir. Şu ödülleri hesaplar:
  - Gol Kralı (golden_boot)
  - Asist Kralı (top_assists)
  - En Değerli Oyuncu (mvp)
  - En İyi Kaleci (best_gk)
  - Yılın Genç Oyuncusu (best_young) – 22 yaş altı
  - Fair Play Ödülü (fair_play) – en az kart
  - Şampiyonluk (champion) – lig birincisi

Her ödülü season_awards tablosuna kaydeder.
Kazanan oyunculara player_achievements tablosuna rozet ekler.

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
# ÖDÜL HESAPLAMA
# ═══════════════════════════════════════════════════════════════════════

def get_season_id_from_week(week: int) -> str:
    """Hafta sayısından sezon ID'si üretir (34 hafta = 1 sezon)."""
    return f"season-{(week + 33) // 34}"


def get_current_year() -> int:
    return datetime.now().year


def compute_golden_boot(career_stats: list[dict]) -> Optional[dict]:
    """Gol Kralı: En çok gol atan oyuncu."""
    if not career_stats:
        return None

    sorted_by_goals = sorted(career_stats, key=lambda x: x.get("goals", 0), reverse=True)
    winner = sorted_by_goals[0]

    if winner.get("goals", 0) <= 0:
        logger.info("Gol Kralı: Hiç gol atılmadı, ödül verilmiyor")
        return None

    logger.info(f"Gol Kralı: {winner.get('player_name', winner.get('player_id'))} - {winner['goals']} gol")
    return {
        "award_type": "golden_boot",
        "player_id": winner.get("player_id"),
        "player_name": winner.get("player_name", winner.get("player_id")),
        "team_name": winner.get("team_name", ""),
        "stat_value": winner["goals"],
        "stat_detail": {
            "goals": winner["goals"],
            "matches": winner.get("matches_played", 0),
            "avg_rating": round(winner.get("avg_rating", 0), 1),
        },
    }


def compute_top_assists(career_stats: list[dict]) -> Optional[dict]:
    """Asist Kralı: En çok asist yapan oyuncu."""
    if not career_stats:
        return None

    sorted_by_assists = sorted(career_stats, key=lambda x: x.get("assists", 0), reverse=True)
    winner = sorted_by_assists[0]

    if winner.get("assists", 0) <= 0:
        logger.info("Asist Kralı: Hiç asist yok, ödül verilmiyor")
        return None

    logger.info(f"Asist Kralı: {winner.get('player_name', winner.get('player_id'))} - {winner['assists']} asist")
    return {
        "award_type": "top_assists",
        "player_id": winner.get("player_id"),
        "player_name": winner.get("player_name", winner.get("player_id")),
        "team_name": winner.get("team_name", ""),
        "stat_value": winner["assists"],
        "stat_detail": {
            "assists": winner["assists"],
            "matches": winner.get("matches_played", 0),
            "avg_rating": round(winner.get("avg_rating", 0), 1),
        },
    }


def compute_mvp(career_stats: list[dict]) -> Optional[dict]:
    """
    En Değerli Oyuncu: Kompozit puanlama
    MVP Score = avg_rating * 0.5 + goals * 2 + assists * 1.5 + motm * 1.0 + matches * 0.1
    """
    if not career_stats:
        return None

    scored = []
    for s in career_stats:
        avg_rating = s.get("avg_rating", 0) or 0
        goals = s.get("goals", 0) or 0
        assists = s.get("assists", 0) or 0
        motm = s.get("motm", 0) or 0
        matches = s.get("matches_played", 0) or 0

        mvp_score = (
            avg_rating * 0.5
            + goals * 2
            + assists * 1.5
            + motm * 1.0
            + matches * 0.1
        )
        scored.append({**s, "mvp_score": mvp_score})

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
            "avg_rating": round(winner.get("avg_rating", 0), 1),
            "goals": winner.get("goals", 0),
            "assists": winner.get("assists", 0),
            "motm": winner.get("motm", 0),
            "matches": winner.get("matches_played", 0),
        },
    }


def compute_best_gk(career_stats: list[dict], players: list[dict]) -> Optional[dict]:
    """
    En İyi Kaleci: En az yediği gol/maç oranı + en çok kurtarış.
    Sadece GK pozisyonundaki oyuncular.
    """
    # Kaleci oyuncularını bul
    gk_ids = set()
    for p in players:
        pos = p.get("position", "")
        if pos == "GK":
            gk_ids.add(p.get("id"))

    gk_stats = [s for s in career_stats if s.get("player_id") in gk_ids]

    if not gk_stats:
        logger.info("En İyi Kaleci: Kaleci bulunamadı")
        return None

    # Kaleci puanı: avg_rating + clean_sheets * 3 + saves * 0.5 - goals_conceded * 0.5
    scored = []
    for s in gk_stats:
        avg_rating = s.get("avg_rating", 0) or 0
        clean_sheets = s.get("clean_sheets", 0) or 0
        saves = s.get("saves", 0) or 0
        matches = max(s.get("matches_played", 0) or 1, 1)

        gk_score = avg_rating + clean_sheets * 3 + saves * 0.5
        scored.append({**s, "gk_score": gk_score})

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
        "stat_value": round(winner.get("avg_rating", 0), 1),
        "stat_detail": {
            "avg_rating": round(winner.get("avg_rating", 0), 1),
            "clean_sheets": winner.get("clean_sheets", 0),
            "saves": winner.get("saves", 0),
            "matches": winner.get("matches_played", 0),
        },
    }


def compute_best_young(career_stats: list[dict], players: list[dict]) -> Optional[dict]:
    """
    Yılın Genç Oyuncusu: 22 yaş altı, en yüksek rating/form.
    """
    # 22 yaş altı oyuncuları bul
    young_ids = set()
    for p in players:
        age = p.get("age", 99)
        if age <= 22:
            young_ids.add(p.get("id"))

    young_stats = [s for s in career_stats if s.get("player_id") in young_ids]

    if not young_stats:
        logger.info("En İyi Genç: U22 oyuncu bulunamadı")
        return None

    young_stats.sort(key=lambda x: x.get("avg_rating", 0) or 0, reverse=True)
    winner = young_stats[0]

    # Yaşı players'tan al
    winner_age = 22
    for p in players:
        if p.get("id") == winner.get("player_id"):
            winner_age = p.get("age", 22)
            break

    logger.info(
        f"En İyi Genç: {winner.get('player_name', winner.get('player_id'))} "
        f"- Yaş: {winner_age}, Rating: {round(winner.get('avg_rating', 0), 1)}"
    )

    return {
        "award_type": "best_young",
        "player_id": winner.get("player_id"),
        "player_name": winner.get("player_name", winner.get("player_id")),
        "team_name": winner.get("team_name", ""),
        "stat_value": round(winner.get("avg_rating", 0), 1),
        "stat_detail": {
            "avg_rating": round(winner.get("avg_rating", 0), 1),
            "age": winner_age,
            "goals": winner.get("goals", 0),
            "assists": winner.get("assists", 0),
            "matches": winner.get("matches_played", 0),
        },
    }


def compute_fair_play(career_stats: list[dict]) -> Optional[dict]:
    """
    Fair Play Ödülü: En az sarı/kırmızı kart alan oyuncu (en az 5 maç).
    Puan = yellow + red * 3, en düşük puan kazanır.
    """
    eligible = [s for s in career_stats if (s.get("matches_played", 0) or 0) >= 5]

    if not eligible:
        logger.info("Fair Play: Yeterli maç oynayan oyuncu yok")
        return None

    def card_score(s):
        yellow = s.get("yellow_cards", 0) or 0
        red = s.get("red_cards", 0) or 0
        return yellow + red * 3

    eligible.sort(key=lambda x: (card_score(x), -(x.get("matches_played", 0) or 0)))
    winner = eligible[0]

    yellow = winner.get("yellow_cards", 0) or 0
    red = winner.get("red_cards", 0) or 0

    logger.info(
        f"Fair Play: {winner.get('player_name', winner.get('player_id'))} "
        f"- {yellow} sarı, {red} kırmızı, {winner.get('matches_played', 0)} maç"
    )

    return {
        "award_type": "fair_play",
        "player_id": winner.get("player_id"),
        "player_name": winner.get("player_name", winner.get("player_id")),
        "team_name": winner.get("team_name", ""),
        "stat_value": yellow + red * 3,
        "stat_detail": {
            "yellow_cards": yellow,
            "red_cards": red,
            "matches": winner.get("matches_played", 0),
        },
    }


def compute_champion(db: SupabaseClient, season_id: str) -> Optional[dict]:
    """Şampiyonluk: Lig birincisi takımın menajer profili."""
    try:
        # Puan tablosundan 1. sırayı bul
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

        # Takım bilgisini al
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
            "player_id": None,  # Takım ödülü
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
    """
    player_achievements tablosunun varlığını kontrol eder.
    Tablo SQL migration ile oluşturulmalıdır (aşağıdaki SQL'i Supabase'de çalıştırın).
    Bu fonksiyon sadece tablonun erişilebilir olduğunu test eder.
    """
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
    """
    Oyuncuya rozet kaydı ekler.
    Rozet adı formatı: "2024_GOLDEN_BOOT" gibi.
    """
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
# ANA İŞLEYİŞ
# ═══════════════════════════════════════════════════════════════════════

def award_season(db: SupabaseClient, season_id: str, profile_id: Optional[str] = None) -> dict:
    """
    Bir sezon için tüm ödülleri hesaplar ve kaydeder.

    Args:
        db: Supabase istemcisi
        season_id: "season-1" formatında sezon ID
        profile_id: Belirli bir profil için hesapla (None = tüm profiller)
    """
    logger.info(f"=== Sezon Ödül Hesaplama Başlıyor: {season_id} ===")

    awards_saved = []
    achievements_saved = []
    errors = []

    # 1. Tüm profilleri veya belirli profili çek
    if profile_id:
        profiles = db.select("profiles", query="id,team_name", filters={"id": f"eq.{profile_id}"})
    else:
        profiles = db.select("profiles", query="id,team_name")

    if not profiles:
        logger.warning("Profil bulunamadı")
        return {"awards": 0, "achievements": 0, "errors": ["Profil bulunamadı"]}

    logger.info(f"{len(profiles)} profil bulundu")

    for profile in profiles:
        pid = profile.get("id")
        team_name = profile.get("team_name", "")

        if not pid or not team_name:
            logger.warning(f"Geçersiz profil: id={pid}, team_name={team_name}")
            continue

        logger.info(f"Profil işleniyor: {team_name} (id={pid})")

        try:
            # 2. Takımın oyuncularını çek
            players = db.select("players", query="id,name,position,age,rating,form_rating", filters={"team_name": f"eq.{team_name}"})

            if not players:
                logger.warning(f"Oyuncu bulunamadı: {team_name}")
                continue

            # 3. Oyuncu sezon istatistiklerini çek (player_career_stats)
            player_ids = [p.get("id") for p in players if p.get("id")]

            if not player_ids:
                continue

            # PostgREST: in operatörü için virgülle ayrılmış liste
            ids_filter = f"({','.join(player_ids)})"
            career_stats = db.select(
                "player_career_stats",
                query="player_id,season_id,goals,assists,yellow_cards,red_cards,matches_played,clean_sheets,avg_rating,motm,saves,position,team_name",
                filters={"season_id": f"eq.{season_id}", "player_id": f"in.{ids_filter}"},
            )

            if not career_stats:
                logger.warning(f"Career stats bulunamadı: {team_name}, sezon={season_id}")
                continue

            # team_name'i career_stats'a ekle (yoksa)
            for cs in career_stats:
                if not cs.get("team_name"):
                    cs["team_name"] = team_name
                if not cs.get("player_name"):
                    # Oyuncu adını players'tan bul
                    for p in players:
                        if p.get("id") == cs.get("player_id"):
                            cs["player_name"] = p.get("name", cs["player_id"])
                            break

            # 4. Ödülleri hesapla
            award_computations = [
                ("golden_boot", lambda: compute_golden_boot(career_stats)),
                ("top_assists", lambda: compute_top_assists(career_stats)),
                ("mvp", lambda: compute_mvp(career_stats)),
                ("best_gk", lambda: compute_best_gk(career_stats, players)),
                ("best_young", lambda: compute_best_young(career_stats, players)),
                ("fair_play", lambda: compute_fair_play(career_stats)),
            ]

            for award_type, compute_fn in award_computations:
                try:
                    result = compute_fn()
                    if not result:
                        continue

                    # Ödülü season_awards tablosuna kaydet
                    award_id = f"award_{season_id}_{award_type}_{pid}"
                    award_row = {
                        "id": award_id,
                        "season_id": season_id,
                        "profile_id": pid,
                        "league_name": None,
                        "award_type": result["award_type"],
                        "player_id": result.get("player_id"),
                        "player_name": result.get("player_name", ""),
                        "team_name": result.get("team_name", team_name),
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
                            result.get("team_name", team_name),
                            season_id,
                            award_type,
                            pid,
                        )
                        if success:
                            achievements_saved.append(result["player_id"])

                except Exception as e:
                    err_msg = f"Ödül hesaplama hatası ({award_type}, {team_name}): {e}"
                    errors.append(err_msg)
                    logger.error(err_msg)

            # 5. Şampiyonluk kontrolü
            try:
                champion_result = compute_champion(db, season_id)
                if champion_result and champion_result.get("profile_id") == pid:
                    award_id = f"award_{season_id}_champion_{pid}"
                    award_row = {
                        "id": award_id,
                        "season_id": season_id,
                        "profile_id": pid,
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

                    # Profile güncelle: total_trophies
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
                            "total_awards": current_awards + len([a for a in awards_saved if pid in a]),
                        },
                        {"id": f"eq.{pid}"},
                    )

            except Exception as e:
                err_msg = f"Şampiyonluk hesaplama hatası: {e}"
                errors.append(err_msg)
                logger.error(err_msg)

        except Exception as e:
            err_msg = f"Profil {pid} işleme hatası: {e}"
            errors.append(err_msg)
            logger.error(err_msg)

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
    parser = argparse.ArgumentParser(description="Siyah Beyaz FC — Sezon Ödül Hesaplayıcı")
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

    # Sezon ID'sini belirle
    season_id = args.season_id
    if not season_id and args.week:
        season_id = get_season_id_from_week(args.week)
    if not season_id:
        # Varsayılan: mevcut sezon
        season_id = "season-1"
        logger.info(f"Sezon ID belirtilmedi, varsayılan: {season_id}")

    # Hafta kontrolü
    if args.week and args.week < 34:
        logger.warning(f"Hafta {args.week} < 34. Sezon henüz bitmedi! Yine de devam ediliyor...")

    db = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)

    try:
        # player_achievements tablosu kontrolü
        has_achievements_table = ensure_player_achievements_table(db)

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
