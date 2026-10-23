# Global interaction contract

## Shared UI conventions
- Primary actions perform action or navigate; disabled/unavailable actions must explain status via visible explanatory copy.
- Forms use Zod validation and inline messages; primary Save disabled only when appropriate, not silently inert. Save persists demo data and closes modal; success toast + visible state update.
- Confirm destructive actions: delete transaction/category with dependencies, reset demo data, logout, remove watchlist. Escape and Cancel preserve state.
- Loading skeletons may be simulated for 200–500ms only if useful; avoid needless delays. Errors show Retry when retry is meaningful.
- Filters/sorting reflected in URL query params for list pages; Clear resets all and updates URL.
- Date range default 'This month' based on fixture demo clock, not real current date. Demo mode should use a fixed date 2026-10-15 for deterministic calculations; include a visible as-of indicator.

## Header actions
Logo -> `/app/dashboard` authenticated, `/` public. Sidebar links -> designated route. Global search opens command palette; search pages/routes and demo merchants/stocks with keyboard shortcut Cmd/Ctrl+K, ESC dismisses. Bell -> `/app/notifications`; click notification -> linked record; avatar -> menu Profile, Appearance, Reset Demo, Log Out; theme toggles light/dark/system. Breadcrumbs -> parent routes.

## Quick actions
Add expense / income -> shared TransactionForm preselected type; Create budget -> BudgetForm; New goal -> GoalForm; Ask AI -> `/app/ai-assistant?context=<page>`; transfer -> only between simulated owned deposit accounts, with clear demo label.

## Modal conventions
No nested modals. Clicking outside dismisses only nonsensitive, non-destructive forms with safe-change prompts if dirty. Confirm action shows effect and details. After navigation preserve only URL-backed state; unsaved dirty forms prompt before leaving.

## Global footer and marketing
Navigation links real routes. Contact form validates locally and shows 'Demo form: message not sent'; no false success. Privacy/terms pages must explicitly describe demonstration status and future plans, not claim compliance.
