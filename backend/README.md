# Expenzo — Backend Architecture & Database Migrations

This folder contains the complete production backend schema, database migrations, atomic financial stored procedures (RPCs), Row Level Security (RLS) policies, and serverless Edge Functions for **Expenzo**.

---

## Directory Structure

```
backend/
├── combined_production_migration.sql       # Complete, all-in-one consolidated SQL migration script
├── 20261030000000_initial_schema.sql       # Migration 1: 17 core relational tables & constraints
├── 20261030000001_rls_policies.sql         # Migration 2: Row Level Security (RLS) multi-tenant policies
├── 20261030000002_atomic_financial_rpcs.sql# Migration 3: execute_transfer and pay_bill stored procedures
├── 20261031000000_complete_production_backend.sql # Migration 4: Auth triggers, indexes & health telemetry
├── migrations/                             # Mirrored sequential migration folder
│   ├── 20261030000000_initial_schema.sql
│   ├── 20261030000001_rls_policies.sql
│   ├── 20261030000002_atomic_financial_rpcs.sql
│   ├── 20261031000000_complete_production_backend.sql
│   └── combined_production_migration.sql
└── functions/                              # Supabase Serverless Edge Functions (Deno Runtime)
    ├── ai-assistant/index.ts               # Secure server-side Gemini Flash proxy with zero client key leakage
    └── market-data/index.ts                # Real-time investment market data proxy
```

---

## Database Migrations Catalog

### 1. `20261030000000_initial_schema.sql`
- Initializes UUID extensions (`uuid-ossp` / `pgcrypto`).
- Establishes core relational tables:
  1. `profiles`: Linked 1:1 to `auth.users(id)` with cascading delete.
  2. `user_preferences`: Theme, Indian numbering format, budget warning threshold.
  3. `financial_accounts`: Multi-bank account tracking (savings, current, credit, cash, investment) using integer paise opening balances.
  4. `categories`: Normalized categories with user uniqueness constraint.
  5. `transactions`: Canonical financial ledger using 64-bit integer paise (`amount_minor BIGINT >= 0`).
  6. `recurring_bills` & `bill_payments`: Scheduled recurring obligations and payment tracking.
  7. `financial_goals` & `goal_contributions`: Targeted savings and milestone accumulation.
  8. `budget_history`, `cashflow_projections`, and `monthly_aggregates`.

### 2. `20261030000001_rls_policies.sql`
- Enables Row Level Security (RLS) on all database tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Grants strict isolation policies binding `SELECT`, `INSERT`, `UPDATE`, and `DELETE` exclusively to the authenticated JWT principal (`auth.uid() = user_id`).
- Guarantees zero cross-tenant data leakage at the PostgreSQL kernel level.

### 3. `20261030000002_atomic_financial_rpcs.sql`
- **`execute_transfer(sender_account_id, receiver_account_id, transfer_amount_minor, transfer_description)`**:
  - Validates caller ownership of both accounts.
  - Checks sender liquidity for non-credit accounts.
  - Generates synchronized debit and credit entries in `transactions`.
  - Guarantees ACID transactional atomicity with full rollback on failure.
- **`pay_bill(bill_id, account_id, payment_amount_minor, payment_notes)`**:
  - Deducts payment amount from specified financial account.
  - Logs transaction in canonical ledger and records payment in `bill_payments`.
  - Automatically advances `next_due_date` according to recurrence cycle (monthly, quarterly, yearly).

### 4. `20261031000000_complete_production_backend.sql`
- Implements automated auth trigger `on_auth_user_created` to provision user profiles and preferences upon signup.
- Configures B-tree performance indexes on foreign keys, transaction dates, and category tags.
- Provisions operational telemetry tables: `audit_logs`, `user_security_events`, and `ai_query_logs`.

### 5. `combined_production_migration.sql`
- Single idempotent script containing all four migrations above.
- Safely executable directly in the Supabase SQL Editor.

---

## Execution Guide

### Option A: Supabase Cloud SQL Editor (Fastest)
1. Open your Supabase Dashboard: `https://supabase.com/dashboard/project/<PROJECT_REF>/sql`
2. Open `backend/combined_production_migration.sql`.
3. Copy all contents and paste into the SQL Editor.
4. Click **Run** (`Cmd + Enter` or `Ctrl + Enter`).

### Option B: Supabase CLI (Automated Migration Sync)
From the project root:
```bash
# Link your remote Supabase project
npx supabase link --project-ref <YOUR_PROJECT_REF>

# Inspect migration status
npx supabase migration list

# Push pending migrations to remote database
npx supabase db push
```

---

## Edge Functions Deployment

Deploy serverless edge functions to handle AI queries and external market data without exposing API keys:

```bash
# Deploy AI Assistant proxy function
npx supabase functions deploy ai-assistant --no-verify-jwt

# Deploy Market Data proxy function
npx supabase functions deploy market-data --no-verify-jwt

# Set secure environment secret on Supabase backend
npx supabase secrets set GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>"
```
