#!/usr/bin/env python3
"""
Siyah Beyaz FC — Regen System (BUG-15)
Emekli olan oyuncuların yerine "regen" (re-generation) oyuncular üretir.

Mantık:
  1. Sezon sonunda emekli olan oyuncuları tespit et (is_retiring = true)
  2. Her pozisyon grubu için (GK/DEF/MID/FWD) emekli sayısını say
  3. Her emekli oyuncu için 1 regen üret (minimum 2 her gruba)
  4. Regen'in ismi: emekli oyuncunun soyadı + farklı ilk isim
  5. Yaş: 15-18, potansiyel: emekli oyuncunun peak rating'ine dayalı
  6. profile_id = NULL, is_free_agent = true (serbest oyuncu havuzunda)

Kullanım:
    python regen_system.py [--season-id <id>]
"""

import os
import sys
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

# Import SupabaseClient from bot_actions
from bot_actions import SupabaseClient, SUPABASE_URL, SUPABASE_KEY

# ─── Logging ────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("regen_system")

# ─── Pozisyon Gruplama ────────────────────────────────────────────────────

POSITION_GROUPS = {
    "GK": "GK",
    "CB": "DEF", "LB": "DEF", "RB": "DEF", "LWB": "DEF", "RWB": "DEF",
    "CDM": "MID", "CM": "MID", "CAM": "MID", "LM": "MID", "RM": "MID", "LW": "MID", "RW": "MID",
    "CF": "FWD", "ST": "FWD",
}

# Pozisyon gruplarından spesifik pozisyon seçimi
GROUP_POSITIONS = {
    "GK": ["GK"],
    "DEF": ["CB", "LB", "RB", "LWB", "RWB"],
    "MID": ["CDM", "CM", "CAM", "LM", "RM", "LW", "RW"],
    "FWD": ["CF", "ST"],
}

# Türk isimleri (regen için)
FIRST_NAMES = [
    "Ahmet", "Mehmet", "Mustafa", "Can", "Burak", "Emre", "Arda", "Ömer", "Yiğit", "Mert",
    "Ali", "Hakan", "Kerem", "Efe", "Deniz", "Tolga", "Sercan", "Cengiz", "Umut", "Berk",
    "Furkan", "Oğuz", "Salih", "İbrahim", "Yusuf", "Kaan", "Baran", "Alper", "Murat", "Cem",
    "Semih", "Batuhan", "Emirhan", "Taha", "Rıza", "Tayfun", "Gökhan", "Savaş", "Erkan", "Onur",
]

LAST_NAMES = [
    "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Erdogan", "Aydın", "Özdemir", "Arslan",
    "Koç", "Öztürk", "Kılıç", "Doğan", "Keskin", "Akar", "Çetin", "Korkmaz", "Gündüz",
    "Polat", "Şen", "Güven", "Tan", "Aktaş", "Karadağ", "Uğur", "Başaran",
    "Söğüt", "Tuncel", "Balcı", "Kıraç", "Soysal", "Velioğlu", "Yavuz", "Dinç", "Köse", "Okutan",
]


def map_to_group(position: str) -> str:
    """Pozisyonu gruba dönüştürür."""
    return POSITION_GROUPS.get(position, "MID")


def generate_regen_player(
    retired_player: dict,
    db: SupabaseClient,
) -> dict:
    """
    Emekli bir oyuncudan ilham alan regen oyuncu üretir.

    Regen oyuncunun özellikleri:
    - İsim: Farklı ilk isim + emekli oyuncunun soyadı
    - Yaş: 15-18
    - Pozisyon: Emekli oyuncunun pozisyon grubundan
    - Rating: 40-55 (genç, gelişecek)
    - Potansiyel: Emekli oyuncunun rating'ine dayalı (peak_rating * 0.8 - 1.0)
    - profile_id: NULL (serbest oyuncu)
    - is_free_agent: true
    - is_regen: true
    - inspired_by_player_id: emekli oyuncunun ID'si
    """
    retired_name = retired_player.get("name", "Bilinmeyen Oyuncu")
    retired_rating = retired_player.get("rating", 60)
    retired_position = retired_player.get("position", "MID")
    retired_specific_position = retired_player.get("specific_position", None)
    retired_id = retired_player.get("id", "")

    # Soyadı çıkar (son kelime)
    name_parts = retired_name.strip().split()
    if len(name_parts) >= 2:
        last_name = name_parts[-1]
    else:
        last_name = random.choice(LAST_NAMES)

    # Yeni ilk isim (emekli oyuncunun ilk isminden farklı)
    retired_first = name_parts[0] if name_parts else ""
    new_first = random.choice([n for n in FIRST_NAMES if n != retired_first] or FIRST_NAMES)
    new_name = f"{new_first} {last_name}"

    # Pozisyon grubu
    group = map_to_group(retired_position)
    possible_positions = GROUP_POSITIONS.get(group, ["CM"])
    specific_position = retired_specific_position or random.choice(possible_positions)

    # Yaş: 15-18
    age = random.randint(15, 18)

    # Rating: Genç oyuncular için düşük başlangıç (40-55)
    base_rating = random.randint(40, 55)

    # Potansiyel: Emekli oyuncunun peak rating'ine dayalı
    # Emekli oyuncu ne kadar iyiyse, regen'in potansiyeli o kadar yüksek
    peak_factor = random.uniform(0.75, 1.0)
    potential = min(99, max(base_rating + 10, int(retired_rating * peak_factor)))

    # Hidden potential (biraz daha yüksek)
    hidden_potential = min(99, potential + random.randint(0, 10))

    # Rating hedefe göre ölçekle (genç oyuncular için düşük başlangıç)
    rating = base_rating

    # Temel stat'ler rating'e göre
    stats_base = {
        "speed": max(5, rating + random.randint(-10, 10)),
        "passing": max(5, rating + random.randint(-10, 10)),
        "shooting": max(5, rating + random.randint(-10, 10)),
        "defending": max(5, rating + random.randint(-10, 10)),
        "goalkeeping": max(1, rating + random.randint(-30, -10)) if group != "GK" else max(30, rating + random.randint(-5, 15)),
        "heading": max(5, rating + random.randint(-10, 10)),
        "vision": max(5, rating + random.randint(-10, 10)),
        "control": max(5, rating + random.randint(-10, 10)),
        "power": max(5, rating + random.randint(-10, 10)),
    }

    # Pazar değeri (genç, düşük rating = düşük değer)
    market_value = max(100_000, rating * 20_000 + potential * 5_000)

    # Maaş (genç oyuncular için düşük)
    salary = max(500, rating * 100)

    # Benzersiz ID üret
    player_id = f"regen-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}"

    regen = {
        "id": player_id,
        "name": new_name,
        "position": group,
        "specific_position": specific_position,
        "rating": rating,
        "potential": potential,
        "hidden_potential": hidden_potential,
        "age": age,
        "height": 170 + random.randint(0, 20) if group != "GK" else 183 + random.randint(0, 12),
        "weight": 65 + random.randint(0, 15),
        "market_value": market_value,
        "salary": salary,
        "nation": "Türkiye",
        "preferred_foot": random.choice(["Right", "Left"]),
        "speed": stats_base["speed"],
        "power": stats_base["power"],
        "passing": stats_base["passing"],
        "shooting": stats_base["shooting"],
        "defending": stats_base["defending"],
        "vision": stats_base["vision"],
        "control": stats_base["control"],
        "heading": stats_base["heading"],
        "goalkeeping": stats_base["goalkeeping"],
        "cond": 90 + random.randint(0, 10),
        "form": 40 + random.randint(0, 30),
        "morale": 60 + random.randint(0, 20),
        "confidence": 50 + random.randint(0, 20),
        "form_rating": 50,
        "injury_history": [],
        "match_ratings": [],
        "traits": [],
        "neg_traits": [],
        "personality_traits": [],
        "play_style": "",
        "trait_levels": {},
        "style_levels": {},
        "is_free_agent": True,
        "is_regen": True,
        "inspired_by_player_id": retired_id,
        "contract_end_week": None,
        "profile_id": None,
        "team_name": None,
    }

    return regen


def generate_regens(db: SupabaseClient, season_id: Optional[str] = None) -> dict:
    """
    Emekli oyuncular için regen oyuncular üretir.

    Args:
        db: SupabaseClient örneği
        season_id: Opsiyonel sezon ID (filtreleme için)

    Returns:
        Sonuç sözlüğü: {total_retired, regens_created, regens_by_group, details}
    """
    logger.info("Regen sistemi başlıyor...")

    result = {
        "total_retired": 0,
        "regens_created": 0,
        "regens_by_group": {"GK": 0, "DEF": 0, "MID": 0, "FWD": 0},
        "details": [],
        "errors": [],
    }

    # 1. Emekli oyuncuları bul (is_retiring = true)
    try:
        retired_players = db.select(
            "players",
            query="id, name, position, specific_position, rating, potential, age, profile_id",
            filters={"is_retiring": "eq.true"},
        )
    except Exception as e:
        logger.error(f"Emekli oyuncular sorgulanamadı: {e}")
        result["errors"].append(f"Emekli oyuncular sorgulanamadı: {e}")
        return result

    if not retired_players:
        logger.info("Emekli oyuncu bulunamadı. Regen üretimi atlanıyor.")
        return result

    result["total_retired"] = len(retired_players)
    logger.info(f"Toplam emekli oyuncu: {len(retired_players)}")

    # 2. Pozisyon grubuna göre say
    retired_by_group: dict[str, list] = defaultdict(list)
    for p in retired_players:
        group = map_to_group(p.get("position", "MID"))
        retired_by_group[group].append(p)

    logger.info(f"Emekli dağılımı: {dict((k, len(v)) for k, v in retired_by_group.items())}")

    # 3. Her grup için regen üret
    all_regens = []
    for group in ["GK", "DEF", "MID", "FWD"]:
        retired_in_group = retired_by_group.get(group, [])
        count = max(len(retired_in_group), 2)  # Minimum 2 her gruba

        logger.info(f"Grup {group}: {len(retired_in_group)} emekli, {count} regen üretilecek")

        for i in range(count):
            # İlgili emekli oyuncudan ilham al (varsa), yoksa rastgele
            if i < len(retired_in_group):
                inspired_by = retired_in_group[i]
            else:
                # Minimum ekleme — rastgele emekli oyuncudan ilham al
                inspired_by = random.choice(retired_in_group) if retired_in_group else {
                    "id": f"generic-{group}",
                    "name": f"Generic {group} Player",
                    "position": group,
                    "specific_position": random.choice(GROUP_POSITIONS.get(group, ["CM"])),
                    "rating": 55 + random.randint(0, 20),
                    "potential": 70,
                    "age": 35,
                }

            try:
                regen = generate_regen_player(inspired_by, db)
                all_regens.append(regen)
                result["regens_by_group"][group] += 1

                detail = (
                    f"Regen: {regen['name']} ({regen['specific_position']}, "
                    f"OVR {regen['rating']}, POT {regen['potential']}, yaş {regen['age']}) "
                    f"← İlham: {inspired_by.get('name', '?')} (OVR {inspired_by.get('rating', '?')})"
                )
                result["details"].append(detail)
                logger.info(detail)
            except Exception as e:
                err_msg = f"Regen üretim hatası ({group}, #{i}): {e}"
                result["errors"].append(err_msg)
                logger.error(err_msg)

    # 4. Regen oyuncuları veritabanına kaydet
    if all_regens:
        logger.info(f"Toplam {len(all_regens)} regen kaydediliyor...")
        for regen in all_regens:
            try:
                db.insert("players", regen)
                result["regens_created"] += 1
            except Exception as e:
                err_msg = f"Regen kaydetme hatası ({regen.get('name', '?')}): {e}"
                result["errors"].append(err_msg)
                logger.error(err_msg)

    logger.info(
        f"Regen sistemi tamamlandı: {result['regens_created']}/{len(all_regens)} regen kaydedildi, "
        f"{len(result['errors'])} hata"
    )

    # 5. Emekli oyuncuları sil (is_retiring temizle)
    try:
        retired_ids = [p.get("id") for p in retired_players if p.get("id")]
        if retired_ids:
            # Emekli oyuncuları silmek yerine is_retiring = false yap ve serbest bırak
            for rid in retired_ids:
                try:
                    db.update(
                        "players",
                        {
                            "is_retiring": False,
                            "profile_id": None,
                            "team_name": None,
                            "is_free_agent": True,
                        },
                        {"id": f"eq.{rid}"},
                    )
                except Exception as e:
                    logger.warning(f"Emekli oyuncu temizleme hatası ({rid}): {e}")
            logger.info(f"{len(retired_ids)} emekli oyuncu serbest bırakıldı")
    except Exception as e:
        logger.warning(f"Emekli oyuncu temizleme hatası: {e}")

    return result


# ─── CLI ───────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Siyah Beyaz FC — Regen System")
    parser.add_argument("--season-id", type=str, help="Sezon ID (opsiyonel)")
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("Supabase yapılandırması eksik!")
        sys.exit(1)

    db = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)

    try:
        result = generate_regens(db, season_id=args.season_id)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    finally:
        db.close()


if __name__ == "__main__":
    import json
    main()
