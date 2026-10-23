# Stitch reference-screen briefs

## Global base prompt (prepend)
"Design EXPENZO, a polished original Indian personal finance desktop/mobile web app. Trustworthy fintech visual language, airy white background #F8FAFC, dark navy typography #0F172A, emerald accent #16A34A, Inter font, strong tabular numeric hierarchy, rounded 16px cards, hairline borders. Sophisticated calm style, not a generic admin dashboard; responsive, accessible contrast. All figures are DEMO and INR with Indian grouping. Consistent sidebar and app header in authenticated screens. Do not copy real bank branding or falsely suggest partnerships."

## Stitch 1 — Marketing homepage
"Create a 1440px marketing homepage with sticky navbar logo Features AI Banking Investments About, Login, Get Started. Hero headline 'All your money. One smarter place.', explanatory copy and Get Started/Explore Features CTAs. Adjacent large believable illustrative financial dashboard UI. Below four feature showcases, conversational demo, three-step how it works, personas, security explanation, large final CTA/footer. Mobile 390px adaptation. Design actual section hierarchy and clickable visual affordances."

## Stitch 2 — Financial dashboard
"Full-height desktop EXPENZO app shell, 240px collapsible sidebar grouped Overview/Intelligence/More, slim header with search/bell/profile. Greeting, demo-as-of badge, quick action buttons, top KPIs cash/inflow/outflow/portfolio, 2/3 cash-flow chart + 1/3 spending donut, budget progress, recent transactions, bill reminders, investment snapshot and Demo AI Insight. Crisp charts. Provide mobile stacked layout and nav drawer."

## Stitch 3 — Expenses and transaction ledger
"EXPENZO expense view with spending summary, category donut and merchant graph, prominent Add Expense and Smart Entry, month selector, recent transaction table with account, category, amount, date. Show transaction add modal state with validated fields and Save/Cancel; alongside second concept of responsive mobile transaction cards. No fake payment success."

## Stitch 4 — AI assistant
"EXPENZO rules-based prototype assistant split view: left chat threads, right active conversation, suggested question chips, date/financial evidence card, categorized expense mini chart and links View Transactions/View Budgets. Clear label 'Prototype assistant · Demo data'. Input/composer, Send, New Chat, message timestamp. Responsive mobile one-column. Avoid chatbot claims of guaranteed returns."

## Stitch 5 — Banking
"Demo banking overview with fictional masked HDFC/SBI-style textual institution names only, balance cards, statement preview, pending bills, demo transfer CTA and separate clearly Disabled/Future Services section. Distinguish simulated transfer from actual payment."

## Stitch 6 — Investments
"Original portfolio overview with cost/value/return KPI row, holdings table, fictional quote chart marked DEMO, sector allocation, searchable stock directory, watchlist controls; no trade buy/sell CTA."

## Handoff checklist
Extract spacing/colors/layout rather than copying full generated markup. Rebuild controls with shared Radix primitives and typed financial services. Verify behavior contracts from PRDs, 390px and 1440px views, and actual click effects. Stitch output never overrides finance logic, routes or demo labeling.
