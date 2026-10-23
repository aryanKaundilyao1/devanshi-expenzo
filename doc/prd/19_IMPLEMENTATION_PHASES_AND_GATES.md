# Frontend implementation phases and gate policy

## Work order
0. Discovery and PRD approval — read specs and inspect repository; no code changes until approval of pack (user has now requested PRD creation, not application build).
1. Foundation: Vite/React/TS, Tailwind, routing, layouts, tokens, global interactions, stores, fixture schema, mocked service interfaces. Gate: all placeholder routes reachable, design primitives responsive, data selectors tested.
2. Marketing: all public pages and CTA routing. Gate: no dead links, no fake real product claims, Lighthouse-style usability audit.
3. Demo auth and onboarding: persona switch, safe demo session, intro, form validations. Gate: entry/exit/deep-route tests.
4. Core ledger + dashboard: opening balances, transfer math, KPI selectors, charts and quick actions. Gate: E02-E05 and KPI reconciliation.
5. Expense module: expenses, transactions, categories, budgets, recurring. Gate: CRUD/search/CSV and E06-E07,E17.
6. Banking: accounts, statements, bills, services, demo transfer. Gate: consistent ledger and no bank credential claims.
7. Investments: quote fixtures, holdings, watchlists, discover, analytics. Gate: E10 and data timestamp disclosures.
8. Free assistant and insights: intent engine, explainable rule cards, chat persistence, evidence links. Gate: E08-E09 and offline proof.
9. Planner, reports, learning: goals, simulator, snapshot reports, glossary and quizzes. Gate: E11-E12.
10. Settings and notifications: appearance, persona, privacy, reset, alerts. Gate: E13,E16 and persistence.
11. Full QA polish: E01-E18 across viewport/themes, performance/keyboard audit, code cleanup, documentation. Gate: frontend prototype release candidate.

## Required phase report
`PHASE_PROGRESS.md`: scope, implemented routes, action registry coverage, fixture assumptions, files changed, tests run with results, screenshots, unresolved blockers, accepted deviations, suggested next phase. Do not quietly skip a failed test.

## Implementation definition of done
Routes render + refresh; controls work and have accessible labels; mutations update all related modules; visuals follow tokens; demo labels are accurate; meaningful empty/validation states; responsive on three viewports; no secrets; tests pass.

## Out-of-scope future phases
12 Spring Boot backend + real authentication; 13 database and true service connectors; 14 live authorized banking/market feed integration and consent; 15 real AI service evaluation; 16 production security/compliance/deployment. These require independent specifications and permission; do not begin during prototype implementation.
