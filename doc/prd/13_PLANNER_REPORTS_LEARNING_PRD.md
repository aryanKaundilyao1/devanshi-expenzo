# Planner, reports and learning PRD

## `/app/financial-planner`
Goal cards with name, target, saved amount, remaining, target date and progress %. **New Goal** modal validates title/target/date; **Edit Goal**, **Delete** confirm; click card -> `/app/financial-planner/goals/:id`; **Open Simulator** -> `/app/financial-planner/simulator?goal=:id`. A goal allocation is tracked separately from account balance, not an extra liquid asset.

## `/app/financial-planner/goals/:id`
Progress, contribution history (demo records), monthly needed = max(0,target−saved)/remaining monthly periods, notes and date. **Add Contribution** -> amount confirmation, modifies goal progress allocation only; explicitly state it does not move money from a bank account. **Edit** modal; **Simulate** -> simulator. Overfunded state handled gracefully.

## `/app/financial-planner/simulator`
Goal selector, editable target/current savings/deadline/monthly contribution, optional hypothetical annual return default 0. **Calculate** and sliders update display; projection line uses deterministic monthly arithmetic. Return assumptions clearly fictional; no investment advice. **Apply plan** updates goal planned contribution only after confirmation; does not transfer cash. Handle past deadlines and zero remaining time.

## `/app/reports`
Daily/Weekly/Monthly/Custom range selection, include modules toggles (expenses, budgets, banking summary, portfolio). **Generate** computes snapshot from current state -> report record and navigates `/app/reports/:id`; **Export CSV** downloads selected transaction subset; **Print/Save PDF** invokes browser print (PDF through browser only). Date filters validate start<=end.

## `/app/reports/:id`
Report header including DEMO DATA + as-of date; income, expense, net cash flow, account totals, budgets and holdings where selected; breakdown charts and transactions. **Back**, **Print**, **Download CSV**; invalid id -> not found. Reports are snapshot versions: display generated timestamp, can **Regenerate** with current data.

## `/app/learning`
Search, Beginner/Intermediate/Advanced tabs, sections Banking, Budgeting, Markets, Safety. **Open article** -> `/app/learning/topics/:slug`; **Start quiz** -> modal, 3-5 static questions, grading and explanation, scores local only. Articles include definitions and non-personalized examples.

## `/app/learning/topics/:slug`
Title, reading time, article, glossary, related topics; **Ask AI to explain** -> assistant with topic context; **Back to Learning**; invalid slug fallback.

## Acceptance
Contribution projections numerically correct, source ledgers not mutated by planning simulations, report amounts reconcile to filters, CSV opens as text correctly and print stylesheet readable.
