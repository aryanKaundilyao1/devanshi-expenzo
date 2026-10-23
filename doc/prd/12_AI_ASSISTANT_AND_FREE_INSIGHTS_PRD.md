# No-cost AI-like insights and assistant — prototype PRD

## Promise and wording
Build a **fully free, offline, deterministic personal-finance explanation engine** with TypeScript. Requires no paid inference API and no server. On-screen labels: 'Prototype financial assistant — rules-based demo' and 'Demo Insight'. Never present deterministic templates as an LLM, live financial advice, bank fraud conclusion, or future-price prediction.

## Architecture
`analyticsSelectors` -> accurate facts from current ledger/accounts/holdings/goals; `insightRules` -> trigger rules and evidence payload; `intentParser` -> recognized query patterns; `responseComposer` -> transparent message + numerical result + link. Avoid independent hardcoded reply values. Every insight has type, category, severity, evidence IDs, period, formula/logic, actionRoute, generatedAt demo date. Recompute when state changes; cache optionally keyed by finance store revision.

## Free insight rules (implement at least these)
1. Category budget threshold: spent/budget >=0.8, >=1.0; value, threshold, category period.
2. Month-over-month category change where prior comparable data exists; only show percentage if denominator >0, otherwise state newly observed spending.
3. Largest expense category this period and its share of total.
4. Savings-goal gap: remaining amount, months until target, required per-month without returns.
5. Pending recurring bill reminder within 7 demo-clock days.
6. Concentration: largest holding share of portfolio; label exposure, not recommendation.
7. Cash-flow summary current period: income minus expenses, excluding internal transfers.
8. Unusual expense: amount >3x prior category median if at least 5 prior transactions; otherwise avoid unsupported anomaly claim.

## `/app/ai-insights`
Filters All/Spending/Budgets/Savings/Cash Flow/Investments; date range; cards title, numerical explanation, severity, why shown, link and as-of date. **Review** -> `/app/ai-insights/:id`. **View related transactions** -> filtered `/app/transactions`. **Refresh** -> recompute local rules from current state (not network). Empty -> 'Not enough data yet' with CTA Add Expense / Set Budget.

## `/app/ai-insights/:id`
Evidence table with linked records, calculation narrative, limitations. **Back** -> insights list. **Open related page** -> actionRoute. Invalid id -> not-found card.

## `/app/ai-assistant` / `:chatId`
Sidebar chat threads; **New Chat** creates thread; text field + Send (Enter sends, Shift+Enter newline); suggested chips fill/send supported prompts; **Delete Chat** confirms; click thread changes route and loads messages. Chat history in localStorage; no external calls. Display 'Supported questions' help panel and error/suggestion for unsupported prompts. Loading bubble 200ms optional.

## Supported intent examples and response rules
- 'How much did I spend this month?' -> sum expense transactions for demo month, show amount and **View transactions** link with date filter.
- 'What did I spend on food?' -> category aggregation; if ambiguous category name ask which category.
- 'What was my biggest expense?' -> highest amount expense with date, merchant, link.
- 'Compare spending with last month' -> both totals and change; if prior =0 do not calculate percentage.
- 'What is my balance?' -> sum deposit/cash accounts only, display which accounts included.
- 'Which bills are due soon?' -> list recurring reminders within 7 days, show estimated label.
- 'How am I doing on budgets?' -> category budgets percent utilized and links.
- 'Can I save ₹5000 by December?' -> goal calculation only when date and available inputs known; assumptions and no guarantee.
- 'Explain my portfolio risk' -> concentration/asset mix only; no stock recommendation.
- 'What is a SIP?' -> reviewed static educational glossary response, source link to Learning.

## Parser robustness
Case-insensitive and currency-aware regex, dates relative to demoAsOf. For unknown query, answer 'I can help with spending, balances, budgets, goals, and portfolio demo summaries' plus selectable examples. For unseeded data, explicit 'No demo data available'. No unsupported numeric hallucination. Never echo untrusted text as HTML.

## Acceptance
Change a transaction, then repeat an expense query; response must reflect new exact total. Insight evidence values equal selector results. Zero cost / offline operation verified via network-disabled run. No promises of personalized investments or actual fraud detection.
