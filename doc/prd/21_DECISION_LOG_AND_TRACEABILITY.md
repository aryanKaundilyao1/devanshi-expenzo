# Decision register and feature traceability

## Locked decisions
- D001 React + Vite + TypeScript SPA, Spring Boot later.
- D002 Frontend-only demo, no real financial integrations or production auth.
- D003 Default currency INR; no fake FX conversion.
- D004 All data fictional; fixed demo clock 2026-10-15; versioned localStorage.
- D005 One normalized canonical ledger, derived selectors for balances/budgets.
- D006 Free insight engine is offline/rules-based; no LLM claims.
- D007 Stitch is visual-design reference, not authoritative code architecture.
- D008 Transfers not income/expense; holdings not double-counted as cash.
- D009 Every interactive control has route/action/effect/test evidence.
- D010 No production backend or banking/trading services until separate approval.

## Change control
Change proposal must include reason, affected routes, data contract, button/action matrix rows, affected tests and migration impact. Update this log with date and decision. If new route is introduced, edit 02 + 17 + 18 together.

## Traceability templates
| Requirement | Spec | Action contract | Test |
|---|---|---|---|
| Demo onboarding | 07 | 17 auth rows | E01,E16 |
| Ledger accounting | 05,09 | 17 transaction rows | E02-E06 |
| Budget alerts | 09,12 | 17 budget/insight rows | E07,E08 |
| Banking demo | 10 | 17 banking rows | E04,E12 |
| Investments | 11 | 17 investment rows | E10 |
| Free insights | 12 | 17 AI rows | E08,E09 |
| Goals/reports | 13 | 17 planner/report rows | E11,E12 |
| Settings/notifications | 14 | 17 settings rows | E13,E16 |

## Unknowns intentionally deferred
Financial provider agreements, KYC, legal obligations, real brokerage, investment advice compliance, hosted AI provider, live stock feeds, multi-currency conversion, production authentication. Prototype must not imply any is complete.

## Phase 1 Execution Log (2026-10-23)
- Phase 1 Frontend Foundation, Design System, Routing & Application Shells implemented and verified.
- 17/17 Vitest unit and route integration tests passed.
- Production build verified with Vite (`tsc -b && vite build`) with 0 errors.
- Gate 1 approval criteria met.

## Phase 2 Execution Log (2026-10-23)
- Phase 2 Public Marketing Website fully implemented across all 10 public routes.
- Homepage rendered in exact 10-section PRD specification.
- Interactive Dashboard Preview, tabbed Features explorer with hash support, deterministic AI playground, demo account switcher, and Zod contact form implemented.
- 25/25 automated tests passed (8 new marketing integration tests added).
- Production build verified (`tsc -b && vite build`) in 1.20s with 0 errors.
- Gate 2 approval criteria met. Ready for Phase 3.

## Phase 3 Execution Log (2026-10-23)
- Phase 3 Authentication, Demo Session Management & Personalized Onboarding fully implemented.
- Routes `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, and `/onboarding` implemented.
- `useAuthStore` created with local persistence (`expenzo-auth-session:v1`) supporting 5 demo personas (Student, Professional, Family, Investor, Older Adult).
- `PersonaSelectorDialog` modal built and integrated into login and onboarding.
- Password strength meter (Too short / Weak / Medium / Strong) added to `/auth/register`.
- Clear educational prototype disclosures added to recovery and email verification flows.
- 7-step onboarding wizard implemented with experience level, persona, goals, complexity, theme, and seeded vs clean slate setup.
- Route protection guard (`ProtectedRoute`) and Topbar session/logout integration verified.
- 34/34 automated tests passed (9 new auth/onboarding integration tests added).
- Production build verified (`tsc -b && vite build`) in 1.20s with 0 errors.
- Gate 3 approval criteria met.

## Phase 4 Execution Log (2026-10-23)
- Phase 4 Core Financial Dashboard, Interactive Analytics & Unified Financial Command Center fully implemented.
- Dashboard mounted at `/app/dashboard`, bound directly to `useFinanceStore` without secondary mock stores.
- 6 primary KPI metric cards computed from canonical ledger: Available Cash (₹77,200), Inflow (₹52,000), Outflow (₹18,800), Portfolio (₹42,500), Net Worth (₹1,19,700), and Savings Goal Progress (₹12,000 / ₹60,000).
- Period filter chips (`7D`, `30D`, `90D`, `1Y`) dynamically updating flow metrics while strictly preserving point-in-time balance totals.
- Recharts Cash Flow Dynamics AreaChart (Inflow vs Outflow) with single-stream toggles.
- Recharts Category Spending Donut with top-spend badge and ranking distribution.
- Recent transactions feed with real-time updates and direct deep-links.
- Transaction creation modal (Expense, Income, Transfer) with balance insufficiency warnings and instantaneous multi-widget recalculation.
- Net Worth Accounting Breakdown dialog with Zero Double-Counting Guarantee explanation.
- Budget utilization widget with 80% threshold warnings.
- Investment portfolio snapshot with active holdings (TCS, INFY), returns, and statutory risk disclaimer.
- Upcoming bills commitment widget with auto-debit badges.
- Rules-based deterministic intelligence cards.
- Customize Dashboard widget dialog with local visibility persistence.
- Persona layout adaptation (e.g. Student persona prioritizing budgets and savings over portfolio) and clean slate empty workspace handling.
- 48/48 automated tests passed across all 7 test suites (14 new dashboard tests added).
- Production build verified (`tsc -b && vite build`) in 1.75s with 0 errors.
- Gate 4 approval criteria met. Ready for Phase 5.

## Phase 5 Execution Log (2026-10-23)
- Phase 5 Complete Expense Tracker, Transaction Management, Categories, Budgets & Recurring Payments fully implemented.
- Routes `/app/expenses`, `/app/transactions`, `/app/transactions/:id`, `/app/categories`, `/app/budgets`, and `/app/recurring` implemented and wired to React Router.
- Unified transaction CRUD utilizing extended `TransactionModal` with edit prefilling, instant balance updating, and deletion with balance reversal.
- Searchable & filterable transaction ledger with bi-directional URL query sync and formula-injection-safe CSV export.
- Full transaction detail audit page (`/app/transactions/:id`) with 404 fallback.
- Category management (`/app/categories`) with icon and color customization, and safe transaction reassignment dialog on deletion.
- Budget management system (`/app/budgets`) with budget vs actual bar chart and threshold alert states.
- Recurring commitments engine (`/app/recurring`) with zero phantom deduction guarantee, monthly projection metrics, and single-occurrence ledger posting with calendar advance.
- Natural-language Smart Entry parser (`smartEntryParser.ts`) with multi-clause extraction and editable confirmation.
- Receipt scanner prototype with file validation, preview, and canned supermarket fixture.
- 66/66 automated tests passed across all 8 test suites (18 new Phase 5 tests added).
- Production build verified (`tsc -b && vite build`) in 1.79s with 0 errors.
- Gate 5 approval criteria met. Ready for Phase 6.

## Phase 6 Execution Log (2026-10-23)
- Phase 6 Digital Banking, Multi-Account Aggregation, Simulated Transfers, Statements, Bills & Services fully implemented.
- Routes `/app/banking`, `/app/banking/accounts`, `/app/banking/accounts/:id`, `/app/banking/transfer`, `/app/banking/beneficiaries`, `/app/banking/transactions`, `/app/banking/statements`, `/app/banking/bills`, `/app/banking/cards`, `/app/banking/deposits`, `/app/banking/loans`, and `/app/banking/services` fully implemented and wired to React Router.
- Multi-Account aggregation displays derived balances strictly from canonical ledger (HDFC ₹50,000, SBI ₹25,200, Cash ₹2,000) preserving exact target liquid cash of ₹77,200.
- Account directory supports search, filter by type (savings, checking, wallet, credit), sorting, and creation of new demo accounts.
- Zero-Balance account closure policy strictly enforced: accounts with non-zero balances cannot be archived; accounts with ₹0 balance archive cleanly while retaining historical ledger transactions.
- Simulated internal transfers execute atomic double-entry debit and credit, generating synthetic receipt numbers, live post-transfer balance previews, and strictly conserving aggregated cash and net worth with zero external income/expense leakage.
- Beneficiary management directory implemented for organizing external demo contacts with honest non-transfer disclosures.
- Periodic statement generator with mathematical invariant check: Closing Balance = Opening Balance + Total Credits - Total Debits, verified with running balances, print view, and injection-safe CSV export.
- Bills management module tracking upcoming, due soon, overdue, and paid bills; one-click "Pay Demo" logs expense directly into canonical ledger and prevents duplicate payments.
- Card showcase featuring virtual debit/credit cards with live simulated security freezing and nickname customization.
- Term deposits calculator implementing Indian quarterly compounding for Fixed Deposits (FD) and Recurring Deposits (RD) with plan persistence.
- Loan and EMI calculator with presets (Home, Car, Personal, Education), monthly EMI derivation, and yearly amortization schedule table.
- Banking services directory with active modules and informative compliance roadmap dialogs for future Account Aggregator/UPI integrations.
- Free deterministic rules-based AI banking insights (highest outflow account, largest banking expense, upcoming bills warning, cash-flow summary, balance warnings, recurring commitments).
- 89/89 automated tests passed across all 9 test suites (23 new Phase 6 banking tests added).
- Production build verified (`tsc -b && vite build`) in 1.86s with 0 errors.
- Gate 6 approval criteria met.

## Phase 7 Execution Log (2026-10-23)
- Accelerated Phase 7 (Complete Financial Intelligence & Investment Experience) combining Work Packages 7A–7F fully implemented.
- **7A Investments & Stocks:**
  - Expanded 15-stock Indian equity & ETF catalog (`stockCatalog.ts`) with historical quotes across 1M, 3M, 6M, 1Y.
  - Implemented `/app/investments`, `/app/investments/holdings`, `/app/investments/discover`, `/app/investments/stocks/:symbol`, `/app/investments/watchlists`, `/app/investments/watchlists/:id`, and `/app/investments/analytics`.
  - Holdings CRUD (`addHolding`, `updateHolding`, `deleteHolding`) and Watchlists CRUD (`createWatchlist`, `updateWatchlist`, `deleteWatchlist`, `toggleWatchlistTicker`).
  - Portfolio metrics calculation (invested, current, unrealized P&L, day change), Recharts Asset Allocation Donut, Sector Allocation, and Diversification score with concentration warnings.
  - Full statutory market risk disclaimers and simulated pricing disclosures displayed on all views.
- **7B Free AI Intelligence & Insights:**
  - Implemented offline, deterministic client-side intent parsing engine (`intentRegistry.ts`) recognizing 12 distinct financial intent categories (expenses, biggest expense, food, income, banking accounts, bills, budgets, investments, largest holding, goals, education concepts, and fallback).
  - Built 12 explainable insight rules (`insightRules.ts`) with stable rule IDs, numeric calculation formulas, and confidence scores.
  - Implemented multi-turn conversational AI Assistant (`/app/ai-assistant`) with persona-isolated localStorage persistence (`expenzo-ai-chat:v1:{persona}`), structured response cards, actionable deep links, and quick-prompt chips.
  - Implemented AI Insights command center (`/app/ai-insights`) and detailed rule explorer (`/app/ai-insights/:id`).
  - Strict zero paid LLM/API dependencies; 100% private, free, and client-side.
- **7C Financial Planner & Goals:**
  - Implemented `/app/planner`, `/app/planner/goals/:id`, and `/app/planner/simulator`.
  - Savings Goal CRUD and milestone progress tracking.
  - Recorded goal contribution action (`recordGoalContribution`) strictly adhering to the mental planning allocation invariant (zero artificial cash account deduction or synthetic double-counting).
  - Monthly required contribution calculator using calendar day math.
  - Interactive What-If Simulator with sliders for monthly savings boost, expense cut, and investment expected return, rendering interactive Recharts wealth accumulation projections.
- **7D Financial Reports & Analytics:**
  - Implemented `/app/reports` and `/app/reports/:type` for 10 standardized financial report types.
  - Double-entry reconciliation engine computing income, expenses, net savings, savings rate %, portfolio value, and category breakdowns.
  - Standard print layout styling for print-ready browser PDF export.
  - Formula-injection-safe CSV export protecting against `=`, `+`, `-`, `@`, `\t`, `\r` prefixes.
- **7E Financial Learning Hub:**
  - Implemented `/app/learning` and `/app/learning/:slug` featuring 7 financial literacy topic modules with interactive quizzes and reading progress.
  - Persona-isolated learning state (`expenzo-learning:v1:{persona}`) tracking bookmarked topics and quiz scores.
- **7F Cross-Module Integration & Verification:**
  - Added dedicated integration test suite `phase7Integration.test.tsx` verifying cross-module reactive synchronization across expenses, investments, planner, banking cash conservation, persona isolation, and CSV security.
  - Full test suite passed: 133 / 133 tests passing across 15 test files.
  - Production build verified: `tsc -b && vite build` completed in 1.96s with 0 errors.
  - Gate 7 approval criteria met. Standing by for Phase 8.

## Phase 8 Execution Log (2026-10-23) — FINAL PROTOTYPE COMPLETION & RELEASE SIGN-OFF
- Phase 8 (Final Prototype Completion & Release Audit) fully completed.
- **8A Settings & Customization:**
  - Implemented responsive sub-navigation in `SettingsLayout.tsx` across Profile, Appearance, Financial Rules, Security, Connections, Privacy, and Notifications tabs.
  - Profile Settings: User profile updates (display name, email, persona switching among 5 archetypes, financial literacy, complexity mode).
  - Appearance Settings: Light, Dark, System theme mode; comfortable vs. compact density; reduced motion; high contrast.
  - Financial Rules Settings: Locked INR currency display, simulated system clock (`2026-10-15`), default monthly budget cap, fiscal month start day, and Indian vs. International numeric formatting.
  - Security Settings: Honest sandbox disclosures, simulated active session ID, remember session toggle, browser localStorage storage breakdown, instant sandbox reset, and Phase 12+ real-auth roadmap preview dialog.
  - Connections Settings: Directory of connected demo accounts with balance indicators, Add Demo Account modal, edit/archive controls, and informative RBI Account Aggregator roadmap modal.
  - Privacy Settings: Zero-telemetry policy, JSON workspace export, schema-validated JSON workspace import with live data preview, individual module clear, and master factory reset.
  - Notification Settings: 7 configurable deterministic alert rule toggles (budget overruns, bill due dates, low balances, monthly summaries, goal milestones, portfolio concentration, product notices) updating evaluator rules.
- **8B Notifications Center:**
  - Implemented `/app/notifications` with unread notification counter badge, category filter tabs (All, Alerts, Bills, Budgets, System), mark all as read, individual dismiss, clear all, and deep links into relevant modules.
  - Built deterministic rule evaluator `notificationGenerator.ts` triggered automatically against current store state.
- **8C Route & Navigation Audit:**
  - Audited all 58 application routes (0 placeholders remaining; all 8 former placeholders cleanly converted into production pages).
  - Wired full compatibility redirects (`/app/planner` -> `/app/financial-planner`, `/app/learning/:slug` -> `/app/financial-learning/:slug`, etc.).
  - Header search, user profile menu, notification bell, bottom mobile navigation, and sidebar navigation completely integrated with real routes.
- **8D Every-Button Verification & Interaction Audit:**
  - Audited 290 interactive elements across the application (`doc/FINAL_CLICK_AUDIT.md`). Zero dead buttons, zero broken forms, zero silent failures.
- **8E Financial Consistency & Reconciliation Audit:**
  - Audited all 6 financial test scenarios (`doc/FINAL_FINANCIAL_RECONCILIATION.md`). Verified exact conservation of cash in internal transfers, correct Net Worth formulas, and mental planning allocation invariant.
- **8F Comprehensive QA & Viewport Audit:**
  - Verified mobile (375px), tablet (768px), and desktop (1280px) responsive layouts.
  - Verified ARIA roles, high contrast mode, reduced motion, keyboard accessibility, and 4.5:1 color contrast. Full report documented in `doc/FINAL_QA_REPORT.md`.
- **8G Demo Script & Presentation Guide:**
  - Authored step-by-step presentation script `doc/DEMO_WALKTHROUGH.md` covering 10-minute demo, 3-minute executive pitch, persona switching showcase, transfer reconciliation, and What-If simulator.
- **8H Frontend Release Checklist & Sign-Off:**
  - Verified 25/25 checklist items in `doc/FRONTEND_RELEASE_CHECKLIST.md`.
  - All 17 automated test suites passed: **160 / 160 tests passing (100%)**.
  - Production build verified: `tsc -b && vite build` completed in 1.93s with 0 errors.
  - Status: **PROTOTYPE RELEASE CANDIDATE APPROVED — READY FOR DEMO**.






