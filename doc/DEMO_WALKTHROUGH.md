# EXPENZO — LIVE DEMONSTRATION & WALKTHROUGH GUIDE
### Scripted Presentation Workflow, Key Financial Baselines & Feature Guide

**Target Audience:** Product Reviewers, Technical Evaluators, Stakeholders & Pair Programmers  
**Application URL:** `http://localhost:5173` (Vite local dev server) or preview build  
**Mode:** 100% Client-Side Prototype (Zero External APIs, Zero Bank Passwords)

---

## 1. Quick Launch Instructions

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the local development server
npm run dev

# Open in browser: http://localhost:5173
```

---

## 2. Recommended Demonstration Flow (10-Minute Script)

### Step 1: Public Marketing Website (`/`)
1. **Hero Section:** Note the emerald branding, value proposition ("All Your Money. One Smarter Place."), and zero-bank-connection trust banner.
2. **Interactive Preview Widget (`#interactive-preview`):**
   - Click the timeframe tabs (`7D`, `30D`, `90D`) and observe instantaneous recalculation of cash flow metrics.
   - Switch between `Overview`, `Expenses`, `Banking`, and `Investments` tabs.
3. **AI Assistant Showcase:** Click prompt pills to witness deterministic typing answers.
4. **CTA Click:** Click **"Get Started Free"** or **"Sign In"** in the top navigation bar.

---

### Step 2: Instant Demo Persona Login (`/auth/login`)
1. Notice the **Quick Demo Persona** selection buttons at the top of the login card.
2. Click **"Working Professional (Aryan Sharma)"** (or click "Switch Persona" to view all 5 personas: Student, Professional, Family, Investor, Senior).
3. The demo credentials automatically populate.
4. Click **"Enter Live Demo Dashboard"** → instantly arrives at `/app/dashboard`.

---

### Step 3: Financial Command Center Dashboard (`/app/dashboard`)
1. **Inspect Baseline Metrics:**
   - Available Liquid Cash: **₹77,200.00** (HDFC ₹50,000 + SBI ₹25,200 + Cash ₹2,000).
   - Inflow (October): **₹52,000.00**.
   - Outflow (October): **₹18,800.00**.
   - Portfolio Valuation: **₹42,500.00** (10 TCS + 5 INFY).
   - Total Net Worth: **₹1,19,700.00**.
2. **Period Filter Chips:** Toggle between `7D`, `30D`, `90D`, and `1Y`. Watch the Cash Flow chart and category totals dynamically react.
3. **Net Worth Breakdown:** Click the **Net Worth** card to open the double-entry breakdown modal explaining the Zero Double-Counting Guarantee.

---

### Step 4: Add an Expense & Observe Instant Reactive Sync
1. Click **"+ Add Transaction"** in the top header.
2. Select **"Expense"**, Account: **Everyday Savings (HDFC)**, Amount: **₹2,500**, Category: **Food & Dining**, Merchant: **The Bistro Garden**, Date: `2026-10-15`.
3. Click **"Record Transaction"**.
4. **Observe Multi-Module Reaction:**
   - Outflow increases by ₹2,500 to **₹21,300.00**.
   - Available Cash decreases by ₹2,500 to **₹74,700.00**.
   - Food & Dining category bar expands.
   - Recent Transactions feed displays the new expense at the top.

---

### Step 5: Digital Banking & Simulated Transfer (`/app/banking`)
1. Navigate to **Banking** in the sidebar.
2. Click **"Transfer Funds"** (`/app/banking/transfer`).
3. Source Account: **Everyday Savings (HDFC)**; Destination Account: **Goals Savings (SBI)**; Amount: **₹10,000**.
4. Note the live balance preview showing post-transfer balances.
5. Click **"Confirm & Execute Transfer"**.
6. View generated **Transfer Receipt** with synthetic reference number `EXP-TRF-*`.
7. **Verify Invariant:** Total Liquid Cash and Net Worth remain strictly unchanged.

---

### Step 6: Explore Stock Investments & Portfolio Analytics (`/app/investments`)
1. Navigate to **Investments** in the sidebar.
2. View current holdings: **TCS** (10 shares @ CMP ₹3,500) and **INFY** (5 shares @ CMP ₹1,500).
3. Click **"Stock Discovery"** (`/app/investments/discover`): Search for `RELIANCE` or filter by `Energy`.
4. Click on `RELIANCE` to view the **Stock Detail Page**:
   - Toggle timeframes: `1M`, `3M`, `6M`, `1Y` on the interactive SVG price chart.
   - Click **"+ Add to Watchlist"**.
5. Navigate to **Portfolio Analytics** (`/app/investments/analytics`) to inspect the Asset Allocation Donut, Sector Distribution, and Concentration Risk Score.

---

### Step 7: Query the Free AI Assistant (`/app/ai-assistant`)
1. Navigate to **AI Assistant** in the sidebar.
2. Click one of the suggestion chips, or type:
   - *"How much did I spend this month?"* → AI computes exact ledger outflow and returns category breakdown.
   - *"What is my biggest expense?"* → AI identifies the ₹12,000 rent payment.
   - *"What is my portfolio value?"* → AI calculates real-time valuation of stock holdings.
   - *"Will TCS stock double next week?"* → AI delivers an honest fallback stating it cannot predict the market.

---

### Step 8: Financial Planner, Goals & What-If Simulator (`/app/financial-planner`)
1. Navigate to **Financial Planner** in the sidebar.
2. Review active goals: **Emergency Fund** and **MacBook Pro Upgrade**.
3. Click **"Record Contribution"** on MacBook Pro: Allocate ₹5,000.
   - Goal progress bar advances.
   - Liquid bank cash is preserved (mental planning allocation invariant).
4. Click **"What-If Simulator"** (`/app/financial-planner/simulator`):
   - Move the **Monthly Savings Boost** slider to +₹15,000/mo.
   - Adjust **Expected Return** to 12% CAGR.
   - Inspect the 10-year wealth projection trajectory comparing Baseline vs Simulated Path.

---

### Step 9: Financial Reports & Reconciled Statements (`/app/reports`)
1. Navigate to **Reports** in the sidebar.
2. Click on **Monthly Financial Statement**.
3. Inspect executive summary metrics: Income ₹52,000, Expenses, Net Savings, Savings Rate %.
4. Click **"Export CSV"** → Downloads sanitized, formula-injection-safe CSV file.
5. Click **"Print Statement"** → Opens print preview with dedicated print CSS.

---

### Step 10: Notifications & Settings Customization (`/app/settings`)
1. Click the **Notification Bell** in the topbar (`/app/notifications`):
   - Inspect categorized alerts (Budgets, Bills, Investments, Security).
   - Click **"Mark all as read"**.
2. Navigate to **Settings > Appearance** (`/app/settings/appearance`):
   - Switch between **Light**, **Dark**, and **System** themes — theme changes immediately without reloading.
3. Navigate to **Settings > Privacy** (`/app/settings/privacy`):
   - Click **"Download JSON Backup"** to export your modified demo workspace.
   - Click **"Reset Workspace"** to restore factory default data.

---

## 3. Expected Baseline Reference Numbers

| Metric | Baseline Value (October 15, 2026) | Notes |
|---|---|---|
| **Everyday Savings (HDFC)** | ₹50,000.00 | Opening ₹21,300 + Credits ₹52,000 - Debits ₹23,300 |
| **Goals Savings (SBI)** | ₹25,200.00 | Opening ₹20,200 + Sweep ₹5,000 |
| **Physical Cash Wallet** | ₹2,000.00 | Petty cash reserve |
| **Total Liquid Cash** | **₹77,200.00** | Sum of 3 liquid accounts |
| **Total Inflow (October)** | **₹52,000.00** | Corporate Salary credited Oct 1 |
| **Total Outflow (October)** | **₹18,800.00** | Rent ₹12k, Food ₹2.8k, Shopping ₹2k, Utilities ₹1.5k, Transport ₹500 |
| **Net Savings (October)** | **₹33,200.00** | Savings Rate: 63.85% |
| **Stock Holdings Valuation** | **₹42,500.00** | TCS (10 @ ₹3,500 = ₹35k) + INFY (5 @ ₹1,500 = ₹7.5k) |
| **Total Net Worth** | **₹1,19,700.00** | Liquid Cash ₹77.2k + Stocks ₹42.5k |

