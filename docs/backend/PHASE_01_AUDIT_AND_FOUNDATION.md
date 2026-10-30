# EXPENZO Backend Implementation — Phase 1 PRD
## Repository Audit and Backend Foundation

### 1. Objective
Establish the foundational Supabase client, typed environment configuration, and service factory adapter without disrupting existing frontend UI components or Vitest suites.

### 2. Affected Existing Files
- `frontend/package.json` (add `@supabase/supabase-js`)
- `frontend/src/services/contracts/finance.ts`
- `frontend/src/store/useFinanceStore.ts`
- `frontend/src/store/useAuthStore.ts`

### 3. New Files to Create
- `frontend/src/lib/supabase.ts` (centralized client initialization with runtime env validation)
- `frontend/src/types/database.ts` (generated/hand-crafted TypeScript types for all Supabase tables)
- `frontend/src/services/apiFinanceService.ts` (real implementation of FinanceServiceContract)
- `frontend/src/services/serviceFactory.ts` (dynamic service switcher: `production` vs `demo`)
- `frontend/.env.example` & `.env.example` (template with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### 4. Database Changes
None (Client-side foundation setup).

### 5. API and Service Changes
- Introduce `serviceFactory.getFinanceService()` to conditionally return either `apiFinanceService` (default for real authenticated users) or `mockFinanceService` (for offline tests and demo sessions).

### 6. Security Requirements
- Strictly use `VITE_SUPABASE_ANON_KEY` (public publishable key).
- Never allow `SUPABASE_SERVICE_ROLE_KEY` in frontend code or environment files.
- Fail gracefully with actionable error messages if Supabase environment variables are missing.

### 7. Acceptance Criteria
- `@supabase/supabase-js` installed cleanly without peer dependency conflicts.
- `frontend/src/lib/supabase.ts` exports typed client.
- `serviceFactory` provides seamless contract adherence.
- All existing 160 Vitest tests pass without regressions.
- Implementation status updated in `docs/backend/IMPLEMENTATION_STATUS.md`.

