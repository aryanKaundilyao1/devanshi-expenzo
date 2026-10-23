# Information architecture and routes

## Layout shells
`MarketingLayout`: header, primary navigation, footer. `AuthLayout`: form-focused shell. `AppLayout`: collapsible desktop sidebar, topbar, content, responsive mobile drawer/bottom shortcuts. `NotFound`: 404 and return buttons. Root `/app` redirects to `/app/dashboard`; `/app/settings` redirects to `/app/settings/profile`.

## Public routes
`/` Home; `/features` Features; `/ai` AI; `/banking-info` Banking; `/investments-info` Investments; `/about` About; `/security` Security; `/contact` Contact; `/privacy` Privacy; `/terms` Terms.

## Auth routes
`/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/onboarding`.

## App routes
- `/app/dashboard`
- `/app/expenses`; `/app/transactions`; `/app/transactions/:id`; `/app/categories`; `/app/budgets`; `/app/recurring`
- `/app/banking`; `/app/banking/accounts/:id`; `/app/banking/transactions`; `/app/banking/statements`; `/app/banking/services`; `/app/banking/bills`
- `/app/investments`; `/app/investments/holdings`; `/app/investments/discover`; `/app/investments/stocks/:symbol`; `/app/investments/watchlists`; `/app/investments/watchlists/:id`; `/app/investments/analytics`
- `/app/ai-assistant`; `/app/ai-assistant/:chatId`; `/app/ai-insights`; `/app/ai-insights/:id`
- `/app/financial-planner`; `/app/financial-planner/goals/:id`; `/app/financial-planner/simulator`
- `/app/reports`; `/app/reports/:id`; `/app/learning`; `/app/learning/topics/:slug`; `/app/notifications`
- `/app/settings/profile`; `/app/settings/appearance`; `/app/settings/financial`; `/app/settings/security`; `/app/settings/connections`; `/app/settings/privacy`; `/app/settings/notifications`

## Sidebar group structure
**Overview** Dashboard, Expenses (Transactions/Categories/Budgets/Recurring), Banking (Accounts/Transactions/Statements/Services/Bills), Investments (Holdings/Discover/Watchlists/Analytics). **Intelligence** AI Assistant, AI Insights, Financial Planner. **More** Reports, Learn, Notifications, Settings. Sidebar active state derives from route pathname; nested route expansion follows active section.

## Routing contracts
Click cards may navigate to detail pages; query filters must be URL params (e.g. `/app/transactions?category=Food&period=this-month`, `/app/investments/discover?q=TCS`). Invalid IDs show an inline 'Not found' state and back link rather than a crash. Browser back/forward preserves location and filter state. All routes must survive refresh in production SPA hosting via fallback rewrite.

## Mobile
Header hamburger toggles accessible navigation drawer; optional bottom shortcuts for Home, Expenses, Banking, AI, More. Never hide routes entirely on mobile. Touch targets >=44x44 CSS px.
