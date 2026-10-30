# EXPENZO — External Dependencies & Remaining Blockers

**Status:** Code Complete & Tested. No Internal Code Blockers.

---

## 1. External Third-Party Dependencies

To switch from the local offline mode to a live cloud database, the developer must supply their own free credentials:

1. **Supabase Project URL & Anon Key:**
   - **Status:** Handled via `.env` / environment variables.
   - **Requirement:** Run the 3 migration files in `supabase/migrations/` on your Supabase project SQL Editor, and paste `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` or Vercel dashboard.
2. **Google Gemini Flash API Key (Optional for live LLM):**
   - **Status:** Handled gracefully. If `GEMINI_API_KEY` is not provided in Supabase Edge Functions secrets, EXPENZO automatically falls back to its offline deterministic rule engine.
3. **RBI Account Aggregator Framework (Live Banking):**
   - **Status:** Out-of-scope for prototype demonstration. All digital banking operations (HDFC, SBI, cash) function as manually tracked accounts with authentic double-entry ledger bookkeeping.

