# End-to-end scenarios and test specification

## Framework
Playwright for E2E, Vitest for pure financial calculations and rules, Testing Library for dialogs and forms. Seed reset before each test. Demo clock fixed as 2026-10-15. Minimum viewports: 390x844, 768x1024, 1440x900. Test in desktop Chromium and mobile emulation; where available test WebKit/Firefox.

## Critical tests
**E01 Demo entry:** from `/` click Try Demo, choose Professional, verify dashboard, Demo badge, nav. Refresh -> still demo. Logout -> protected route redirects to login.

**E02 Expense mutation:** capture cash and October outflow; add ₹500 Food to HDFC; ledger count+1, HDFC cash −₹500, aggregate cash −₹500, expense total +₹500, budget progress +₹500, AI category summary +₹500. Refresh and verify persisted.

**E03 Income/edit/delete:** add income ₹2,000; inflow and cash +₹2,000. Edit to ₹3,000; net difference +₹1,000. Delete; totals revert exactly.

**E04 Internal transfer:** transfer ₹1,000 HDFC->SBI; source −₹1,000, target +₹1,000; combined cash unchanged; income/expense unchanged; statement transfer legs reconcile.

**E05 Invalid transfer:** source==destination, negative, zero and insufficient funds all blocked with inline errors and unchanged store.

**E06 Filters+export:** set category Food, period October, export CSV; each exported row matches filtered list and no excluded transaction; safe CSV escaping.

**E07 Budget warning:** set budget and create spending to cross 80%, verify alert exactly once; cross 100%, verify exceeded state; delete spending and recalc budget.

**E08 AI rules:** ask 'How much did I spend this month?' record response; add ₹500 expense and ask again; exact amount difference ₹500; offline network disabled and still works.

**E09 AI unsupported:** ask unknown query; safe fallback with suggested examples, no invented amount.

**E10 Holdings:** record 2 demo shares at seeded price; portfolio value increments expected amount; deposit cash unchanged; remove holding reverts. Watchlist add/remove survives refresh.

**E11 Goal:** goal ₹60,000 with ₹12,000 progress and 12 remaining periods -> required ₹4,000/month at 0 return; adjust date, projection recalculates; no bank balance changes.

**E12 Reports:** generate October report; income−expense equals net cash flow, statement balances reconcile, CSV export consistent; print view includes demo disclaimer.

**E13 Reset:** mutate transactions/goals/chat/preferences, reset demo data with confirmation; financial seed restores precisely, preferences retain/reset according to published behavior. Ensure no stale derived state.

**E14 Accessibility:** tab to nav and controls, opening dialog traps focus, ESC cancels, focus restored; no icon-only unnamed buttons; ARIA errors read aloud.

**E15 Routes:** direct deep URL and browser back/forward work on every route; invalid detail ID and 404 show recovery actions.

**E16 Persona switch:** confirm switch, dataset resets to correct isolated persona, no prior persona financial records leak into UI.

**E17 Bill rule:** create recurring bill, no cash deduction; Record Occurrence opens prefilled confirm; only on save does it affect ledger.

**E18 Mobile:** navigate drawer, open forms, edit transaction, view scrollable chart/table, save; no horizontal page overflow.

## Phase exit criterion
All tests relevant to phase pass; lint/typecheck/build succeed; no critical accessibility issues; interactive elements have action mapping; screenshots approved for desktop/mobile; any known limitation documented. Do not mark phase done if an action only shows decorative toast.
