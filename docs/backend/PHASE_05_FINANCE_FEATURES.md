# EXPENZO Backend Implementation — Phase 5 PRD
## Budgets, Goals, Bills, Reports and Settings

### 1. Objective
Connect budgets, savings goals, recurring rules, bill tracking, user preferences, and notification rules to PostgreSQL persistence.

### 2. Affected Existing Files
- `frontend/src/store/useFinanceStore.ts`
- `frontend/src/features/expenses/pages/BudgetsPage.tsx`
- `frontend/src/features/planner/pages/FinancialPlannerPage.tsx`
- `frontend/src/features/banking/pages/BillsPage.tsx`
- `frontend/src/features/settings/pages/*`

### 3. New Files to Create
- `frontend/src/services/apiPlannerService.ts`
- `frontend/src/services/apiSettingsService.ts`

### 4. Database Changes
- `budgets`: Category caps and spending tracking.
- `savings_goals`: Target amount, current saved, target date.
- `goal_contributions`: History of deposits toward goals (strictly mental allocation without double deduction).
- `banking_bills`: Upcoming bills and status (`pending` vs `paid`).
- `user_preferences`: Display preferences, theme, notification alert thresholds.

### 5. Invariants
- Budget spending is dynamically aggregated from `transactions` in the active date window.
- Paying a bill via "Pay Demo" creates a verified expense transaction in `transactions`.

### 6. Acceptance Criteria
- Budgets persist across browser sessions.
- Savings goals progress and milestone contributions persist in PostgreSQL.
- User settings (theme, Indian lakh formatting, notification thresholds) update the database and reload upon sign-in.

