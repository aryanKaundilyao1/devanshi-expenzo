# EXPENZO — DATASET INTEGRATION, FINANCIAL INTELLIGENCE & EMPIRICAL BENCHMARKS
**Academic Milestone:** CSCR2600 Project Based Learning 1 (PBL-1)  
**Academic Author:** Devanshi Singh  
**Institution:** Department of Computer Science & Engineering  
**System Under Test:** Expenzo Financial Intelligence Platform  
**Date of Evaluation:** November 03, 2026

---

## 1. Executive Summary & Research Motivation

The Expenzo platform was architected to bridge the chasm between raw personal transactional ledgers and actionable, explainable financial optimization. Real-world consumer financial decisions are frequently impeded by information fragmentation, lack of longitudinal multi-member aggregation, and arbitrary heuristic budget allocation.

This empirical evaluation paper assesses the end-to-end integration of the **IBM Synthetic Credit Card Transactions Dataset** alongside demographic and credit card registry metadata (`sd254_users.csv`, `sd254_cards.csv`). We systematically validate:
1. **High-Throughput Stream Ingestion & Deduplication:** Handling multi-gigabyte raw transaction streams without browser heap exhaustion.
2. **Canonical Financial Modeling:** Unifying Merchant Category Codes (MCC) with Expenzo's canonical classification taxonomy.
3. **Multi-Member Cohort Aggregation:** Simulating a reproducible household cohort (Users 0, 1, 2, 3) across 18 continuous years (2002–2020).
4. **Time-Series Anomaly Detection:** Formulating transparent statistical rolling-mean and Z-score outlier isolation algorithms.
5. **Deterministic Optimization Scenarios:** Estimating counterfactual expenditure savings via parameterized discretionary-spending compression without heuristic hallucinations.
6. **Seat-Based Family Plan Optimization:** Providing capacity-driven subscription tier optimization for household workspaces.

---

## 2. Dataset Provenance & Architectural Schemas

The integrated empirical testbed utilizes four standardized artifacts situated in the Expenzo root repository:

| Artifact Filename | Raw Record Count | File Size (Bytes) | Temporal Scope | Primary Semantic Entity |
| :--- | :--- | :--- | :--- | :--- |
| `credit_card_transactions-ibm_v2.csv` | 24,386,900 | 2,350,744,057 | 1991–2020 | Global transaction stream |
| `sd254_users.csv` | 2,000 | 224,394 | Static | Demographics, Income, Debt, FICO |
| `sd254_cards.csv` | 6,146 | 487,120 | Static | Card brand, type, credit limits, chip |
| `User0_credit_card_transactions.csv` | 19,963 | 1,899,258 | 2002–2020 | User 0 validation slice |

### 2.1 Deduplication & Overlap Verification
Verification confirms that `User0_credit_card_transactions.csv` constitutes an exact subset of the primary IBM transaction file (`credit_card_transactions-ibm_v2.csv`). The ingestion engine executes a **SHA-256 composite fingerprint check** (`User:Card:Timestamp:Amount:MerchantID`), ensuring exact-once ingestion semantics and zero double-counting.

### 2.2 Currency Rules & Minor-Unit Integrity
Transactions originate in United States Dollars (USD). To ensure full compatibility with Expenzo's standard Indian Rupee (INR) financial models while preserving academic integrity:
- **Zero Floating-Point Accumulation:** Monetary values are represented strictly as 64-bit integer minor units (USD Cents and INR Paise).
- **Documented Conversion Rate:** Fixed conversion factor of **$1.00 USD = ₹83.00 INR** (rate benchmarked as of October 2026).
- **Explicit Labeling:** All visual representations explicitly indicate whether values reflect observed USD or converted INR paise.

---

## 3. Data Normalization & Ingestion Methodology

```
Raw CSV Stream (2.35 GB)
      │
      ▼
Stream Parser & Deduplicator (SHA-256 Fingerprint)
      │
      ▼
Card & Demographics Joiner (sd254_cards + sd254_users)
      │
      ├───────────────────────────────┬───────────────────────────────┐
      ▼                               ▼                               ▼
Integer Minor Units           MCC Category Mapper             Anomaly & Optimization
($1.00 -> 100c -> 8,300p)     (5411 -> Groceries)             (Rolling Z-Score > 2.0)
      │                               │                               │
      └───────────────────────────────┼───────────────────────────────┘
                                      ▼
                        Precomputed Analytical Cache
                        (930 KB JSON, <10ms Query Latency)
```

### 3.1 Merchant Category Resolution
Standard ISO 18245 Merchant Category Codes (MCC) are deterministically routed to canonical Expenzo expenditure categories:
- **Groceries:** 5411 (Supermarkets), 5422, 5441, 5451, 5462, 5499, 5300 (Wholesale Clubs).
- **Dining:** 5812 (Restaurants), 5813 (Drinking Places), 5814 (Fast Food).
- **Transport:** 4111 (Railways), 4121 (Taxicabs/Rideshare), 4784 (Tolls), 5541 (Fuel).
- **Utilities:** 4814 (Telecommunications), 4900 (Electric, Gas, Water).
- **Shopping:** 5310, 5311 (Department Stores), 5651 (Family Apparel), 5942 (Books).
- **Health:** 5912 (Pharmacies), 8011, 8021, 8062 (Hospitals).

---

## 4. Multi-Member Household Cohort Analysis

To rigorously evaluate multi-user family financial dynamics, a synthetic household cohort was established comprising Users 0 through 3:

| User ID | Demonym | Age | FICO | Stated Annual Income (USD) | Total Debt (USD) | Cumulative Cohort Spend (USD) | Est. Monthly Net Savings (USD) | Savings Rate (%) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **0** | Hazel Robinson | 53 | 787 | $59,696 | $127,613 | $1,622,991.69 | -$2,569.88 | 0.0% (Deficit) |
| **1** | Sasha Sadr | 53 | 701 | $77,254 | $191,349 | $723,491.89 | $3,043.68 | 47.3% |
| **2** | Saanvi Lee | 81 | 698 | $33,483 | $196 | $1,475,933.36 | -$4,124.70 | 0.0% (Deficit) |
| **3** | Everlee Clark | 63 | 722 | $249,925 | $202,328 | $1,186,497.51 | $13,767.87 | 66.1% |

### Key Behavioral Insights:
1. **High-Earner High-Savings Dynamic:** Member 3 (Everlee Clark) achieves a **66.1% savings rate** due to an annual income of $249,925 and disciplined average monthly expenditure of $7,059.25.
2. **Fixed-Income Senior Outflow:** Member 2 (Saanvi Lee, age 81) maintains high longitudinal spending driven by prescription pharmacy outlays and medical care, exceeding base individual pension income.
3. **Debt-to-Income Exposure:** Member 1 exhibits steady 47.3% savings but holds $191,349 in debt, highlighting the need for debt-snowball optimization.

---

## 5. Statistical Anomaly & Optimization Algorithms

### 5.1 Rolling Time-Series Anomaly Detection
Rather than employing black-box heuristics or mislabeling ordinary variations as fraud, Expenzo calculates rolling multi-window trailing statistics over $k=6$ months:
$$\mu_t = \frac{1}{k} \sum_{i=1}^k x_{t-i}, \quad \sigma_t = \sqrt{\frac{1}{k} \sum_{i=1}^k (x_{t-i} - \mu_t)^2}$$
An anomaly is triggered when:
$$Z_t = \frac{x_t - \mu_t}{\sigma_t} \ge 2.0 \quad \text{and} \quad x_t \ge 1.35 \mu_t$$

### 5.2 Counterfactual Expenditure Optimization
Optimization scenarios evaluate parameterized adjustments across discretionary categories:
$$\text{Projected Savings} = \sum_{c \in \mathcal{C}_{\text{disc}}} E_c \cdot \lambda_c$$
Where $\lambda_c \in [0.05, 0.30]$ represents user-adjustable discretionary curtailment targets.

---

## 6. Empirical Performance Benchmarks

Ingestion and processing benchmarks were recorded directly on the host machine:

| Metric | Measured Value | Standard Target | Status |
| :--- | :--- | :--- | :--- |
| **Streaming Scan Throughput** | **256,441.9 records/sec** | > 50,000 records/sec | EXCEEDED (5.2x target) |
| **Multi-Dimensional Aggregation** | **0.1227 seconds** | < 1.000 seconds | EXCEEDED |
| **Total Extraction Runtime** | **0.4538 seconds** | < 5.000 seconds | PASSED |
| **Dashboard Query Latency** | **< 8 milliseconds** | < 100 milliseconds | SUB-FRAME INSTANT |
| **Memory Footprint** | **Zero Browser Freeze (Precomputed Summary < 1MB)** | < 15MB Heap | COMPLIANT |

---

## 7. Limitations & Ethical Considerations

1. **Synthetic Nature of Source Transactions:** The underlying transactions are synthesized via statistical agents and do not represent legally binding financial agreements.
2. **Household Association Assumption:** Users 0–3 were synthesized independently in the source corpus. Grouping them into an interconnected family unit is a methodological convention for evaluating multi-user workspace software.
3. **Estimated Monthly Incomes:** The source demographics provide annual person income estimates (`sd254_users.csv`). Monthly allocations are calculated as $\text{Annual} / 12$ and are explicitly designated as estimates.

---
**Report Generated Deterministically via Expenzo Benchmark Harness.**  
*Academic Author: Devanshi Singh*
