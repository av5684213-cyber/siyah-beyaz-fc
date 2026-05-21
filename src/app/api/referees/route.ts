/**
 * Referees API — Get referees for a league
 * GET /api/referees?leagueId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

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

    if (!leagueId) {
      return NextResponse.json({ error: true, message: 'leagueId is required.' }, { status: 400 });
    }

    // Try to fetch from referees table
    let referees: any[] = [];
    let refError: any = null;

    try {
      const result = await supabase
        .from('referees')
        .select('*')
        .eq('league_id', leagueId)
        .order('name', { ascending: true });
      referees = result.data || [];
      refError = result.error;
    } catch (err: any) {
      console.warn('[GET /api/referees] Table might not exist:', err.message);
      return NextResponse.json({ referees: [], total: 0 });
    }

    if (refError) {
      console.error('[GET /api/referees] Error:', refError.message);
      if (refError.message?.includes('does not exist') || refError.message?.includes('schema cache')) {
        return NextResponse.json({ referees: [], total: 0 });
      }
      return NextResponse.json({ error: true, message: 'Error loading referees.' }, { status: 500 });
    }

    return NextResponse.json({
      referees: referees || [],
      total: referees.length,
    });
  } catch (err) {
    console.error('[GET /api/referees] Exception:', err);
    return NextResponse.json({ error: true, message: 'An error occurred.' }, { status: 500 });
  }
}
