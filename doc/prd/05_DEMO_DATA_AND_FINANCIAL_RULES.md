# Demo data, money math and persistence

## Data contract
Use typed IDs; store amounts as integer paise (`amountMinor`) and currency `INR`, not JS floating point rupees. Entities: UserProfile, Preference, FinancialAccount, Transaction, Category, Budget, RecurringRule, SavingsGoal, Instrument, StockQuote, InvestmentTransaction, InvestmentHolding, Watchlist, Insight, ChatSession/Message, Notification, GeneratedReport. `demoAsOf='2026-10-15'` globally. All timestamps are ISO; display in Asia/Kolkata time.

## Exact default seed — Professional persona
- Account `acct_hdfc`: "Everyday Savings", bank HDFC (fictional account), available 5000000 paise (₹50,000).
- `acct_sbi`: "Goals Savings", SBI (fictional), available 2520000 paise (₹25,200).
- `acct_cash`: "Cash Wallet", available 200000 paise (₹2,000). Initial displayed total liquid cash ₹77,200. Seed starting balances must be derived consistently from seed ledger or treated as opening balances at 2026-10-01; use opening balances + transactions, never both duplicate counted.
- Define October 2026 transactions with dates <= demoAsOf, e.g. salary +₹52,000 Oct 1 in HDFC; rent −₹12,000 Oct 2 HDFC; groceries −₹2,000 Oct 4 HDFC; transport −₹500 Oct 6 wallet; dining −₹800 Oct 8 HDFC; transfer ₹5,000 HDFC->SBI Oct 10; electricity −₹1,500 Oct 11 HDFC; shopping −₹2,000 Oct 12 HDFC. **Seed opening balances separately and compute current balance.** Target initial displayed balances can be achieved by solving opening balance = desired current − net ledger delta.
- Budgets: Food ₹6,000/month, Shopping ₹4,000, Transport ₹2,000, Utilities ₹3,000, Housing ₹15,000. Goal: Laptop ₹60,000 by 2027-10-15, current progress ₹12,000 (goal allocation separate from cash, not another additive asset). Demo investments: 10 TCS at fictional ₹3,500 and 5 INFY at fictional ₹1,500, costs ₹3,200 and ₹1,400 respectively, portfolio value ₹42,500; timestamps marked DEMO (not live).
- Seed 6–10 notifications generated from rules; 3 insight examples derived from seeded numbers, never inconsistent independent literals.

## Finance calculation requirements
`accountBalance(accountId)=openingBalance+sum(signed movements)`. Income positive, expense negative, transfers debit source / credit destination in a single atomic operation with one transfer ID and two ledger legs or equivalent normalized semantics. Exclude transfers from income and expense totals. Cash total excludes available credit and investments. `monthlyExpenses=sum(expenses in selected period)`, refunds/reversals use explicit types and adjust properly. Budget `spent` derives from expense ledger, not stored field. Portfolio = sum(qty*demoQuote) with integer/decimal safe math; holdings cost basis tracked from purchase events; do not automatically debit bank balance when user *records an existing holding*. Distinguish 'Record existing holding' vs 'Buy in demo simulator' (latter disabled initially). Net worth if shown = liquid assets + holdings − explicitly represented liabilities, avoid cash+goal double count. Dates and comparisons use demo clock.

## Persistence and consistency
Zustand state -> versioned localStorage (`expenzo-demo:v1`). Schema migration/reset when version changes; provide Reset Demo. Never persist uploaded receipt photos or real bank credentials. Demo seed is immutable baseline, derived selectors recalc on mutations. Browser refresh preserves demo modifications. Separate personas use distinct seed datasets, reset when switching with confirmation. Incognito/localStorage errors show nonpersistent mode warning.

## Data validation
Nonzero positive transaction amount; min ₹0.01; required category for expense/income; owned account IDs; target account differs from source; insufficient funds stops demo transfer if deposit accounts; valid dates; guard duplicate submit; no delete of account with attached ledger until records reassigned/archived. Ensure date range includes demo clock unless user changes it.

## Currency decision
INR only for functional prototype. Show other currencies as planned, not as fake formatted conversion. Use Indian number formatting consistently.
