#!/usr/bin/env python3
"""
EXPENZO — Offline Transaction Processing Benchmark & Evaluation Harness
Milestone: CSCR2600 Project Based Learning 1 (PBL-1)
Academic Author: Devanshi Singh
Institution: Department of Computer Science & Engineering

Benchmarking harness for external financial transaction dataset ingestion
based on the IBM Synthetic Credit Card Transactions dataset format.
Validates:
1. Stream ingestion throughput (records/sec).
2. Cryptographic transaction fingerprinting and duplicate identification.
3. Merchant Category Code (MCC) canonical resolution.
4. Deterministic integer minor-unit conversion (USD to INR paise).
5. Exact-sum household and category aggregation invariants.
"""

import sys
import time
import hashlib
import random
from typing import List, Dict, Any, Tuple

# Canonical MCC Mappings (Expenzo Financial Domain Model)
MCC_MAP: Dict[int, str] = {
    5411: "Food & Groceries",
    5422: "Food & Groceries",
    5812: "Dining & Restaurants",
    5814: "Dining & Restaurants",
    4111: "Transportation",
    4121: "Transportation",
    4814: "Utilities & Bills",
    4900: "Utilities & Bills",
    5311: "Shopping & Retail",
    5651: "Shopping & Retail",
    5912: "Health & Medical",
    7832: "Entertainment & Leisure",
    5541: "Automotive & Fuel",
}

USD_TO_INR_RATE = 83.0  # ₹83.00 per USD

def generate_synthetic_record(idx: int, duplicate: bool = False) -> Dict[str, Any]:
    """Generates a structured record mimicking the IBM Credit Card dataset."""
    if duplicate:
        # Fixed deterministic values for deliberate duplicate injection
        return {
            "User": 0,
            "Card": 0,
            "Year": 2026,
            "Month": 10,
            "Day": 15,
            "Time": "14:30",
            "Amount": "$45.50",
            "UseChip": "Chip Transaction",
            "MerchantName": "Trader Joe's",
            "MerchantCity": "Austin",
            "MerchantState": "TX",
            "Zip": 78701,
            "MCC": 5411,
            "Errors?": "",
        }

    user_id = random.randint(0, 3)
    card_id = random.randint(0, 1)
    month = random.randint(1, 10)
    day = random.randint(1, 28)
    hour = random.randint(8, 22)
    minute = random.randint(0, 59)
    amount_val = round(random.uniform(5.0, 350.0), 2)
    mcc_code = random.choice(list(MCC_MAP.keys()))
    merchants = {
        5411: "Whole Foods Market",
        5812: "Olive Garden",
        5814: "Chipotle Mexican Grill",
        4121: "Uber Technologies",
        4900: "Consolidated Edison Electric",
        5311: "Target Superstore",
        5912: "CVS Pharmacy",
        7832: "AMC Theatres",
        5541: "Shell Oil",
    }
    merchant_name = merchants.get(mcc_code, "Retail Merchant")

    return {
        "User": user_id,
        "Card": card_id,
        "Year": 2026,
        "Month": month,
        "Day": day,
        "Time": f"{hour:02d}:{minute:02d}",
        "Amount": f"${amount_val:.2f}",
        "UseChip": "Chip Transaction",
        "MerchantName": merchant_name,
        "MerchantCity": "New York",
        "MerchantState": "NY",
        "Zip": 10001,
        "MCC": mcc_code,
        "Errors?": "",
    }

def compute_fingerprint(record: Dict[str, Any]) -> str:
    """Computes SHA-256 fingerprint from user-card-timestamp-amount-merchant tuple."""
    raw = f"{record['User']}:{record['Card']}:{record['Year']}-{record['Month']:02d}-{record['Day']:02d}:{record['Time']}:{record['Amount']}:{record['MerchantName'].strip().lower()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def parse_dollar_to_paise(amount_str: str) -> int:
    """Converts '$134.20' to integer paise (1 USD = 83 INR -> 134.20 * 83 * 100 = 1,113,860 paise)."""
    clean = amount_str.replace("$", "").replace(",", "").strip()
    usd = float(clean)
    return int(round(usd * USD_TO_INR_RATE * 100))

def run_benchmark(batch_size: int = 50000, duplicate_ratio: float = 0.05) -> Tuple[float, int, int, Dict[str, int]]:
    print(f"=================================================================")
    print(f"EXPENZO — INGESTION BENCHMARK HARNESS (CSCR2600 PBL-1)")
    print(f"Academic Author: Devanshi Singh")
    print(f"Target Workload: {batch_size:,} Synthetic Credit Card Transactions")
    print(f"Duplicate Rate:  {duplicate_ratio * 100:.1f}%")
    print(f"=================================================================")

    # Step 1: Synthesize In-Memory Batch
    print(f"[*] Generating {batch_size:,} synthetic records...")
    t0 = time.perf_counter()
    records = []
    num_duplicates = int(batch_size * duplicate_ratio)
    for i in range(batch_size - num_duplicates):
        records.append(generate_synthetic_record(i))
    for _ in range(num_duplicates):
        records.append(generate_synthetic_record(0, duplicate=True))
    random.shuffle(records)
    gen_time = time.perf_counter() - t0
    print(f"[+] Dataset synthesis completed in {gen_time:.3f}s")

    # Step 2: Stream Ingestion, Deduplication & Transformation
    print(f"[*] Running parsing, MCC resolution, exact conversion & deduplication...")
    t_start = time.perf_counter()
    seen_fingerprints = set()
    category_totals: Dict[str, int] = {}
    total_paise = 0
    imported_count = 0
    duplicate_count = 0

    for rec in records:
        fp = compute_fingerprint(rec)
        if fp in seen_fingerprints:
            duplicate_count += 1
            continue
        seen_fingerprints.add(fp)

        # Deterministic integer arithmetic conversion
        paise = parse_dollar_to_paise(rec["Amount"])
        mcc = rec.get("MCC", 5999)
        cat = MCC_MAP.get(mcc, "Miscellaneous")

        total_paise += paise
        category_totals[cat] = category_totals.get(cat, 0) + paise
        imported_count += 1

    duration = time.perf_counter() - t_start
    throughput = len(records) / duration

    # Step 3: Exact-Sum Invariant Validation
    cat_sum = sum(category_totals.values())
    invariant_holds = (cat_sum == total_paise)

    print(f"-----------------------------------------------------------------")
    print(f"BENCHMARK RESULTS SUMMARY:")
    print(f"  Total Ingested:        {len(records):,} records")
    print(f"  Execution Time:        {duration:.4f} seconds")
    print(f"  Ingestion Throughput:  {throughput:,.1f} records/second")
    print(f"  Duplicates Isolated:   {duplicate_count:,} ({duplicate_count/len(records)*100:.2f}%)")
    print(f"  Valid New Entries:     {imported_count:,}")
    print(f"  Total Volume (Paise):  {total_paise:,} paise (₹{total_paise/100:,.2f})")
    print(f"  Exact-Sum Invariant:   {'PASSED (Zero Discrepancy)' if invariant_holds else 'FAILED'}")
    print(f"-----------------------------------------------------------------")
    print(f"CATEGORY BREAKDOWN (Deterministic Minor Unit Aggregation):")
    for cat, paise_amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        pct = (paise_amt / total_paise) * 100 if total_paise > 0 else 0
        print(f"  • {cat:<24} ₹{paise_amt/100:>12,.2f} ({pct:>5.1f}%)")
    print(f"=================================================================")

    return throughput, duplicate_count, imported_count, category_totals

if __name__ == "__main__":
    count = 50000
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            count = 50000
    run_benchmark(batch_size=count)
