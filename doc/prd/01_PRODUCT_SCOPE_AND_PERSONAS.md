# Product scope, jobs-to-be-done and non-goals

## Mission
Help users see, understand and plan their finances across expenses, account overviews, portfolios and goals with transparent demo analytics.

## Personas and default demo profiles
| Persona | Sample use case | Initial focus |
|---|---|---|
| Student | Track allowance and transport | expenses, savings goals |
| Professional | Organize salary and bills | cash flow, accounts |
| Family | Track household categories | budgets, reminders |
| Investor | Explore watchlists | portfolio, risk awareness |
| Senior | Larger text and simpler cards | readability, bills |

A persona changes only starter preference/layout and seeded profile; any persona can access every module. Switching persona offers confirm dialog because demo dataset may be replaced. Provide clean starter profile switch without mixing different personas' records.

## Prototype in scope
Working routing, all specified frontend pages, CRUD for fictional transactions/categories/budgets/holdings/goals/watchlists, deterministic analytics, simulated financial accounts, mock assistant, notifications, CSV download, print-ready reports, filters, theme, session/seed resets, accessible mobile views.

## Out of scope
Real OAuth, payments, UPI, KYC, card controls, beneficiary creation, account aggregation, brokerage trading, broker credentials, OCR-based receipt interpretation, real SMS/email, market feeds, external LLM API. Show these as clearly unavailable features, not fake successes. Receipt screen may use a canned sample extraction only after user clicks 'Try sample receipt'; uploaded files are preview-only with no false extraction.

## Definition of a free AI feature
No network/paid-model dependency. Deterministic TypeScript functions and templates produce transparent insights from current demo data, backed by verifiable calculations and disclosed limitations. Label these 'Demo insight' or 'Prototype assistant', not real LLM output. Future paid/free model integration is deferred.
