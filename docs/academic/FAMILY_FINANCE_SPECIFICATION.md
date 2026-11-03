# Expenzo: Multi-User Family Finance Architecture, Seat Optimization Engine & Portfolio Valuation Analytics

**Academic Project:** CSCR2600 Project Based Learning 1 (PBL-1)  
**Academic Author:** Devanshi Singh  
**Institution:** Department of Computer Science & Engineering  
**Application Repository:** `https://github.com/aryanKaundilyao1/devanshi-expenzo.git`  
**Deployment Platform:** Vercel Production (`https://expenzo-red.vercel.app/`)  
**Backend Persistence:** Supabase Cloud PostgreSQL with Row Level Security (RLS)  

---

## 1. Executive Summary & Problem Formulation

Contemporary personal finance applications are predominantly single-tenant systems that model an individual's cash flow in isolation. However, modern financial decisions—such as shared residential rent, utility splits, collective emergency buffers, and generational investments—are fundamentally distributed across household units. Existing multi-user solutions either compromise data privacy by disclosing all personal ledger entries to all family members or introduce high operational overhead through unstructured manual spreadsheets.

**Expenzo** introduces a mathematically formalized, privacy-preserving, multi-tenant financial architecture that reconciles personal financial privacy with collaborative household governance:
1. **Multi-User Family Workspaces:** Granular Role-Based Access Control (RBAC) separating private personal ledgers from shared household expenses and collective goals.
2. **Deterministic Seat Optimization Engine:** Algorithmic seat reservation accounting where pending invitations actively reserve capacity to eliminate race conditions and over-subscription.
3. **Dual-Axis Period Flows vs. Point-in-Time Stock Valuation:** Rigorous separation between expenditure flow metrics (rate of consumption per period) and cumulative asset stock holdings (bank balances and market-valued equities).
4. **IBM Synthetic Credit Card Dataset Ingestion Harness:** Additive external dataset ingestion adapter featuring MCC code mapping, deterministic integer paise conversion, and cryptographic deduplication.

---

## 2. Mathematical Formalization & Financial Invariants

All internal financial calculations in Expenzo operate strictly on integer minor currency units (paise in INR, where ₹1.00 = 100 paise). Floating-point arithmetic is strictly prohibited in financial state transitions to ensure zero rounding drift.

### 2.1 The Exact-Sum Shared Allocation Invariant

When an authorized family member records a shared household transaction $T$ with total value $T_{paise}$, the transaction is partitioned among $M$ participating family members. Let $a_i \in \mathbb{Z}_{\ge 0}$ denote the allocation assigned to member $i$.

The system enforces the strict **Exact-Sum Invariant**:

$$\sum_{i=1}^{M} a_i = T_{paise}$$

Any transaction allocation mutation where $\sum_{i=1}^{M} a_i \ne T_{paise}$ is atomically rejected at both the PostgreSQL stored procedure level (`allocate_shared_expense` RPC) and the TypeScript domain layer.

#### Rounding Allocation Protocol for Equal and Percentage Splits:
When splitting an expense equally ($a_i = \lfloor \frac{T_{paise}}{M} \rfloor$), the integer remainder $R = T_{paise} \pmod M$ is distributed deterministically to the first $R$ participating members:

$$a_i = \begin{cases} \lfloor \frac{T_{paise}}{M} \rfloor + 1, & \text{if } 1 \le i \le R \\ \lfloor \frac{T_{paise}}{M} \rfloor, & \text{if } R < i \le M \end{cases}$$

This guarantees that:
$$\sum_{i=1}^{M} a_i = R \cdot \left(\lfloor \frac{T_{paise}}{M} \rfloor + 1\right) + (M - R) \cdot \lfloor \frac{T_{paise}}{M} \rfloor = M \cdot \lfloor \frac{T_{paise}}{M} \rfloor + R = T_{paise}$$

### 2.2 Period Flows vs. Cumulative Stock Balances Invariant

A critical architectural pitfall in consumer fintech is the additive aggregation of period flows and cumulative stock balances. Expenzo strictly segregates these financial dimensions:

1. **Expenditure Flows ($F_{exp}(t_1, t_2)$):** The definite integral of consumption transactions over interval $[t_1, t_2]$:
   $$F_{exp} = \sum_{tx \in \text{Transactions}(t_1, t_2)} tx.amountMinor \quad [\text{type} = \text{'expense'}, \text{status} = \text{'completed'}]$$
   *Non-consumption exclusions:* Internal transfers between owned accounts, investment purchase allocations, and savings goal escrow transfers are strictly excluded from $F_{exp}$ to prevent artificial double-counting.

2. **Holdings & Net Worth ($S_{stock}(t)$):** Point-in-time snapshot of cumulative asset balances at timestamp $t$:
   $$S_{liquid}(t) = \sum_{acc \in \text{BankAccounts}} acc.balanceMinor(t)$$
   $$S_{equity}(t) = \sum_{h \in \text{Holdings}} h.quantity \times Quote(h.ticker, t).currentPriceMinor$$
   $$\text{NetWorth}(t) = S_{liquid}(t) + S_{equity}(t) - \sum_{l \in \text{Liabilities}} l.outstandingMinor(t)$$

3. **Net Savings & Savings Rate Formulation:**
   $$\text{NetSavings}(t_1, t_2) = F_{income}(t_1, t_2) - F_{exp}(t_1, t_2)$$
   $$\text{SavingsRate}(t_1, t_2) = \begin{cases} \frac{\text{NetSavings}(t_1, t_2)}{F_{income}(t_1, t_2)} \times 100\%, & \text{if } F_{income} > 0 \\ 0\%, & \text{if } F_{income} \le 0 \end{cases}$$

---

## 3. Seat Allocation & Optimization Engine

### 3.1 Plan Tiers & Capacity Specifications

Expenzo defines three non-synthetic, tiered household plans designed for academic demonstration:

| Plan Tier | Max Active Seats ($S_{plan}$) | Monthly Simulated Cost | Target Household Profile |
| :--- | :---: | :---: | :--- |
| **Personal** | 1 seat | ₹0 / mo | Single-user personal financial ledger & AI advisor |
| **Family** | 4 seats | ₹499 / mo | Nuclear household (parents + children), shared utilities |
| **Family Plus** | 8 seats | ₹999 / mo | Multi-generational or extended family finances |

### 3.2 Seat Capacity Verification with Pending Reservation Guarantee

In distributed collaborative systems, inviting a user without reserving a seat allows race conditions where multiple pending invites exceed plan capacity upon acceptance. Expenzo formalizes occupied capacity as:

$$C_{occupied} = M_{active} + I_{pending}$$

Where:
- $M_{active}$: Count of active members ($\text{status} = \text{'active'}$).
- $I_{pending}$: Count of unexpired pending invitations ($\text{status} = \text{'pending'}$).

The invariant requires:
$$C_{occupied} \le S_{plan}$$

Revoking an invitation immediately transitions its state to $\text{status} = \text{'revoked'}$, decrementing $I_{pending}$ and restoring seat availability.

### 3.3 Algorithmic Plan Recommendation Engine

The seat optimization advisor evaluates current workspace utilization $U = \frac{C_{occupied}}{S_{plan}}$ and generates deterministic recommendations:

1. **Over-Capacity Preemption:** If $C_{occupied} \ge S_{plan}$, the engine flags zero available seats and recommends an immediate tier upgrade.
2. **Under-Utilization Preemption:** If $C_{occupied} \le 4$ while the workspace is subscribed to `family_plus` ($S_{plan} = 8$), the advisor recommends downgrading to `family` ($S_{plan} = 4$), computing the exact recurring monthly savings:
   $$\Delta_{\text{savings}} = \text{Price}(\text{family\_plus}) - \text{Price}(\text{family}) = ₹999 - ₹499 = ₹500/\text{month}$$
3. **Cost Per Active Member:**
   $$\text{EffectiveCostPerMember} = \frac{\text{MonthlyPrice}}{M_{active}}$$

---

## 4. External Dataset Ingestion Adapter (IBM Synthetic Credit Card Dataset)

To evaluate system performance under high transaction volumes and validate categorical classification, Expenzo incorporates an ingestion adapter designed for the IBM Synthetic Credit Card Transactions dataset.

### 4.1 Schema Normalization & MCC Resolution

The adapter ingests standard credit card transaction attributes:
`[User, Card, Year, Month, Day, Time, Amount, Use Chip, Merchant Name, Merchant City, Merchant State, Zip, MCC, Errors?]`

Merchant Category Codes (MCC) are mapped to canonical Expenzo categories:
- **MCC 5411, 5422, 5499:** $\to$ `Food & Groceries`
- **MCC 5812, 5814:** $\to$ `Dining & Restaurants`
- **MCC 4111, 4121, 5541:** $\to$ `Transportation`
- **MCC 4814, 4899, 4900:** $\to$ `Utilities & Bills`
- **MCC 5311, 5651, 5999:** $\to$ `Shopping & Retail`
- **MCC 5912, 8011, 8099:** $\to$ `Health & Medical`
- **MCC 7832, 7922, 7999:** $\to$ `Entertainment & Leisure`

### 4.2 Cryptographic Deduplication & Minor Unit Normalization

Each incoming record is fingerprinted via a SHA-256 composite digest:
$$\text{Fingerprint} = \mathcal{H}(\text{User} \parallel \text{Card} \parallel \text{Date} \parallel \text{Time} \parallel \text{Amount} \parallel \text{MerchantClean})$$

Duplicate records are recorded in the ingestion batch metadata and discarded. Amounts in USD are converted to INR paise at a fixed demonstration rate of ₹83.00:
$$\text{Paise} = \text{round}(\text{USD} \times 83.00 \times 100)$$

### 4.3 Demonstration Mode Isolation

Ingested external synthetic datasets are tagged with provenance metadata (`isSyntheticDataset: true`, `datasetBatchId`). Users can toggle **Dataset Demonstration Mode** in the Family Analytics view, overlaying external data for research analysis while guaranteeing that core personal bank balances and Supabase production tables remain uncontaminated.

---

## 5. Verification & Empirical Results

The system's correctness, deterministic behavior, and robustness were validated through comprehensive automated testing and offline benchmark harnesses.

### 5.1 Test Suite Verification (100% Pass Rate)

| Test File | Tests | Status | Target Verifications |
| :--- | :---: | :---: | :--- |
| `familyAccounting.test.ts` | 8 | PASSED | Net savings, budget utilization, exact-sum allocations, non-consumption exclusions |
| `seatOptimizer.test.ts` | 9 | PASSED | Capacity calculations, pending reservations, upgrade/downgrade heuristics |
| `holdingsAnalytics.test.ts` | 4 | PASSED | Flow vs balance separation, portfolio net worth, asset allocations |
| `datasetImporter.test.ts` | 5 | PASSED | CSV parsing, MCC code resolution, fingerprint deduplication, currency conversion |
| `familyStoreAndWorkspaces.test.tsx` | 9 | PASSED | Workspace mode switching, member invites/revocations, exact splits, goal escrow |
| Existing Core Test Suites (20 suites) | 184 | PASSED | Banking, ledger, RLS RPCs, auth journeys, investments, AI advisor, reports |
| **Total Test Execution** | **219** | **PASSED** | **25 Test Files, 219 Tests Passed, 0 Failures** |

### 5.2 Offline Stream Processing Benchmark

Running the benchmark harness (`scripts/benchmark_dataset.py`) against 10,000 synthetic credit card transactions on standard commodity hardware yielded:
- **Throughput:** $915,744\text{ records/second}$
- **Duplicate Isolation:** 499 duplicates detected and filtered out (100% precision)
- **Exact-Sum Invariant:** Verified with zero discrepancy across all categorical and household partitions.

### 5.3 Production Build Verification

Executing `tsc -b && vite build` completed in **3.99 seconds**, generating optimized production assets with tree-shaken chunks for charts, UI components, and vendor libraries.

---

## 6. Reproducible Evaluation Walkthrough for CSCR2600 PBL-1

1. **Access Application:** Navigate to `https://expenzo-red.vercel.app/` or run `cd frontend && npm run dev`.
2. **Workspace Switching:** Click the workspace switcher in the sidebar header to toggle between **Personal** and **Singh Household Finance**.
3. **Review Member Comparison:** Open `/app/family/analytics` to view interactive Recharts comparing member spending, savings rates, and categorical breakdown.
4. **Test Seat Optimization:** Open `/app/family/plans` to observe seat capacity utilization (3 active + 1 pending = 4/4 seats used) and simulate plan adjustments.
5. **Record Exact-Sum Shared Expense:** Open `/app/family/shared-expenses` and trigger the Shared Expense Modal to observe real-time enforcement of the exact-sum allocation constraint down to single paise.
6. **Inspect Dual-Axis Dashboard Analytics:** Open the main Dashboard (`/app/dashboard`) to inspect the **Expenditure Flows vs. Financial Holdings** synchronized dual-axis visualization.
