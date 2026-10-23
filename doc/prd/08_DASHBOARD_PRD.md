# Dashboard `/app/dashboard` PRD

## Layout
Header greeting, Demo As-of date and data badge, range segmented 7D/30D/90D/1Y/Custom. Quick Add Expense / Add Income / Ask AI / New Goal. KPI row: Liquid cash, Inflow, Outflow, Investment value; optional net worth only if correctly derived. Primary two-column: income-v-expense trend chart, category donut + legend; secondary: recent transaction list (last 5), category budget progress, upcoming bills, investment snapshot, top two rules-based insights.

## Control specification
- Period chip -> change `?period=7d|30d|90d|1y`; all period-dependent cards/charts update using demo clock.
- Custom -> date picker; submit -> `?start=YYYY-MM-DD&end=YYYY-MM-DD`; invalid range inline validation.
- Add Expense/Income -> TransactionForm modal; save -> close, success toast and immediately recompute KPI/chart/budget.
- Ask AI -> `/app/ai-assistant?context=dashboard`.
- New Goal -> GoalModal, save -> update planner and card.
- Cash KPI card -> `/app/banking`; spending KPI -> `/app/expenses`; portfolio KPI -> `/app/investments`.
- Category segment click -> `/app/transactions?category=<id>&period=<period>`.
- Recent row click -> `/app/transactions/:id`; View All -> `/app/transactions`.
- Budget item click -> `/app/budgets?category=<id>`.
- Bill item -> `/app/banking/bills`; holding/market summary -> `/app/investments`.
- Insight click -> `/app/ai-insights/:id` with exact evidence and date range.

## Empty/error states
No transactions -> show helpful 'Add your first transaction' CTA; no investments -> Add Holding; no bills -> Create reminder; zero budget -> Create budget. No chart should invent a trend from nonexistent data. Long numeric values truncate only with tooltip or full access.

## Acceptance
Seed summaries match ledger; transaction mutation updates view without page reload; all links and time filters work; responsive cards stack on mobile.
