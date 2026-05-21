# Task: Loan (Kiralık) System Backend

## Agent: Backend Developer

## Summary

Created the loan system backend with 4 API routes and a migration SQL file.

## Files Created

### 1. Migration SQL
- **`/home/z/my-project/siyah-beyaz-fc/download/LOAN_SYSTEM_MIGRATION.sql`**
  - Adds 6 columns to `players` table: `is_on_loan_market`, `loan_fee`, `loaned_to_profile_id`, `loan_owner_profile_id`, `loan_status`, `loan_end_date`
  - Creates `loans` table with: id, player_id, owner_team_id, loaned_to_team_id, start_date, end_date, loan_fee_paid, status, created_at
  - Indexes for loan-related queries
  - RLS policies for the `loans` table

### 2. API Routes

#### POST `/api/loans/list`
- **File**: `src/app/api/loans/list/route.ts`
- User lists their own player for loan
- Validates player ownership, checks not already on loan market
- Sets `is_on_loan_market = true`, `loan_fee = X`, `loan_owner_profile_id`
- Creates `loans` record with status `listed`
- Rollback on failure

#### GET `/api/loans/available`
- **File**: `src/app/api/loans/available/route.ts`
- Returns players where `is_on_loan_market = true` AND `profile_id != current user`
- Filters out players already on active loan
- Enriches with owner team names from profiles table

#### POST `/api/loans/request`
- **File**: `src/app/api/loans/request/route.ts`
- Charges 10 credits from requesting user
- Sets `loaned_to_profile_id`, `loan_status = 'active'`, `loan_end_date = '2026-08-31'`
- Removes from loan market (`is_on_loan_market = false`)
- Updates or creates `loans` record with status `active`
- Full rollback on credit deduction failure

#### POST `/api/loans/return-early`
- **File**: `src/app/api/loans/return-early/route.ts`
- Early return — no credit refund
- Both borrower and owner can initiate early return
- Sets `loan_status = 'returned_early'`, clears `loaned_to_profile_id`
- Updates `loans` record accordingly

## Patterns Used
- Same Supabase client pattern as existing routes (`getSupabase()`, `isSupabaseConfigured()`)
- `isValidUserId` from security module for input validation
- Proper try/catch error handling
- Turkish error messages consistent with existing codebase
- `maybeSingle()` for safe single-record queries

## Note
The migration SQL must be run manually in Supabase Dashboard > SQL Editor before the API routes will work, as columns must exist in the database.
