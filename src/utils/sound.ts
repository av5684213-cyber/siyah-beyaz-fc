/**
 * utils/sound.ts
 *
 * Ses efektleri sistemi — gol sesi, şampiyonluk sesi, alkış vb.
 * Web Audio API kullanarak kısa sentezlenmiş sesler çalar.
 * Harici dosya gerektirmez (base64 dahil edilmez).
 *
 * Sesler varsayılan olarak kapalıdır.
 * Kullanıcı ayarlardan açabilir (localStorage: 'sound_enabled').
 */

// ─── Ses Tipi ────────────────────────────────────────────────────

export type SoundId =
  | 'goal'
  | 'champion'
  | 'applause'
  | 'whistle'
  | 'card'
  | 'transfer'
  | 'click'
  | 'record'
  | 'error'
  | 'success';

// ─── Ayar Yönetimi ───────────────────────────────────────────────

const STORAGE_KEY = 'sound_enabled';

/**
 * Seslerin açık olup olmadığını kontrol eder.
 * Varsayılan: kapalı (false).
 */
export function isSoundEnabled(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Sesleri açar veya kapatır.
 */
export function setSoundEnabled(enabled: boolean): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch (err) {
    console.error('[sound] setSoundEnabled error:', err);
  }
}

/**
 * Ses durumunu değiştirir (toggle).
 */
export function toggleSound(): boolean {
  const newState = !isSoundEnabled();
  setSoundEnabled(newState);
  return newState;
}

// ─── Web Audio API Context ────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtx;
  } catch (err) {
    console.error('[sound] getAudioContext error:', err);
    return null;
  }
}

// ─── Ses Sentez Fonksiyonları ─────────────────────────────────────

/**
 * Gol sesi — yükselen tiz ton + kısa patlama
 */
function playGoalSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;

    // Yükselen ton
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.linearRampToValueAtTime(800, now + 0.2);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // İkinci dalga
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(600, now + 0.1);
    osc2.frequency.linearRampToValueAtTime(1200, now + 0.3);
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch (err) {
    console.error('[sound] playGoalSound error:', err);
  }
}

/**
 * Şampiyonluk sesi — fanfar benzeri yükselen arpej
 */
function playChampionSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      gain.gain.setValueAtTime(0.25, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.5);
    });

    // Final akoru
    const oscFinal = ctx.createOscillator();
    const gainFinal = ctx.createGain();
    oscFinal.type = 'sine';
    oscFinal.frequency.setValueAtTime(1047, now + 0.6);
    gainFinal.gain.setValueAtTime(0.3, now + 0.6);
    gainFinal.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    oscFinal.connect(gainFinal).connect(ctx.destination);
    oscFinal.start(now + 0.6);
    oscFinal.stop(now + 1.5);
  } catch (err) {
    console.error('[sound] playChampionSound error:', err);
  }
}

/**
 * Alkış sesi — beyaz gürültü patlaması
 */
function playApplauseSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;
    const duration = 1.2;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.Q.setValueAtTime(0.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);
  } catch (err) {
    console.error('[sound] playApplauseSound error:', err);
  }
}

/**
 * Düdük sesi
 */
function playWhistleSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.setValueAtTime(1100, now + 0.15);
    osc.frequency.setValueAtTime(900, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.setValueAtTime(0.3, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } catch (err) {
    console.error('[sound] playWhistleSound error:', err);
  }
}

/**
 * Kart sesi (kısa tık)
 */
function playCardSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (err) {
    console.error('[sound] playCardSound error:', err);
  }
}

/**
 * Transfer sesi — kasayı andıran "kaching"
 */
function playTransferSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.setValueAtTime(1600, now + 0.05);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    // İkinci ton
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1800, now + 0.1);
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.4);
  } catch (err) {
    console.error('[sound] playTransferSound error:', err);
  }
}

/**
 * Tıklama sesi — hafif ui geri bildirimi
 */
function playClickSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (err) {
    console.error('[sound] playClickSound error:', err);
  }
}

/**
 * Rekor sesi — dramatik yükseliş
 */
function playRecordSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.5);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  } catch (err) {
    console.error('[sound] playRecordSound error:', err);
  }
}

/**
 * Hata sesi — alçalan ton
 */
function playErrorSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (err) {
    console.error('[sound] playErrorSound error:', err);
  }
}

/**
 * Başarı sesi — kısa pozitif "ding"
 */
function playSuccessSound(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // İkinci "ding"
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.15);
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.error('[sound] playSuccessSound error:', err);
  }
}

// ─── Ana Çalma Fonksiyonu ─────────────────────────────────────────

const SOUND_MAP: Record<SoundId, (ctx: AudioContext) => void> = {
  goal: playGoalSound,
  champion: playChampionSound,
  applause: playApplauseSound,
  whistle: playWhistleSound,
  card: playCardSound,
  transfer: playTransferSound,
  click: playClickSound,
  record: playRecordSound,
  error: playErrorSound,
  success: playSuccessSound,
};

/**
 * Belirtilen ses efektini çalar.
 * Sesler kapalıysa hiçbir şey yapmaz.
 */
export function playSound(soundId: SoundId): void {
  try {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // AudioContext askıya alınmışsa devam ettir
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        const player = SOUND_MAP[soundId];
        if (player) player(ctx);
      }).catch((err: unknown) => {
        console.error('[sound] resume error:', err);
      });
    } else {
      const player = SOUND_MAP[soundId];
      if (player) player(ctx);
    }
  } catch (err) {
    console.error('[sound] playSound error:', err);
  }
}
