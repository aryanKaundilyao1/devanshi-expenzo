# Frontend engineering architecture and contracts

## Stack
React 19, Vite, TypeScript strict, Tailwind v4, React Router v7, Radix UI, Lucide, Recharts, RHF+Zod, Zustand. Unit tests Vitest + Testing Library, E2E Playwright. Native browser APIs for CSV and print, no paid services.

## Suggested directories
```
frontend/src/
  app/{main.tsx,routes.tsx,providers.tsx}
  layouts/{MarketingLayout,AuthLayout,AppLayout}.tsx
  components/{ui,finance,charts,navigation}/
  features/{marketing,auth,onboarding,dashboard,expenses,transactions,categories,budgets,recurring,banking,investments,ai-assistant,ai-insights,planner,reports,learning,notifications,settings}/
  domain/{types,calculations,selectors,validators}/
  services/{contracts,mocks,fixtures}/
  state/{financeStore,investmentStore,chatStore,uiStore,demoSessionStore}/
  utils/{money,date,csv,urls}/
  styles/
```

## Service interfaces
`FinanceService` getAccounts/getTransactions/createTransaction/updateTransaction/deleteTransaction/getBudgets/upsertBudget; `BankingService` transfer/getStatement/getBills; `InvestmentService` getQuotes/getHoldings/upsertHolding/getWatchlists; `InsightsService` generateInsights/answerQuestion; `ReportService` generate/export; `SettingsService` savePreferences/reset. Methods async-return Promise to ease future adapters even if mocks resolve immediately. Never expose raw localStorage access directly from feature components.

## State rules
Use normalized IDs and selectors. Update transaction+account effects atomically in store actions. Derive balance from opening balances+ledger (never independently mutating cached balances). Derive budget totals/portfolio metrics, do not persist redundant computed numbers. One canonical source for transaction list; banking and expenses both filter that source. Store versioned seeded snapshots; state migrations only in persistence boundary.

## Query and navigation
Typed route registry; `useSearchParams` for period/category/search. Route guards for demo session only; mark nonsecure. No dynamic eval or unsafe HTML from messages/descriptions. Disallow unsafe external URL navigation.

## Error handling and accessibility
Root error boundary; feature fallback; toast service; accessible dialogs with aria-describedby; keyboard-first forms. Financial calculations tested separately from UI. Responsive checks at 390, 768, 1440px. All icon-only controls aria-label. Preserve anchor semantics for navigation.

## Deployment
Static SPA host with history fallback to index.html, Vite build and environment config. No network reliance. Do not ship actual financial secrets or fake live prices.
