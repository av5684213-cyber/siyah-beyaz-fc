#!/usr/bin/env python3
"""
update_player_values.py
Oyuncu Değerleme Algoritması

Her hafta (Pazar gecesi) çalışır. Her oyuncu için current_price hesaplar.

Formül:
  Baz fiyat: overall * 1000
  Form etkisi: (form_rating - 50) / 2 (% artış/azalış)
  Sakatlık geçmişi: Son 3 ayda sakatlandıysa -%10, uzun sakatlık (7+ gün) -%20
  Yaş etkisi: 22 altı +%20 potansiyel bonusu, 30+ yaş -%10
  Performans: Geçen sezonki goller * 500, asistler * 300
  Nadirlik bonusu: Common x1, Rare x1.5, Epic x2, Legendary x3
  Minimum: 100, Maksimum: 10.000.000

Kullanım:
  python update_player_values.py
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

try:
    from supabase import create_client, Client
except ImportError:
    print("supabase-py kurulu değil: pip install supabase")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/tmp/update_player_values.log', mode='a'),
    ]
)
logger = logging.getLogger('update_player_values')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', 'https://jmxbyaamwbpnvgbnjbmo.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''))

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase ortam değişkenleri eksik!")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─── Sabitler ────────────────────────────────────────────────────────────
MIN_PRICE = 100
MAX_PRICE = 10_000_000
BASE_MULTIPLIER = 1000  # overall * 1000


def determine_rarity(rating: int, potential: int) -> str:
    """Oyuncu nadirliğini belirle"""
    if rating >= 85 or potential >= 90:
        return 'Legendary'
    elif rating >= 75 or potential >= 80:
        return 'Epic'
    elif rating >= 65 or potential >= 70:
        return 'Rare'
    return 'Common'


def calculate_player_price(player: Dict[str, Any]) -> int:
    """
    Bir oyuncunun pazar değerini hesapla

    Args:
        player: Oyuncu verisi (Supabase'den)

    Returns:
        Hesaplanan fiyat (int)
    """
    overall = player.get('rating', 50) or 50
    form_rating = player.get('form_rating', 50) or 50
    age = player.get('age', 25) or 25
    potential = player.get('potential', overall) or overall
    is_injured = bool(player.get('is_injured', False))
    injury_end_date = player.get('injury_end_date')

    # Son sezon performansı
    goals = player.get('goals', 0) or 0
    assists = player.get('assists', 0) or 0

    # 1. Baz fiyat
    base_price = overall * BASE_MULTIPLIER

    # 2. Form etkisi: (form_rating - 50) / 2 yüzdesel
    form_modifier = 1.0 + ((form_rating - 50) / 200.0)  # -0.25 ile +0.25 arası

    # 3. Sakatlık geçmişi
    injury_modifier = 1.0
    if is_injured and injury_end_date:
        try:
            end = datetime.fromisoformat(injury_end_date.replace('Z', '+00:00'))
            # Uzun sakatlık (7+ gün kaldıysa)
            days_remaining = (end - datetime.now(end.tzinfo)).days
            if days_remaining >= 7:
                injury_modifier = 0.80  # -%20
            else:
                injury_modifier = 0.90  # -%10
        except (ValueError, TypeError):
            injury_modifier = 0.90
    elif is_injured:
        injury_modifier = 0.90  # -%10

    # Sakatlık geçmişi kontrolü
    injury_history = player.get('injury_history')
    if injury_history:
        try:
            if isinstance(injury_history, str):
                history = json.loads(injury_history)
            else:
                history = injury_history

            three_months_ago = (datetime.now() - timedelta(days=90)).isoformat()
            recent_injuries = [h for h in history if h.get('date', '') >= three_months_ago]

            for inj in recent_injuries:
                duration = inj.get('duration_days', 0)
                if duration >= 7:
                    injury_modifier *= 0.90  # Ek -%10
                    break
                else:
                    injury_modifier *= 0.95  # Ek -%5
        except (json.JSONDecodeError, TypeError):
            pass

    # 4. Yaş etkisi
    age_modifier = 1.0
    if age < 22:
        age_modifier = 1.20  # +%20 potansiyel bonusu
    elif age >= 30:
        age_modifier = 0.90  # -%10
    elif age >= 33:
        age_modifier = 0.80  # -%20

    # 5. Performans (geçen sezonki goller ve asistler)
    performance_bonus = goals * 500 + assists * 300

    # 6. Nadirlik bonusu
    rarity = determine_rarity(overall, potential)
    rarity_multipliers = {
        'Common': 1.0,
        'Rare': 1.5,
        'Epic': 2.0,
        'Legendary': 3.0,
    }
    rarity_modifier = rarity_multipliers.get(rarity, 1.0)

    # Toplam hesaplama
    total_price = base_price * form_modifier * injury_modifier * age_modifier * rarity_modifier + performance_bonus

    # Minimum ve maksimum sınırlar
    total_price = max(MIN_PRICE, min(MAX_PRICE, int(total_price)))

    return total_price


def update_all_player_values() -> Dict[str, Any]:
    """Tüm oyuncuların değerlerini güncelle"""
    logger.info("Oyuncu değer güncelleme başlatılıyor...")

    try:
        result = supabase.table('players').select('*').execute()
        players = result.data or []
    except Exception as e:
        logger.error(f"Oyuncular alınamadı: {e}")
        return {"success": False, "error": str(e)}

    if not players:
        logger.info("Güncellenecek oyuncu yok")
        return {"success": True, "updated": 0}

    total_updated = 0
    total_failed = 0
    price_changes = []
    errors = []

    # Toplu güncelleme için hazırlık
    batch_updates = []

    for player in players:
        try:
            old_price = player.get('market_value', 0) or 0
            new_price = calculate_player_price(player)
            rarity = determine_rarity(player.get('rating', 50) or 50, player.get('potential', 50) or 50)

            batch_updates.append({
                'id': player['id'],
                'market_value': new_price,
            })

            if old_price != new_price:
                price_changes.append({
                    'player': player.get('name', ''),
                    'old': old_price,
                    'new': new_price,
                    'change': new_price - old_price,
                    'rarity': rarity,
                })

            total_updated += 1

        except Exception as e:
            total_failed += 1
            errors.append(f"Player {player.get('id', 'unknown')}: {e}")

    # Toplu güncelleme (batch)
    for update in batch_updates:
        try:
            supabase.table('players').update({
                'market_value': update['market_value'],
            }).eq('id', update['id']).execute()
        except Exception as e:
            total_failed += 1
            errors.append(f"Update {update['id']}: {e}")

    # Özet
    avg_old = sum(p['old'] for p in price_changes) / max(1, len(price_changes))
    avg_new = sum(p['new'] for p in price_changes) / max(1, len(price_changes))

    result = {
        "success": True,
        "total_players": len(players),
        "updated": total_updated,
        "failed": total_failed,
        "price_changes_count": len(price_changes),
        "avg_old_price": round(avg_old),
        "avg_new_price": round(avg_new),
        "sample_changes": price_changes[:10],
        "errors": errors[:5] if errors else None,
        "timestamp": datetime.now().isoformat(),
    }

    logger.info(
        f"Değer güncelleme tamamlandı: {total_updated} oyuncu, "
        f"{len(price_changes)} fiyat değişti, "
        f"ortalama: {round(avg_old):,} → {round(avg_new):,}"
    )

    # Logla
    try:
        supabase.table('error_logs').insert({
            'source': 'python',
            'level': 'info',
            'message': f'Oyuncu değer güncelleme: {total_updated} oyuncu işlendi',
            'context': result,
        }).execute()
    except Exception:
        pass

    return result


if __name__ == '__main__':
    result = update_all_player_values()
    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
