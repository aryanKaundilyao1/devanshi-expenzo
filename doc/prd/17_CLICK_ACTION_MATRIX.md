# Click-by-click acceptance matrix

Each row is a binding contract: trigger -> outcome -> observable proof. Every page also has global logo/sidebar/breadcrumb and back/forward navigation from `04_GLOBAL_INTERACTION_CONTRACT.md`.

| Route/screen | Trigger | Result / destination | Acceptance evidence |
|---|---|---|---|
| `/` | Get Started | `/auth/register` | proper route |
| `/` | Explore Features | `/features` | correct heading |
| `/` | Try Demo | demo chooser then `/app/dashboard` | Demo badge present |
| `/features` | feature tab | change hash and preview | selected panel visible |
| `/ai` | example question | response preview | 'Illustrative' label |
| `/banking-info` | Demo Banking | demo session then `/app/banking` | sample accounts |
| `/investments-info` | Demo Stocks | demo session then `/app/investments/discover` | sample quotes |
| `/contact` | Send | validation; no actual send | 'not sent' notice |
| `/auth/login` | Enter Demo | persona picker -> dashboard/onboarding | session established |
| `/auth/login` | Sign In | real login unavailable message | no fake auth |
| `/auth/register` | Create Account | validation then demo-only notice | no fake account |
| `/auth/forgot-password` | Reset | unavailable email notice | no claim sent |
| `/auth/reset-password` | Update | unavailable backend notice | no fake token |
| `/auth/verify-email` | Verify | unavailable backend notice | no fake verified |
| `/onboarding` | Next/Back | wizard controls | inputs persist |
| `/onboarding` | Finish/Skip | `/app/dashboard` | preferences stored |
| `/app/dashboard` | period chips | update query+KPIs | totals change appropriately |
| `/app/dashboard` | Add Expense/Income | shared transaction dialog | totals update after save |
| `/app/dashboard` | Ask AI | assistant with context | correct route |
| `/app/dashboard` | KPI/card/category click | related module filtered | selected context visible |
| `/app/expenses` | Smart Entry | editable parsed transaction preview | confirm required |
| `/app/expenses` | Receipt | preview/sample demo | no fake OCR claim |
| `/app/transactions` | Search/Filter/Sort | URL+rows update | CSV matches rows |
| `/app/transactions` | row | `/app/transactions/:id` | correct record |
| `/app/transactions/:id` | Edit/Save | changes canonical ledger | dashboard changes |
| `/app/transactions/:id` | Delete | confirm -> list | restored balances |
| `/app/categories` | Add/Rename | category store mutation | ledger labels consistent |
| `/app/categories` | Delete used | reassignment or block | no orphan category |
| `/app/budgets` | Create/Edit/Delete | modal + store mutation | progress recalculated |
| `/app/budgets` | View Transactions | filtered ledger | right category/period |
| `/app/recurring` | Add/Edit/Pause | update reminder rules | future dates update |
| `/app/recurring` | Record occurrence | transaction prefill | no auto-charge |
| `/app/banking` | View Account | `/app/banking/accounts/:id` | correct balance |
| `/app/banking` | Demo Transfer | review then store transfer | source/destination change |
| `/app/banking` | Connect Bank | unavailable explainer | no credential form |
| `/app/banking/accounts/:id` | Statement | `/app/banking/statements?account=id` | selected account |
| `/app/banking/transactions` | row | canonical transaction detail | same ID |
| `/app/banking/statements` | Generate | computed opening/movements/closing | sums reconcile |
| `/app/banking/statements` | CSV/Print | file or print dialog | DEMO watermark |
| `/app/banking/services` | service tile | feature detail | demo-only or unavailable |
| `/app/banking/bills` | Add/Edit/Delete | reminder changes | no payment claimed |
| `/app/banking/bills` | Record expense | transaction form | explicit confirmation |
| `/app/investments` | View holdings/discover | respective routes | correct page |
| `/app/investments/holdings` | Add/Edit/Remove | holdings store | valuation changes |
| `/app/investments/discover` | Search/Filter | demo directory | correct matches |
| `/app/investments/discover` | stock result | `/app/investments/stocks/:symbol` | quote shown |
| `/app/investments/stocks/:symbol` | Watch | watchlist picker | saved membership |
| `/app/investments/stocks/:symbol` | Record Holding | holding form | no cash debit |
| `/app/investments/watchlists` | Create/Rename/Delete | watchlist store | persistence works |
| `/app/investments/watchlists/:id` | Add/Remove stock | members update | no duplicates |
| `/app/investments/analytics` | Ask AI | assistant portfolio context | related prompts |
| `/app/ai-insights` | filters/Refresh | local rule recalculation | evidence current |
| `/app/ai-insights` | Review | `/app/ai-insights/:id` | evidence view |
| `/app/ai-insights/:id` | Related records | filtered module | matching evidence |
| `/app/ai-assistant` | Send | supported demo answer | exact sums |
| `/app/ai-assistant` | New Chat | new local thread | route changes |
| `/app/ai-assistant/:chatId` | Delete Chat | confirm and redirect | stored thread removed |
| `/app/financial-planner` | New Goal | goal modal | goal saved |
| `/app/financial-planner/goals/:id` | Add Contribution | goal allocation update | cash unchanged |
| `/app/financial-planner/simulator` | Sliders/Calculate | new projection | formula accurate |
| `/app/financial-planner/simulator` | Apply Plan | confirm -> planned value | no bank movement |
| `/app/reports` | Generate | `/app/reports/:id` | snapshot correct |
| `/app/reports/:id` | CSV/Print | export/print | totals same as report |
| `/app/learning` | Article/Quiz | detail/modal | graded demo answer |
| `/app/learning/topics/:slug` | Ask AI | assistant context topic | educational answer |
| `/app/notifications` | row/mark read | route + unread update | bell count changes |
| `/app/settings/profile` | Save | persisted preference | greeting changes |
| `/app/settings/appearance` | Theme | change and persist | reload retained |
| `/app/settings/connections` | Connect Real | unavailable explanation | no credentials |
| `/app/settings/privacy` | Download/Reset | JSON/confirm reset | deterministic seed restored |
| `/app/settings/notifications` | Save toggles | prefs persist | subsequent alerts respect |
| Global header | Search | command palette navigation | keyboard accessible |
| Global avatar | Logout | confirm -> `/auth/login` | demo session cleared |

## Exhaustiveness protocol
For every screen created, add an entry to a machine-readable `ui-actions.json` list of interactive controls with route, test identifier, action, output state and E2E test. An icon that looks clickable must either have a tested action or be visually noninteractive. Do not leave silent buttons.
