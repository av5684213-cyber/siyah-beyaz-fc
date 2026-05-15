import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/chat/system-message
 * 
 * Maç motoru olayları geldiğinde (gol, kart, sakatlık vb.) bu route çağrılır.
 * match_chat tablosuna sistem mesajı olarak ekler.
 * 
 * Request body:
 *   match_id: string     — Maç/fikstür ID
 *   event_text: string   — Olay metni (ör: "⚽ GOL! Mehmet (45')")
 *   event_minute: number — Maç dakikası
 *   event_type?: string  — Olay türü (goal, yellow, red, injury, vb.)
 * 
 * Bu endpoint CRON_SECRET veya internal auth ile korunabilir.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { match_id, event_text, event_minute, event_type } = body;

    // ─── Validasyon ───────────────────────────────────────────────
    if (!match_id || typeof match_id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'match_id gerekli ve string olmalı' },
        { status: 400 }
      );
    }

    if (!event_text || typeof event_text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'event_text gerekli ve string olmalı' },
        { status: 400 }
      );
    }

    if (event_minute !== undefined && typeof event_minute !== 'number') {
      return NextResponse.json(
        { success: false, error: 'event_minute number olmalı' },
        { status: 400 }
      );
    }

    // Metin uzunluk sınırı
    const sanitizedText = event_text.slice(0, 500);
    const sanitizedMinute = typeof event_minute === 'number' ? Math.max(0, Math.min(120, event_minute)) : null;

    // ─── Supabase'e sistem mesajı ekle ────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[system-message] Supabase yapılandırılmamış');
      return NextResponse.json(
        { success: false, error: 'Supabase yapılandırılmamış' },
        { status: 500 }
      );
    }

    const messageRecord: Record<string, unknown> = {
      fixture_id: match_id,
      profile_id: 'system',
      sender_name: 'Maç Motoru',
      content: sanitizedText,
      message_type: 'system',
      minute: sanitizedMinute,
    };

    // Event type varsa ekle
    if (event_type) {
      messageRecord['event_type'] = String(event_type).slice(0, 50);
    }

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/match_chat`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(messageRecord),
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('[system-message] Insert hatası:', insertResponse.status, errorText);
      return NextResponse.json(
        { success: false, error: `Supabase insert hatası: ${insertResponse.status}` },
        { status: 500 }
      );
    }

    const insertedData = await insertResponse.json();

    console.log(
      `[system-message] Sistem mesajı eklendi: match=${match_id}, ` +
      `dk=${sanitizedMinute}, text="${sanitizedText.slice(0, 50)}"`
    );

    return NextResponse.json({
      success: true,
      message: 'Sistem mesajı eklendi',
      data: insertedData,
    });

  } catch (error) {
    console.error('[system-message] Genel hata:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
