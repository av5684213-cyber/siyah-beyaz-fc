#!/usr/bin/env python3
"""
Siyah Beyaz FC — Bot Actions Service (Python)
Bot AI: Transfer kararları, kadro seçimi, otomatik yönetim

Kullanım:
    python bot_actions.py [--bot-id <id>] [--all-bots] [--action transfers|squad|all]

BOT_SYSTEM_MIGRATION.sql ile profiles ve league_teams tablolarında
is_bot ve bot_difficulty alanları mevcuttur.

Ortam değişkenleri: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
"""

import os
import sys
import json
import random
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
logger = logging.getLogger("bot_actions")

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

    def delete(self, table: str, filters: Optional[dict] = None) -> Any:
        params = filters or {}
        return self._request("DELETE", table, params=params)

    def close(self):
        self.client.close()


# ═══════════════════════════════════════════════════════════════════════
# BOT YARDIMCILARI
# ═══════════════════════════════════════════════════════════════════════

# Zorluk seviyesi konfigürasyonu
DIFFICULTY_CONFIG = {
    1: {  # Kolay
        "transfer_budget_ratio": 0.15,
        "sell_threshold_rating": 45,
        "buy_rating_boost": 0,
        "max_squad_size": 22,
        "min_squad_size": 16,
        "sell_chance": 0.20,
        "buy_chance": 0.30,
    },
    2: {  # Orta
        "transfer_budget_ratio": 0.25,
        "sell_threshold_rating": 50,
        "buy_rating_boost": 2,
        "max_squad_size": 22,
        "min_squad_size": 16,
        "sell_chance": 0.25,
        "buy_chance": 0.35,
    },
    3: {  # Zor
        "transfer_budget_ratio": 0.35,
        "sell_threshold_rating": 55,
        "buy_rating_boost": 5,
        "max_squad_size": 22,
        "min_squad_size": 16,
        "sell_chance": 0.30,
        "buy_chance": 0.40,
    },
}

# İdeal kadro dağılımı
IDEAL_SQUAD_DISTRIBUTION = {"GK": 2, "DEF": 6, "MID": 6, "FWD": 5}

# Pozisyon gruplama
POSITION_GROUPS = {
    "GK": "GK",
    "CB": "DEF", "LB": "DEF", "RB": "DEF", "LWB": "DEF", "RWB": "DEF",
    "CDM": "MID", "CM": "MID", "CAM": "MID", "LM": "MID", "RM": "MID",
    "LW": "FWD", "RW": "FWD", "CF": "FWD", "ST": "FWD",
}


def map_to_group(position: str) -> str:
    """Pozisyonu gruba dönüştürür."""
    return POSITION_GROUPS.get(position, "MID")


def get_position_needs(squad: list[dict]) -> dict[str, int]:
    """Kadroda eksik pozisyonları belirler."""
    current: dict[str, int] = {"GK": 0, "DEF": 0, "MID": 0, "FWD": 0}
    for p in squad:
        group = map_to_group(p.get("position", "CM"))
        current[group] = current.get(group, 0) + 1

    needs: dict[str, int] = {}
    for pos, ideal_count in IDEAL_SQUAD_DISTRIBUTION.items():
        needs[pos] = max(0, ideal_count - current.get(pos, 0))
    return needs


def get_random_price(rating: int, difficulty: int) -> int:
    """Rating ve zorluk bazlı rastgele fiyat üretir."""
    base = max(500_000, rating * 80_000)
    variance = base * (0.8 + random.random() * 0.4)
    difficulty_multiplier = 1 + (difficulty - 1) * 0.1
    return round(variance * difficulty_multiplier)


# ═══════════════════════════════════════════════════════════════════════
# BOT TRANSFER İŞLEMLERİ
# ═══════════════════════════════════════════════════════════════════════

def process_bot_transfers(db: SupabaseClient, bot_user_id: str) -> dict:
    """
    Botun kredi durumuna göre transfer kararları alır.
    
    1. Kadrosundaki en düşük OVR'lu oyuncuyu transfer listesine koy (rastgele fiyat)
    2. Piyasadan, botun eksik mevkisine veya en yüksek potansiyelli oyuncuyu al
       (Rastgele 3 oyuncudan en uygun fiyatlıyı seç)
    """
    logger.info(f"Bot transfer işlemleri başlıyor: {bot_user_id}")

    result = {"bought": False, "sold": False, "details": [], "errors": []}

    try:
        # 1. Bot profilini çek
        profiles = db.select("profiles", query="*", filters={"id": f"eq.{bot_user_id}"})
        if not profiles:
            result["errors"].append("Bot profili bulunamadı")
            return result

        profile = profiles[0]
        if not profile.get("is_bot"):
            result["errors"].append("Bu kullanıcı bir bot değil")
            return result

        difficulty = profile.get("bot_difficulty", 1)
        config = DIFFICULTY_CONFIG.get(difficulty, DIFFICULTY_CONFIG[1])
        team_name = profile.get("team_name", "Bot Takımı")
        money = profile.get("money", 0) or 0

        logger.info(f"Bot: {team_name}, Bütçe: ₺{money:,}, Zorluk: {difficulty}")

        # 2. Kadroyu çek
        squad = db.select("players", query="*", filters={"profile_id": f"eq.{bot_user_id}"})

        if not squad:
            result["errors"].append("Kadro bulunamadı")
            return result

        logger.info(f"Kadro büyüklüğü: {len(squad)} oyuncu")

        # ─── SATIŞ ──────────────────────────────────────────────
        if len(squad) > config["min_squad_size"] and random.random() < config["sell_chance"]:
            # En düşük OVR'lu oyuncuyu bul
            sorted_squad = sorted(squad, key=lambda p: p.get("rating", 0))
            worst_player = sorted_squad[0]

            if (worst_player.get("rating", 0) or 0) < config["sell_threshold_rating"] + 30:
                sell_price = get_random_price(worst_player.get("rating", 30), difficulty)

                try:
                    # Transfer listesine ekle
                    db.insert("transfer_market", {
                        "player_id": worst_player.get("id"),
                        "player_data": json.dumps(worst_player),
                        "seller_id": bot_user_id,
                        "seller_name": team_name,
                        "price": sell_price,
                        "min_price": round(sell_price * 0.7),
                        "max_price": round(sell_price * 1.5),
                        "is_active": True,
                        "is_auction": True,
                        "starting_price": sell_price,
                        "reserve_price": round(sell_price * 0.7),
                        "bid_count": 0,
                        "expires_at": (datetime.now().isoformat()),
                    })

                    # Kadrodan çıkar
                    db.delete("players", {"id": f"eq.{worst_player.get('id')}"})

                    # Parayı ekle
                    db.update(
                        "profiles",
                        {"money": money + sell_price},
                        {"id": f"eq.{bot_user_id}"},
                    )

                    result["sold"] = True
                    detail = f"Satıldı: {worst_player.get('name', '?')} (OVR {worst_player.get('rating', 0)}) → ₺{sell_price:,}"
                    result["details"].append(detail)
                    logger.info(f"Bot {team_name}: {detail}")

                except Exception as e:
                    err_msg = f"Satış hatası: {e}"
                    result["errors"].append(err_msg)
                    logger.error(err_msg)

        # ─── ALIŞ ──────────────────────────────────────────────
        if random.random() < config["buy_chance"]:
            needs = get_position_needs(squad)
            needed_positions = [pos for pos, count in needs.items() if count > 0]

            budget = money * config["transfer_budget_ratio"]

            try:
                # Piyasadaki aktif ilanları çek
                listings = db.select(
                    "transfer_market",
                    query="*",
                    filters={"is_active": "eq.true"},
                )

                if listings:
                    # Kendi ilanlarını çıkar
                    other_listings = [l for l in listings if l.get("seller_id") != bot_user_id]

                    # Bütçeye uygun ilanları filtrele
                    affordable = [l for l in other_listings if (l.get("price", 999999999) or 0) <= budget]

                    if affordable:
                        # Eksik mevki öncelikli seçim
                        target = None

                        if needed_positions:
                            # Eksik mevkideki oyuncuları bul
                            matching = []
                            for l in affordable:
                                player_data = l.get("player_data")
                                if isinstance(player_data, str):
                                    try:
                                        player_data = json.loads(player_data)
                                    except json.JSONDecodeError:
                                        continue
                                if isinstance(player_data, dict):
                                    pos = player_data.get("position", "")
                                    group = map_to_group(pos)
                                    if group in needed_positions:
                                        matching.append(l)

                            if matching:
                                # Rastgele 3 oyuncudan en uygun fiyatlıyı seç
                                candidates = random.sample(matching, min(3, len(matching)))
                                target = min(candidates, key=lambda x: x.get("price", 999999999))

                        if not target:
                            # Genel olarak en uygun fiyatlıyı seç
                            candidates = random.sample(affordable, min(3, len(affordable)))
                            target = min(candidates, key=lambda x: x.get("price", 999999999))

                        buy_price = target.get("price", 0)

                        # Botun parasını güncelle
                        db.update(
                            "profiles",
                            {"money": max(0, money - buy_price)},
                            {"id": f"eq.{bot_user_id}"},
                        )

                        # Oyuncunun sahipliğini değiştir
                        player_data = target.get("player_data", {})
                        if isinstance(player_data, str):
                            try:
                                player_data = json.loads(player_data)
                            except json.JSONDecodeError:
                                player_data = {}

                        db.update(
                            "players",
                            {
                                "profile_id": bot_user_id,
                                "team_name": team_name,
                            },
                            {"id": f"eq.{target.get('player_id')}"},
                        )

                        # İlanı kapat
                        db.update(
                            "transfer_market",
                            {"is_active": False},
                            {"id": f"eq.{target.get('id')}"},
                        )

                        # Satıcıya ödeme
                        seller_id = target.get("seller_id")
                        if seller_id:
                            try:
                                seller_profiles = db.select(
                                    "profiles",
                                    query="money",
                                    filters={"id": f"eq.{seller_id}"},
                                )
                                if seller_profiles:
                                    seller_money = seller_profiles[0].get("money", 0) or 0
                                    tax_rate = 0.025
                                    seller_revenue = round(buy_price * (1 - tax_rate))
                                    db.update(
                                        "profiles",
                                        {"money": seller_money + seller_revenue},
                                        {"id": f"eq.{seller_id}"},
                                    )
                            except Exception as e:
                                logger.warning(f"Satıcıya ödeme hatası: {e}")

                        result["bought"] = True
                        player_name = player_data.get("name", "Bilinmeyen") if isinstance(player_data, dict) else "Bilinmeyen"
                        detail = f"Alındı: {player_name} → ₺{buy_price:,} (bütçe: ₺{budget:,})"
                        result["details"].append(detail)
                        logger.info(f"Bot {team_name}: {detail}")

                    else:
                        result["details"].append("Bütçeye uygun oyuncu yok")
                else:
                    result["details"].append("Piyasada ilan yok")

            except Exception as e:
                err_msg = f"Alış hatası: {e}"
                result["errors"].append(err_msg)
                logger.error(err_msg)

    except Exception as e:
        err_msg = f"Bot transfer genel hata: {e}"
        result["errors"].append(err_msg)
        logger.error(err_msg, exc_info=True)

    return result


# ═══════════════════════════════════════════════════════════════════════
# BOT KADRO SEÇİMİ
# ═══════════════════════════════════════════════════════════════════════

def select_bot_squad(db: SupabaseClient, bot_user_id: str, match_id: Optional[str] = None) -> dict:
    """
    En yüksek OVR'lu 11 oyuncuyu seçer ve kadro düzenler.
    Formasyon bazlı seçim yapar (4-4-2 varsayılan).
    
    Returns:
        {"starting": [...], "subs": [...], "formation": str}
    """
    logger.info(f"Bot kadro seçimi: {bot_user_id}")

    try:
        # Kadroyu çek (cezalı ve sakatları filtrele)
        today = datetime.now().strftime("%Y-%m-%d")
        all_players = db.select("players", query="*", filters={"profile_id": f"eq.{bot_user_id}"})

        if not all_players or len(all_players) < 11:
            logger.warning(f"Yetersiz oyuncu: {len(all_players) if all_players else 0}")
            return {"starting": [], "subs": [], "formation": "4-4-2", "error": "Yetersiz oyuncu"}

        # Cezalı ve sakat oyuncuları ele
        available = []
        for p in all_players:
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

        if len(available) < 11:
            logger.warning(f"Uygun oyuncu yetersiz: {len(available)}")
            return {"starting": [], "subs": [], "formation": "4-4-2", "error": "Uygun oyuncu yetersiz"}

        # Rating'e göre sırala
        available.sort(key=lambda p: p.get("rating", 0), reverse=True)

        # 4-4-2 formasyon slotları
        formation = "4-4-2"
        formation_slots = {"GK": 1, "DEF": 4, "MID": 4, "FWD": 2}

        # Pozisyon bazlı grupla
        by_position: dict[str, list] = {"GK": [], "DEF": [], "MID": [], "FWD": []}
        for p in available:
            group = map_to_group(p.get("position", "CM"))
            by_position[group].append(p)

        # Her pozisyon için en iyi oyuncuları seç
        starting = []
        used_ids = set()

        for pos, count in formation_slots.items():
            pos_players = by_position.get(pos, [])
            for i in range(min(count, len(pos_players))):
                player = pos_players[i]
                if player.get("id") not in used_ids:
                    starting.append(player)
                    used_ids.add(player.get("id"))

        # 11'e tamamlamak için eksik kalan slotları en iyi kalanlardan doldur
        if len(starting) < 11:
            remaining = [p for p in available if p.get("id") not in used_ids]
            for p in remaining:
                if len(starting) >= 11:
                    break
                starting.append(p)
                used_ids.add(p.get("id"))

        # Yedekler: kalan en iyi 7 oyuncu
        subs = [p for p in available if p.get("id") not in used_ids][:7]

        starting_ids = [p.get("id") for p in starting]
        subs_ids = [p.get("id") for p in subs]

        logger.info(
            f"Bot kadro seçildi: 11 başlangıç, {len(subs)} yedek "
            f"(formasyon: {formation})"
        )

        # match_lineups tablosuna kaydet (mevcutsa)
        if match_id:
            try:
                lineup_data = {
                    "id": f"lineup_{match_id}_{bot_user_id}",
                    "match_id": match_id,
                    "team_id": bot_user_id,
                    "formation": formation,
                    "starting": json.dumps(starting_ids),
                    "subs": json.dumps(subs_ids),
                }
                db.upsert("match_lineups", lineup_data)
                logger.info(f"Kadro match_lineups'a kaydedildi")
            except Exception as e:
                logger.warning(f"match_lineups kaydetme hatası (tablo olmayabilir): {e}")

        return {
            "starting": starting_ids,
            "subs": subs_ids,
            "formation": formation,
            "starting_count": len(starting_ids),
            "subs_count": len(subs_ids),
        }

    except Exception as e:
        logger.error(f"Bot kadro seçim hatası: {e}", exc_info=True)
        return {"starting": [], "subs": [], "formation": "4-4-2", "error": str(e)}


# ═══════════════════════════════════════════════════════════════════════
# BOT PROFİL İŞLEMLERİ
# ═══════════════════════════════════════════════════════════════════════

def get_all_bot_profiles(db: SupabaseClient) -> list[dict]:
    """Tüm bot profillerini çeker."""
    try:
        return db.select("profiles", query="id,team_name,money,bot_difficulty", filters={"is_bot": "eq.true"})
    except Exception as e:
        logger.error(f"Bot profilleri çekme hatası: {e}")
        return []


def take_over_bot_for_new_user(db: SupabaseClient, new_user_id: str, team_name: str, manager_name: str) -> dict:
    """
    Yeni kullanıcı kaydolduğunda bot takımını devralır.
    is_bot = true olan bir takım bul, onun is_bot'unu false yap ve kullanıcıya ata.
    """
    logger.info(f"Bot takım devralma: yeni kullanıcı={new_user_id}, takım={team_name}")

    try:
        # Boş bir bot profili bul
        bot_profiles = db.select(
            "profiles",
            query="*",
            filters={"is_bot": "eq.true"},
            limit=1,
        )

        if not bot_profiles:
            logger.info("Devralınacak bot takım yok")
            return {"success": False, "error": "No bot teams available"}

        bot = bot_profiles[0]
        bot_id = bot.get("id")
        league_name = bot.get("league_name")

        logger.info(f"Bot takım bulundu: {bot.get('team_name', '?')} (id={bot_id})")

        # Bot'un oyuncularını yeni kullanıcıya taşı
        db.update(
            "players",
            {"profile_id": new_user_id, "team_name": team_name},
            {"profile_id": f"eq.{bot_id}"},
        )

        # league_teams'i güncelle
        db.update(
            "league_teams",
            {"profile_id": new_user_id, "is_bot": False, "is_npc": False, "name": team_name},
            {"profile_id": f"eq.{bot_id}"},
        )

        # Eski bot profilini sil
        db.delete("profiles", {"id": f"eq.{bot_id}"})

        # Yeni kullanıcı profili oluştur (bot'un parası ve ligiyle)
        new_profile = {
            "id": new_user_id,
            "manager_name": manager_name,
            "team_name": team_name,
            "league_name": league_name,
            "money": bot.get("money", 100000000),
            "reputation": bot.get("reputation", 30),
            "mg_coins": 250,
            "current_day": 1,
            "ticket_price": 35,
            "stadium_capacity": 10000,
            "is_bot": False,
            "created_at": datetime.now().isoformat(),
        }

        db.insert("profiles", new_profile)

        logger.info(f"Bot takım devralındı: {team_name} → {new_user_id}")
        return {"success": True, "team_name": team_name, "league_name": league_name}

    except Exception as e:
        logger.error(f"Bot devralma hatası: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


# ═══════════════════════════════════════════════════════════════════════
# TOPLU İŞLEMLER
# ═══════════════════════════════════════════════════════════════════════

def process_all_bots(db: SupabaseClient, action: str = "all") -> dict:
    """Tüm botları işler (cron çağrısı için)."""
    logger.info(f"Tüm botlar işleniyor: action={action}")

    bots = get_all_bot_profiles(db)
    if not bots:
        return {"processed": 0, "results": [], "errors": []}

    logger.info(f"{len(bots)} bot bulundu")

    results = []
    errors = []

    for bot in bots:
        bot_id = bot.get("id")
        bot_name = bot.get("team_name", "Bilinmeyen")

        try:
            bot_result = {"bot_id": bot_id, "team_name": bot_name}

            if action in ("transfers", "all"):
                transfer_result = process_bot_transfers(db, bot_id)
                bot_result["transfers"] = transfer_result

            if action in ("squad", "all"):
                squad_result = select_bot_squad(db, bot_id)
                bot_result["squad"] = squad_result

            results.append(bot_result)
            logger.info(f"Bot işlendi: {bot_name}")

        except Exception as e:
            err_msg = f"Bot {bot_name} işleme hatası: {e}"
            errors.append(err_msg)
            logger.error(err_msg)

    return {
        "processed": len(results),
        "results": results,
        "errors": errors,
    }


# ═══════════════════════════════════════════════════════════════════════
# CLI GİRİŞ NOKTASI
# ═══════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Siyah Beyaz FC — Bot Actions Service")
    parser.add_argument(
        "--bot-id",
        type=str,
        help="Belirli bir bot ID'sini işle",
    )
    parser.add_argument(
        "--all-bots",
        action="store_true",
        help="Tüm botları işle",
    )
    parser.add_argument(
        "--action",
        type=str,
        choices=["transfers", "squad", "all"],
        default="all",
        help="İşlem türü (transfers, squad, all)",
    )
    parser.add_argument(
        "--take-over",
        type=str,
        metavar="NEW_USER_ID",
        help="Bir bot takımını yeni kullanıcıya devret",
    )

    args = parser.parse_args()

    db = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)

    try:
        if args.take_over:
            result = take_over_bot_for_new_user(
                db, args.take_over,
                f"Team-{args.take_over[:8]}",
                f"Manager-{args.take_over[:8]}",
            )
            print(json.dumps(result, indent=2, ensure_ascii=False))

        elif args.bot_id:
            if args.action in ("transfers", "all"):
                result = process_bot_transfers(db, args.bot_id)
                print("Transfers:", json.dumps(result, indent=2, ensure_ascii=False))

            if args.action in ("squad", "all"):
                result = select_bot_squad(db, args.bot_id)
                print("Squad:", json.dumps(result, indent=2, ensure_ascii=False))

        elif args.all_bots:
            result = process_all_bots(db, args.action)
            print(json.dumps(result, indent=2, ensure_ascii=False))

        else:
            logger.info("Varsayılan: tüm botlar işleniyor")
            result = process_all_bots(db, "all")
            print(json.dumps(result, indent=2, ensure_ascii=False))

    finally:
        db.close()


if __name__ == "__main__":
    main()
