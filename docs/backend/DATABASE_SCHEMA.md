# EXPENZO — PostgreSQL Database Schema Documentation

## Core Architectural Invariants
1. **Integer Minor Units:** All currency values are stored as `BIGINT` representing paise (₹1.00 = 100 paise) to prevent floating-point inaccuracies.
2. **Canonical Ledger Accounting:** Account balances are dynamically derived from `opening_balance_minor + credits - debits` rather than trusting mutable cache columns.
3. **Double-Entry Internal Transfers:** Account-to-account transfers create a single row with both `account_id` (source) and `target_account_id` (destination), conserving net worth and zero external income/expense leakage.

---

## Entity Relationship Overview

| Table Name | Description | Key Relationships |
| :--- | :--- | :--- |
| `profiles` | User profile linked to Supabase Auth | `id REFERENCES auth.users(id)` |
| `user_preferences` | Theme, formatting, notification rules | `user_id REFERENCES profiles(id)` |
| `financial_accounts` | Bank, cash, and credit accounts | `user_id REFERENCES profiles(id)` |
| `categories` | Income/Expense categories | `user_id REFERENCES profiles(id)` |
| `transactions` | Central canonical double-entry ledger | `account_id REFERENCES financial_accounts(id)` |
| `budgets` | Category budget caps per period | `user_id REFERENCES profiles(id)` |
| `savings_goals` | Financial savings targets | `user_id REFERENCES profiles(id)` |
| `goal_contributions` | Milestone allocations | `goal_id REFERENCES savings_goals(id)` |
| `banking_bills` | Recurring utility and service bills | `account_id REFERENCES financial_accounts(id)` |
| `banking_beneficiaries`| External payment contacts | `user_id REFERENCES profiles(id)` |
| `user_cards` | Virtual cards linked to accounts | `account_id REFERENCES financial_accounts(id)` |
| `investment_holdings` | Equities, ETFs, mutual funds | `user_id REFERENCES profiles(id)` |
| `watchlists` | User-curated ticker lists | `user_id REFERENCES profiles(id)` |
| `watchlist_items` | Tickers inside watchlists | `watchlist_id REFERENCES watchlists(id)` |
| `market_price_cache` | Shared quote cache | None (Global shared cache) |
| `ai_chat_sessions` | Conversational assistant threads | `user_id REFERENCES profiles(id)` |
| `ai_chat_messages` | Multi-turn chat message history | `session_id REFERENCES ai_chat_sessions(id)`|
| `notifications` | System and financial alert messages | `user_id REFERENCES profiles(id)` |
| `recurring_rules` | Standing instructions and repeat rules| `account_id REFERENCES financial_accounts(id)` |

