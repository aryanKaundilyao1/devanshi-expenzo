# Investment prototype PRD

## Scope
All instruments/prices are illustrative, timestamped DEMO; no buy/sell execution, live quotes, regulated personalized advice, or guaranteed returns.

## `/app/investments`
Portfolio KPI value, cost basis, unrealized P&L, asset allocation, demo chart; top holdings, watchlists, links **View Holdings** -> holdings, **Discover** -> discover, **Analytics** -> analytics. If no holdings, show Add Holding.

## `/app/investments/holdings`
Sortable holdings list with instrument, quantity, avg cost, demo CMP, cost, value, return. **Add Holding** -> form with instrument, quantity, cost basis and purchase date; **Edit** -> revise; **Remove** -> confirm. Recording preexisting holding does not deduct cash. Recompute P&L after edits and quote fixture changes. Show unavailability when no price.

## `/app/investments/discover`
Search ticker/company and filter exchange/sector/asset type; results from local instrument dataset. Row -> `/app/investments/stocks/:symbol`; **Watch** -> picker to add to watchlist; **Clear** -> reset query. No 'Top movers today' unless described as fictional demo.

## `/app/investments/stocks/:symbol`
Company info, fictional quote and timestamp, 1M/3M/1Y chart from fixed fixtures, metrics only if seeded, explain terms button -> related learning article. **Add to Watchlist** -> select/create watchlist; **Record Holding** -> holding form; **Ask about Stock** -> AI assistant with ticker context; **Back** -> discover. Unknown ticker -> Not found.

## `/app/investments/watchlists` + `/:id`
**Create** -> unique title form; **Rename**; **Delete** with confirm; **Add Instrument** -> picker; **Remove** instrument; click symbol -> stock detail. Empty list has CTA. No external price alerts, but optional demo threshold rule can generate local simulated alert when mock quote is explicitly changed.

## `/app/investments/analytics`
Allocation pie/chart, concentration by holding and sector, unrealized return and explanatory labels; tooltip shows source records. **View holdings** -> holdings; **Ask AI** -> assistant context=portfolio.

## Acceptance
`sum(quantity*demoPrice)` equals portfolio value. Gain = value − cost; no holdings are added to deposit cash or counted twice; watchlist changes persist on reload.
