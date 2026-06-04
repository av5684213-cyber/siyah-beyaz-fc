#!/usr/bin/env python3
"""
season_end_trigger.py
Sezon Sonu Tetikleyicisi

- Hafta 34 tamamlandığında otomatik çalışır
- Ödül hesaplamalarını çalıştırır (golden_boot, top_assists, mvp, best_gk, best_young, fair_play, champion)
- Ödülleri season_awards tablosuna yazar
- Kazanan oyunculara player_achievements tablosuna rozet ekler
- hall_of_fame tablosunu günceller
- Yeni sezonu başlatır

Kullanım:
  python season_end_trigger.py --action check
  python season_end_trigger.py --action force-end --season-id S2026_01
"""

import os
import sys
import json
import random
import logging
from datetime import datetime
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
        logging.FileHandler('/tmp/season_end_trigger.log', mode='a'),
    ]
)
logger = logging.getLogger('season_end_trigger')

# Gençlik Akademisi entegrasyonu
# cron_youth_academy.py'yi import etmeye çalış, başarısız olursa yerel fonksiyon kullan
_youth_academy_available = False
try:
    from cron_youth_academy import process_season_intake as _youth_season_intake
    _youth_academy_available = True
    logger.info("cron_youth_academy.process_season_intake import edildi")
except ImportError:
    logger.info("cron_youth_academy bulunamadı, yerel genç oyuncu üretim fonksiyonu kullanılacak")

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

GAMES_PER_SEASON = 34


# ═══════════════════════════════════════════════════════════════════════════
# SEZON TAMAMLANMA KONTROLÜ
# ═══════════════════════════════════════════════════════════════════════════

def check_season_completion() -> Dict[str, Any]:
    """Tüm liglerde sezon tamamlanmış mı kontrol et"""
    try:
        result = supabase.table('league_teams').select('league_name, played').execute()
        teams = result.data or []
    except Exception as e:
        logger.error(f"Lig takımları alınamadı: {e}")
        return {"completed": False, "error": str(e)}

    if not teams:
        return {"completed": False, "message": "Lig takımı bulunamadı"}

    # Lig bazında grupla
    leagues: Dict[str, Dict] = {}
    for team in teams:
        league_name = team.get('league_name', 'unknown')
        played = team.get('played', 0) or 0
        if league_name not in leagues:
            leagues[league_name] = {"total_teams": 0, "all_played": True}
        leagues[league_name]["total_teams"] += 1
        if played < GAMES_PER_SEASON:
            leagues[league_name]["all_played"] = False

    completed_leagues = [name for name, data in leagues.items() if data["all_played"]]
    incomplete_leagues = [name for name, data in leagues.items() if not data["all_played"]]

    return {
        "completed": len(completed_leagues) > 0 and len(incomplete_leagues) == 0,
        "completed_leagues": completed_leagues,
        "incomplete_leagues": incomplete_leagues,
        "total_leagues": len(leagues),
    }


# ═══════════════════════════════════════════════════════════════════════════
# ÖDÜL HESAPLAMALARI
# ═══════════════════════════════════════════════════════════════════════════

def calculate_season_awards(season_id: str, league_name: str) -> List[Dict[str, Any]]:
    """Bir lig için sezon ödüllerini hesapla"""
    awards = []

    try:
        # Lig tablosunu al (şampiyon belirleme)
        standings = supabase.table('league_teams').select('*').eq('league_name', league_name).order('points', desc=True).execute()
        teams = standings.data or []

        if not teams:
            return awards

        champion = teams[0]

        # Bu ligdeki tüm oyuncuların sezon istatistiklerini al
        team_names = [t['name'] for t in teams]
        profile_ids = [t.get('profile_id') for t in teams if t.get('profile_id')]

        players_result = supabase.table('players').select('*').in_('profile_id', profile_ids).execute()
        all_players = players_result.data or []

        # ── 1. ŞAMPİYON ──
        champion_award = {
            'id': f"award_{season_id}_{league_name}_champion",
            'season_id': season_id,
            'profile_id': champion.get('profile_id', ''),
            'league_name': league_name,
            'award_type': 'champion',
            'team_name': champion.get('name', ''),
            'stat_value': champion.get('points', 0),
            'stat_detail': {
                'points': champion.get('points', 0),
                'won': champion.get('won', 0),
                'drawn': champion.get('drawn', 0),
                'lost': champion.get('lost', 0),
                'gf': champion.get('gf', 0),
                'ga': champion.get('ga', 0),
            },
            'created_at': datetime.now().isoformat(),
        }
        awards.append(champion_award)

        # Oyuncu bazlı ödüller için istatistik hesapla
        player_stats = []
        for p in all_players:
            stats = {
                'player_id': p.get('id', ''),
                'player_name': p.get('name', ''),
                'profile_id': p.get('profile_id', ''),
                'team_name': p.get('team_name', ''),
                'position': p.get('position', ''),
                'rating': p.get('rating', 50) or 50,
                'age': p.get('age', 20) or 20,
                'goals': p.get('goals', 0) or 0,
                'assists': p.get('assists', 0) or 0,
                'yellow_cards': p.get('yellow_cards', 0) or 0,
                'red_cards': p.get('red_cards', 0) or 0,
                'clean_sheets': p.get('clean_sheets', 0) or 0,
                'matches_played': p.get('matches_played', 0) or 0,
                'form_rating': p.get('form_rating', 50) or 50,
            }
            player_stats.append(stats)

        if not player_stats:
            return awards

        # ── 2. ALTIN KRAMPON (En çok gol) ──
        top_scorer = max(player_stats, key=lambda x: x['goals'])
        if top_scorer['goals'] > 0:
            awards.append({
                'id': f"award_{season_id}_{league_name}_golden_boot",
                'season_id': season_id,
                'profile_id': top_scorer['profile_id'],
                'league_name': league_name,
                'award_type': 'golden_boot',
                'player_id': top_scorer['player_id'],
                'player_name': top_scorer['player_name'],
                'team_name': top_scorer['team_name'],
                'stat_value': top_scorer['goals'],
                'stat_detail': {'goals': top_scorer['goals'], 'matches': top_scorer['matches_played']},
                'created_at': datetime.now().isoformat(),
            })

        # ── 3. ASİST KRALI ──
        top_assister = max(player_stats, key=lambda x: x['assists'])
        if top_assister['assists'] > 0:
            awards.append({
                'id': f"award_{season_id}_{league_name}_top_assists",
                'season_id': season_id,
                'profile_id': top_assister['profile_id'],
                'league_name': league_name,
                'award_type': 'top_assists',
                'player_id': top_assister['player_id'],
                'player_name': top_assister['player_name'],
                'team_name': top_assister['team_name'],
                'stat_value': top_assister['assists'],
                'stat_detail': {'assists': top_assister['assists'], 'matches': top_assister['matches_played']},
                'created_at': datetime.now().isoformat(),
            })

        # ── 4. MVP (En yüksek form_rating) ──
        mvp = max(player_stats, key=lambda x: (x['form_rating'], x['goals'] + x['assists']))
        awards.append({
            'id': f"award_{season_id}_{league_name}_mvp",
            'season_id': season_id,
            'profile_id': mvp['profile_id'],
            'league_name': league_name,
            'award_type': 'mvp',
            'player_id': mvp['player_id'],
            'player_name': mvp['player_name'],
            'team_name': mvp['team_name'],
            'stat_value': mvp['form_rating'],
            'stat_detail': {'form_rating': mvp['form_rating'], 'goals': mvp['goals'], 'assists': mvp['assists']},
            'created_at': datetime.now().isoformat(),
        })

        # ── 5. EN İYİ KALECİ (GK, clean_sheets + rating) ──
        goalkeepers = [p for p in player_stats if p['position'] == 'GK']
        if goalkeepers:
            best_gk = max(goalkeepers, key=lambda x: (x['clean_sheets'], x['form_rating']))
            awards.append({
                'id': f"award_{season_id}_{league_name}_best_gk",
                'season_id': season_id,
                'profile_id': best_gk['profile_id'],
                'league_name': league_name,
                'award_type': 'best_gk',
                'player_id': best_gk['player_id'],
                'player_name': best_gk['player_name'],
                'team_name': best_gk['team_name'],
                'stat_value': best_gk['clean_sheets'],
                'stat_detail': {'clean_sheets': best_gk['clean_sheets'], 'rating': best_gk['rating']},
                'created_at': datetime.now().isoformat(),
            })

        # ── 6. EN İYİ GENÇ (U21, en yüksek rating) ──
        young_players = [p for p in player_stats if p['age'] <= 21]
        if young_players:
            best_young = max(young_players, key=lambda x: (x['form_rating'], x['goals'] + x['assists']))
            awards.append({
                'id': f"award_{season_id}_{league_name}_best_young",
                'season_id': season_id,
                'profile_id': best_young['profile_id'],
                'league_name': league_name,
                'award_type': 'best_young',
                'player_id': best_young['player_id'],
                'player_name': best_young['player_name'],
                'team_name': best_young['team_name'],
                'stat_value': best_young['form_rating'],
                'stat_detail': {'age': best_young['age'], 'form_rating': best_young['form_rating']},
                'created_at': datetime.now().isoformat(),
            })

        # ── 7. FAIR PLAY (En az kart) ──
        fair_play = min(player_stats, key=lambda x: (x['red_cards'] * 3 + x['yellow_cards'], -x['matches_played']))
        if fair_play['matches_played'] >= 10:
            awards.append({
                'id': f"award_{season_id}_{league_name}_fair_play",
                'season_id': season_id,
                'profile_id': fair_play['profile_id'],
                'league_name': league_name,
                'award_type': 'fair_play',
                'player_id': fair_play['player_id'],
                'player_name': fair_play['player_name'],
                'team_name': fair_play['team_name'],
                'stat_value': fair_play['yellow_cards'] + fair_play['red_cards'] * 3,
                'stat_detail': {'yellow_cards': fair_play['yellow_cards'], 'red_cards': fair_play['red_cards'], 'matches': fair_play['matches_played']},
                'created_at': datetime.now().isoformat(),
            })

    except Exception as e:
        logger.error(f"Ödül hesaplama hatası ({league_name}): {e}", exc_info=True)

    return awards


# ═══════════════════════════════════════════════════════════════════════════
# HALL OF FAME GÜNCELLEME
# ═══════════════════════════════════════════════════════════════════════════

def update_hall_of_fame(season_id: str, league_name: str, awards: List[Dict]) -> None:
    """Hall of Fame tablosunu güncelle"""
    try:
        # Şampiyon
        champion_award = next((a for a in awards if a['award_type'] == 'champion'), None)
        golden_boot = next((a for a in awards if a['award_type'] == 'golden_boot'), None)
        top_assists = next((a for a in awards if a['award_type'] == 'top_assists'), None)
        mvp = next((a for a in awards if a['award_type'] == 'mvp'), None)

        hof_entry = {
            'id': f"hof_{season_id}_{league_name}",
            'season_id': season_id,
            'league_name': league_name,
            'champion_team': champion_award.get('team_name', '') if champion_award else '',
            'champion_profile_id': champion_award.get('profile_id', '') if champion_award else '',
            'golden_boot_player': golden_boot.get('player_name', '') if golden_boot else '',
            'golden_boot_goals': golden_boot.get('stat_value', 0) if golden_boot else 0,
            'top_assists_player': top_assists.get('player_name', '') if top_assists else '',
            'top_assists_value': top_assists.get('stat_value', 0) if top_assists else 0,
            'mvp_player': mvp.get('player_name', '') if mvp else '',
            'created_at': datetime.now().isoformat(),
        }

        # Upsert
        existing = supabase.table('hall_of_fame').select('id').eq('id', hof_entry['id']).execute()
        if existing.data:
            supabase.table('hall_of_fame').update(hof_entry).eq('id', hof_entry['id']).execute()
        else:
            supabase.table('hall_of_fame').insert(hof_entry).execute()

        logger.info(f"Hall of Fame güncellendi: {league_name}")

    except Exception as e:
        logger.error(f"Hall of Fame güncelleme hatası: {e}", exc_info=True)


# ═══════════════════════════════════════════════════════════════════════════
# PLAYER ACHIEVEMENTS (ROZET EKLEME)
# ═══════════════════════════════════════════════════════════════════════════

def add_player_achievements(awards: List[Dict]) -> None:
    """Ödül kazanan oyunculara rozet ekle"""
    for award in awards:
        if not award.get('player_id'):
            continue

        achievement = {
            'id': f"ach_{award['id']}",
            'player_id': award['player_id'],
            'achievement_type': award['award_type'],
            'season_id': award['season_id'],
            'league_name': award.get('league_name', ''),
            'description': f"{award['award_type']} - {award.get('player_name', '')} ({award.get('stat_value', 0)})",
            'created_at': datetime.now().isoformat(),
        }

        try:
            existing = supabase.table('player_achievements').select('id').eq('id', achievement['id']).execute()
            if not existing.data:
                supabase.table('player_achievements').insert(achievement).execute()
        except Exception as e:
            logger.error(f"Rozet ekleme hatası ({achievement['id']}): {e}")


# ═══════════════════════════════════════════════════════════════════════════
# YENİ SEZON BAŞLATMA
# ═══════════════════════════════════════════════════════════════════════════

def start_new_season(league_name: str) -> Dict[str, Any]:
    """Yeni sezon başlat: puanları sıfırla, istatistikleri kaydet"""
    logger.info(f"Yeni sezon başlatılıyor: {league_name}")

    try:
        # Lig takımlarını al
        teams_result = supabase.table('league_teams').select('*').eq('league_name', league_name).execute()
        teams = teams_result.data or []

        if not teams:
            return {"success": False, "error": "Takım bulunamadı"}

        # 1. Sezon istatistiklerini kaydet (season_summaries)
        # Mevcut sezon ID'sini belirle
        current_season = supabase.table('seasons').select('*').eq('league_name', league_name).order('created_at', desc=True).limit(1).execute()
        old_season_id = current_season.data[0]['id'] if current_season.data else f"S{datetime.now().year}_auto"

        for team in teams:
            profile_id = team.get('profile_id')
            if not profile_id:
                continue

            # Sezon özeti kaydet
            summary = {
                'id': f"summary_{old_season_id}_{team.get('name', '').replace(' ', '_')}",
                'season_id': old_season_id,
                'profile_id': profile_id,
                'team_name': team.get('name', ''),
                'league_name': league_name,
                'points': team.get('points', 0) or 0,
                'won': team.get('won', 0) or 0,
                'drawn': team.get('drawn', 0) or 0,
                'lost': team.get('lost', 0) or 0,
                'goals_for': team.get('gf', 0) or 0,
                'goals_against': team.get('ga', 0) or 0,
                'created_at': datetime.now().isoformat(),
            }

            try:
                supabase.table('season_summaries').upsert(summary, on_conflict='id').execute()
            except Exception as e:
                logger.warning(f"Sezon özeti kaydetme hatası: {e}")

        # 2. Lig puanlarını sıfırla
        for team in teams:
            supabase.table('league_teams').update({
                'played': 0,
                'won': 0,
                'drawn': 0,
                'lost': 0,
                'gf': 0,
                'ga': 0,
                'points': 0,
            }).eq('id', team['id']).execute()

        # 3. Oyuncu istatistiklerini sıfırla (mevcut sezon verilerini kaydet)
        for team in teams:
            profile_id = team.get('profile_id')
            if not profile_id:
                continue

            players = supabase.table('players').select('id, goals, assists, yellow_cards, red_cards, matches_played, clean_sheets').eq('profile_id', profile_id).execute()

            for p in (players.data or []):
                # season_stats tablosuna eski verileri kaydet
                try:
                    supabase.table('season_stats').insert({
                        'player_id': p['id'],
                        'season_id': old_season_id,
                        'goals': p.get('goals', 0) or 0,
                        'assists': p.get('assists', 0) or 0,
                        'yellow_cards': p.get('yellow_cards', 0) or 0,
                        'red_cards': p.get('red_cards', 0) or 0,
                        'matches_played': p.get('matches_played', 0) or 0,
                        'clean_sheets': p.get('clean_sheets', 0) or 0,
                        'created_at': datetime.now().isoformat(),
                    }).execute()
                except Exception:
                    pass

            # İstatistikleri sıfırla
            supabase.table('players').update({
                'goals': 0,
                'assists': 0,
                'yellow_cards': 0,
                'red_cards': 0,
                'matches_played': 0,
                'clean_sheets': 0,
                'suspended_until': None,
                'is_injured': False,
                'injury_end_date': None,
            }).eq('profile_id', profile_id).execute()

        # 4. Yeni sezon kaydı oluştur
        new_season_number = int(old_season_id.split('_')[-1]) + 1 if '_' in old_season_id else 2
        new_season_id = f"S{datetime.now().year}_{new_season_number:02d}"

        try:
            supabase.table('seasons').insert({
                'id': new_season_id,
                'league_name': league_name,
                'status': 'active',
                'created_at': datetime.now().isoformat(),
            }).execute()
        except Exception as e:
            logger.warning(f"Yeni sezon kaydı: {e}")

        logger.info(f"Yeni sezon başlatıldı: {league_name} → {new_season_id}")

        return {"success": True, "old_season": old_season_id, "new_season": new_season_id}

    except Exception as e:
        logger.error(f"Yeni sezon başlatma hatası: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


# ═══════════════════════════════════════════════════════════════════════════
# GENÇ OYUNCU ÜRETİMİ (Yerel fallback — cron_youth_academy import edilemezse)
# ═══════════════════════════════════════════════════════════════════════════

def _generate_youth_players_locally(season_id: str) -> Dict[str, Any]:
    """
    Yerel genç oyuncu üretim fonksiyonu (fallback).
    cron_youth_academy.py import edilemediğinde kullanılır.
    Her kullanıcının akademi seviyesine göre 1-3 genç oyuncu üretir,
    players tablosuna ekler.
    """
    logger.info(f"Yerel genç oyuncu üretimi başlatılıyor: {season_id}")

    total_created = 0
    total_profiles = 0
    errors = []

    try:
        result = supabase.table('profiles').select('id, academy_level, team_name, region').execute()
        profiles = result.data or []
    except Exception as e:
        logger.error(f"Profiller alınamadı: {e}")
        return {"success": False, "error": str(e)}

    TURK_FIRST_NAMES = [
        "Ahmet", "Mehmet", "Ali", "Mustafa", "Hasan", "Emre", "Burak",
        "Oğuz", "Kerem", "Cem", "Deniz", "Efe", "Arda", "Baran",
        "Berk", "Can", "Doruk", "Ege", "Furkan", "Mert",
    ]
    TURK_LAST_NAMES = [
        "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız",
        "Yıldırım", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan",
    ]
    POSITIONS = ['GK', 'DEF', 'MID', 'FWD']

    for profile in profiles:
        profile_id = profile['id']
        academy_level = profile.get('academy_level', 1) or 1
        team_name = profile.get('team_name', 'Bilinmeyen')

        try:
            # Akademi seviyesine göre oyuncu sayısı
            if academy_level >= 8:
                num_players = 3
            elif academy_level >= 4:
                num_players = 2
            else:
                num_players = 1

            for i in range(num_players):
                position = random.choice(POSITIONS)
                age = random.randint(15, 19)
                base_rating = 35 + academy_level * 3
                rating = max(30, min(75, base_rating + random.randint(-5, 10)))
                potential = max(55, min(95, 60 + academy_level * 3 + random.randint(-5, 10)))

                name = f"{random.choice(TURK_FIRST_NAMES)} {random.choice(TURK_LAST_NAMES)}"
                player_id = f"youth_{profile_id[:8]}_{random.randint(1000, 9999)}"

                youth_player = {
                    'id': player_id,
                    'profile_id': profile_id,
                    'name': name,
                    'age': age,
                    'position': position,
                    'rating': rating,
                    'potential': potential,
                    'market_value': rating * 1000,
                    'salary': max(5000, rating * 200),
                    'cond': 85 + random.randint(-5, 10),
                    'form': 60 + random.randint(-10, 15),
                    'morale': 70 + random.randint(-10, 10),
                    'confidence': 60 + random.randint(-10, 15),
                    'created_at': datetime.now().isoformat(),
                }

                try:
                    supabase.table('players').insert(youth_player).execute()
                    total_created += 1
                except Exception as insert_err:
                    errors.append(f"Player insert {player_id}: {insert_err}")
                    logger.warning(f"Genç oyuncu ekleme hatası: {insert_err}")

            total_profiles += 1
            logger.info(f"  {team_name} (Lv.{academy_level}): {num_players} genç oyuncu üretildi")

        except Exception as e:
            error_msg = f"Profile {profile_id} ({team_name}): {e}"
            logger.error(error_msg)
            errors.append(error_msg)

    logger.info(f"Yerel genç oyuncu üretimi tamamlandı: {total_created} oyuncu, {total_profiles} profil")
    return {
        "success": True,
        "profiles_processed": total_profiles,
        "players_created": total_created,
        "errors": errors if errors else None,
    }


def trigger_youth_academy(season_id: str) -> Dict[str, Any]:
    """
    Gençlik Akademisi sezon alımını tetikler.
    Önce cron_youth_academy.process_season_intake'i dener,
    başarısız olursa yerel fallback fonksiyonu kullanır.
    """
    logger.info(f"Gençlik Akademisi sezon alımı tetikleniyor: {season_id}")

    if _youth_academy_available:
        try:
            result = _youth_season_intake(season_id)
            logger.info(f"cron_youth_academy.process_season_intake başarılı: {result.get('players_created', 0)} oyuncu")
            return result
        except Exception as e:
            logger.warning(f"cron_youth_academy.process_season_intake hatası, yerel fallback kullanılıyor: {e}")
            return _generate_youth_players_locally(season_id)
    else:
        logger.info("cron_youth_academy mevcut değil, yerel genç oyuncu üretimi kullanılıyor")
        return _generate_youth_players_locally(season_id)


# ═══════════════════════════════════════════════════════════════════════════
# ANA SEZON SONU İŞLEMİ
# ═══════════════════════════════════════════════════════════════════════════

def process_season_end(force: bool = False, season_id: Optional[str] = None) -> Dict[str, Any]:
    """Sezon sonu işlemlerini başlat"""

    # 1. Sezon tamamlanma kontrolü
    status = check_season_completion()

    if not force and not status.get('completed', False):
        logger.info("Sezon henüz tamamlanmadı")
        return {
            "action": "none",
            "message": "Sezon henüz tamamlanmadı",
            "status": status,
        }

    leagues_to_process = status.get('completed_leagues', [])
    if not leagues_to_process:
        # Tüm ligleri al
        try:
            leagues_result = supabase.table('league_teams').select('league_name').execute()
            leagues_to_process = list(set(t['league_name'] for t in (leagues_result.data or [])))
        except Exception:
            leagues_to_process = []

    if not season_id:
        season_id = f"S{datetime.now().year}_auto"

    all_awards = []
    all_results = []

    for league_name in leagues_to_process:
        logger.info(f"İşleniyor: {league_name}")

        # 2. Ödülleri hesapla
        awards = calculate_season_awards(season_id, league_name)
        all_awards.extend(awards)

        # 3. Ödülleri kaydet
        for award in awards:
            try:
                existing = supabase.table('season_awards').select('id').eq('id', award['id']).execute()
                if not existing.data:
                    supabase.table('season_awards').insert(award).execute()
            except Exception as e:
                logger.error(f"Ödül kaydetme hatası: {e}")

        # 4. Rozetleri ekle
        add_player_achievements(awards)

        # 5. Hall of Fame güncelle
        update_hall_of_fame(season_id, league_name, awards)

        # 6. Yeni sezon başlat
        new_season_result = start_new_season(league_name)
        all_results.append({
            "league": league_name,
            "awards_count": len(awards),
            "new_season": new_season_result,
        })

    # 7. Gençlik Akademisi — Yeni sezon için genç oyuncu üret
    youth_result = None
    try:
        new_season_id = all_results[0]['new_season'].get('new_season', season_id) if all_results else season_id
        youth_result = trigger_youth_academy(new_season_id)
        logger.info(
            f"Gençlik Akademisi: {youth_result.get('players_created', 0)} genç oyuncu "
            f"üretildi ({youth_result.get('profiles_processed', 0)} profil)"
        )
    except Exception as e:
        logger.error(f"Gençlik Akademisi hatası (devam ediliyor): {e}")
        youth_result = {"success": False, "error": str(e)}

    # Logla
    try:
        supabase.table('error_logs').insert({
            'source': 'python',
            'level': 'info',
            'message': f'Sezon sonu: {len(all_awards)} ödül, {len(leagues_to_process)} lig, {youth_result.get("players_created", 0)} genç oyuncu işlendi',
            'context': {
                "season_id": season_id,
                "total_awards": len(all_awards),
                "leagues": leagues_to_process,
                "youth_academy": youth_result,
            },
        }).execute()
    except Exception:
        pass

    return {
        "success": True,
        "season_id": season_id,
        "total_awards": len(all_awards),
        "leagues_processed": len(leagues_to_process),
        "youth_academy": youth_result,
        "awards": all_awards,
        "results": all_results,
        "timestamp": datetime.now().isoformat(),
    }


# ═══════════════════════════════════════════════════════════════════════════
# ANA FONKSİYON
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Sezon Sonu Tetikleyicisi')
    parser.add_argument('--action', choices=['check', 'force-end'], required=True,
                        help='check: sezon durumu, force-end: sezonu zorla bitir')
    parser.add_argument('--season-id', type=str, default=None,
                        help='Sezon ID (opsiyonel)')

    args = parser.parse_args()

    if args.action == 'check':
        result = check_season_completion()
    elif args.action == 'force-end':
        result = process_season_end(force=True, season_id=args.season_id)
    else:
        result = {"error": "Bilinmeyen aksiyon"}

    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
