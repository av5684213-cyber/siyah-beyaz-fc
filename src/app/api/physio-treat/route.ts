/**
 * Physio Treat API — Fizyoterapist Tedavisi
 * POST /api/physio-treat
 *
 * Body: { playerId, profileId }
 *
 * Akış:
 * 1. Kullanıcının fizyoterapist personelini getir (type='physio')
 * 2. Fizyoterapist yıldızlarından toplam iyileştirme gücünü hesapla
 * 3. Oyuncunun injury_end_date değerinden iyileştirme günlerini düş
 * 4. Yeni injury_end_date'i güncelle (sakatlık bittiyse is_injured=false yap)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculatePhysioHealing, applyHealingToDate } from '@/lib/fm/injuryManager';
import { verifyProfileExists } from '@/lib/fm/security';
import { createErrorResponse } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    // ── Supabase kontrol ──
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: true, message: 'Supabase yapılandırılmamış.' },
        { status: 500 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: true, message: 'Supabase client null.' },
        { status: 500 }
      );
    }

    // ── Parametreleri al ──
    const body = await request.json();
    const { playerId, profileId } = body;

    if (!playerId || !profileId) {
      return NextResponse.json(
        { error: true, message: 'playerId ve profileId zorunludur.', userMessage: 'Eksik bilgi. Lütfen tekrar deneyin.' },
        { status: 400 }
      );
    }

    // Verify profile exists
    const { valid, error: profileError, status: profileStatus } = await verifyProfileExists(supabase, profileId);
    if (!valid) {
      return NextResponse.json(
        { error: true, message: profileError || 'Profil bulunamadı.', userMessage: 'Profil bulunamadı.' },
        { status: profileStatus || 404 }
      );
    }

    // ── 1. Oyuncuyu getir ──
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, is_injured, injury_end_date, injury_severity, profile_id')
      .eq('id', playerId)
      .maybeSingle();

    if (playerError) {
      console.error('[POST /api/physio-treat] Player fetch error:', playerError.message);
      return NextResponse.json(
        { error: true, message: 'Oyuncu bulunamadı.', userMessage: 'Oyuncu bilgileri alınamadı.' },
        { status: 404 }
      );
    }

    if (!player) {
      return NextResponse.json(
        { error: true, message: 'Oyuncu bulunamadı.', userMessage: 'Oyuncu bulunamadı.' },
        { status: 404 }
      );
    }

    // Oyuncu sakat değilse tedaviye gerek yok
    if (!player.is_injured || !player.injury_end_date) {
      return NextResponse.json(
        { error: true, message: 'Oyuncu sakat değil.', userMessage: 'Bu oyuncu sakat değil, tedaviye gerek yok.' },
        { status: 400 }
      );
    }

    // ── 2. Kullanıcının fizyoterapistlerini getir ──
    const { data: physios, error: physioError } = await supabase
      .from('staff')
      .select('stars, type')
      .eq('user_id', profileId)
      .eq('type', 'physio');

    if (physioError) {
      console.error('[POST /api/physio-treat] Physio fetch error:', physioError.message);
      return NextResponse.json(
        { error: true, message: 'Fizyoterapist bilgileri alınamadı.', userMessage: 'Personel bilgileri yüklenirken hata oluştu.' },
        { status: 500 }
      );
    }

    if (!physios || physios.length === 0) {
      return NextResponse.json(
        { error: true, message: 'Fizyoterapist yok.', userMessage: 'Fizyoterapist personeliniz yok. Önce personel işe alımından fizyoterapist alın.' },
        { status: 400 }
      );
    }

    // ── 3. İyileştirme gücünü hesapla ──
    const physioStars: number[] = physios.map((p: { stars: number }) => p.stars);
    const daysReduced = calculatePhysioHealing(physioStars);

    if (daysReduced <= 0) {
      return NextResponse.json(
        { error: true, message: 'İyileştirme gücü yetersiz.', userMessage: 'Fizyoterapistlerinizin iyileştirme gücü yetersiz.' },
        { status: 400 }
      );
    }

    // ── 4. Yeni bitiş tarihini hesapla ──
    const newEndDate = applyHealingToDate(player.injury_end_date, daysReduced);

    let updateData: Record<string, unknown>;
    let injuryCleared = false;

    if (newEndDate === null) {
      // Sakatlık tamamen iyileşti
      updateData = {
        is_injured: false,
        injury_end_date: null,
        injury_severity: null,
      };
      injuryCleared = true;
    } else {
      updateData = {
        injury_end_date: newEndDate,
      };
    }

    // ── 5. Veritabanını güncelle ──
    const { error: updateError } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', playerId);

    if (updateError) {
      console.error('[POST /api/physio-treat] Update error:', updateError.message);
      return NextResponse.json(
        { error: true, message: 'Güncelleme hatası.', userMessage: 'Oyuncu bilgileri güncellenirken hata oluştu.' },
        { status: 500 }
      );
    }

    // ── 6. Başarı yanıtı ──
    const result: {
      success: boolean;
      daysReduced: number;
      newEndDate: string | null;
      injuryCleared: boolean;
      physiosUsed: number;
    } = {
      success: true,
      daysReduced,
      newEndDate,
      injuryCleared,
      physiosUsed: physios.length,
    };

    return NextResponse.json(result);
  } catch (err) {
    return createErrorResponse(err, { route: '/api/physio-treat', method: 'POST' });
  }
}
