import { NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Supabase off' }, { status: 500 });
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: 'No client' }, { status: 500 });

  const { fixtureId, choice, profileId } = await request.json();
  if (!fixtureId || !choice || !profileId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  // Oyuncuların morale/cond değerlerini choice'a göre güncelle
  const effects: Record<string, { moraleChange: number; condChange: number }> = {
    motivate:   { moraleChange: +5, condChange: -3 },
    calm:       { moraleChange: +2, condChange:  0 },
    aggressive: { moraleChange: +8, condChange: -5 },
  };
  const fx = effects[choice] || { moraleChange: 0, condChange: 0 };

  try {
    const { data: players } = await supabase
      .from('players')
      .select('id, morale, cond')
      .eq('profile_id', profileId);

    for (const p of players || []) {
      await supabase.from('players').update({
        morale: Math.min(100, Math.max(0, (p.morale || 60) + fx.moraleChange)),
        cond:   Math.max(10,  (p.cond   || 80) + fx.condChange),
      }).eq('id', p.id);
    }

    return NextResponse.json({ success: true, effect: fx });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
