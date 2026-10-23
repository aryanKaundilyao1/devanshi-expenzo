# Expenses, transactions, categories, budgets and recurring PRD

## `/app/expenses`
Header, month period selector, summary KPIs, category donut, merchants chart, spending timeline, natural-language quick add. **Add Expense** -> TransactionForm expense mode; **Add Income** -> income mode; **Smart Entry** -> parse preview; **Upload Receipt** -> preview-only or 'Try Sample Receipt' canned extraction; parsed transaction must always require confirmation. Category chip -> filtered ledger; merchant row -> `/app/transactions?merchant=<encoded>`.

## Shared TransactionForm
Fields type expense/income/transfer; amount INR; account; category for nontransfer; merchant/description; date; optional notes/tags. Transfer has destination account, no expense category. Save validates, writes atomic mutation, updates all selectors, closes modal and toasts. Edit prepopulates; cancel discards; delete requires confirmation; validation prevents invalid amount/dates/account IDs and duplicate submit. Source/target transfer balances update exactly once.

## `/app/transactions` + `/:id`
Search text, type, category, account, date, amount range, sort, pagination. Filters mirrored in URL; Clear resets. Row -> detail page with edit/delete actions; Save Edit returns to detail with updated data; Delete returns to filtered list. **Export CSV** uses visible filtered result set with headings, escaped CSV values and sanitized spreadsheet formula-like cell strings; download filename includes demo and date. No real bank statement inference.

## `/app/categories`
Cards/list of expense and income categories with icon/color, usage count. **Create** -> category modal, unique name per type; **Edit** -> rename and update references by categoryId; **Delete** -> disallow if used until reassignment dialog; category reorder optional. Default categories are modifiable without breaking analytics.

## `/app/budgets`
Monthly/weekly/custom tabs, budget cards with spent/limit/remaining and progress states (>=80% warning, >=100% exceeded). **Create Budget** -> form: category, amount, period, threshold; prevent duplicate overlapping active budget same category/period unless edit. **Edit** saves, **Delete** confirm. **View Transactions** -> ledger filtered by category and budget period. Budget graphs derive spent from transactions. Alerts created or recalculated when thresholds crossed; dismiss a notification does not remove actual threshold state.

## `/app/recurring`
List scheduled demo rules: merchant, amount, category, frequency, next expected date, account. **Add Rule** modal; **Edit**, **Pause/Resume**, **Delete** confirm; next date derived with calendar-aware logic. Rules are forecasts only and do not automatically deduct money or add ledger records unless user explicitly clicks **Record Occurrence**, which opens a prefilled TransactionForm for confirmation.

## Free smart entry behavior
Support strict grammar patterns: 'spent ₹450 on food', 'received ₹5000 salary', '₹200 cab', multiple clauses joined by 'and'. For ambiguities, missing amount, missing date, or unknown categories, show editable preview and uncertainty note. Parser uses local rules only, no LLM/OCR claim.

## Acceptance
Add/edit/delete updates cash, dashboard, filtered lists, budgets, reports and AI insights. Transfer excluded from income/expenses; CSV respects filtered list; category reassignment does not orphan records.
