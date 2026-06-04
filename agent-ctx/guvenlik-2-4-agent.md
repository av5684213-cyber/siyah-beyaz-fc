# GÜVENLİK-2 & GÜVENLİK-4 Implementation

## Task: Admin Route Protection + CORS Configuration

### Files Modified

1. **`src/app/api/admin/schema-migration/route.ts`**
   - Added `import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'`
   - Added `x-admin-user-id` header check after CRON_SECRET verification
   - When `x-admin-user-id` is present, verifies the user has `admin` role in `profiles` table
   - Falls back to CRON_SECRET-only protection when header is absent (for cron jobs)

2. **`src/app/api/admin/set-role/route.ts`**
   - Added `x-admin-user-id` header check before the email allowlist check
   - Uses existing supabase client (already imported)
   - When `x-admin-user-id` is present, verifies admin role
   - Falls back to email-allowlist-only protection when header is absent

3. **`src/app/api/admin/migrate/route.ts`**
   - Added `import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'`
   - Added `x-admin-user-id` header check after CRON_SECRET verification
   - When `x-admin-user-id` is present, verifies the user has `admin` role
   - Falls back to CRON_SECRET-only protection when header is absent

4. **`next.config.ts`**
   - Added CORS headers entry for `/api/(.*)` source pattern
   - Headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Access-Control-Max-Age`
   - Allowed origins: supabase.co, *.space.chatglm.site, *.space-z.ai, *.chatglm.site
   - Allowed headers include `x-admin-user-id` for the new admin verification

5. **`src/proxy.ts`**
   - Added CORS preflight (OPTIONS) handler before API route protection
   - Dynamically sets `Access-Control-Allow-Origin` based on request origin
   - Allows specific origins + wildcard subdomains (*.space.chatglm.site, *.space-z.ai)
   - Returns 204 No Content for valid preflight requests
   - Section numbering updated: old "3. API route protection" → "4. API route protection"

### Non-Breaking Changes
- All admin route checks are additive — existing cron jobs (no `x-admin-user-id` header) continue to work
- CORS preflight only applies to OPTIONS requests, does not affect normal API calls
- ESLint passes with no errors on all modified files
- Dev server starts successfully with no errors
