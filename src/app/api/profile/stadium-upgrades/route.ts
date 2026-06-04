import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { verifyProfileExists } from '@/lib/fm/security';
import { getAuthenticatedUserId } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  const profileId = getAuthenticatedUserId(request, request.nextUrl.searchParams.get('profileId'));
  if (!profileId) {
    return NextResponse.json({ error: 'profileId zorunlu' }, { status: 400 });
  }

  const { valid, error, status } = await verifyProfileExists(supabase, profileId);
  if (!valid) {
    return NextResponse.json({ error }, { status });
  }

  const { data, error: fetchError } = await supabase
    .from('profiles')
    .select('stadium_upgrades, stadium_capacity')
    .eq('id', profileId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: 'Stadyum bilgisi alınamadı' }, { status: 500 });
  }

  return NextResponse.json({
    stadium_upgrades: data?.stadium_upgrades || {},
    stadium_capacity: data?.stadium_capacity || 10000,
  });
}
