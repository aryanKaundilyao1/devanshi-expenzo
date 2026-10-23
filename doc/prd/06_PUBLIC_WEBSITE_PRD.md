# Public marketing website PRD

## Homepage `/` composition (top to bottom)
1. Sticky navbar logo, Features, AI, Banking, Investments, About, Login, Get Started; mobile menu opens drawer.
2. Hero: eyebrow 'EXPENZO — Financial clarity powered by intelligence'; headline 'All your money. One smarter place.'; subheading; **Get Started** -> `/auth/register`; **Explore Features** -> `/features`; optional **Try Demo** -> start demo persona selection then `/app/dashboard`.
3. Product preview: card grid cash, spending, portfolio, cash-flow chart, insight; data visibly fictional; **Open Interactive Demo** -> `/auth/login?demo=1`.
4. Four feature modules with separate Explore CTAs -> `/features#expenses`, `/banking-info`, `/investments-info`, `/ai`.
5. AI example: user selects a canned question; deterministic preview returns explanation marked 'Illustrative'; **Try Assistant Demo** -> `/app/ai-assistant` after demo session initiation.
6. How it works (Set up, Record, Understand).
7. User modes slider/tabs (Student, Professional, Family, Investor, Senior) changes illustration and explanatory copy, not account state.
8. Trust/privacy: accurate demo privacy wording, **Read Security** -> `/security`.
9. Final CTA -> `/auth/register`.
10. Footer: all public pages, privacy, terms, contact.

## Other page specifications
- `/features`: tabs Expenses/Banking/Investments/AI/Planner; each tab updates URL hash, feature details and demo CTA; direct hash loads selected tab.
- `/ai`: explanation of rule-based free insights, example chat, forecast limitations; **Explore Insights** -> demo `/app/ai-insights`.
- `/banking-info`: future bank features, clear demo/no live bank connection disclosure; **View Demo Banking** -> `/app/banking` via demo session.
- `/investments-info`: portfolios, watchlists, data timestamp explanation; **Explore Stocks Demo** -> `/app/investments/discover` via demo session.
- `/about`: mission, honest roadmap, accessible design; CTA -> register.
- `/security`: what prototype stores in browser, risks, no real account credentials, production intentions.
- `/privacy`, `/terms`: prototype-appropriate content, no unjustified legal/compliance claims.
- `/contact`: name/email/topic/message fields, zod validation; submit -> inline 'Demo only; not delivered' state; no network.

## Acceptance
All links resolve; no dead CTA, fake testimonials, unverified certification badges or claimed live accounts. Mobile nav keyboard-operable. Direct route refresh works.
