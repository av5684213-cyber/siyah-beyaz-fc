'use client';

import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MatchEvent } from '@/lib/fm/types';

/**
 * MatchCommentary — maç sırasında olayları heyecanlı cümlelerle gösterir.
 * Gol, kart, sakatlık gibi olayları sadece metin değil,
 * "İnanılmaz! Genç yıldız son dakikada attı!" gibi
 * heyecanlı anlatımlarla sunar.
 */

interface MatchCommentaryProps {
  /** Maç olayları listesi */
  events: MatchEvent[];
  /** Ev sahibi takım adı */
  homeTeam: string;
  /** Deplasman takım adı */
  awayTeam: string;
  /** Maksimum gösterilecek olay sayısı */
  maxVisible?: number;
  /** Özel stil sınıfı */
  className?: string;
}

// ─── Heyecanlı Anlatım Havuzları ──────────────────────────────────

const GOAL_NARRATIONS: string[] = [
  'İNANILMAZ! {player} topu ağlara gönderdi! Tribünler çıldırdı!',
  'GOOOL! {player} muhteşem bir vuruşla skoru değiştirdi!',
  'Harika bir gol! {player} kalecinin yapacağı hiçbir şey yoktu!',
  'Tribünler ayağa kalktı! {player} harika bir frikik golü attı!',
  '{player} yine yaptı yapacağını! Klas bir bitiriş!',
  'Ne bir vuruş! {player} topu adeta ağlara yapıştırdı!',
  'Bu golü seyretmeye değer! {player} muhteşem bir gol attı!',
  'Rakip savunma çaresiz! {player} kendine güvenle vurdu ve gol!',
  'Genç yıldız {player} sahne aldı! Muhteşem bir gol!',
  '{player} takımını öne geçirdi! Bu gol maçın kaderini değiştirebilir!',
];

const LATE_GOAL_NARRATIONS: string[] = [
  'SON DAKİKA DRAMI! {player} {minute}. dakikada takımını kurtardı!',
  'İNANILMAZ BİR AN! {player} son saniyede golü attı! Tribünler yıkılıyor!',
  'Bu filmi yazamazsın! {player} {minute}. dakikada her şeyi değiştirdi!',
  'Dakikalar azalıyordu ki {player} patladı! Muhteşem bir son dakika golü!',
];

const YELLOW_CARD_NARRATIONS: string[] = [
  'Hakem sarı kartı gösterdi! {player} uyarılıyor.',
  'Sert bir müdahale ve hakem cezayı kesiyor. {player} sarı kart görüyor.',
  '{player} sarı kart gördü. Bu faulun bedeli ağır olabilir.',
  'Taktiksel bir faul ve hakem sarı kartını çıkarıyor. {player} uyarıldı.',
  'Hakemin sabrı taştı! {player} sarı kartla cezalandırılıyor.',
];

const RED_CARD_NARRATIONS: string[] = [
  'KIRMIZI KART! {player} oyundan atıldı! Takım 10 kişi kaldı!',
  'Hakem kırmızı kartı gösterdi! {player} soyunma odasına yolcu!',
  'Maçın kaderi değişti! {player} kırmızı kart gördü ve takım eksik kaldı!',
  'Şok eden bir an! {player} kırmızı kartla sahayı terk ediyor!',
];

const INJURY_NARRATIONS: string[] = [
  'Kötü bir görüntü! {player} yerde kaldı. Sağlık ekibi sahaya giriyor.',
  '{player} sakatlandı! Bu takım için büyük bir kayıp olabilir.',
  'Endişelendiren bir sahne... {player} tedavi ediliyor.',
  'Maçın gidişatı değişebilir! {player} sakatlık geçirdi.',
  'Umutlar kırıldı! {player} oyuna devam edemeyecek gibi görünüyor.',
];

const HALFTIME_NARRATIONS: string[] = [
  'İlk yarı sona erdi! Her iki takım da soyunma odasına dönüyor.',
  'Hakem ilk yarıyı bitirdi. İki teknik direktör için kritik bir ara!',
  'İlk 45 dakika geride kaldı. Şimdi taktik değişiklikleri zamanı!',
];

const FULLTIME_NARRATIONS: string[] = [
  'MAÇ BİTTİ! Hakem son düdüğü çaldı!',
  'Son dakika geride kaldı! Hakem maçı bitirdi.',
  '90 dakika dolu dolu geçti! Karşılaşma sona erdi.',
];

const SUBSTITUTION_NARRATIONS: string[] = [
  'Teknik direktör değişikliğe gidiyor. {player} oyuna giriyor.',
  'Taktik bir hamle! {player} sahaya giriyor, takıma yeni bir nefes!',
  'Değişiklik zamanı! {player} oyuna dahil oluyor.',
];

const OFFSIDE_NARRATIONS: string[] = [
  'Ofsayt! Hakem bayrağını kaldırdı.',
  'Savunma hattı tuzağı çalıştı! Ofsayt kararı.',
  'Hakem ofsayt bayrağını gösterdi. Pozisyon golle sonuçlanmadı.',
];

const CORNER_NARRATIONS: string[] = [
  'Korner atışı! Tehlikeli bir pozisyon olabilir.',
  'Kaleci topu kornere çevirdi! Kalabalık ceza sahası...',
  'Korner vuruşu kullanılacak. Takım hücum için pozisyon alıyor.',
];

// ─── Rastgele Anlatım Seçici ──────────────────────────────────────

function pickNarration(pool: string[], player?: string, minute?: number): string {
  try {
    const template = pool[Math.floor(Math.random() * pool.length)];
    return template
      .replace('{player}', player ?? 'Bilinmeyen')
      .replace('{minute}', String(minute ?? ''));
  } catch {
    return pool[0]
      .replace('{player}', player ?? 'Bilinmeyen')
      .replace('{minute}', String(minute ?? ''));
  }
}

/**
 * Bir MatchEvent'i heyecanlı anlatıma dönüştürür.
 */
function narrateEvent(event: MatchEvent): string {
  try {
    const isLate = event.minute >= 80;

    switch (event.type) {
      case 'GOAL':
        if (isLate) {
          return pickNarration(LATE_GOAL_NARRATIONS, event.player, event.minute);
        }
        return pickNarration(GOAL_NARRATIONS, event.player, event.minute);

      case 'YELLOW':
        return pickNarration(YELLOW_CARD_NARRATIONS, event.player, event.minute);

      case 'RED':
        return pickNarration(RED_CARD_NARRATIONS, event.player, event.minute);

      case 'INJURY':
        return pickNarration(INJURY_NARRATIONS, event.player, event.minute);

      case 'HALFTIME':
        return pickNarration(HALFTIME_NARRATIONS);

      case 'FULLTIME':
        return pickNarration(FULLTIME_NARRATIONS);

      case 'SUB':
        return pickNarration(SUBSTITUTION_NARRATIONS, event.player, event.minute);

      case 'OFFSIDE':
        return pickNarration(OFFSIDE_NARRATIONS, event.player, event.minute);

      case 'CORNER':
        return pickNarration(CORNER_NARRATIONS, event.player, event.minute);

      case 'COMMENTARY':
        return event.text; // Mevcut metin aynen kullanılır

      default:
        return event.text;
    }
  } catch (err) {
    console.error('[MatchCommentary] narrateEvent error:', err);
    return event.text;
  }
}

// ─── Olay İkonları ────────────────────────────────────────────────

function getEventIcon(type: MatchEvent['type']): string {
  switch (type) {
    case 'GOAL': return '⚽';
    case 'YELLOW': return '🟨';
    case 'RED': return '🟥';
    case 'INJURY': return '🏥';
    case 'SUB': return '🔄';
    case 'HALFTIME': return '⏸️';
    case 'FULLTIME': return '🏁';
    case 'OFFSIDE': return '🚩';
    case 'CORNER': return '🚩';
    case 'COMMENTARY': return '💬';
    default: return '📋';
  }
}

function getEventColor(type: MatchEvent['type']): string {
  switch (type) {
    case 'GOAL': return 'border-green-500/40 bg-green-900/20';
    case 'YELLOW': return 'border-yellow-500/40 bg-yellow-900/20';
    case 'RED': return 'border-red-500/40 bg-red-900/20';
    case 'INJURY': return 'border-orange-500/40 bg-orange-900/20';
    case 'SUB': return 'border-blue-500/40 bg-blue-900/20';
    case 'HALFTIME':
    case 'FULLTIME': return 'border-white/30 bg-white/5';
    default: return 'border-white/10 bg-white/5';
  }
}

// ─── Bileşen ───────────────────────────────────────────────────────

export default function MatchCommentary({
  events,
  homeTeam,
  awayTeam,
  maxVisible = 20,
  className = '',
}: MatchCommentaryProps) {
  // Son N olayı al ve heyecanlı anlatıma dönüştür
  const narratedEvents = useMemo(() => {
    try {
      const recent = events.slice(-maxVisible);
      return recent.map((event) => ({
        ...event,
        narration: narrateEvent(event),
      }));
    } catch (err) {
      console.error('[MatchCommentary] narratedEvents error:', err);
      return [];
    }
  }, [events, maxVisible]);

  const getTeamLabel = useCallback(
    (team?: 'HOME' | 'AWAY'): string => {
      if (!team) return '';
      return team === 'HOME' ? homeTeam : awayTeam;
    },
    [homeTeam, awayTeam]
  );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {narratedEvents.length === 0 && (
        <div className="py-8 text-center text-sm text-white/30">
          Maç başladığında olaylar burada görünecek...
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {narratedEvents.map((event, index) => (
          <motion.div
            key={`${event.minute}-${event.type}-${index}`}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index === narratedEvents.length - 1 ? 0 : 0 }}
            className={`rounded-lg border px-3 py-2 text-sm ${getEventColor(event.type)}`}
          >
            <div className="flex items-start gap-2">
              {/* Dakika */}
              <span className="mt-0.5 min-w-[2.5rem] text-right font-mono text-xs text-white/40">
                {event.minute}&apos;
              </span>

              {/* İkon */}
              <span className="text-base">{getEventIcon(event.type)}</span>

              {/* Anlatım */}
              <div className="flex-1">
                <p
                  className={
                    event.type === 'GOAL'
                      ? 'font-bold text-green-300'
                      : event.type === 'RED'
                      ? 'font-semibold text-red-300'
                      : event.type === 'HALFTIME' || event.type === 'FULLTIME'
                      ? 'font-semibold text-white/80'
                      : 'text-white/70'
                  }
                >
                  {event.narration}
                </p>
                {event.team && (
                  <span className="mt-0.5 text-xs text-white/30">
                    {getTeamLabel(event.team)}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
