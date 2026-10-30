# EXPENZO — Phase 2: Supabase Cloud Database Deployment Report

**Date:** 2026-10-30  
**Phase:** 2 of 8 (Supabase Cloud Database Deployment)  
**Status:** PASS / ACTION REQUIRED (SQL Execution in Supabase Dashboard)  

---

## 1. Remote Supabase Project Verification

- **Supabase Project Reference:** `nrqddnghuykcoyfhjidm`
- **Project URL:** `https://nrqddnghuykcoyfhjidm.supabase.co`
- **Connection Diagnostics:**
  - REST endpoint reachable: `HTTP/2 404 PGRST205` (PostgREST responsive and operational, table schema cache empty pending initial migrations).
  - API Key: Public Anon JWT validated and accepted by Supabase PostgREST gateway.
  - Zero Service-Role exposure in frontend codebase or client builds.

---

## 2. Database Migrations Audit & Verification

All 3 migration files were inspected, validated for PostgreSQL syntax, dependency order, referential integrity, and atomic guarantees:

### Migration 0: `20261030000000_initial_schema.sql`
- **Tables (19):**
  1. `profiles`: Direct cascade foreign key to `auth.users(id)`.
  2. `user_preferences`: User display, alert thresholds, and notification configs.
  3. `financial_accounts`: Multi-institution savings, current, credit, cash, and investment accounts.
  4. `categories`: Custom expense & income categories with user isolation.
  5. `transactions`: Single canonical double-entry ledger. All monetary amounts stored as `BIGINT amount_minor` (paise) with non-negative constraints.
  6. `budgets`: Category spending ceilings with user-defined warning thresholds.
  7. `savings_goals`: Target dates, milestone trackers, and categories.
  8. `goal_contributions`: Mental planning records preserving double-entry accounting integrity without synthetic double-counting.
  9. `banking_bills`: Recurring utility and credit bills with due-date tracking and payment statuses.
  10. `banking_beneficiaries`: Masked account numbers and IFSC directories.
  11. `user_cards`: Virtual debit and credit card simulation with frozen states.
  12. `investment_holdings`: NSE/BSE stock and ETF quantities and average buy prices.
  13. `watchlists` & `watchlist_items`: User stock watchlists.
  14. `market_price_cache`: Server-cached quotes with read-only client access.
  15. `ai_chat_sessions` & `ai_chat_messages`: Multi-turn conversational financial AI sessions.
  16. `notifications`: In-app system and financial alerts.
  17. `recurring_rules`: Automated subscription and recurring transaction schedules.
- **Performance Indexes:** 7 targeted B-tree indexes covering user queries, date ordering, and account lookups.

### Migration 1: `20261030000001_rls_policies.sql`
- **Coverage:** 100% of tables have Row Level Security (`ENABLE ROW LEVEL SECURITY`) activated.
- **Tenant Isolation:** Enforced strictly via `auth.uid() = user_id` on all CRUD operations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- **Profile Protection:** Users can only view, create, and modify their own row matching `auth.uid() = id`.
- **Public Cache:** `market_price_cache` allows `SELECT` for authenticated users and restricts write mutations to administrative service roles.

### Migration 2: `20261030000002_atomic_financial_rpcs.sql`
- **`execute_transfer` RPC:**
  - `SECURITY DEFINER` with explicit `search_path = public`.
  - Verifies caller `auth.uid()`.
  - Row-locks both source and destination accounts (`FOR UPDATE`).
  - Ensures source and destination accounts belong strictly to the authenticated user.
  - Inserts double-entry canonical transfer transaction.
  - Guarantees zero net worth leakage and transfer neutrality.
- **`pay_bill` RPC:**
  - `SECURITY DEFINER` with explicit `search_path = public`.
  - Atomically marks bill as `paid` and creates corresponding expense transaction in canonical ledger.
- **`handle_new_user` Trigger:**
  - Automatic `AFTER INSERT ON auth.users` trigger.
  - Automatically provisions clean `profiles` and `user_preferences` rows for every newly registered production user.

---

## 3. Consolidated Production Migration Script

A consolidated single-file migration script has been generated at:
`supabase/migrations/combined_production_migration.sql` (634 lines).

This allows executing all 19 tables, indexes, RLS policies, and RPC functions in a single transaction in the Supabase SQL Editor.

---

## 4. Frontend Compatibility & Test Verification

- **Vitest Suites:** 18 / 18 test files passing.
- **Individual Tests:** 164 / 164 tests passing.
- **TypeScript:** `tsc -b` passes cleanly with 0 type errors.
- **Production Build:** Vite production bundle generated successfully in 2.06s.
- **Auth Store:** Hardened to handle graceful profile loading and mock test sandboxing without unhandled network exceptions.
