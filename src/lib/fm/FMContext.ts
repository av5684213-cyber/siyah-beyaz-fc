/**
 * FMContext — Bağımsız React Context Tanımı
 *
 * Bu dosya GameContext.tsx ile useShallowFM.ts arasındaki
 * döngüsel bağımlılığı kırmak için oluşturuldu.
 *
 * SORUN: GameContext.tsx → export { useShallowFM } → useShallowFM.ts → import { FMContext } from GameContext
 * Bu döngü, FMContext (const) henüz başlatılmamışken erişilmesine neden oluyordu:
 * "ReferenceError: Cannot access '$' before initialization"
 *
 * ÇÖZÜM: FMContext burada tanımlanır. Hem GameContext.tsx hem de
 * useShallowFM.ts bu dosyadan import eder. Bu dosya hiçbir
 * GameContext bağımlılığı içermediğinden döngüsel bağımlılık oluşmaz.
 */
'use client';
import { createContext } from 'react';

// FMContextValue tipi GameContext.tsx'te tanımlıdır.
// Burada any kullanıyoruz çünkü tip bilgisi ayrı bir dosyada
// tanımlansaydı bu da döngüsel bağımlılık yaratabilirdi.
// GameContext.tsx'te FMContext.Provider value={contextValue}
// atamasında TypeScript tip güvenliği sağlanır.
export const FMContext = createContext<any>(null);
