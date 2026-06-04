/**
 * Admin: Kritik DB düzeltmelerini uygula
 * POST /api/admin/apply-critical-fixes
 *
 * Bu endpoint, DATABASE_URL ortam değişkeni doğru ayarlanmışsa
 * (PostgreSQL bağlantı dizesi) canlı veritabanına doğrudan DDL uygular.
 *
 * Güvenlik: CRON_SECRET ile korunur.
 *
 * Eğer DATABASE_URL yoksa veya SQLite ise, SQL içeriğini döndürür
 * (kullanıcı Supabase SQL Editor'de manuel çalıştırabilir).
 */
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

// Birleştirilmiş kritik düzeltme SQL'i
const CRITICAL_FIX_SQL = `
-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 0: staff_types ve staff tablolarını oluştur (eksik!)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS staff_types (
  type TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  max_count INTEGER NOT NULL DEFAULT 1,
  base_salary INTEGER NOT NULL DEFAULT 0
);

-- Eksik sütunları ekle (tablo zaten varsa CREATE IF NOT EXISTS sütun eklemez!)
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS name_tr TEXT;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS max_count INTEGER;
ALTER TABLE staff_types ADD COLUMN IF NOT EXISTS base_salary INTEGER;

UPDATE staff_types SET name_tr = type WHERE name_tr IS NULL;
UPDATE staff_types SET max_count = 3 WHERE max_count IS NULL;
UPDATE staff_types SET base_salary = 100000 WHERE base_salary IS NULL;

INSERT INTO staff_types (type, name_tr, max_count, base_salary, description) VALUES
  ('scout', 'Gözlemci', 3, 100000, 'Transfer piyasasında oyuncu keşfi yapar'),
  ('coach', 'Yardımcı Antrenör', 3, 150000, 'Antrenman kalitesini artırır'),
  ('physio', 'Fizyoterapist', 3, 80000, 'Sakatlık iyileşme süresini kısaltır'),
  ('youth_coordinator', 'Gençlik Koordinatörü', 2, 120000, 'Altyapıdan oyuncu yetiştirir'),
  ('sporting_director', 'Sportif Direktör', 1, 200000, 'Transfer stratejisi oluşturur'),
  ('analyst', 'Maç Analisti', 2, 60000, 'Rakip analiz raporları hazırlar')
ON CONFLICT (type) DO UPDATE SET
  name_tr = EXCLUDED.name_tr,
  max_count = EXCLUDED.max_count,
  base_salary = EXCLUDED.base_salary,
  description = EXCLUDED.description;

CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL REFERENCES staff_types(type),
  stars INTEGER NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 5),
  name TEXT NOT NULL,
  contract_start_week INTEGER DEFAULT 1,
  contract_end_week INTEGER DEFAULT 34,
  total_cost INTEGER DEFAULT 0,
  salary_weekly INTEGER DEFAULT 0,
  hired_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_type ON staff(user_id, type);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_types ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Kullanici kendi personelini gorebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini ekleyebilir" ON staff;
  DROP POLICY IF EXISTS "Kullanici kendi personelini silebilir" ON staff;
  DROP POLICY IF EXISTS "Staff select own" ON staff;
  DROP POLICY IF EXISTS "Staff insert own" ON staff;
  DROP POLICY IF EXISTS "Staff delete own" ON staff;
END $$;

CREATE POLICY "Kullanici kendi personelini gorebilir" ON staff
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Kullanici kendi personelini ekleyebilir" ON staff
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Kullanici kendi personelini silebilir" ON staff
  FOR DELETE USING (user_id = auth.uid()::text);

DO $$
BEGIN
  DROP POLICY IF EXISTS "Staff types herkese acik" ON staff_types;
  DROP POLICY IF EXISTS "Staff types select all" ON staff_types;
END $$;

CREATE POLICY "Staff types herkese acik" ON staff_types
  FOR SELECT USING (true);

-- referees RLS
DO $$
BEGIN
  DROP POLICY IF EXISTS "Referees herkese acik" ON referees;
  DROP POLICY IF EXISTS "Referees select all" ON referees;
END $$;

CREATE POLICY "Referees herkese acik" ON referees
  FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 1: player_development_log tablosunu düzelt
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS old_ovr NUMERIC;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS new_ovr NUMERIC;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS change_reason TEXT DEFAULT 'weekly_training';
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS match_performance_contribution NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS season_week INTEGER;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS training_sessions INTEGER DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS training_contribution NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS potential_bonus NUMERIC DEFAULT 0;
ALTER TABLE player_development_log ADD COLUMN IF NOT EXISTS age_penalty NUMERIC DEFAULT 0;

UPDATE player_development_log SET old_ovr = old_rating WHERE old_ovr IS NULL AND old_rating IS NOT NULL;
UPDATE player_development_log SET new_ovr = new_rating WHERE new_ovr IS NULL AND new_rating IS NOT NULL;
UPDATE player_development_log SET change_reason = COALESCE(reason, 'weekly_training') WHERE change_reason = 'weekly_training' AND reason IS NOT NULL AND reason != 'weekly_training';

-- DİKKAT: Eski VIEW farklı sütunlara sahip (week, ovr_change, week_label),
-- CREATE OR REPLACE VIEW ile sütun düşülemez (PostgreSQL 42P16) → DROP+CREATE gerekli
DROP VIEW IF EXISTS player_development_log_summary;
CREATE VIEW player_development_log_summary AS
SELECT
  player_id,
  season_week,
  change_reason,
  match_performance_contribution,
  COALESCE(old_ovr, old_rating) as old_ovr,
  COALESCE(new_ovr, new_rating) as new_ovr,
  created_at
FROM player_development_log
ORDER BY created_at DESC;

CREATE INDEX IF NOT EXISTS idx_player_dev_log_player ON player_development_log(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_dev_log_profile ON player_development_log(profile_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 2: league_teams is_bot düzeltmesi
-- ═══════════════════════════════════════════════════════════════════════

UPDATE league_teams SET is_bot = true WHERE is_npc = true AND is_bot = false AND profile_id IS NULL;

-- ═══════════════════════════════════════════════════════════════════════
-- BÖLÜM 3: assign_bot_to_user RPC düzeltmesi
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION assign_bot_to_user(
  p_profile_id TEXT,
  p_team_name TEXT,
  p_manager_name TEXT DEFAULT 'Menajer',
  p_philosophy TEXT DEFAULT 'balanced',
  p_color1 TEXT DEFAULT '#ffffff',
  p_color2 TEXT DEFAULT '#000000',
  p_region TEXT DEFAULT 'TR'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_bot_team RECORD;
  v_league_id UUID;
  v_league_name TEXT;
  v_old_profile_id UUID;
BEGIN
  SET LOCAL lock_timeout = '5s';
  SELECT lt.id, lt.league_id, lt.name AS old_team_name, lt.profile_id AS old_profile_id
  INTO v_bot_team
  FROM league_teams lt
  JOIN leagues l ON l.id = lt.league_id
  WHERE (lt.is_bot = true OR lt.is_npc = true)
    AND lt.profile_id IS NULL AND l.tier = 4
  ORDER BY lt.id LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_bot_available');
  END IF;
  SELECT id, name INTO v_league_id, v_league_name FROM leagues WHERE id = v_bot_team.league_id;
  UPDATE league_teams SET profile_id = p_profile_id, is_bot = false, is_npc = false, name = p_team_name, color = p_color1 WHERE id = v_bot_team.id;
  IF v_bot_team.old_profile_id IS NOT NULL THEN
    UPDATE players SET profile_id = p_profile_id, team_name = p_team_name WHERE profile_id = v_bot_team.old_profile_id;
    DELETE FROM profiles WHERE id = v_bot_team.old_profile_id;
  END IF;
  RETURN jsonb_build_object('success', true, 'league_id', v_league_id, 'league_name', COALESCE(v_league_name, '4. Lig'), 'team_slot_id', v_bot_team.id, 'took_over_bot', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'reason', SQLERRM);
END;
$$;

NOTIFY pgrst, 'reload schema';
`;

// Lig temizleme SQL'i (ayrı çalıştırılır — dikkatli olunmalı)
const LEAGUE_CLEANUP_SQL = `
-- ═══════════════════════════════════════════════════════════════════════
-- Lig duplikasyonu temizleme
-- DİKKAT: Bu SQL veri taşıma yapar, yedek alındığından emin olun!
-- ═══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  primary_league_id UUID;
  duplicate_league RECORD;
  target_league_id UUID;
BEGIN
  FOR tier_val IN 1..3 LOOP
    SELECT id INTO primary_league_id FROM leagues WHERE tier = tier_val ORDER BY created_at ASC LIMIT 1;
    IF primary_league_id IS NULL THEN CONTINUE; END IF;
    SELECT id INTO target_league_id FROM leagues WHERE tier = 4 ORDER BY created_at ASC LIMIT 1;
    FOR duplicate_league IN
      SELECT id, name FROM leagues WHERE tier = tier_val AND id != primary_league_id ORDER BY created_at ASC
    LOOP
      IF target_league_id IS NOT NULL THEN
        UPDATE league_teams SET league_id = target_league_id WHERE league_id = duplicate_league.id;
      END IF;
      DELETE FROM league_teams WHERE league_id = duplicate_league.id;
      DELETE FROM league_standings WHERE league_id = duplicate_league.id;
      DELETE FROM seasons WHERE league_id = duplicate_league.id;
      DELETE FROM leagues WHERE id = duplicate_league.id;
      RAISE NOTICE 'Tier %: Duplicate lig silindi: %', tier_val, duplicate_league.name;
    END LOOP;
  END LOOP;
END $$;

-- 4. Lig departmanlarını isimlendir
DO $$
DECLARE
  dept_index INTEGER := 0;
  dept_record RECORD;
  new_name TEXT;
BEGIN
  FOR dept_record IN SELECT id FROM leagues WHERE tier = 4 ORDER BY created_at ASC LOOP
    dept_index := dept_index + 1;
    new_name := CASE WHEN dept_index = 1 THEN '4. Lig' ELSE '4. Lig ' || dept_index || '. Bölüm' END;
    UPDATE leagues SET name = new_name WHERE id = dept_record.id;
  END LOOP;
  IF dept_index > 4 THEN
    DECLARE
      excess_league RECORD;
      min_team_league_id UUID;
    BEGIN
      FOR excess_league IN SELECT id FROM leagues WHERE tier = 4 ORDER BY created_at ASC OFFSET 4 LOOP
        SELECT id INTO min_team_league_id FROM (
          SELECT l.id, COUNT(lt.id) as tc FROM leagues l LEFT JOIN league_teams lt ON lt.league_id = l.id
          WHERE l.tier = 4 GROUP BY l.id ORDER BY tc ASC LIMIT 1
        ) sub;
        IF min_team_league_id IS NOT NULL THEN
          UPDATE league_teams SET league_id = min_team_league_id WHERE league_id = excess_league.id;
          DELETE FROM league_standings WHERE league_id = excess_league.id;
          DELETE FROM seasons WHERE league_id = excess_league.id;
          DELETE FROM leagues WHERE id = excess_league.id;
        END IF;
      END LOOP;
    END;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
`;

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { action, database_url } = body as { action?: string; database_url?: string };

  // DATABASE_URL: body'den veya ortam değişkeninden al
  const dbUrl = database_url || process.env.DATABASE_URL;
  const canConnectDirectly = dbUrl && !dbUrl.startsWith('file:');

  // Sadece SQL göster (uygulama)
  if (action === 'show_sql') {
    return NextResponse.json({
      message: 'Aşağıdaki SQL\'i Supabase Dashboard > SQL Editor\'de çalıştırın',
      critical_fix_sql: CRITICAL_FIX_SQL,
      league_cleanup_sql: LEAGUE_CLEANUP_SQL,
      instructions: [
        '1. Supabase Dashboard\'a gidin (https://supabase.com/dashboard)',
        '2. Projenizi seçin (jmxbyaamwbpnvgbnjbmo)',
        '3. Sol menüden "SQL Editor" seçin',
        '4. "New query" butonuna tıklayın',
        '5. critical_fix_sql içeriğini yapıştırın ve "Run" edin',
        '6. Başarılı olduktan sonra league_cleanup_sql içeriğini yapıştırın ve "Run" edin',
        '7. Doğrulama: SELECT tier, count(*) FROM leagues GROUP BY tier ORDER BY tier;',
      ],
    });
  }

  // Doğrudan DB'ye uygula
  if (!canConnectDirectly) {
    return NextResponse.json({
      error: 'DATABASE_URL PostgreSQL bağlantı dizesi olmalı',
      hint: 'Body\'de database_url parametresi gönderin veya .env dosyasında DATABASE_URL ayarlayın',
      format: 'postgresql://postgres:[ŞİFRE]@db.jmxbyaamwbpnvgbnjbmo.supabase.co:5432/postgres',
      alternative: 'action=show_sql parametresi ile SQL içeriğini alıp manuel uygulayabilirsiniz',
    }, { status: 400 });
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const results: string[] = [];

  try {
    const client = await pool.connect();

    try {
      // Kritik düzeltmeleri uygula
      if (!action || action === 'critical_fix' || action === 'all') {
        await client.query(CRITICAL_FIX_SQL);
        results.push('staff_types ve staff tabloları oluşturuldu');
        results.push('player_development_log sütunları eklendi');
        results.push('player_development_log_summary VIEW düzeltildi');
        results.push('league_teams is_bot bayrakları düzeltildi');
        results.push('assign_bot_to_user RPC güncellendi');
      }

      // Lig temizleme (sadece açıkça istenirse)
      if (action === 'league_cleanup' || action === 'all') {
        await client.query(LEAGUE_CLEANUP_SQL);
        results.push('Lig duplikasyonu temizlendi');
        results.push('4. Lig departmanları yeniden adlandırıldı');
      }

      // Doğrulama
      const { rows: leagueCounts } = await client.query(
        'SELECT tier, count(*) as lig_sayisi FROM leagues GROUP BY tier ORDER BY tier'
      );
      results.push(`Doğrulama: ${JSON.stringify(leagueCounts)}`);

    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error('[apply-critical-fixes] Hata:', err);
    return NextResponse.json({
      error: 'DB düzeltme hatası',
      detail: err.message,
      results_sofar: results,
    }, { status: 500 });
  } finally {
    await pool.end();
  }
}

// GET: SQL içeriğini göster
export async function GET() {
  return NextResponse.json({
    message: 'Kritik DB düzeltmeleri endpoint\'i',
    usage: {
      show_sql: 'POST { action: "show_sql" } → SQL içeriğini gösterir',
      apply_critical: 'POST { action: "critical_fix", database_url: "..." } → Kritik düzeltmeleri uygular',
      apply_league: 'POST { action: "league_cleanup", database_url: "..." } → Lig temizleme uygular',
      apply_all: 'POST { action: "all", database_url: "..." } → Tüm düzeltmeleri uygular',
    },
    auth: 'Authorization: Bearer <CRON_SECRET>',
  });
}
