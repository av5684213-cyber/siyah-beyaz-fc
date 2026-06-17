/**
 * Referees API — Get referees for a league
 * GET /api/referees?leagueId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { createErrorResponse } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: true, message: 'Supabase not configured.' }, { status: 500 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: true, message: 'Supabase client null.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    // leagueId opsiyonel — verilmezse tüm hakemleri döndür
    // Eski sürümde leagueId zorunluydu, bu yüzden frontend bazen 400 hatası alıyordu.

    // Try to fetch from referees table
    let referees: any[] = [];
    let refError: any = null;

    try {
      let query = supabase
        .from('referees')
        .select('*')
        .order('name', { ascending: true });

      // Sadece leagueId verilmişse filterele
      if (leagueId) {
        query = query.eq('league_id', leagueId);
      }

      const result = await query;
      referees = result.data || [];
      refError = result.error;
    } catch (err: any) {
      console.warn('[GET /api/referees] Table might not exist:', err.message);
      return NextResponse.json({ referees: [], total: 0 });
    }

    if (refError) {
      console.error('[GET /api/referees] Error:', refError.message);
      if (
        refError.message?.includes('does not exist') ||
        refError.message?.includes('schema cache') ||
        refError.message?.includes('relation') ||
        refError.message?.includes('not found') ||
        refError.code === '42P01'
      ) {
        return NextResponse.json({ referees: [], total: 0 });
      }
      return NextResponse.json({ error: true, message: 'Error loading referees.' }, { status: 500 });
    }

    return NextResponse.json({
      referees: referees || [],
      total: referees.length,
    });
  } catch (err) {
    return createErrorResponse(err, { route: '/api/referees', method: 'GET' });
  }
}
