# EXPENZO Backend Implementation — Phase 3 PRD
## Complete Authentication and User Management

### 1. Objective
Replace simulated authentication with real Supabase Auth (GoTrue). Provide complete email/password registration, login, session persistence, automatic profile creation, and strict user isolation where newly registered users receive an empty personal financial workspace.

### 2. Affected Existing Files
- `frontend/src/store/useAuthStore.ts` (connect to Supabase Auth API)
- `frontend/src/features/auth/pages/LoginPage.tsx`
- `frontend/src/features/auth/pages/RegisterPage.tsx`
- `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`
- `frontend/src/features/auth/pages/ResetPasswordPage.tsx`
- `frontend/src/components/layout/ProtectedRoute.tsx`

### 3. New Files to Create
- `frontend/src/features/auth/hooks/useSupabaseAuth.ts`
- `frontend/src/features/auth/utils/authErrors.ts`

### 4. Database Changes
- Trigger on `auth.users` to automatically insert a corresponding row into `public.profiles` and `public.user_preferences`.

### 5. API and Service Changes
- `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.signOut()`
- `supabase.auth.onAuthStateChange((event, session) => ...)`

### 6. Critical Invariants
- A newly registered user begins with **zero seeded accounts and an empty ledger**.
- Demo persona selector remains exclusively available in explicit Demo Mode.
- Real production accounts strictly load user-specific records from PostgreSQL.

### 7. Acceptance Criteria
- User can register, verify, sign in, and sign out with real credentials.
- Page refresh restores active Supabase JWT session seamlessly.
- Protected routes redirect unauthenticated visitors to `/login`.
- User A cannot access or view User B's profile or data.

