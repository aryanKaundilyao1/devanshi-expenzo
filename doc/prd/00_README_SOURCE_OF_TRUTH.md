# EXPENZO — Prototype PRD source of truth
Version: 1.0 | Status: approved prototype specification | Scope: frontend-only demo

## How Antigravity must use this pack
Read **all documents** before implementing a screen, especially 01, 02, 03, 04, 05 and 19. This document set overrides prior planning proposals wherever they differ. Implement in phase order from `19_IMPLEMENTATION_PHASES_AND_GATES.md`. Keep route and action contracts stable. Do not silently substitute static screenshots for functional components. Update `21_DECISION_LOG_AND_TRACEABILITY.md` when changes are approved.

## Product
EXPENZO is a unified personal finance prototype for expense tracking, budgets, banking-style account overview, investments, AI insights, conversational assistance and financial planning. Audience includes students, professionals, families, investors, and older adults; adapt to declared preferences, not age stereotypes.

## Prototype limitations — display clearly
No real accounts, login security, emails, bank connections, funds transfers, share trading, financial advice, live quotes, or live AI claims. All data is fictional and demonstrative. Every functional demo operation must update local state. Disabled integrations must say why and suggest an available demo alternative. Local browser storage is not suitable for private real financial data.

## Document index
- `01_PRODUCT_SCOPE_AND_PERSONAS.md` — product boundaries, scenarios and personas
- `02_INFORMATION_ARCHITECTURE_AND_ROUTES.md` — complete page and subpage structure
- `03_DESIGN_SYSTEM_AND_RESPONSIVE.md` — design and Stitch handoff
- `04_GLOBAL_INTERACTION_CONTRACT.md` — global buttons, UX states and navigation
- `05_DEMO_DATA_AND_FINANCIAL_RULES.md` — seed data, calculations and persistence
- `06_PUBLIC_WEBSITE_PRD.md` — marketing pages and CTAs
- `07_AUTH_ONBOARDING_PRD.md` — demo sign in and onboarding
- `08_DASHBOARD_PRD.md` — central dashboard
- `09_EXPENSES_TRANSACTIONS_BUDGETS_PRD.md` — transactions, categories, budgets
- `10_BANKING_PRD.md` — banking demo
- `11_INVESTMENTS_PRD.md` — portfolio and stocks
- `12_AI_ASSISTANT_AND_FREE_INSIGHTS_PRD.md` — fully offline, no-cost intelligence
- `13_PLANNER_REPORTS_LEARNING_PRD.md` — goals, reporting and education
- `14_NOTIFICATIONS_SETTINGS_PRD.md` — alerts and settings
- `15_FRONTEND_TECHNICAL_ARCHITECTURE.md` — code-level boundaries and services
- `16_ERROR_EMPTY_LOADING_ACCESSIBILITY.md` — edge-state quality
- `17_CLICK_ACTION_MATRIX.md` — every major control and its action
- `18_END_TO_END_ACCEPTANCE_TESTS.md` — testable scenarios
- `19_IMPLEMENTATION_PHASES_AND_GATES.md` — phases and approvals
- `20_STITCH_SCREEN_BRIEFS.md` — visual generation prompts
- `21_DECISION_LOG_AND_TRACEABILITY.md` — spec change log

## Non-negotiable acceptance definition
A feature is complete only when route loads directly, UI responds to valid and invalid inputs, relevant state updates consistently, demo designation is visible, mobile behavior works, and the corresponding tests pass. No invented integrations or misrepresented security guarantees.
