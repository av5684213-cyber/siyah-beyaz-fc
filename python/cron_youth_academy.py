#!/usr/bin/env python3
"""
cron_youth_academy.py
Gençlik Akademisi Cron Servisi

- Sezon başında (her 34 haftada bir) tetiklenir
- Her kullanıcının akademi seviyesine göre genç oyuncu üretir
- Genç oyuncuların potential alanı olur ve haftalık antrenmanlarda potential'a göre OVR artar

Kullanım:
  python cron_youth_academy.py --action season-intake
  python cron_youth_academy.py --action weekly-training
"""

import os
import sys
import json
import random
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

# Supabase client
try:
    from supabase import create_client, Client
except ImportError:
    print("supabase-py kurulu değil: pip install supabase")
    sys.exit(1)

# ─── Logging ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/tmp/youth_academy_cron.log', mode='a'),
    ]
)
logger = logging.getLogger('youth_academy_cron')

# ─── Supabase Config ──────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get('SUPABASE_URL') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = (
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    or os.environ.get('SUPABASE_ANON_KEY')
    or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
)

if not SUPABASE_URL:
    logger.error("SUPABASE_URL ortam değişkeni gerekli! (SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_URL)")
    sys.exit(1)
if not SUPABASE_KEY:
    logger.error("SUPABASE_KEY ortam değişkeni gerekli! (SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY veya NEXT_PUBLIC_SUPABASE_ANON_KEY)")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ═══════════════════════════════════════════════════════════════════════════
# TÜRK İSİM VERİTABANI
# ═══════════════════════════════════════════════════════════════════════════

TURK_FIRST_NAMES_MALE = [
    "Ahmet", "Mehmet", "Ali", "Mustafa", "Hasan", "İbrahim", "Emre", "Burak",
    "Oğuz", "Kerem", "Cem", "Deniz", "Efe", "Arda", "Baran", "Berk",
    "Can", "Çağatay", "Doruk", "Ege", "Enes", "Furkan", "Gökhan", "Hakan",
    "Kağan", "Levent", "Mert", "Onur", "Polat", "Rıza", "Selim", "Tolga",
    "Uğur", "Volkan", "Yusuf", "Ömer", "Şahin", "İlhan", "Batu", "Cüneyt",
]

TURK_FIRST_NAMES_FEMALE = [
    "Ayşe", "Fatma", "Zeynep", "Elif", "Merve", "Esra", "Büşra", "Kübra",
]

TURK_LAST_NAMES = [
    "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk",
    "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara",
    "Koç", "Kurt", "Özkan", "Şimşek", "Polat", "Korkmaz", "Erdem", "Erdoğan",
    "Avcı", "Turan", "Akın", "Balcı", "Taş", "Keleş", "Ünal", "Sönmez",
    "Ergün", "Keskin", "Uçar", "Acar", "Tosun", "Güneş", "Özer", "Sezer",
]

FOREIGN_FIRST_NAMES = [
    "Lucas", "Mateo", "Santiago", "André", "Felipe", "Rafael", "João", "Pedro",
    "Marco", "Alessandro", "Luca", "Nicolò", "Eduardo", "Carlos", "Diego",
    "Yuki", "Haruto", "Sota", "Kenji", "Riku", "Min-jun", "Ji-hoon",
]

FOREIGN_LAST_NAMES = [
    "Silva", "Santos", "Oliveira", "Fernandes", "Pereira", "Rossi", "Bianchi",
    "Romero", "Gonzalez", "Lopez", "Martinez", "Tanaka", "Yamamoto", "Kim", "Park",
]


# ═══════════════════════════════════════════════════════════════════════════
# GENÇ OYUNCU ÜRETİMİ
# ═══════════════════════════════════════════════════════════════════════════

def generate_youth_player_name(region: str = 'TR') -> str:
    """Bölgeye göre rastgele genç oyuncu ismi üret"""
    if region == 'TR' or random.random() < 0.7:
        first = random.choice(TURK_FIRST_NAMES_MALE)
        last = random.choice(TURK_LAST_NAMES)
    else:
        first = random.choice(FOREIGN_FIRST_NAMES)
        last = random.choice(FOREIGN_LAST_NAMES)
    return f"{first} {last}"


def generate_youth_player(
    academy_level: int,
    profile_id: str,
    team_name: str,
    region: str = 'TR',
    force_position: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Akademi seviyesine göre genç oyuncu üret

    Args:
        academy_level: Akademi seviyesi (1-10)
        profile_id: Sahip profil ID
        team_name: Takım adı
        region: Bölge kodu
        force_position: Zorla mevki (None = rastgele)
    """
    # Mevki seçimi
    positions = ['GK', 'DEF', 'MID', 'FWD']
    position_weights = [2, 6, 6, 5]
    if force_position and force_position in positions:
        position = force_position
    else:
        position = random.choices(positions, weights=position_weights, k=1)[0]

    # Spesifik mevki
    specific_positions = {
        'GK': ['GK'],
        'DEF': ['CB', 'LB', 'RB', 'LWB', 'RWB'],
        'MID': ['CDM', 'CM', 'CAM', 'LM', 'RM'],
        'FWD': ['LW', 'RW', 'CF', 'ST'],
    }
    specific_position = random.choice(specific_positions.get(position, ['CM']))

    # Yaş (14-19 arası, akademi seviyesi yüksekse daha düşük yaş + yüksek potansiyel)
    age = random.randint(14, min(19, 14 + academy_level // 3))

    # Rating hesaplama (akademi seviyesi etkisi)
    base_rating = 35 + academy_level * 3
    rating = max(30, min(75, base_rating + random.randint(-5, 10)))

    # Potential (akademi seviyesi yüksekse daha yüksek potansiyel)
    potential_base = 60 + academy_level * 3
    potential = max(55, min(95, potential_base + random.randint(-5, 10)))

    # Hidden potential (gerçek potansiyel, daha yüksek olabilir)
    hidden_potential = max(potential, min(99, potential + random.randint(0, 10)))

    # Wonderkid şansı (seviye 7+ ise %10, seviye 10 ise %20)
    is_wonderkid = False
    if academy_level >= 7 and random.random() < (0.10 + (academy_level - 7) * 0.03):
        is_wonderkid = True
        potential = min(95, potential + 15)
        hidden_potential = min(99, hidden_potential + 10)
        rating = max(rating, 55)

    # Gelişim eğrisi
    development_curves = ['early', 'normal', 'late', 'injury_prone']
    development_weights = [0.15, 0.55, 0.20, 0.10]
    if is_wonderkid:
        development_weights = [0.30, 0.50, 0.15, 0.05]
    development_curve = random.choices(development_curves, weights=development_weights, k=1)[0]

    # Temel istatistikler (mevkiye göre)
    stats: Dict[str, int] = {}
    if position == 'GK':
        stats = {
            'goalkeeping': max(30, rating + random.randint(-5, 5)),
            'reflexes': max(30, rating + random.randint(-3, 7)),
            'positioning': max(30, rating + random.randint(-5, 5)),
            'jumping': max(30, rating + random.randint(-3, 5)),
            'composure': max(30, rating + random.randint(-5, 3)),
        }
    elif position == 'DEF':
        stats = {
            'defending': max(30, rating + random.randint(-5, 5)),
            'tackling': max(30, rating + random.randint(-3, 5)),
            'heading': max(30, rating + random.randint(-5, 5)),
            'marking': max(30, rating + random.randint(-3, 5)),
            'positioning': max(30, rating + random.randint(-5, 3)),
        }
    elif position == 'MID':
        stats = {
            'passing': max(30, rating + random.randint(-5, 5)),
            'vision': max(30, rating + random.randint(-3, 5)),
            'firstTouch': max(30, rating + random.randint(-5, 5)),
            'stamina': max(30, rating + random.randint(-3, 5)),
            'workRate': max(30, rating + random.randint(-5, 5)),
        }
    else:  # FWD
        stats = {
            'shooting': max(30, rating + random.randint(-5, 5)),
            'finishing': max(30, rating + random.randint(-3, 5)),
            'speed': max(30, rating + random.randint(-5, 5)),
            'dribbling': max(30, rating + random.randint(-3, 5)),
            'offTheBall': max(30, rating + random.randint(-5, 3)),
        }

    # Kategori yaşa göre
    if age <= 16:
        category = 'U17'
    elif age <= 18:
        category = 'U19'
    else:
        category = 'U21'

    player_id = f"youth_{profile_id[:8]}_{random.randint(1000, 9999)}"

    player = {
        'id': player_id,
        'profile_id': profile_id,
        'name': generate_youth_player_name(region),
        'age': age,
        'position': position,
        'specific_position': specific_position,
        'rating': rating,
        'potential': potential,
        'hidden_potential': hidden_potential,
        'academy_level': academy_level,
        'category': category,
        'is_wonderkid': is_wonderkid,
        'development_curve': development_curve,
        'join_date': datetime.now().isoformat(),
        'weekly_training_hours': 15 + academy_level,
        'total_training_weeks': 0,
        'stats_gained_this_season': {},
        'personality_traits': json.dumps([]),
        'traits': json.dumps([]),
        'trait_levels': json.dumps({}),
        'scout_report': None,
        'injured': False,
        'injury_weeks_remaining': 0,
        'cond': 85 + random.randint(-5, 10),
        'form': 60 + random.randint(-10, 15),
        'morale': 70 + random.randint(-10, 10),
        'confidence': 60 + random.randint(-10, 15),
        'stats': json.dumps(stats),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
    }

    return player


# ═══════════════════════════════════════════════════════════════════════════
# SEZON ALIMI (Season Intake)
# ═══════════════════════════════════════════════════════════════════════════

def process_season_intake(season_id: str) -> Dict[str, Any]:
    """
    Sezon başında tüm kullanıcılar için genç oyuncu üret

    Her kullanıcı için:
    - Akademi seviyesine göre 1-3 genç oyuncu üret
    - youth_players tablosuna ekle
    - profiles.last_youth_intake_season güncelle
    """
    logger.info(f"Sezon alımı başlatılıyor: {season_id}")

    # Tüm kullanıcıları getir
    try:
        result = supabase.table('profiles').select('id, academy_level, team_name, region, last_youth_intake_season').execute()
        profiles = result.data or []
    except Exception as e:
        logger.error(f"Profiller alınamadı: {e}")
        return {"success": False, "error": str(e)}

    total_players_created = 0
    total_profiles_processed = 0
    errors = []

    for profile in profiles:
        profile_id = profile['id']
        academy_level = profile.get('academy_level', 1) or 1
        team_name = profile.get('team_name', 'Bilinmeyen')
        region = profile.get('region', 'TR') or 'TR'

        # Bu sezon zaten alınmışsa atla
        if profile.get('last_youth_intake_season') == season_id:
            continue

        try:
            # Akademi seviyesine göre oyuncu sayısı
            if academy_level >= 8:
                num_players = 3
            elif academy_level >= 4:
                num_players = 2
            else:
                num_players = 1

            # Mevki dengesi
            positions = ['GK', 'DEF', 'MID', 'FWD']
            chosen_positions = []
            for i in range(num_players):
                if i == 0 and academy_level >= 6:
                    # Seviye 6+ ise ilk oyuncunun mevkisini seçebilir
                    chosen_positions.append(random.choice(positions))
                else:
                    chosen_positions.append(random.choice(positions))

            players_to_insert = []
            for pos in chosen_positions:
                player = generate_youth_player(
                    academy_level=academy_level,
                    profile_id=profile_id,
                    team_name=team_name,
                    region=region,
                    force_position=pos,
                )
                players_to_insert.append(player)

            if players_to_insert:
                insert_result = supabase.table('youth_players').insert(players_to_insert).execute()
                total_players_created += len(players_to_insert)

            # last_youth_intake_season güncelle
            supabase.table('profiles').update({
                'last_youth_intake_season': season_id,
            }).eq('id', profile_id).execute()

            total_profiles_processed += 1
            logger.info(f"  {team_name} (Lv.{academy_level}): {len(players_to_insert)} genç oyuncu üretildi")

        except Exception as e:
            error_msg = f"Profile {profile_id} ({team_name}): {e}"
            logger.error(error_msg)
            errors.append(error_msg)

    result = {
        "success": True,
        "season_id": season_id,
        "profiles_processed": total_profiles_processed,
        "players_created": total_players_created,
        "errors": errors if errors else None,
        "timestamp": datetime.now().isoformat(),
    }

    logger.info(f"Sezon alımı tamamlandı: {total_players_created} oyuncu, {total_profiles_processed} profil")

    # Logla
    try:
        supabase.table('error_logs').insert({
            'source': 'python',
            'level': 'info',
            'message': f'Sezon alımı: {total_players_created} genç oyuncu üretildi',
            'context': result,
        }).execute()
    except Exception:
        pass

    return result


# ═══════════════════════════════════════════════════════════════════════════
# HAFTALIK ANTRENMAN (Weekly Training)
# ═══════════════════════════════════════════════════════════════════════════

def process_weekly_training() -> Dict[str, Any]:
    """
    Haftalık genç oyuncu antrenmanı

    Her genç oyuncu için:
    - potential'a göre OVR artışı hesapla
    - development_curve'e göre büyüme hızını ayarla
    - İstatistikleri güncelle
    - Yaş kontrolü (21'e ulaşınca otomatik terfi veya serbest bırakma)
    """
    logger.info("Haftalık antrenman başlatılıyor")

    # Tüm genç oyuncuları getir
    try:
        result = supabase.table('youth_players').select('*').execute()
        youth_players = result.data or []
    except Exception as e:
        logger.error(f"Genç oyuncular alınamadı: {e}")
        return {"success": False, "error": str(e)}

    total_trained = 0
    total_promoted = 0
    total_released = 0
    errors = []

    for yp in youth_players:
        try:
            age = yp.get('age', 16)
            rating = yp.get('rating', 50)
            potential = yp.get('potential', 70)
            hidden_potential = yp.get('hidden_potential', 75)
            development_curve = yp.get('development_curve', 'normal')
            injured = yp.get('injured', False)
            injured = bool(injured) if injured is not None else False

            # Sakatsa antrenman yapma
            if injured:
                # Sakatlık süresini azalt
                injury_weeks = yp.get('injury_weeks_remaining', 0) or 0
                if injury_weeks > 1:
                    supabase.table('youth_players').update({
                        'injury_weeks_remaining': injury_weeks - 1,
                    }).eq('id', yp['id']).execute()
                else:
                    supabase.table('youth_players').update({
                        'injured': False,
                        'injury_weeks_remaining': 0,
                    }).eq('id', yp['id']).execute()
                continue

            # Yaş kontrolü - 21'e ulaşınca
            if age >= 21:
                # Rating 60+ ise A takıma terfi (players tablosuna ekle)
                if rating >= 60:
                    _promote_to_senior(yp)
                    total_promoted += 1
                else:
                    # Serbest bırak
                    supabase.table('youth_players').delete().eq('id', yp['id']).execute()
                    total_released += 1
                continue

            # OVR artışı hesapla
            # Potential'a ne kadar yakınsa o kadar yavaş büyüme
            gap = potential - rating
            if gap <= 0:
                growth = random.randint(0, 1)  # Potential'a ulaştı
            else:
                base_growth = gap * 0.08  # %8 potansiyel farkı kadar büyüme

                # Development curve etkisi
                curve_modifiers = {
                    'early': 1.4,
                    'normal': 1.0,
                    'late': 0.6,
                    'injury_prone': 0.5,
                }
                modifier = curve_modifiers.get(development_curve, 1.0)
                growth = max(0, round(base_growth * modifier + random.uniform(-0.5, 0.5)))

            new_rating = min(potential, rating + int(growth))
            new_age = age + 1 if random.random() < 0.08 else age  # ~8 haftada bir yaş artar (yaklaşık 2 ay)

            # İstatistik güncellemesi
            stats = yp.get('stats', {})
            if isinstance(stats, str):
                try:
                    stats = json.loads(stats)
                except json.JSONDecodeError:
                    stats = {}

            # Her hafta rastgele 1-2 istatistik artar
            stat_keys = list(stats.keys())
            if stat_keys:
                num_improvements = random.randint(1, min(2, len(stat_keys)))
                for _ in range(num_improvements):
                    key = random.choice(stat_keys)
                    stats[key] = min(99, stats[key] + random.randint(1, 3))

            # Antrenman haftalarını güncelle
            training_weeks = (yp.get('total_training_weeks', 0) or 0) + 1

            # Kondisyon, form güncelle
            new_cond = min(100, max(50, (yp.get('cond', 85) or 85) + random.randint(-5, 5)))
            new_form = min(100, max(20, (yp.get('form', 60) or 60) + random.randint(-5, 10)))

            # Sakatlık şansı (%3, injury_prone ise %8)
            injury_chance = 0.08 if development_curve == 'injury_prone' else 0.03
            new_injured = random.random() < injury_chance
            new_injury_weeks = 0
            if new_injured:
                new_injury_weeks = random.randint(1, 4)
                new_cond = max(30, new_cond - 20)

            # Kaydet
            update_data = {
                'rating': new_rating,
                'age': new_age,
                'total_training_weeks': training_weeks,
                'stats': json.dumps(stats),
                'cond': new_cond,
                'form': new_form,
                'injured': new_injured,
                'injury_weeks_remaining': new_injury_weeks,
                'updated_at': datetime.now().isoformat(),
            }

            supabase.table('youth_players').update(update_data).eq('id', yp['id']).execute()
            total_trained += 1

        except Exception as e:
            errors.append(f"Player {yp.get('id', 'unknown')}: {e}")

    result = {
        "success": True,
        "trained": total_trained,
        "promoted": total_promoted,
        "released": total_released,
        "errors": errors if errors else None,
        "timestamp": datetime.now().isoformat(),
    }

    logger.info(f"Haftalık antrenman tamamlandı: {total_trained} eğitildi, {total_promoted} terfi, {total_released} serbest")

    return result


def _promote_to_senior(youth_player: Dict[str, Any]) -> None:
    """Genç oyuncuyu A takıma terfi et (players tablosuna ekle)"""
    stats = youth_player.get('stats', {})
    if isinstance(stats, str):
        try:
            stats = json.loads(stats)
        except json.JSONDecodeError:
            stats = {}

    senior_player = {
        'id': f"p_{youth_player['profile_id'][:8]}_{random.randint(1000, 9999)}",
        'profile_id': youth_player['profile_id'],
        'name': youth_player.get('name', 'Bilinmeyen'),
        'position': youth_player.get('position', 'MID'),
        'specific_position': youth_player.get('specific_position', 'CM'),
        'rating': youth_player.get('rating', 60),
        'age': youth_player.get('age', 19),
        'potential': youth_player.get('potential', 70),
        'hidden_potential': youth_player.get('hidden_potential', 75),
        'market_value': youth_player.get('rating', 60) * 50000,
        'salary': max(5000, youth_player.get('rating', 60) * 200),
        'defending': stats.get('defending', youth_player.get('rating', 60)),
        'passing': stats.get('passing', youth_player.get('rating', 60)),
        'shooting': stats.get('shooting', youth_player.get('rating', 60)),
        'speed': stats.get('speed', youth_player.get('rating', 60)),
        'power': stats.get('power', youth_player.get('rating', 60)),
        'cond': youth_player.get('cond', 85) or 85,
        'form': youth_player.get('form', 60) or 60,
        'morale': youth_player.get('morale', 70) or 70,
        'confidence': youth_player.get('confidence', 60) or 60,
        'traits': json.dumps([]),
        'neg_traits': json.dumps([]),
        'scouted': True,
    }

    try:
        supabase.table('players').insert(senior_player).execute()
        supabase.table('youth_players').delete().eq('id', youth_player['id']).execute()
        logger.info(f"  {youth_player.get('name')} A takıma terfi etti (OVR: {youth_player.get('rating')})")
    except Exception as e:
        logger.error(f"  Terfi hatası: {e}")


# ═══════════════════════════════════════════════════════════════════════════
# ANA FONKSİYON
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Gençlik Akademisi Cron Servisi')
    parser.add_argument('--action', choices=['season-intake', 'weekly-training'], required=True,
                        help='Çalıştırılacak aksiyon')
    parser.add_argument('--season-id', type=str, default=None,
                        help='Sezon ID (season-intake için gerekli)')

    args = parser.parse_args()

    if args.action == 'season-intake':
        if not args.season_id:
            args.season_id = f"S{datetime.now().year}_{datetime.now().month:02d}"
        result = process_season_intake(args.season_id)
    elif args.action == 'weekly-training':
        result = process_weekly_training()
    else:
        result = {"success": False, "error": "Bilinmeyen aksiyon"}

    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
