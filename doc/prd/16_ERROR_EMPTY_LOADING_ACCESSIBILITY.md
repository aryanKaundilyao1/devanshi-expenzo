# Error, empty, loading, and inclusive UX states

## Standard states
- Loading: skeleton with accessible busy label only for true asynchronous operation or intentional short prototype simulation.
- Empty: explain missing records + focused CTA (Add Expense, Create Budget, Add Holding, Create Goal).
- No search results: show applied filters, Clear Filters action; do not confuse with no-data state.
- Invalid URL detail ID: "Not found" and link to collection.
- Storage unavailable/full: warning that demo changes may not persist; app usable in memory.
- Import/receipt uploaded: preview local file metadata, no invented OCR; Try sample extraction separate action.
- Unsupported AI question: supported prompt suggestions; never invent answer.
- Network offline: prototype still works; no external APIs.
- Overdue goal, zero balances, negative net cash flow, empty watchlist, overspent budget: meaningful formatting and copy.

## Validation/accessibility
Use inline errors, focus first invalid field on submission, 44px mobile touch targets, focus-visible indicators, screen reader labels for money deltas, proper table headers, alternatives to chart visuals, keyboard navigation and ESC/focus restoration in dialogs. Don't communicate gain/loss only by red/green. Announce toasts via polite live region.

## Responsiveness
390px mobile: accessible drawer, one-column metrics, scrollable tables or responsive cards, no clipped modals. 768px tablet: two-column when possible. 1440px desktop: stable sidebar and content widths. Test both color schemes, large text, reduced motion.

## Safety copy
All simulated banking/investing/AI panels carry clear Demo labels. Avoid 'transaction completed', 'account secured', 'prediction guaranteed' for nonexistent external operations. Financial forecasts explicitly hypothetical.
