# EXPENZO Backend Implementation — Phase 6 PRD
## Investments, Watchlists and Market Data

### 1. Objective
Persist user stock holdings and watchlists in PostgreSQL. Provide server-side market data caching and honest disclosures when live third-party financial feeds are not configured.

### 2. Affected Existing Files
- `frontend/src/store/useFinanceStore.ts`
- `frontend/src/features/investments/pages/InvestmentsPage.tsx`
- `frontend/src/features/investments/pages/HoldingsPage.tsx`
- `frontend/src/features/investments/pages/WatchlistsPage.tsx`

### 3. New Files to Create
- `supabase/functions/market-data/index.ts` (Supabase Edge Function for fetching/caching quotes)
- `frontend/src/services/apiInvestmentService.ts`

### 4. Database Changes
- `investment_holdings`: User holdings with ticker, exchange, quantity, average buy price paise.
- `watchlists` & `watchlist_items`: User-created stock watchlists.
- `market_price_cache`: Server-cached quotes with symbol, price_minor, day_change_percent, updated_at.

### 5. Market Data Invariants
- Portfolio current value = $\sum (\text{holding.quantity} \times \text{latest quote price})$.
- Total invested = $\sum (\text{holding.quantity} \times \text{holding.avgBuyPriceMinor})$.
- Unrealized P&L = $\text{Current Value} - \text{Total Invested}$.
- If live market data API credentials are absent, display manually managed valuations and clearly label quotes as simulated or offline.

### 6. Acceptance Criteria
- User adds/edits/deletes holdings $\rightarrow$ saved to PostgreSQL.
- Watchlists survive page refreshes.
- No live prices are fabricated or misrepresented.

