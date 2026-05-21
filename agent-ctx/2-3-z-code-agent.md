# Task 2-3: Loan Confirmation Modal + Rental API Fix

## Work Completed

### GÖREV 2: Loan Confirmation Modal in PlayerDetailModal.tsx

- Read existing PlayerDetailModal.tsx (1591 lines) and analyzed the loan form overlay (lines 1458-1586)
- Changed loan form from inline `absolute inset-0` overlay inside the modal to a proper `fixed inset-0 z-[500]` confirmation modal overlay with backdrop
- Added motion animation (scale + y) for modal entrance
- Updated title from "Kiralık Olarak Gönder" to "Kiralık Pazarına Gönder"
- Added description text per spec:
  - "Oyuncunuz kiralık pazarına çıkacak. Diğer takımlar bu oyuncuyu kiralayabilir."
  - "Kiralama gerçekleştiğinde 10 Kredi sistem komisyonu olarak kiracıdan düşülecek."
  - "Kiralık ücret (Euro) kiralanan takıma ödenecek."
- Added Duration input (weeks, 1-34) with range slider + number input, pre-filled with 17
- Changed API endpoint from `/api/rental/create-listing` to `/api/rental/list`
- Replaced `alert()` with toast notifications (`useToast` from ToastContext)
- Added `toastSuccess()` for success and `toastError()` for errors
- Added validation: loan fee must be > 0
- Button text changed from "Kiralık Pazara Çıkar" to "Onayla"
- Cancel button text "İptal" preserved
- Clicking backdrop (outside modal) dismisses the confirmation modal

### GÖREV 3: Rental API Fix - "Oyuncu bulunamadı"

- Created SQL migration at `supabase/migrations/20260521000002_rental_system.sql`:
  - `rental_listings` table: id, player_id, owner_team_id, daily_cost, status, duration_weeks, listed_at, created_at
  - `loans` table: id, player_id, owner_team_id, loaned_to_team_id, loan_fee_paid, duration_weeks, start_date, end_date, status, created_at, updated_at
  - Indexes on player_id, status, owner_team_id, loaned_to_team_id
  - RLS policies (idempotent with DO $$ blocks)
  - Players table column additions (is_on_loan_market, loan_status, loan_fee, loan_owner_profile_id)
- Updated `/api/rental/list/route.ts`:
  - Added `isTableNotFoundError()` helper function
  - When `rental_listings` insert fails with "does not exist" error, returns 500 with helpful message: "Kiralık pazarı sistemi henüz veritabanına yüklenmemiş. Lütfen yöneticinizle iletişime geçin ve 20260521000002_rental_system.sql migration dosyasını çalıştırmasını isteyin."
  - Same for fallback insert attempt
  - `loans` table insert: Changed from try/catch to proper Supabase error handling with `isTableNotFoundError` detection
  - Migration hint included in debug field of error responses

## Files Modified
- `src/components/fm/PlayerDetailModal.tsx` — Loan confirmation modal (import useToast, toast notifications, fixed overlay, duration input, API endpoint)
- `src/app/api/rental/list/route.ts` — Table-not-found detection, migration hint error messages

## Files Created
- `supabase/migrations/20260521000002_rental_system.sql` — Complete rental system migration

## Verification
- TypeScript compilation: No new errors in modified files (pre-existing errors unchanged)
- Dev server: HTTP 200 on localhost:3000
