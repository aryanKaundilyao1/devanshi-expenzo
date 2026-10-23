import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { InvestmentHolding, StockQuote } from '@/types/finance';
import { TrendingUp, ArrowRight, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

interface PortfolioSnapshotProps {
  holdings: InvestmentHolding[];
  quotes: Record<string, StockQuote>;
  portfolioValueMinor: number;
  totalInvestedMinor: number;
}

export function PortfolioSnapshot({
  holdings,
  quotes,
  portfolioValueMinor,
  totalInvestedMinor,
}: PortfolioSnapshotProps) {
  const navigate = useNavigate();

  const unrealizedGainMinor = portfolioValueMinor - totalInvestedMinor;
  const gainPercent =
    totalInvestedMinor > 0
      ? Math.round((unrealizedGainMinor / totalInvestedMinor) * 1000) / 10
      : 0;

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Investment Portfolio</h3>
          </div>
          <p className="text-xs text-slate-500">
            Market valuation across NSE demo quotes.
          </p>
        </div>

        <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
          {holdings.length} Holdings Active
        </Badge>
      </div>

      {holdings.length > 0 ? (
        <div className="space-y-3">
          {/* Portfolio Metric Strip */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Current Market Value</p>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                <CurrencyDisplay amountMinor={portfolioValueMinor} />
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Unrealized P&L</p>
              <div
                className={`text-sm font-bold tabular-nums flex items-center justify-end gap-1 ${
                  unrealizedGainMinor >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                }`}
              >
                {unrealizedGainMinor >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                <span>
                  {unrealizedGainMinor >= 0 ? '+' : ''}{gainPercent}% ({unrealizedGainMinor >= 0 ? '+' : ''}
                  <CurrencyDisplay amountMinor={unrealizedGainMinor} />)
                </span>
              </div>
            </div>
          </div>

          {/* Holdings List */}
          <div className="space-y-1.5">
            {holdings.map((h) => {
              const quote = quotes[h.ticker];
              const currentPriceMinor = quote ? quote.currentPriceMinor : h.averageBuyPriceMinor;
              const holdingValueMinor = h.quantity * currentPriceMinor;
              const holdingCostMinor = h.quantity * h.averageBuyPriceMinor;
              const holdingPnlMinor = holdingValueMinor - holdingCostMinor;

              return (
                <div
                  key={h.id}
                  onClick={() => navigate(`/app/investments/stocks/${h.ticker}`)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                      {h.ticker.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {h.ticker}
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">
                          {h.quantity} shares
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-none">
                        Avg: ₹{(h.averageBuyPriceMinor / 100).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                      <CurrencyDisplay amountMinor={holdingValueMinor} />
                    </p>
                    <p
                      className={`text-[10px] font-semibold tabular-nums ${
                        holdingPnlMinor >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {holdingPnlMinor >= 0 ? '+' : ''}
                      <CurrencyDisplay amountMinor={holdingPnlMinor} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/investments')}
              className="w-full justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600"
            >
              <span>Explore Portfolio & Stock Discovery</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 p-4">
          <Compass className="h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Investment Holdings</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Track your equity portfolio, mutual funds, and stock watchlists.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/app/investments')} className="text-xs gap-1.5 mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Discover Stocks</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
