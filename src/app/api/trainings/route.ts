/**
 * Training API Route
 *
 * GET  /api/trainings?profileId=xxx  — Son antrenmanları getir
 * POST /api/trainings                — Yeni antrenman kaydet
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

// ═══════════════════════════════════════════════════════════════
// GET: Son antrenmanları getir
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase yapılandırılmamış.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = getAuthenticatedUserId(request, searchParams.get('profileId'));
    const limit = parseInt(searchParams.get('limit') || '2', 10);

    if (!profileId) {
      return NextResponse.json({ error: true, message: 'profileId parametresi gerekli.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('trainings')
      .select('*')
      .eq('profile_id', profileId)
      .order('training_date', { ascending: false })
      .order('training_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[GET /api/trainings] Supabase error:', error.message);
      return NextResponse.json({ error: true, message: 'Antrenman verisi yüklenirken hata oluştu.' }, { status: 500 });
    }

    return NextResponse.json({ trainings: data || [] });
  } catch (err) {
    console.error('[GET /api/trainings] Exception:', err);
    return createErrorResponse(err, { route: '/api/trainings', method: 'GET' });
  }
}

// ═══════════════════════════════════════════════════════════════
// POST: Yeni antrenman kaydet
// ═══════════════════════════════════════════════════════════════

interface PlayerTrainingResult {
  player_id: string;
  player_name: string;
  position: string;
  stats_gained: Record<string, number>;
  cond_change: number;
  morale_change: number;
}

interface TrainingRequestBody {
  profile_id: string;
  team_name: string;
  session_type: 'morning' | 'afternoon';
  training_date?: string;
  player_results: PlayerTrainingResult[];
  player_ids?: string[];  // Katılan oyuncu ID'leri
  avg_cond_change?: number;
  avg_morale_change?: number;
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase yapılandırılmamış.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const body: TrainingRequestBody = await request.json();

    const resolvedProfileId = getAuthenticatedUserId(request, body.profile_id);
    if (!resolvedProfileId || !body.session_type || !body.player_results) {
      return NextResponse.json({ error: true, message: 'Eksik parametreler.' }, { status: 400 });
    }

    const trainingTime = body.session_type === 'morning' ? '11:30' : '17:30';
    const trainingDate = body.training_date || new Date().toISOString().split('T')[0];

    const row = {
      profile_id: resolvedProfileId,
      team_name: body.team_name || '',
      session_type: body.session_type,
      training_date: trainingDate,
      training_time: trainingTime,
      player_results: JSON.stringify(body.player_results),
      player_ids: body.player_ids || body.player_results.map((p: PlayerTrainingResult) => p.player_id),
      avg_cond_change: body.avg_cond_change || 0,
      avg_morale_change: body.avg_morale_change || 0,
      total_players: body.player_results.length,
    };

    const { data, error } = await supabase
      .from('trainings')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('[POST /api/trainings] Supabase error:', error.message);
      return NextResponse.json({ error: true, message: 'Antrenman kaydedilirken hata oluştu.' }, { status: 500 });
    }

    // ── training_attendances tablosuna bireysel katılım kaydı yaz ──
    // Bu kayıt olmadan apply-training, update-form-ratings, update-player-ovr
    // crons'ları training_attendances'ı boş buluyor ve fallback'e düşüyor.
    const playerIdsList = body.player_ids || body.player_results.map((p: PlayerTrainingResult) => p.player_id);
    if (playerIdsList.length > 0) {
      const attendanceRows = playerIdsList.map((pid: string) => ({
        player_id: pid,
        profile_id: resolvedProfileId,
        training_date: trainingDate,
        session_type: body.session_type,
        training_record_id: data?.id || null,
      }));
      const { error: attError } = await supabase.from('training_attendances').insert(attendanceRows);
      if (attError) {
        console.warn('[POST /api/trainings] training_attendances insert failed (non-critical):', attError.message);
      } else {
        console.log(`[POST /api/trainings] Inserted ${attendanceRows.length} attendance records`);
      }
    }

    return NextResponse.json({ success: true, training: data });
  } catch (err) {
    console.error('[POST /api/trainings] Exception:', err);
    return createErrorResponse(err, { route: '/api/trainings', method: 'POST' });
  }
}
