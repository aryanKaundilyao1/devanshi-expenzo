# EXPENZO — Intelligent Personal Finance Management Platform
### Comprehensive Frontend Prototype & Release Candidate

EXPENZO is an AI-powered personal financial companion engineered as a scalable, high-fidelity fintech web application. It consolidates daily expense tracking, multi-account banking aggregation, stock portfolio intelligence, goal-oriented wealth planning, financial literacy education, and free deterministic AI insights into one unified, private command center.

---

## 🌟 Key Features & Modules

- **Public Marketing Website:** 10-section landing page with interactive dashboard previews, feature explorer, deterministic AI playground, and persona previews.
- **Authentication & Onboarding:** 5 life-stage personas (Student, Professional, Family, Investor, Senior), 7-step onboarding wizard, password strength meter, and session management.
- **Financial Command Center Dashboard:** Real-time KPIs, Cash-Flow dynamics chart (Inflow vs Outflow), Category spending donut, upcoming bills, budget status, and net worth breakdown dialog.
- **Expense & Transaction Management:** Double-entry ledger with smart natural language entry parser, simulated receipt scanner, category manager, monthly budget alerts, and RFC 4180 CSV export.
- **Digital Banking & Transfers:** Multi-account aggregation (HDFC, SBI, Cash Wallet), atomic internal transfers with synthetic receipts, virtual card security freeze, term deposit (FD/RD) compounding, and loan EMI calculators.
- **Investments & Stock Experience:** 15-stock Indian equities catalog (NSE/BSE) across 7 sectors with historical price charts (1M, 3M, 6M, 1Y), holdings CRUD, multi-watchlist manager, asset/sector allocation donuts, and concentration risk scoring.
- **Free Deterministic AI Assistant:** 100% offline, client-side intent parsing engine recognizing 12 query categories with zero paid LLM/API dependencies; 12 evaluated explainable insight rules.
- **Financial Planner & Simulator:** Goal milestones with strict zero double-counting cash preservation; interactive What-If scenario simulator projecting 10-year wealth trajectories.
- **Financial Reports & Statements:** 10 standardized statement types, double-entry financial reconciliation, print layout for PDF export, and formula-injection-safe CSV generator.
- **Financial Learning Hub:** 7 interactive literacy modules with bookmarks and 3-question knowledge-check quizzes.
- **Notifications Center & Settings:** Proactive financial event evaluator (budgets, bills, low balances, goal pace), unread badges, and all 7 settings panels (profile, appearance, financial rules, security, connections, privacy, notification preferences).

---

## 🏗️ Technology Architecture

- **UI & Framework:** React 19 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS v4 + Radix UI Primitives + Lucide React Icons
- **State Management:** Zustand with schema-versioned `localStorage` persistence
- **Routing:** React Router v7 with protected routes, deep-link sync, and compatibility redirects
- **Data Visualization:** Recharts (Area, Bar, Donut, and Candlestick-style close charts)
- **Forms & Validation:** React Hook Form + Zod validation schemas
- **Testing Suite:** Vitest + JSDOM + Testing Library (160 automated tests, 100% pass rate)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### Installation & Launch

```bash
# Clone the repository
git clone https://github.com/expenzo/expenzo.git
cd Expenzo

# Navigate to the frontend workspace
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running Tests & Building for Production

```bash
# Run the complete test suite (17 test files, 160 tests)
npm test

# Run TypeScript compilation and Vite production build
npm run build

# Preview the production build locally
npm run preview
```

---

## 📑 Documentation Index

Comprehensive engineering documents are located in the `doc/` directory:
- [Source of Truth PRD](doc/prd/00_README_SOURCE_OF_TRUTH.md)
- [Final Click & Interaction Audit](doc/FINAL_CLICK_AUDIT.md) — 290/290 audited controls verified.
- [Final Route & Navigation Audit](doc/FINAL_ROUTE_AUDIT.md) — 58 routes verified, zero placeholder pages.
- [Final Financial Reconciliation](doc/FINAL_FINANCIAL_RECONCILIATION.md) — Mathematical proofs and accounting invariants.
- [Final Quality Assurance Report](doc/FINAL_QA_REPORT.md) — Viewport, accessibility, and test results.
- [Live Demo Walkthrough Guide](doc/DEMO_WALKTHROUGH.md) — Scripted presentation workflow and key numbers.
- [Frontend Release Checklist](doc/FRONTEND_RELEASE_CHECKLIST.md) — 25/25 release criteria passing.
- [Phase Implementation Progress](doc/PHASE_PROGRESS.md) — Phases 1 through 8 execution history.

---

## 🔒 Prototype Disclosures & Boundaries

EXPENZO is currently operating as a verified frontend prototype. All banking records, stock prices, transaction ledgers, and authentication credentials are held entirely in your browser's local memory and local storage. No real money movement, live banking feeds, or paid AI APIs are involved.

