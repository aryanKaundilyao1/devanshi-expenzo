# EXPENZO Backend Implementation — Phase 4 PRD
## Real Accounts, Transactions and Financial Ledger

### 1. Objective
Replace simulated localStorage ledger mutations with persistent, database-backed operations for financial accounts, transactions, and atomic money transfers, preserving canonical double-entry accounting.

### 2. Affected Existing Files
- `frontend/src/store/useFinanceStore.ts`
- `frontend/src/services/apiFinanceService.ts`
- `frontend/src/features/dashboard/pages/DashboardPage.tsx`
- `frontend/src/features/expenses/pages/TransactionsPage.tsx`
- `frontend/src/features/banking/pages/TransferPage.tsx`

### 3. New Files to Create
- `frontend/src/features/banking/services/supabaseBankingService.ts`
- `frontend/src/features/expenses/services/supabaseExpenseService.ts`

### 4. Database Changes
- Table `financial_accounts`: holds manual account balances and active status.
- Table `transactions`: canonical double-entry ledger with `type: 'expense' | 'income' | 'transfer'`.
- RPC `execute_transfer`: ensures atomic debits and credits.

### 5. Financial Invariants
- Consolidated cash = Sum of balances across all active non-credit accounts.
- Transfer neutrality: Internal transfers between owned accounts never alter Net Worth or consolidated income/expenses.
- All monetary amounts stored as integer paise (`amount_minor`).

### 6. Acceptance Criteria
- User creates account $\rightarrow$ persists to PostgreSQL.
- User adds expense/income $\rightarrow$ updates ledger and recalculates dashboard metrics.
- User executes transfer $\rightarrow$ atomic balance adjustments in PostgreSQL with 0 wealth leakage.
- Refreshing the browser or signing in from another device retrieves identical financial state.

