# EXPENZO — Row Level Security (RLS) & Access Control Matrix

## Multi-Tenant Security Policy
1. **Zero Cross-Tenant Leakage:** Every table containing user financial records has RLS enabled with `auth.uid() = user_id`.
2. **PostgreSQL RPC Security:** Stored procedures use `SECURITY DEFINER` with an explicit `auth.uid()` identity check at execution time to ensure that callers cannot manipulate accounts they do not own.
3. **No Service-Role Key on Client:** The frontend strictly possesses the anonymous public publishable key (`VITE_SUPABASE_ANON_KEY`).

---

## Policy Coverage Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | `auth.uid() = id` | `auth.uid() = id` | `auth.uid() = id` | System cascade |
| `user_preferences` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | System cascade |
| `financial_accounts` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `transactions` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `budgets` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `savings_goals` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `banking_bills` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `investment_holdings`| `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `watchlists` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `ai_chat_sessions` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `notifications` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `market_price_cache` | `auth.role() = 'authenticated'` | Service Role only | Service Role only | Service Role only |

