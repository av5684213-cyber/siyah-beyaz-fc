#!/usr/bin/env python3
"""
update_player_values.py v2
Oyuncu Değerleme Algoritması — Detaylı Formül

Her hafta (Pazar gecesi) çalışır. Her oyuncu için current_price hesaplar.

Formül:
  1. Baz fiyat: overall * 1000
  2. Form etkisi: (form_rating - 50) / 2 yüzdesel artış/azalış
  3. Sakatlık geçmişi: Son 3 aydaki sakatlık gün sayısı → her 5 gün -%5, max -%30
  4. Yaş etkisi: 18-21 → +%20, 22-27 → +%10, 28-31 → 0, 32-35 → -%15, 36+ → -%30
  5. Performans: Geçen sezonki goller * 500, asistler * 300
  6. Nadirlik bonusu: Common x1, Rare x1.5, Epic x2, Legendary x3
  7. Minimum: 100, Maksimum: 10.000.000

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


def calculate_injury_modifier(player: Dict[str, Any]) -> float:
    """
    Sakatlık geçmişi etkisini hesaplar (v2 detaylı).

    Kural: Son 3 aydaki sakatlık gün sayısı.
    Her 5 gün sakatlık için -%5, max -%30.

    Returns:
        Float modifier (0.70 ile 1.0 arası)
    """
    modifier = 1.0

    try:
        # Mevcut sakatlık durumu
        is_injured = bool(player.get('is_injured', False))
        injury_end_date = player.get('injury_end_date')

        if is_injured:
            if injury_end_date:
                try:
                    end = datetime.fromisoformat(str(injury_end_date).replace('Z', '+00:00'))
                    days_remaining = (end - datetime.now(end.tzinfo)).days
                    if days_remaining >= 7:
                        modifier *= 0.85  # Uzun süreli sakatlık -%15
                    else:
                        modifier *= 0.95  # Kısa süreli sakatlık -%5
                except (ValueError, TypeError) as e:
                    logger.warning(f"Sakatlık bitiş tarihi parse hatası, varsayılan -%%5 uygulandı: {e}")
                    modifier *= 0.95
            else:
                modifier *= 0.95

        # Sakatlık geçmişi kontrolü
        injury_history = player.get('injury_history')
        if injury_history:
            try:
                if isinstance(injury_history, str):
                    history = json.loads(injury_history)
                else:
                    history = injury_history

                if isinstance(history, list):
                    three_months_ago = (datetime.now() - timedelta(days=90)).isoformat()
                    recent_injuries = [
                        h for h in history
                        if isinstance(h, dict) and h.get('date', '') >= three_months_ago
                    ]

                    # Son 3 aydaki toplam sakatlık gün sayısı
                    total_injury_days = 0
                    for inj in recent_injuries:
                        duration = inj.get('duration_days', 0)
                        if isinstance(duration, (int, float)):
                            total_injury_days += int(duration)

                    # Her 5 gün için -%5, max -%30
                    if total_injury_days > 0:
                        penalty_pct = min(30, (total_injury_days // 5) * 5)
                        modifier *= (1 - penalty_pct / 100)
                        logger.debug(
                            f"Sakatlık geçmişi: {total_injury_days} gün, "
                            f"-%{penalty_pct} etki"
                        )

            except (json.JSONDecodeError, TypeError, AttributeError) as e:
                logger.warning(f"Sakatlık geçmişi parse hatası, injury_days=0 kabul edildi: {e}")

    except Exception as e:
        # Genel hata durumunda modifier etkisi uygulanmaz (1.0 kalır)
        logger.warning(f"Sakatlık modifier hesaplama genel hatası, etkisiz kabul edildi: {e}")

    # Modifier asgari 0.70 olsun (-%30 max)
    modifier = max(0.70, modifier)
    return modifier


def calculate_age_modifier(age: int) -> float:
    """
    Yaş etkisini hesaplar (v2 detaylı).

    Kural:
      18-21 yaş: +%20 (potansiyel bonusu)
      22-27 yaş: +%10 (prime)
      28-31 yaş: 0 (sabit)
      32-35 yaş: -%15
      36+ yaş: -%30

    Returns:
        Float modifier
    """
    if 18 <= age <= 21:
        return 1.20  # +%20 potansiyel bonusu
    elif 22 <= age <= 27:
        return 1.10  # +%10 prime
    elif 28 <= age <= 31:
        return 1.00  # Sabit
    elif 32 <= age <= 35:
        return 0.85  # -%15
    elif age >= 36:
        return 0.70  # -%30
    else:
        # 18 yaş altı (nadir ama olabilir)
        return 1.25  # +%25 çok genç potansiyel


def calculate_form_modifier(form_rating: int) -> float:
    """
    Form etkisini hesaplar.

    Kural: (form_rating - 50) / 2 yüzdesel artış/azalış
    50 referans değer. Form 80 ise +%15, form 20 ise -%15

    Returns:
        Float modifier
    """
    form_pct = (form_rating - 50) / 2.0  # -25 ile +25 arası
    return 1.0 + (form_pct / 100.0)


def get_season_stats(player_id: str, player: Dict[str, Any]) -> Dict[str, int]:
    """
    Geçen sezonki gol ve asist istatistiklerini çeker.

    Önce season_stats tablosundan, yoksa player'ın kendi alanlarından alır.
    season_stats tablosu yoksa veya sorgu başarısız olursa
    varsayılan olarak goals=0, assists=0 kabul eder.

    Returns:
        {"goals": int, "assists": int}
    """
    goals = 0
    assists = 0

    # season_stats tablosundan çekmeyi dene
    try:
        result = supabase.table('season_stats').select('goals,assists').eq('player_id', player_id).limit(1).execute()
        if result.data and len(result.data) > 0:
            goals = result.data[0].get('goals', 0) or 0
            assists = result.data[0].get('assists', 0) or 0
            return {"goals": int(goals), "assists": int(assists)}
    except Exception as e:
        logger.warning(
            f"season_stats tablosundan veri alınamadı (player_id={player_id}), "
            f"goals=0, assists=0 kabul edildi: {e}"
        )

    # Fallback: player'ın kendi alanlarından al
    try:
        goals = player.get('goals', 0) or 0
        assists = player.get('assists', 0) or 0
    except Exception as e:
        logger.warning(
            f"Player fallback istatistik okunamadı (player_id={player_id}), "
            f"goals=0, assists=0 kabul edildi: {e}"
        )
        goals = 0
        assists = 0

    return {"goals": int(goals), "assists": int(assists)}


def calculate_player_price(player: Dict[str, Any]) -> int:
    """
    Bir oyuncunun pazar değerini hesaplar (v2 — detaylı formül).

    Formül:
      total = base_price * form_modifier * injury_modifier * age_modifier * rarity_modifier + performance_bonus

    Args:
        player: Oyuncu verisi (Supabase'den)

    Returns:
        Hesaplanan fiyat (int), 100 ile 10.000.000 arası
    """
    overall = player.get('rating', 50) or 50
    form_rating = player.get('form_rating', 50) or 50
    age = player.get('age', 25) or 25
    potential = player.get('potential', overall) or overall
    player_id = player.get('id', '')

    # 1. Baz fiyat: overall * 1000
    base_price = overall * BASE_MULTIPLIER

    # 2. Form etkisi: (form_rating - 50) / 2 yüzdesel
    form_modifier = calculate_form_modifier(form_rating)

    # 3. Sakatlık geçmişi: her 5 gün -%5, max -%30
    injury_modifier = calculate_injury_modifier(player)

    # 4. Yaş etkisi
    age_modifier = calculate_age_modifier(age)

    # 5. Performans (geçen sezonki goller ve asistler)
    stats = get_season_stats(player_id, player)
    performance_bonus = stats["goals"] * 500 + stats["assists"] * 300

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
    total_price = (
        base_price
        * form_modifier
        * injury_modifier
        * age_modifier
        * rarity_modifier
        + performance_bonus
    )

    # 7. Minimum ve maksimum sınırlar
    total_price = max(MIN_PRICE, min(MAX_PRICE, int(total_price)))

    logger.debug(
        f"Oyuncu {player.get('name', '?')}: "
        f"base={base_price:,} form={form_modifier:.2f} "
        f"injury={injury_modifier:.2f} age={age_modifier:.2f} "
        f"rarity={rarity_modifier}({rarity}) "
        f"perf=+{performance_bonus:,} → {total_price:,}"
    )

    return total_price


def update_all_player_values() -> Dict[str, Any]:
    """Tüm oyuncuların değerlerini güncelle"""
    logger.info("Oyuncu değer güncelleme başlatılıyor (v2)...")

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

    for player in players:
        try:
            old_price = player.get('current_price', 0) or player.get('market_value', 0) or 0

            # Fiyat hesaplama — hata durumunda eski fiyatı koru
            try:
                new_price = calculate_player_price(player)
            except (ZeroDivisionError, ValueError, TypeError) as calc_err:
                logger.error(
                    f"Fiyat hesaplama hatası (player_id={player.get('id', '?')}), "
                    f"eski fiyat korunuyor ({old_price}): {calc_err}"
                )
                new_price = old_price if old_price > 0 else MIN_PRICE
            except Exception as calc_err:
                logger.error(
                    f"Fiyat hesaplama beklenmeyen hata (player_id={player.get('id', '?')}), "
                    f"eski fiyat korunuyor ({old_price}): {calc_err}"
                )
                new_price = old_price if old_price > 0 else MIN_PRICE

            rarity = determine_rarity(player.get('rating', 50) or 50, player.get('potential', 50) or 50)

            # current_price alanını güncelle
            try:
                supabase.table('players').update({
                    'current_price': new_price,
                }).eq('id', player['id']).execute()
            except Exception:
                # current_price alanı yoksa market_value kullan
                try:
                    supabase.table('players').update({
                        'market_value': new_price,
                    }).eq('id', player['id']).execute()
                except Exception as update_err:
                    total_failed += 1
                    errors.append(f"Update {player.get('id', 'unknown')}: {update_err}")
                    continue

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
            'message': f'Oyuncu değer güncelleme (v2): {total_updated} oyuncu işlendi',
            'context': result,
        }).execute()
    except Exception:
        pass

    return result


if __name__ == '__main__':
    result = update_all_player_values()
    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
