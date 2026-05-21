# Siyah Beyaz FC — Football Manager

Profesyonel futbol menajerliği simülasyonu. Kendi takımını kur, transferleri yap, taktikleri belirle ve ligde zirveye çık.

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| UI Kütüphanesi | shadcn/ui, Radix UI, Lucide Icons, Framer Motion |
| State Yönetimi | Zustand, React Context (GameContext) |
| Veritabanı | Supabase (PostgreSQL + Realtime + RLS) |
| Backend (Cron) | Vercel Cron Jobs, Node.js API Routes |
| Backend (Python) | Python 3.11+ (maç simülasyonu, bot AI, sezon ödülleri) |
| Test | Jest, React Testing Library |
| Dağıtım | Vercel, Standalone Docker |

## Özellikler

- **Kadro Yönetimi:** Oyuncu kartları, pozisyon atama, fitness takibi
- **Transfer Pazarı:** Oyuncu alım-satım, pazar değer hesaplama, koridor sistemi
- **Maç Simülasyonu:** Poisson dağılımı tabanlı gol hesaplama, canlı olay akışı
- **Lig Sistemi:** Çok katmanlı lig (Süper Lig → 4. Lig), puan tablosu, fikstür
- **Antrenman Sistemi:** Taktiksel büyüme, kondisyon yönetimi, gençlik akademisi
- **Bot YZ:** Otomatik takım yönetimi, zorluk seviyeli transfer kararları
- **Maç Sohbeti:** Supabase Realtime tabanlı canlı mesajlaşma
- **Sezon Ödülleri:** En değerli oyuncu, gol kralı, en iyi genç oyuncu
- **Web Push Bildirimleri:** Maç hatırlatmaları, transfer teklifleri
- **Efsaneler Müzesi:** Emekli oyuncuların kariyer istatistikleri

## Kurulum

### Gereksinimler

- Node.js 18+
- npm 9+
- Python 3.11+ (opsiyonel, bot/maç simülasyonu için)

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/av5684213-cyber/siyah-beyaz-fc.git
cd siyah-beyaz-fc

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenle (aşağıya bak)

# 4. Geliştirme sunucusunu başlat
npm run dev

# 5. Tarayıcıda aç
# http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## Ortam Değişkenleri

`.env.local` dosyasında aşağıdaki değişkenleri tanımlayın:

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'si | Evet |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | Evet |
| `CRON_SECRET` | Vercel cron job'ları için güvenlik anahtarı | Evet |

### Örnek `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
CRON_SECRET=my-secret-cron-key-2024
```

## Proje Yapısı

```
siyah-beyaz-fc/
├── src/
│   ├── app/                    # Next.js App Router sayfaları
│   │   ├── api/                # API route'ları (cron, league, auth...)
│   │   ├── match/[id]/         # Maç izleme sayfası
│   │   ├── awards/             # Sezon ödülleri
│   │   ├── fixture/            # Fikstür tablosu
│   │   ├── hall-of-fame/       # Efsaneler müzesi
│   │   ├── settings/team/      # Takım ayarları
│   │   └── page.tsx            # Ana sayfa (Dashboard)
│   ├── components/
│   │   ├── fm/                 # Oyun bileşenleri (MatchDay, DashboardTab...)
│   │   ├── Chat/               # Sohbet bileşenleri
│   │   └── ui/                 # shadcn/ui temel bileşenleri
│   ├── lib/
│   │   ├── fm/                 # Oyun mantığı (training, tactics, valuation...)
│   │   ├── supabase.ts         # Supabase istemcisi
│   │   └── push-notifications.ts # Web Push bildirimleri
│   └── middleware.ts            # Auth middleware
├── python/                     # Python servisleri
│   ├── match_simulator.py      # Maç simülasyonu
│   ├── bot_actions.py          # Bot YZ kararları
│   ├── award_season.py         # Sezon ödül hesaplama
│   └── requirements.txt        # Python bağımlılıkları
├── supabase/
│   └── migrations/             # SQL migration dosyaları
├── __tests__/                  # Birim testleri
├── scripts/                    # Yardımcı scriptler
├── vercel.json                 # Vercel cron yapılandırması
├── next.config.ts              # Next.js yapılandırması
├── tailwind.config.ts          # Tailwind CSS yapılandırması
└── package.json                # Proje bağımlılıkları
```

## Vercel Cron Job'ları

| Endpoint | Sıklık | Açıklama |
|----------|--------|----------|
| `/api/cron/match-simulator` | Hafta içi 12:00 | Maç simülasyonu |
| `/api/cron/bot-actions` | Pazartesi 10:00 | Bot eylemleri |
| `/api/cron/bot-transfers` | Pazartesi 10:00 | Bot transferleri |
| `/api/cron/update-player-values` | Pazartesi 02:00 | Oyuncu değer güncelleme |
| `/api/cron/update-player-ovr` | Pazar 23:00 | Haftalık OVR güncelleme |
| `/api/cron/update-form-ratings` | Her gün 03:00 | Form değerlendirmesi |
| `/api/cron/youth-training` | Pazartesi 04:00 | Gençlik antrenmanı |
| `/api/cron/check-academy-upgrades` | Her saat | Akademi yükseltme kontrolü |
| `/api/cron/season-end-trigger` | Pazar 00:00 | Sezon sonu tetikleyici |
| `/api/notifications/send-match-reminder` | Maç günü 11:50/17:50 | Maç hatırlatma bildirimi |

## Test

```bash
# Tüm testleri çalıştır
npm test

# İzleme modunda çalıştır
npm run test:watch

# Kapsam raporu oluştur
npm run test:coverage
```

## Lisans

Bu proje kişisel kullanım içindir. Ticari kullanım yasaktır.
