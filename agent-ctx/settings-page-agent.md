# Settings Page Implementation

## Task ID: settings-page

## Summary
Created `/home/z/my-project/src/app/settings/page.tsx` - a complete settings page for the siyah-beyaz-fc project.

## Features Implemented
1. **Team Name Change** - Input field with save button, updates `profile.team_name` in Supabase `profiles` table and localStorage
2. **Team Colors** - Two color pickers (primary_color, secondary_color) with `<input type="color">` + hex text input, live preview, save to Supabase + localStorage
3. **Notification Preferences** - Push notification toggle, saves to localStorage key `fm_push_enabled`
4. **Sound Effects** - Toggle for sound effects, saves to localStorage key `fm_sound_enabled`
5. **Language Selection** - Turkish active, other options (English, Deutsch, Español, Français, العربية) greyed out/disabled with "Yakında" badge

## Technical Details
- `'use client'` component
- Imports `useFM` from `@/lib/fm/GameContext` for profile data
- Imports `getSupabase`, `isSupabaseConfigured` from `@/lib/supabase`
- Uses lucide-react icons: ArrowLeft, Settings, Palette, Bell, Volume2, Globe, Save
- Uses `motion/react` for animations (fade-in cards, slide-in header)
- Dark theme (bg-black, text-white, zinc-900 borders)
- Back button linking to `/`
- Each setting section in its own card with header
- Toast notification on save using `showToast` from `@/components/fm/ToastNotifications`
- Toggle switches with proper `role="switch"` and `aria-checked` accessibility
- Responsive design (grid cols adapt on mobile vs desktop)

## Verification
- Dev server returns HTTP 200 for `/settings`
- All 5 setting sections render correctly
- HTML output verified to contain: Ayarlar, Takım Adı, Takım Renkleri, Bildirim Tercihleri, Ses Efektleri, Dil Seçimi, Yakında badges
