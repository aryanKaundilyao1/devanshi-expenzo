# EXPENZO Backend Implementation — Phase 2 PRD
## PostgreSQL Database, Migrations and Security

### 1. Objective
Design and author production-grade PostgreSQL migrations enforcing relational integrity, Row Level Security (RLS) on all user-owned tables, integer minor unit monetary fields (paise), indexes, and atomic RPC functions for money transfers.

### 2. Affected Existing Files
- `frontend/src/types/database.ts` (sync with schema)

### 3. New Files to Create
- `supabase/migrations/20261030000000_initial_schema.sql` (Tables, Foreign Keys, Enums, Constraints)
- `supabase/migrations/20261030000001_rls_policies.sql` (Granular RLS policies using `auth.uid()`)
- `supabase/migrations/20261030000002_atomic_financial_rpcs.sql` (Stored procedures for atomic transfers and bill pay)
- `docs/backend/DATABASE_SCHEMA.md` (Entity-relationship documentation)
- `docs/backend/RLS_SECURITY_MODEL.md` (Security matrix & access control rules)

### 4. Database Schema Entities
- **Identity & Preferences**: `profiles`, `user_preferences`
- **Banking & Accounts**: `financial_accounts`, `banking_beneficiaries`, `banking_bills`, `user_cards`
- **Transactions & Ledger**: `categories`, `transactions`
- **Planning**: `budgets`, `savings_goals`, `goal_contributions`, `recurring_rules`
- **Investments**: `investment_holdings`, `watchlists`, `watchlist_items`, `market_price_cache`
- **AI & History**: `ai_chat_sessions`, `ai_chat_messages`, `notifications`

### 5. Financial Data Integrity
- All amounts stored as `BIGINT` in minor units (`amount_minor` paise, e.g. ₹100.50 = `10050`).
- Check constraint: `amount_minor >= 0` for ledger records.
- Stored procedure `execute_transfer(p_from_account_id, p_to_account_id, p_amount_minor, p_notes)` executes atomic transaction creation ensuring zero wealth inflation.

### 6. Security Requirements
- Enable RLS on every table without exception.
- Policies: `SELECT/INSERT/UPDATE/DELETE USING (auth.uid() = user_id)`.
- Enforce foreign-key ownership constraints: cannot reference an account owned by a different user.

### 7. Acceptance Criteria
- SQL migrations parse without syntax errors.
- RLS blocks cross-user reads and writes.
- Transfers execute atomically in a single Postgres transaction.

