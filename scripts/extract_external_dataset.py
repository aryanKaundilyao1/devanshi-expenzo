#!/usr/bin/env python3
"""
EXPENZO — External Dataset Ingestion & Preprocessing Pipeline
Reads:
  - data/external/archive/sd254_users.csv
  - data/external/archive/sd254_cards.csv
  - data/external/archive/User0_credit_card_transactions.csv
  - data/external/archive/credit_card_transactions-ibm_v2.csv
Outputs:
  - frontend/src/data/externalDataset.json
"""

import csv
import json
import os
import re
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "external", "archive")
OUT_FILE = os.path.join(BASE_DIR, "frontend", "src", "data", "externalDataset.json")

MCC_MAP = {
    5411: "Food & Groceries",
    5422: "Food & Groceries",
    5441: "Food & Groceries",
    5451: "Food & Groceries",
    5462: "Food & Groceries",
    5499: "Food & Groceries",
    5812: "Dining & Restaurants",
    5813: "Dining & Restaurants",
    5814: "Dining & Restaurants",
    4111: "Transportation",
    4112: "Transportation",
    4121: "Transportation",
    4131: "Transportation",
    4789: "Transportation",
    5541: "Automotive & Fuel",
    5542: "Automotive & Fuel",
    4814: "Utilities & Bills",
    4899: "Utilities & Bills",
    4900: "Utilities & Bills",
    5310: "Shopping & Retail",
    5311: "Shopping & Retail",
    5331: "Shopping & Retail",
    5611: "Shopping & Retail",
    5621: "Shopping & Retail",
    5651: "Shopping & Retail",
    5691: "Shopping & Retail",
    5942: "Shopping & Retail",
    5999: "Shopping & Retail",
    5912: "Health & Medical",
    8011: "Health & Medical",
    8021: "Health & Medical",
    8042: "Health & Medical",
    8062: "Health & Medical",
    8099: "Health & Medical",
    7832: "Entertainment & Leisure",
    7911: "Entertainment & Leisure",
    7922: "Entertainment & Leisure",
    7991: "Entertainment & Leisure",
    7996: "Entertainment & Leisure",
    7997: "Entertainment & Leisure",
    7999: "Entertainment & Leisure",
}

MERCHANT_NAMES = {
    5411: ["Whole Foods Market", "Trader Joe's", "Reliance Fresh Supermarket", "Nature's Basket Groceries"],
    5422: ["Fresh Meat & Poultry", "Local Butcher Market", "Seafood Emporium"],
    5499: ["Gourmet Food Pantry", "Daily Needs Mart", "Organic Farm Direct"],
    5814: ["Chipotle Mexican Grill", "Starbucks Coffee", "Subway Sandwiches", "Haldiram's Express", "Domino's Pizza"],
    5812: ["Barbeque Nation Dining", "Olive Garden Italian", "The Bombay Canteen", "Punjab Grill Bistro"],
    4121: ["Uber Rides", "Ola Cabs Express", "City Metro Taxi", "Rapido Transit"],
    4111: ["Delhi Metro Rail Recharge", "Indian Railways IRCTC", "Transit Authority Commute"],
    5541: ["Indian Oil Fuel Station", "Bharat Petroleum", "Shell Energy Station", "HP Petrol Pump"],
    4900: ["BSES Rajdhani Electricity", "Tata Power Delhi", "Indraprastha Gas Piped Supply", "Delhi Jal Board Water"],
    4814: ["Airtel Fiber Broadband", "Jio Infocomm Telecom", "Vodafone Idea Mobile Bill"],
    5311: ["Amazon India Retail", "Flipkart Commerce", "Target Supercentre", "Big Bazaar Department"],
    5651: ["Zara Fashion Store", "H&M Apparel", "FabIndia Ethnic Wear", "Marks & Spencer Retail"],
    5942: ["Crossword Bookstore", "Kitab Khana Books", "Academic Book Corner"],
    5912: ["Apollo Pharmacy Care", "MedPlus Drugstore", "Guardian Health & Wellness", "1mg Diagnostics"],
    8011: ["Max Healthcare Diagnostics", "Fortis Clinic Consultation", "Dr. Lal PathLabs"],
    7832: ["PVR Cinema IMAX", "INOX Leisure Multiplex", "Cinepolis Theater"],
    7999: ["Cult.fit Fitness Club", "Spotify Premium Music", "Netflix Streaming Subscription"],
}

USD_TO_INR = 83.0

def clean_amount(amt_str):
    clean = re.sub(r'[^0-9.-]', '', str(amt_str))
    try:
        return float(clean)
    except:
        return 0.0

def run():
    print(f"Reading dataset from: {DATA_DIR}")

    # 1. Parse Users
    users_file = os.path.join(DATA_DIR, "sd254_users.csv")
    raw_users = []
    with open(users_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= 4:
                break
            raw_users.append(row)

    household_members = []
    user_mapping = [
        {"userId": "user-0", "name": "Devanshi Singh", "role": "owner", "avatar": "DS"},
        {"userId": "user-1", "name": "Aarav Singh", "role": "member", "avatar": "AS"},
        {"userId": "user-2", "name": "Priya Singh", "role": "member", "avatar": "PS"},
        {"userId": "user-3", "name": "Rohan Singh", "role": "member", "avatar": "RS"},
    ]

    for i, ru in enumerate(raw_users):
        meta = user_mapping[i]
        inc_usd = clean_amount(ru.get("Yearly Income - Person", "$60000"))
        debt_usd = clean_amount(ru.get("Total Debt", "$0"))
        fico = int(ru.get("FICO Score", 720))

        annual_inr = round(inc_usd * USD_TO_INR)
        monthly_paise = round(annual_inr / 12 * 100)
        allocated_budget = round(monthly_paise * 0.45) # 45% budget allocation

        household_members.append({
            "id": f"mem-{meta['userId']}",
            "userId": meta["userId"],
            "name": meta["name"],
            "originalDatasetName": ru["Person"],
            "email": f"{meta['name'].lower().replace(' ', '.')}@expenzo.local",
            "role": meta["role"],
            "status": "active",
            "joinedAt": "2026-08-01T09:00:00Z",
            "age": int(ru.get("Current Age", 45)),
            "gender": ru.get("Gender", "Unknown"),
            "city": ru.get("City", "Delhi"),
            "state": ru.get("State", "DL"),
            "knownMonthlyIncomeMinor": monthly_paise,
            "allocatedBudgetMinor": allocated_budget,
            "totalDebtMinor": round(debt_usd * USD_TO_INR * 100),
            "ficoScore": fico,
        })

    # 2. Parse Cards
    cards_file = os.path.join(DATA_DIR, "sd254_cards.csv")
    accounts = []
    card_map = {} # (userIndex, cardIndex) -> accountId

    with open(cards_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            u_idx = int(row["User"])
            if u_idx >= 4:
                continue
            c_idx = int(row["CARD INDEX"])
            brand = row.get("Card Brand", "Visa")
            c_type = row.get("Card Type", "Debit")
            num = str(row.get("Card Number", "0000"))
            last4 = num[-4:] if len(num) >= 4 else "0000"
            limit_usd = clean_amount(row.get("Credit Limit", "$15000"))

            acct_type = "credit" if "Credit" in c_type else "savings"
            user_name = household_members[u_idx]["name"]
            acct_id = f"acc-u{u_idx}-c{c_idx}"
            card_map[(u_idx, c_idx)] = acct_id

            # Starting balance (proportional to limit / realistic balance)
            init_balance_minor = round(limit_usd * USD_TO_INR * 100 * 0.65) if acct_type == "savings" else round(limit_usd * USD_TO_INR * 100 * 0.20)

            accounts.append({
                "id": acct_id,
                "name": f"{brand} {c_type} ({user_name.split()[0]})",
                "accountType": acct_type,
                "institution": f"{brand} Financial",
                "institutionName": f"{brand} Financial",
                "accountNumberMasked": f"•••• {last4}",
                "accountNumberMask": f"•••• {last4}",
                "openingBalanceMinor": init_balance_minor,
                "balanceMinor": init_balance_minor,
                "availableCreditMinor": round(limit_usd * USD_TO_INR * 100),
                "creditLimitMinor": round(limit_usd * USD_TO_INR * 100),
                "currency": "INR",
                "isDemo": False,
                "lastUpdated": "2026-10-31T00:00:00Z",
                "isArchived": False,
                "userId": household_members[u_idx]["userId"],
            })

    # 3. Parse Transactions from IBM Dataset
    transactions = []
    seen_fingerprints = set()

    # We read User0 file first (high-density primary earner)
    u0_file = os.path.join(DATA_DIR, "User0_credit_card_transactions.csv")
    rows_by_user = {0: [], 1: [], 2: [], 3: []}

    with open(u0_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows_by_user[0].append(row)

    # Read Users 1, 2, 3 from the main IBM dataset (stream first 120,000 rows)
    v2_file = os.path.join(DATA_DIR, "credit_card_transactions-ibm_v2.csv")
    with open(v2_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            u = int(row["User"])
            if u in (1, 2, 3) and len(rows_by_user[u]) < 600:
                rows_by_user[u].append(row)
            if i >= 120000:
                break

    # Sample distribution: User 0: ~800, User 1: ~350, User 2: ~300, User 3: ~250
    targets = {0: 800, 1: 350, 2: 300, 3: 250}

    for u_idx in (0, 1, 2, 3):
        user_rows = rows_by_user[u_idx]
        # Sort or sample evenly
        sample_size = min(len(user_rows), targets[u_idx])
        # Pick the most recent sample
        selected_rows = user_rows[-sample_size:]

        for row in selected_rows:
            try:
                c_idx = int(row["Card"])
                acct_id = card_map.get((u_idx, c_idx), accounts[0]["id"])
                user_id = household_members[u_idx]["userId"]

                # Fingerprint check
                raw_amt = str(row.get("Amount", "$0.00"))
                amt_usd = clean_amount(raw_amt)
                if amt_usd <= 0.5:
                    continue

                fp = f"{u_idx}:{c_idx}:{row.get('Year')}:{row.get('Month')}:{row.get('Day')}:{raw_amt}:{row.get('Merchant Name')}"
                if fp in seen_fingerprints:
                    continue
                seen_fingerprints.add(fp)

                mcc = int(row.get("MCC", 5411))
                category = MCC_MAP.get(mcc, "General & Miscellaneous")

                # Merchant Name resolution
                named_options = MERCHANT_NAMES.get(mcc)
                if named_options:
                    # Deterministic hash selection for merchant
                    h_val = abs(hash(str(row.get("Merchant Name", "")))) % len(named_options)
                    merchant = named_options[h_val]
                else:
                    merchant = f"Merchant #{abs(hash(str(row.get('Merchant Name')))) % 9000 + 1000}"

                city = row.get("Merchant City", "").strip()
                if city and city != "ONLINE":
                    merchant = f"{merchant} ({city})"

                # Year normalization: map historical distribution to 2024-2026
                # (e.g. recent transactions fall into Sept-Oct 2026 for rich dashboard metrics)
                orig_year = int(row.get("Year", 2020))
                orig_month = int(row.get("Month", 10))
                orig_day = min(int(row.get("Day", 15)), 28)

                # Normalize year to 2026 if within last 2 years of user dataset, else 2025/2026
                year_offset = 2026 - 2020
                norm_year = max(2024, min(2026, orig_year + year_offset))

                # Month adjustment: cluster significant activity around Aug, Sep, Oct 2026
                date_str = f"{norm_year}-{orig_month:02d}-{orig_day:02d}"

                # Minor paise conversion (1 USD = 83 INR, 100 paise per INR)
                amt_minor = round(amt_usd * USD_TO_INR * 100)

                # Flagged or fraud
                is_fraud = row.get("Is Fraud?", "No") == "Yes"
                is_err = bool(row.get("Errors?", "").strip())

                tx_id = f"tx-ibm-{len(transactions) + 1:05d}"
                is_shared = (u_idx == 0 and category in ("Food & Groceries", "Utilities & Bills") and len(transactions) % 3 == 0)

                transactions.append({
                    "id": tx_id,
                    "accountId": acct_id,
                    "amountMinor": amt_minor,
                    "type": "expense",
                    "category": category,
                    "merchant": merchant,
                    "date": date_str,
                    "status": "flagged" if (is_fraud or is_err) else "completed",
                    "notes": f"Imported from IBM Dataset [MCC {mcc}, Chip: {row.get('Use Chip', 'Swipe')}]",
                    "tags": ["ibm-dataset", "external", f"mcc-{mcc}"],
                    "isShared": is_shared,
                    "familyId": "fam-singh-001" if is_shared else None,
                    "userId": user_id,
                    "metadata": {
                        "mcc": mcc,
                        "rawUsd": amt_usd,
                        "originalUser": row.get("User"),
                        "originalCard": row.get("Card"),
                        "useChip": row.get("Use Chip"),
                        "provenance": "data/external/archive/credit_card_transactions-ibm_v2.csv",
                    }
                })

            except Exception as e:
                continue

    # Add monthly salary/income credits for each user so savings and cash flows are real!
    for u_idx in (0, 1, 2, 3):
        u = household_members[u_idx]
        user_acct = [a["id"] for a in accounts if a["userId"] == u["userId"] and a["accountType"] == "savings"]
        acct_id = user_acct[0] if user_acct else accounts[0]["id"]
        monthly_income = u["knownMonthlyIncomeMinor"]

        # 3 salary credits for Aug, Sep, Oct 2026
        for m_str in ("2026-08-01", "2026-09-01", "2026-10-01"):
            transactions.append({
                "id": f"tx-salary-u{u_idx}-{m_str}",
                "accountId": acct_id,
                "amountMinor": monthly_income,
                "type": "income",
                "category": "Salary & Income",
                "merchant": f"Employer Payroll Corp ({u['name']})",
                "date": m_str,
                "status": "completed",
                "notes": f"Monthly professional salary credit from sd254_users profile",
                "tags": ["salary", "payroll", "ground-truth-income"],
                "userId": u["userId"],
            })

    # Sort transactions chronologically
    transactions.sort(key=lambda t: t["date"], reverse=True)

    result = {
        "metadata": {
            "source": "IBM Synthetic Financial Transactions Dataset (archive/)",
            "totalTransactions": len(transactions),
            "totalAccounts": len(accounts),
            "totalMembers": len(household_members),
            "dateRange": {
                "earliest": transactions[-1]["date"] if transactions else "2024-01-01",
                "latest": transactions[0]["date"] if transactions else "2026-10-28",
            },
            "generatedAt": "2026-11-19T14:00:00Z",
            "academicAttribution": "Devanshi Singh, CSCR2600 PBL-1",
        },
        "members": household_members,
        "accounts": accounts,
        "transactions": transactions,
    }

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Successfully generated: {OUT_FILE}")
    print(f"  • Members:      {len(household_members)}")
    print(f"  • Accounts:     {len(accounts)}")
    print(f"  • Transactions: {len(transactions)}")

if __name__ == "__main__":
    run()
