/**
 * Alt-Bağlamlar Dizin Dosyası
 *
 * GameContext'in bölünmüş 4 alt-bağlamını yeniden dışa aktarır.
 * Her alt-bağlam kendi sağlayıcısını ve kanca (hook) fonksiyonunu dışa aktarır.
 *
 * Kullanım:
 * - Geriye uyumlu: useFM() ile mevcut arayüz korunur
 * - İleride doğrudan: useProfileContext(), useSquadContext() vb.
 *   ile gereksiz yeniden render'lar önlenebilir
 */
export { ProfileProvider, useProfileContext } from './ProfileContext';
export { SquadProvider, useSquadContext } from './SquadContext';
export { GameOpsProvider, useGameOpsContext } from './GameOpsContext';
export { UIProvider, useUIContext } from './UIContext';
