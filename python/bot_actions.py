#!/usr/bin/env python3
"""
Siyah Beyaz FC — Bot Actions Service (Python) v2
Bot AI: Akıllı transfer kararları, kadro seçimi, taktik yönetimi

Geliştirmeler (v2):
  - Mevki bazlı kadro ihtiyacı analizi (her mevki en az 2 oyuncu)
  - Bütçe dostu transfer: en yüksek OVR'li uygun fiyatlı oyuncuyu al
  - Akıllı satış: aynı mevki 3+ fazla → en düşük OVR'li satışa çıkar
  - Fiyat stratejisi: acil satış (0.8x) veya karlı satış (1.2x) rastgele
  - Haftalık transfer limiti: maks 2 (1 alım + 1 satım)
  - Kadro seçiminde kondisyon kontrolü (stamina < 50 → yedek)
  - Rakip zayıflığına göre formasyon seçimi
  - 60. dk taktik değişimi (geride → agresif)
  - 80. dk zamana oynama sinyali (önde/berabere → zaman geçirme)

Kullanım:
    python bot_actions.py [--bot-id <id>] [--all-bots] [--action transfers|squad|tactics|all]

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

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_ANON_KEY")
    or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
)

if not SUPABASE_URL:
    logger.error("SUPABASE_URL ortam değişkeni gerekli! (SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_URL)")
    sys.exit(1)
if not SUPABASE_KEY:
    logger.error("SUPABASE_KEY ortam değişkeni gerekli! (SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY veya NEXT_PUBLIC_SUPABASE_ANON_KEY)")
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
# Kolay (1): Sadece kadro seçimi yapar, transfer yapmaz
# Orta (2): Haftada 1 transfer yapar, bütçeye dikkat eder
# Zor (3): Aktif transfer yapar, rakibin zayıf yönüne göre taktik değiştirir, genç oyunculara yatırım yapar
DIFFICULTY_CONFIG = {
    1: {  # Kolay — Sadece kadro seçimi, transfer yok
        "transfer_budget_ratio": 0.0,  # Transfer yapmaz
        "sell_threshold_rating": 45,
        "buy_rating_boost": 0,
        "max_squad_size": 22,
        "min_squad_size": 16,
        "sell_chance": 0.0,  # Satış yapmaz
        "buy_chance": 0.0,  # Alım yapmaz
        "max_weekly_transfers": 0,  # Transfer limiti: 0
        "youth_investment_ratio": 0.0,
        "tactic_change_chance": 0.0,  # Taktik değişmez
        "description": "Kolay bot: Sadece kadro seçimi yapar, transfer yapmaz",
    },
    2: {  # Orta — Haftada 1 transfer, bütçeye dikkat
        "transfer_budget_ratio": 0.20,
        "sell_threshold_rating": 50,
        "buy_rating_boost": 2,
        "max_squad_size": 22,
        "min_squad_size": 16,
        "sell_chance": 0.25,
        "buy_chance": 0.35,
        "max_weekly_transfers": 1,  # Haftada maks 1 transfer
        "youth_investment_ratio": 0.10,
        "tactic_change_chance": 0.30,  # %30 taktik değişim şansı
        "description": "Orta bot: Haftada 1 transfer yapar, bütçeye dikkat eder",
    },
    3: {  # Zor — Aktif transfer, taktik değişimi, genç yatırımı
        "transfer_budget_ratio": 0.35,
        "sell_threshold_rating": 55,
        "buy_rating_boost": 5,
        "max_squad_size": 22,
        "min_squad_size": 16,
        "sell_chance": 0.35,
        "buy_chance": 0.50,
        "max_weekly_transfers": 2,  # Haftada maks 2 transfer
        "youth_investment_ratio": 0.25,
        "tactic_change_chance": 0.70,  # %70 taktik değişim şansı
        "description": "Zor bot: Aktif transfer yapar, taktik değiştirir, gençlere yatırım yapar",
    },
}

# ─── Bot Kişilik Sistemi ────────────────────────────────────────────────
# Her bot bir "transfer hedefi" kişiliğine sahiptir. Bu, hangi tür
# oyunculara öncelik vereceğini belirler.

BOT_PERSONALITIES = {
    "youth_developer": {
        "name": "Genç Yetenek Avcısı",
        "description": "Genç ve yüksek potansiyelli oyunculara yatırım yapar",
        "preferred_age_max": 22,
        "potential_weight": 2.5,  # Potansiyele 2.5x ağırlık verir
        "rating_weight": 0.8,
        "price_tolerance": 1.3,  # Fiyatın %30 üstüne kadar gider
        "sell_old_players": True,
        "sell_age_threshold": 30,
    },
    "star_chaser": {
        "name": "Yıldız Oyuncu Takipçisi",
        "description": "Yüksek OVR'li yıldız oyuncuları takip eder",
        "preferred_age_max": 30,
        "potential_weight": 0.5,
        "rating_weight": 2.0,  # Rating'e 2x ağırlık verir
        "price_tolerance": 1.5,  # Fiyatın %50 üstüne kadar gider
        "sell_old_players": False,
        "sell_age_threshold": 34,
    },
    "bargain_hunter": {
        "name": "Fırsat Avcısı",
        "description": "Ucuz ve değerli oyuncuları bulur",
        "preferred_age_max": 28,
        "potential_weight": 1.2,
        "rating_weight": 1.0,
        "price_tolerance": 0.8,  # Fiyatın %20 altına iner
        "sell_old_players": True,
        "sell_age_threshold": 29,
    },
    "balanced_builder": {
        "name": "Dengeli Kurucu",
        "description": "Dengeli bir kadro kurar, yaş/potansiyel/rating dengesine bakar",
        "preferred_age_max": 26,
        "potential_weight": 1.0,
        "rating_weight": 1.0,
        "price_tolerance": 1.0,
        "sell_old_players": True,
        "sell_age_threshold": 32,
    },
}

# Kişilik atanma ağırlıkları (yüksek = daha sık atanır)
PERSONALITY_WEIGHTS = {
    "youth_developer": 3,
    "star_chaser": 2,
    "bargain_hunter": 3,
    "balanced_builder": 2,
}


def assign_bot_personality(difficulty: int) -> str:
    """
    Zorluk seviyesine göre bot kişiliği atar.
    Kolay botlar genelde dengeli, zor botlar genç yetenek avcısı olur.
    """
    if difficulty == 1:
        return "balanced_builder"
    elif difficulty == 2:
        # Orta: %40 genç avcısı, %30 fırsat avcısı, %30 dengeli
        roll = random.random()
        if roll < 0.40:
            return "youth_developer"
        elif roll < 0.70:
            return "bargain_hunter"
        else:
            return "balanced_builder"
    else:
        # Zor: Ağırlıklı rastgele seçim
        personalities = list(PERSONALITY_WEIGHTS.keys())
        weights = list(PERSONALITY_WEIGHTS.values())
        return random.choices(personalities, weights=weights, k=1)[0]


def evaluate_player_for_personality(player_data: dict, personality_key: str) -> float:
    """
    Bot kişiliğine göre bir oyuncunun transfer puanını hesaplar.
    Yüksek puan = daha çok istenen oyuncu.
    """
    personality = BOT_PERSONALITIES.get(personality_key, BOT_PERSONALITIES["balanced_builder"])

    rating = player_data.get("rating", 50)
    potential = player_data.get("potential", rating)
    age = player_data.get("age", 25)

    # Baz puan
    score = rating * personality["rating_weight"] + potential * personality["potential_weight"]

    # Yaş faktörü
    if age <= personality["preferred_age_max"]:
        age_bonus = (personality["preferred_age_max"] - age) * 2
        score += age_bonus
    else:
        age_penalty = (age - personality["preferred_age_max"]) * 3
        score -= age_penalty

    # Genç yatırımcı bonusu: 22 yaş altına ekstra puan
    if personality_key == "youth_developer" and age <= 22:
        score += potential * 0.5

    return score

# Her mevkide en az olması gereken oyuncu sayısı (v2)
MIN_PER_POSITION_GROUP = 2

# İdeal kadro dağılımı
IDEAL_SQUAD_DISTRIBUTION = {"GK": 2, "DEF": 6, "MID": 6, "FWD": 5}

# Aynı mevkide fazlalık eşiği (3+ ise satış)
SURPLUS_THRESHOLD = 3

# Haftalık maksimum transfer sayısı
MAX_WEEKLY_TRANSFERS = 2  # 1 alım + 1 satım

# BUG-4: Maaş bütçesi oranı — gelirin %60'ı maaşlara ayrılır
SALARY_BUDGET_RATIO = 0.60

# BUG-4: Zorluk bazlı maaş yönetim agresifliği
# Difficulty 1 (Kolay): Maaş bütçesinin %50'sini aşamaz → çok tutucu
# Difficulty 2 (Orta):  Maaş bütçesinin %70'ine kadar → normal
# Difficulty 3 (Zor):   Maaş bütçesinin %90'ına kadar → agresif
SALARY_DIFFICULTY_RATIO = {
    1: 0.50,  # Conservative — won't exceed 50% of salary budget
    2: 0.70,  # Normal — up to 70% of salary budget
    3: 0.90,  # Aggressive — up to 90% of salary budget
}

# Pozisyon gruplama
POSITION_GROUPS = {
    "GK": "GK",
    "CB": "DEF", "LB": "DEF", "RB": "DEF", "LWB": "DEF", "RWB": "DEF",
    "CDM": "MID", "CM": "MID", "CAM": "MID", "LM": "MID", "RM": "MID",
    "LW": "FWD", "RW": "FWD", "CF": "FWD", "ST": "FWD",
}

# Formasyon tanımları
FORMATIONS = {
    "4-4-2": {"GK": 1, "DEF": 4, "MID": 4, "FWD": 2},
    "4-3-3": {"GK": 1, "DEF": 4, "MID": 3, "FWD": 3},
    "4-5-1": {"GK": 1, "DEF": 4, "MID": 5, "FWD": 1},
    "3-4-3": {"GK": 1, "DEF": 3, "MID": 4, "FWD": 3},
    "5-4-1": {"GK": 1, "DEF": 5, "MID": 4, "FWD": 1},
    "4-2-4": {"GK": 1, "DEF": 4, "MID": 2, "FWD": 4},
}


def map_to_group(position: str) -> str:
    """Pozisyonu gruba dönüştürür."""
    return POSITION_GROUPS.get(position, "MID")


def get_position_needs(squad: list[dict]) -> dict[str, int]:
    """
    Kadroda eksik pozisyonları belirler (v2).
    Her mevki için en az MIN_PER_POSITION_GROUP oyuncu olmalı.
    """
    current: dict[str, int] = {"GK": 0, "DEF": 0, "MID": 0, "FWD": 0}
    for p in squad:
        group = map_to_group(p.get("position", "CM"))
        current[group] = current.get(group, 0) + 1

    needs: dict[str, int] = {}
    for pos in IDEAL_SQUAD_DISTRIBUTION:
        min_required = max(MIN_PER_POSITION_GROUP, IDEAL_SQUAD_DISTRIBUTION[pos])
        needs[pos] = max(0, min_required - current.get(pos, 0))
    return needs


def get_surplus_positions(squad: list[dict]) -> dict[str, list[dict]]:
    """
    Aynı mevkide SURPLUS_THRESHOLD (3) veya daha fazla oyuncu varsa,
    en düşük OVR'lileri satış adayı olarak döner.
    """
    grouped: dict[str, list[dict]] = defaultdict(list)
    for p in squad:
        group = map_to_group(p.get("position", "CM"))
        grouped[group].append(p)

    surplus: dict[str, list[dict]] = {}
    for group, players in grouped.items():
        if len(players) >= SURPLUS_THRESHOLD:
            # OVR'ye göre sırala (düşükten yükseğe)
            sorted_players = sorted(players, key=lambda p: p.get("rating", 0))
            # Fazla oyuncuları satış adayı yap
            excess_count = len(players) - MIN_PER_POSITION_GROUP
            if excess_count > 0:
                surplus[group] = sorted_players[:excess_count]

    return surplus


def get_random_price(rating: int, difficulty: int) -> int:
    """Rating ve zorluk bazlı rastgele fiyat üretir."""
    base = max(500_000, rating * 80_000)
    variance = base * (0.8 + random.random() * 0.4)
    difficulty_multiplier = 1 + (difficulty - 1) * 0.1
    return round(variance * difficulty_multiplier)


def calculate_salary_budget(profile: dict, squad: list[dict]) -> dict:
    """
    BUG-4: Bot'un maaş bütçesini hesaplar.

    Haftalık geliri baz alarak maaş bütçesi, mevcut maaş yükü ve
    kalan maaş alanı hesaplar. Bot ekonomisinin çökmesini önler.

    Args:
        profile: Bot profil verisi (money, last_weekly_income, vb.)
        squad: Bot'un kadrosu (her oyuncuda salary alanı olmalı)

    Returns:
        {
            salary_budget: int,          # Toplam maaş bütçesi (weekly_income * SALARY_BUDGET_RATIO)
            current_salary_load: int,     # Mevcut toplam maaş yükü
            available_salary_space: int,  # Kalan maaş alanı (negatif olabilir)
            weekly_income: int,           # Haftalık gelir
            is_overloaded: bool,          # Maaş yükü bütçeyi aşıyor mu?
        }
    """
    money = profile.get("money", 0) or 0
    weekly_income = profile.get("last_weekly_income") or max(50000, money * 0.02)
    salary_budget = weekly_income * SALARY_BUDGET_RATIO
    current_salary_load = sum(p.get("salary", 0) or 0 for p in squad)
    available_salary_space = salary_budget - current_salary_load
    is_overloaded = current_salary_load > salary_budget

    return {
        "salary_budget": salary_budget,
        "current_salary_load": current_salary_load,
        "available_salary_space": available_salary_space,
        "weekly_income": weekly_income,
        "is_overloaded": is_overloaded,
    }


# ═══════════════════════════════════════════════════════════════════════
# BOT TRANSFER İŞLEMLERİ (v2 — Akıllı Transfer ve Kadro Planlaması)
# ═══════════════════════════════════════════════════════════════════════

def process_bot_transfers(db: SupabaseClient, bot_user_id: str) -> dict:
    """
    Botun kredi durumuna göre akıllı transfer kararları alır (v2).

    Kurallar:
      1. Her mevkide en az 2 oyuncu olmalı. Eksik mevkileri tespit et.
      2. Transfer piyasasından eksik mevkide en yüksek OVR'li uygun fiyatlı oyuncuyu al.
      3. Botun credits bütçesini aşmayacak şekilde alım yap.
      4. Satış: Aynı mevkide 3+ oyuncu varsa, en düşük OVR'li olanı satışa çıkar.
         Fiyat = current_price * 0.8 (acil satış) veya * 1.2 (karlı satış) rastgele.
      5. Haftada maksimum 2 transfer (1 alım + 1 satım).
    """
    logger.info(f"Bot transfer işlemleri başlıyor (v2): {bot_user_id}")

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
        credits = profile.get("credits", 0) or 0
        money = profile.get("money", 0) or 0

        # ─── v3: Bot kişiliğini ata ─────────────────────────────────
        personality_key = profile.get("bot_personality") or assign_bot_personality(difficulty)
        personality = BOT_PERSONALITIES.get(personality_key, BOT_PERSONALITIES["balanced_builder"])

        logger.info(
            f"Bot: {team_name}, Credits: {credits}, Money: ₺{money:,}, "
            f"Zorluk: {difficulty}, Kişilik: {personality['name']}"
        )

        # Kolay botlar transfer yapmaz
        if difficulty == 1:
            logger.info(f"Kolay bot transfer yapmaz: {team_name}")
            result["details"].append(f"Kolay bot: Transfer yapılmıyor ({personality['name']})")
            return result

        # Zorluk bazlı haftalık transfer limiti
        max_weekly = config.get("max_weekly_transfers", MAX_WEEKLY_TRANSFERS)
        transfer_count = 0

        # 2. Kadroyu çek
        squad = db.select("players", query="*", filters={"profile_id": f"eq.{bot_user_id}"})

        if not squad:
            result["errors"].append("Kadro bulunamadı")
            return result

        logger.info(f"Kadro büyüklüğü: {len(squad)} oyuncu")

        # ─── BUG-4: Maaş bütçesi hesaplama ────────────────────────────
        salary_info = calculate_salary_budget(profile, squad)
        difficulty_salary_ratio = SALARY_DIFFICULTY_RATIO.get(difficulty, SALARY_DIFFICULTY_RATIO[2])
        effective_salary_cap = salary_info["salary_budget"] * difficulty_salary_ratio

        logger.info(
            f"BUG-4 Maaş Bütçesi: bütçe=₺{salary_info['salary_budget']:,.0f}, "
            f"yük=₺{salary_info['current_salary_load']:,.0f}, "
            f"kalan=₺{salary_info['available_salary_space']:,.0f}, "
            f"gelir=₺{salary_info['weekly_income']:,.0f}, "
            f"aşırı_yüklü={salary_info['is_overloaded']}, "
            f"zorluk_oranı={difficulty_salary_ratio:.0%}, "
            f"etkili_kapasite=₺{effective_salary_cap:,.0f}"
        )

        # ─── BUG-4: Acil durum satış — maaş yükü bütçeyi aşıyorsa ───
        # Bu, mevki fazlalığı satışından BAĞIMSIZ bir finansal sağlık mekanizmasıdır.
        # Takım overloaded ise en yüksek maaşlı 2 oyuncuyu acil satışa çıkarır.
        emergency_sold_players = []
        if salary_info["is_overloaded"] and transfer_count < max_weekly:
            # En yüksek maaşlı oyuncuları bul
            players_by_salary = sorted(
                squad,
                key=lambda p: p.get("salary", 0) or 0,
                reverse=True
            )
            # İlk 2 en yüksek maaşlı oyuncuyu acil satışa çıkar
            for emergency_player in players_by_salary[:2]:
                if transfer_count >= max_weekly:
                    break
                # Zaten satılık mı kontrol et
                is_already_for_sale = emergency_player.get("is_for_sale", False)
                if is_already_for_sale:
                    continue

                player_market_value = emergency_player.get("market_value", 0) or emergency_player.get("current_price", 0) or 0
                # Acil satış: market_value * 0.7 (hızlı kurtulmak için indirimli)
                emergency_price = round(player_market_value * 0.7) if player_market_value > 0 else get_random_price(emergency_player.get("rating", 30), difficulty)
                emergency_price = max(100, emergency_price)

                try:
                    db.insert("transfer_market", {
                        "player_id": emergency_player.get("id"),
                        "player_data": json.dumps(emergency_player),
                        "seller_id": bot_user_id,
                        "seller_name": team_name,
                        "price": emergency_price,
                        "min_price": round(emergency_price * 0.6),
                        "max_price": round(emergency_price * 1.3),
                        "is_active": True,
                        "is_auction": True,
                        "starting_price": emergency_price,
                        "reserve_price": round(emergency_price * 0.6),
                        "bid_count": 0,
                        "expires_at": (datetime.fromtimestamp(datetime.now().timestamp() + 4 * 3600).isoformat()),
                    })
                    db.update(
                        "players",
                        {"is_for_sale": True, "sale_price": emergency_price},
                        {"id": f"eq.{emergency_player.get('id')}"},
                    )

                    transfer_count += 1
                    result["sold"] = True
                    emergency_sold_players.append(emergency_player.get("name", "?"))
                    detail = (
                        f"BUG-4 ACİL SATIŞ: {emergency_player.get('name', '?')} "
                        f"(OVR {emergency_player.get('rating', 0)}, maaş=₺{emergency_player.get('salary', 0):,}) → "
                        f"₺{emergency_price:,} [acil satış (0.7x)]"
                    )
                    result["details"].append(detail)
                    logger.warning(f"BUG-4 Bot {team_name}: {detail}")
                except Exception as e:
                    err_msg = f"BUG-4 Acil satış hatası: {e}"
                    result["errors"].append(err_msg)
                    logger.error(err_msg)

        # ─── SATIŞ (v3: Kişilik bazlı + Mevki fazlalığı) ──────────────
        surplus = get_surplus_positions(squad)

        # Kişilik bazlı satış: Yaşlı oyuncuları sat
        if personality.get("sell_old_players") and transfer_count < max_weekly:
            old_players = [
                p for p in squad
                if (p.get("age") or 25) >= personality.get("sell_age_threshold", 32)
            ]
            if old_players:
                # En yaşlı ve en düşük OVR'li olanı seç
                old_players.sort(key=lambda p: (-(p.get("age") or 25), p.get("rating", 0)))
                sell_candidate = old_players[0]
                # Eğer fazlalık listesinde değilse bile yaşlı olduğu için sat
                if sell_candidate.get("id") not in [p.get("id") for p in surplus.get(map_to_group(sell_candidate.get("position", "CM")), [])]:
                    surplus_group = map_to_group(sell_candidate.get("position", "CM"))
                    if surplus_group not in surplus:
                        surplus[surplus_group] = []
                    surplus[surplus_group].append(sell_candidate)
                    logger.info(f"Kişilik satış: {sell_candidate.get('name', '?')} yaş={sell_candidate.get('age', 0)}")

        if surplus and transfer_count < max_weekly:
            # Rastgele bir fazlalık mevki seç
            surplus_group = random.choice(list(surplus.keys()))
            candidates = surplus[surplus_group]

            if candidates:
                sell_player = candidates[0]  # En düşük OVR'li
                player_current_price = sell_player.get("current_price", 0) or sell_player.get("market_value", 0) or 0

                # Fiyat stratejisi: acil satış (0.8x) veya karlı satış (1.2x)
                if player_current_price > 0:
                    if random.random() < 0.5:
                        sell_price = round(player_current_price * 0.8)  # Acil satış
                        price_strategy = "acil satış (0.8x)"
                    else:
                        sell_price = round(player_current_price * 1.2)  # Karlı satış
                        price_strategy = "karlı satış (1.2x)"
                else:
                    sell_price = get_random_price(sell_player.get("rating", 30), difficulty)
                    price_strategy = "varsayılan fiyat"

                # Minimum fiyat kontrolü
                sell_price = max(100, sell_price)

                try:
                    # Transfer listesine ekle
                    db.insert("transfer_market", {
                        "player_id": sell_player.get("id"),
                        "player_data": json.dumps(sell_player),
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
                        # BUG-4 FIX: Doğru expire süresi (4 saat sonrası)
                        "expires_at": (datetime.fromtimestamp(datetime.now().timestamp() + 4 * 3600).isoformat()),
                    })

                    # BUG-1 FIX: Oyuncuyu SİLME — sadece is_for_sale=true olarak işaretle
                    # Eski kod oyuncuyu siliyordu, bu transfer ilanını bozuyordu
                    db.update(
                        "players",
                        {"is_for_sale": True, "sale_price": sell_price},
                        {"id": f"eq.{sell_player.get('id')}"},
                    )

                    # Parayı ekle
                    db.update(
                        "profiles",
                        {"money": money + sell_price},
                        {"id": f"eq.{bot_user_id}"},
                    )

                    transfer_count += 1
                    result["sold"] = True
                    detail = (
                        f"Satıldı: {sell_player.get('name', '?')} "
                        f"(OVR {sell_player.get('rating', 0)}, {surplus_group}) → "
                        f"₺{sell_price:,} [{price_strategy}]"
                    )
                    result["details"].append(detail)
                    logger.info(f"Bot {team_name}: {detail}")

                except Exception as e:
                    err_msg = f"Satış hatası: {e}"
                    result["errors"].append(err_msg)
                    logger.error(err_msg)

        # ─── ALIŞ (v3: Kişilik bazlı oyuncu değerlendirmesi + BUG-4: Maaş kontrolü) ──
        if transfer_count < max_weekly:
            needs = get_position_needs(squad)
            needed_positions = [pos for pos, count in needs.items() if count > 0]

            budget = money * config["transfer_budget_ratio"]

            # BUG-4: Maaş bütçesi kontrolü — calculate_salary_budget sonucunu kullan
            available_salary_space = salary_info["available_salary_space"]
            effective_salary_cap = salary_info["salary_budget"] * difficulty_salary_ratio

            # Kişilik bazlı bütçe toleransı
            price_tolerance = personality.get("price_tolerance", 1.0)
            effective_budget = budget * price_tolerance

            # BUG-4: Maaş yükü etkili kapasiteyi aşıyorsa alım yapma
            if salary_info["current_salary_load"] > effective_salary_cap:
                logger.warning(
                    f"BUG-4: Maaş yükü etkili kapasiteyi aşıyor — alım iptal. "
                    f"yük=₺{salary_info['current_salary_load']:,.0f} > "
                    f"kapasite=₺{effective_salary_cap:,.0f}"
                )
                result["details"].append(
                    f"Maaş bütçesi aşımı: alım iptal (yük=₺{salary_info['current_salary_load']:,.0f})"
                )
            elif needed_positions:
                logger.info(
                    f"Eksik mevkiler: {needed_positions}, bütçe: ₺{budget:,}, "
                    f"kişilik limiti: ₺{effective_budget:,} ({personality['name']}), "
                    f"maaş alanı: ₺{available_salary_space:,.0f}"
                )

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

                        # BUG-4: Gelişmiş bütçe + maaş filtreleme
                        def is_affordable(l):
                            lprice = l.get("price", 999999999) or 0
                            if lprice > effective_budget:
                                return False
                            # BUG-4: Maaş bütçesi kontrolü — available_salary_space kullan
                            pd = l.get("player_data")
                            if isinstance(pd, str):
                                try: pd = json.loads(pd)
                                except: pd = {}
                            if isinstance(pd, dict):
                                p_salary = pd.get("salary") or round((pd.get("rating", 40)) * 500)
                                # Oyuncunun maaşı available_salary_space'i aşıyorsa ve
                                # maaş yükü etkili kapasiteyi aşıyorsa alma
                                if p_salary > available_salary_space and p_salary > 0:
                                    return False
                            return True

                        # BUG-4: Value-for-money skoru hesaplama
                        def calculate_vfm(p_data: dict, p_salary: int) -> float:
                            """Oyuncunun maaşa göre değer-for-money skorunu hesaplar."""
                            rating = p_data.get("rating", 50)
                            potential = p_data.get("potential", rating)
                            p_weight = personality.get("rating_weight", 1.0)
                            pot_weight = personality.get("potential_weight", 1.0)
                            score = (rating * p_weight + potential * pot_weight) / max(1, p_salary)
                            return score

                        affordable = [l for l in other_listings if is_affordable(l)]

                        if affordable:
                            # Eksik mevki öncelikli seçim
                            target = None

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
                                        matching.append((l, player_data))

                            if matching:
                                # v3 + BUG-4: Kişilik bazlı + VFM (value-for-money) skoru ile sırala
                                scored_matching = []
                                for listing, p_data in matching:
                                    personality_score = evaluate_player_for_personality(p_data, personality_key)
                                    p_salary = p_data.get("salary") or round((p_data.get("rating", 40)) * 500)
                                    vfm_score = calculate_vfm(p_data, p_salary)
                                    # Kombine skor: kişilik puanı (%60) + VFM (%40)
                                    combined_score = personality_score * 0.6 + vfm_score * 100 * 0.4
                                    scored_matching.append((listing, p_data, combined_score, vfm_score))
                                scored_matching.sort(key=lambda x: x[2], reverse=True)
                                target = scored_matching[0][0]
                                target_player_data = scored_matching[0][1]
                                logger.info(
                                    f"BUG-4 Kişilik+VFM seçimi: {target_player_data.get('name', '?')} "
                                    f"kombine_puan={scored_matching[0][2]:.1f}, "
                                    f"vfm={scored_matching[0][3]:.4f}, "
                                    f"maaş=₺{target_player_data.get('salary', 0):,}"
                                )
                            else:
                                # Genel olarak en yüksek VFM skorlu olanı seç
                                all_with_data = []
                                for l in affordable:
                                    pd = l.get("player_data")
                                    if isinstance(pd, str):
                                        try:
                                            pd = json.loads(pd)
                                        except json.JSONDecodeError:
                                            continue
                                    if isinstance(pd, dict):
                                        p_salary = pd.get("salary") or round((pd.get("rating", 40)) * 500)
                                        vfm = calculate_vfm(pd, p_salary)
                                        all_with_data.append((l, pd, vfm))

                                if all_with_data:
                                    all_with_data.sort(key=lambda x: x[2], reverse=True)
                                    target = all_with_data[0][0]
                                    target_player_data = all_with_data[0][1]
                                    logger.info(
                                        f"BUG-4 VFM seçimi: {target_player_data.get('name', '?')} "
                                        f"vfm={all_with_data[0][2]:.4f}"
                                    )

                            if target:
                                buy_price = target.get("price", 0)

                                # Bütçe kontrolü
                                if buy_price <= budget:
                                    # Botun parasını güncelle
                                    db.update(
                                        "profiles",
                                        {"money": max(0, money - buy_price)},
                                        {"id": f"eq.{bot_user_id}"},
                                    )

                                    # Oyuncunun sahipliğini değiştir
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

                                    transfer_count += 1
                                    result["bought"] = True
                                    player_name = (
                                        target_player_data.get("name", "Bilinmeyen")
                                        if isinstance(target_player_data, dict)
                                        else "Bilinmeyen"
                                    )
                                    player_ovr = (
                                        target_player_data.get("rating", 0)
                                        if isinstance(target_player_data, dict)
                                        else 0
                                    )
                                    player_pos = (
                                        target_player_data.get("position", "?")
                                        if isinstance(target_player_data, dict)
                                        else "?"
                                    )
                                    detail = (
                                        f"Alındı: {player_name} "
                                        f"(OVR {player_ovr}, {player_pos}) → "
                                        f"₺{buy_price:,} (bütçe: ₺{budget:,})"
                                    )
                                    result["details"].append(detail)
                                    logger.info(f"Bot {team_name}: {detail}")
                                else:
                                    result["details"].append(
                                        f"Bütçe yetersiz: ₺{buy_price:,} > ₺{budget:,}"
                                    )
                            else:
                                result["details"].append("Eksik mevkide uygun oyuncu yok")
                        else:
                            result["details"].append("Bütçeye uygun oyuncu yok")
                    else:
                        result["details"].append("Piyasada ilan yok")

                except Exception as e:
                    err_msg = f"Alış hatası: {e}"
                    result["errors"].append(err_msg)
                    logger.error(err_msg)
            else:
                result["details"].append("Eksik mevki yok, alım gerekmiyor")

        # Transfer özeti
        result["transfer_count"] = transfer_count
        result["max_weekly"] = max_weekly
        result["personality"] = personality_key
        logger.info(
            f"Transfer özeti: {transfer_count}/{max_weekly} "
            f"alım={result['bought']}, satım={result['sold']} "
            f"kişilik={personality['name']}"
        )

    except Exception as e:
        err_msg = f"Bot transfer genel hata: {e}"
        result["errors"].append(err_msg)
        logger.error(err_msg, exc_info=True)

    return result


# ═══════════════════════════════════════════════════════════════════════
# BOT KADRO SEÇİMİ (v2 — Kondisyon + Formasyon Seçimi)
# ═══════════════════════════════════════════════════════════════════════

def select_bot_squad(db: SupabaseClient, bot_user_id: str, match_id: Optional[str] = None) -> dict:
    """
    En yüksek OVR'li 11 oyuncuyu seçer ve kadro düzenler (v2).

    Geliştirmeler:
      - Kondisyonu (stamina) 50'nin altındaki oyuncular yedekte
      - Rakip zayıflığına göre formasyon seçimi
      - Formasyonlar: 4-4-2, 4-3-3, 4-5-1 (rastgele)

    Returns:
        {"starting": [...], "subs": [...], "formation": str}
    """
    logger.info(f"Bot kadro seçimi (v2): {bot_user_id}")

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

        # ─── v2: Kondisyon kontrolü ─────────────────────────────────
        # Stamina 50'nin altındaki oyuncular yedek adayı
        high_stamina = [p for p in available if (p.get("stamina", 100) or 100) >= 50]
        low_stamina = [p for p in available if (p.get("stamina", 100) or 100) < 50]

        logger.info(
            f"Kondisyon dağılımı: yüksek={len(high_stamina)}, düşük={len(low_stamina)}"
        )

        # Yüksek kondisyonluları önceliklendir, düşük olanları yedek havuzuna
        if len(high_stamina) >= 11:
            pool = high_stamina
            reserve_pool = low_stamina
        else:
            # Yeterli yüksek kondisyonlu yoksa düşük olanları da dahil et
            pool = available
            reserve_pool = []

        # ─── v2: Rakip zayıflığına göre formasyon seçimi ───────────
        # Rakip bilgisi varsa zayıf yöne göre, yoksa rastgele
        formation = random.choice(["4-4-2", "4-3-3", "4-5-1"])

        # Rakip analizi (mevcutsa)
        try:
            if match_id:
                # Maç bilgisinden rakibi bul
                match_data = db.select("matches", query="*", filters={"id": f"eq.{match_id}"}, limit=1)
                if match_data:
                    match_info = match_data[0]
                    opponent_id = (
                        match_info.get("away_team_id")
                        if match_info.get("home_team_id") == bot_user_id
                        else match_info.get("home_team_id")
                    )
                    if opponent_id:
                        # Rakip kadro analizi
                        opp_players = db.select("players", query="position,rating", filters={"profile_id": f"eq.{opponent_id}"})
                        if opp_players:
                            # Rakibin en zayıf hattını tespit et
                            opp_group_ratings: dict[str, list[int]] = {"GK": [], "DEF": [], "MID": [], "FWD": []}
                            for op in opp_players:
                                group = map_to_group(op.get("position", "CM"))
                                opp_group_ratings[group].append(op.get("rating", 50))

                            opp_avg = {
                                g: sum(ratings) / len(ratings) if ratings else 50
                                for g, ratings in opp_group_ratings.items()
                            }

                            # Zayıf hatta saldır
                            weakest_group = min(
                                ["DEF", "MID"],
                                key=lambda g: opp_avg.get(g, 50),
                            )

                            if weakest_group == "DEF":
                                formation = "4-3-3"  # Rakip defans zayıfsa hücum
                                logger.info(f"Rakip defans zayıf → 4-3-3 hücum formasyonu")
                            elif weakest_group == "MID":
                                formation = "4-5-1"  # Rakip orta saha zayıfsa kontrol
                                logger.info(f"Rakip orta saha zayıf → 4-5-1 kontrol formasyonu")
                            else:
                                formation = "4-4-2"  # Dengeli
                                logger.info(f"Rakip dengeli → 4-4-2 standart formasyon")
        except Exception as e:
            logger.warning(f"Rakip analizi yapılamadı, varsayılan formasyon: {e}")

        # Formasyon slotları
        formation_slots = FORMATIONS.get(formation, FORMATIONS["4-4-2"])

        # Rating'e göre sırala
        pool.sort(key=lambda p: p.get("rating", 0), reverse=True)

        # Pozisyon bazlı grupla
        by_position: dict[str, list[dict]] = {"GK": [], "DEF": [], "MID": [], "FWD": []}
        for p in pool:
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
            remaining = [p for p in pool if p.get("id") not in used_ids]
            for p in remaining:
                if len(starting) >= 11:
                    break
                starting.append(p)
                used_ids.add(p.get("id"))

        # Yedekler: kalan en iyi 7 oyuncu (düşük kondisyonlular dahil)
        subs_pool = [p for p in available if p.get("id") not in used_ids]
        # Önce yüksek kondisyonluları öne al
        subs_pool.sort(key=lambda p: (p.get("stamina", 100) or 100), reverse=True)
        subs = subs_pool[:7]

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
        return db.select("profiles", query="id,team_name,money,credits,bot_difficulty", filters={"is_bot": "eq.true"})
    except Exception as e:
        logger.error(f"Bot profilleri çekme hatası: {e}")
        return []


def make_tactical_decision(
    db: SupabaseClient,
    bot_user_id: str,
    match_id: str,
    minute: int = 60,
    current_score: Optional[dict] = None,
) -> dict:
    """
    Maç sırasında taktiksel karar alır (v2).

    Kurallar:
      - 60. dakikada skor gerideyse agresif formasyona geç (3-4-3).
      - 80. dakikada beraberlik veya öndeyse zamana oynama sinyali gönder (log).
      - Skor farkına göre mentality ayarla.

    Args:
        db: Supabase client
        bot_user_id: Bot profil ID
        match_id: Maç ID
        minute: Maç dakikası
        current_score: {"home": int, "away": int, "is_home": bool}

    Returns:
        {"formation": str, "mentality": str, "changes_made": list}
    """
    logger.info(f"Bot taktik kararı (v2): bot={bot_user_id}, dakika={minute}")

    result = {"formation": "4-4-2", "mentality": "normal", "changes_made": []}

    if not current_score:
        logger.info("Skor bilgisi yok, taktik değişikliği yapılmıyor")
        return result

    is_home = current_score.get("is_home", True)
    my_goals = current_score.get("home" if is_home else "away", 0)
    opp_goals = current_score.get("away" if is_home else "home", 0)

    goal_diff = my_goals - opp_goals

    logger.info(f"Skor: {my_goals}-{opp_goals} (fark: {goal_diff:+d})")

    if minute >= 60:
        if goal_diff < 0:
            # Gerideyiz - agresif
            if minute >= 75:
                result["formation"] = "3-4-3"
                result["mentality"] = "very_attacking"
                result["changes_made"].append(
                    f"{minute}'. dk: Geride ({goal_diff:+d}), agresif formasyon 3-4-3"
                )
            else:
                result["formation"] = "4-3-3"
                result["mentality"] = "attacking"
                result["changes_made"].append(
                    f"{minute}'. dk: Geride ({goal_diff:+d}), hücum formasyonu 4-3-3"
                )
        elif goal_diff == 0:
            # Eşit - dengeli
            result["formation"] = "4-5-1"
            result["mentality"] = "balanced"
            result["changes_made"].append(
                f"{minute}'. dk: Berabere, denge formasyonu 4-5-1"
            )
        elif goal_diff >= 2:
            # İki+ gol öndeyiz - defansif
            result["formation"] = "5-4-1"
            result["mentality"] = "defensive"
            result["changes_made"].append(
                f"{minute}'. dk: Öndeyiz ({goal_diff:+d}), defansif formasyon 5-4-1"
            )
        else:
            # 1 gol öndeyiz - dengeli
            result["formation"] = "4-4-2"
            result["mentality"] = "balanced"
            result["changes_made"].append(
                f"{minute}'. dk: 1 gol önde, dengeli 4-4-2"
            )

    # ─── v2: 80. dakika zamana oynama sinyali ─────────────────────
    if minute >= 80:
        if goal_diff >= 0:
            result["mentality"] = "time_wasting"
            result["changes_made"].append(
                f"{minute}'. dk: Zamana oynama sinyali aktif "
                f"(skor: {my_goals}-{opp_goals})"
            )
            logger.info(
                f"⏱️ ZAMANA OYNAMA: Bot {bot_user_id}, {minute}'. dk, "
                f"skor {my_goals}-{opp_goals}"
            )
        else:
            # Geride ve dakika az - son hamle
            result["formation"] = "3-4-3"
            result["mentality"] = "all_out_attack"
            result["changes_made"].append(
                f"{minute}'. dk: Son hamle! Herkes hücuma 3-4-3"
            )
            logger.info(
                f"🔥 SON HAMLE: Bot {bot_user_id}, {minute}'. dk, "
                f"skor {my_goals}-{opp_goals}"
            )

    # match_lineups'a taktik güncellemeyi kaydet
    if result["changes_made"]:
        try:
            db.update(
                "match_lineups",
                {"formation": result["formation"], "mentality": result["mentality"]},
                {"match_id": f"eq.{match_id}", "team_id": f"eq.{bot_user_id}"},
            )
        except Exception as e:
            logger.warning(f"Taktik güncelleme kaydedilemedi: {e}")

    return result


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
            "credits": 250,
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

            if action in ("tactics", "all"):
                # Taktik için maç bilgisi gerekli, burada sadece log
                bot_result["tactics"] = {"note": "Taktik kararı maç sırasında alınır"}

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
    parser = argparse.ArgumentParser(description="Siyah Beyaz FC — Bot Actions Service v2")
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
        choices=["transfers", "squad", "tactics", "all"],
        default="all",
        help="İşlem türü (transfers, squad, tactics, all)",
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

            if args.action in ("tactics", "all"):
                print("Tactics: Taktik kararları maç sırasında make_tactical_decision() ile alınır")

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
