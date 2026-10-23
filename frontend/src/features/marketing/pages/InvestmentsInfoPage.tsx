import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { PercentageChange } from '@/components/finance/PercentageChange';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  TrendingUp,
  PieChart,
  Search,
  Bookmark,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function InvestmentsInfoPage() {
  const store = useFinanceStore();
  const [selectedStock, setSelectedStock] = useState('TCS');

  const activeQuote = store.quotes[selectedStock] || store.quotes['TCS'];
  const portfolioVal = store.getPortfolioValue();
  const investedVal = store.getTotalInvested();
  const unrealizedGain = portfolioVal - investedVal;

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* 1. Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="warning">Wealth Intelligence & Portfolios</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Track Your Wealth with Institutional Precision.
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Monitor your equities, ETFs, and mutual funds alongside your everyday liquid accounts. Analyze true cost basis, asset diversification, and unrealized gains in real time.
        </p>
      </div>

      {/* 2-4. Portfolio Tracking & Allocation Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Metrics & Holdings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Portfolio Value</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  <CurrencyDisplay minor={portfolioVal} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Unrealized Return</span>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <PercentageChange valuePercent={8.97} />
                  <span className="text-xs text-emerald-600 font-bold tabular-nums">
                    (+<CurrencyDisplay minor={unrealizedGain} />)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400">Total Invested</span>
                <p className="text-base font-bold tabular-nums mt-0.5">
                  <CurrencyDisplay minor={investedVal} />
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400">Holdings Count</span>
                <p className="text-base font-bold tabular-nums mt-0.5">
                  {store.holdings.length} Active Positions
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Holdings Breakdown
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {store.holdings.map((h) => {
                  const quote = store.quotes[h.ticker];
                  const currentPrice = quote ? quote.currentPriceMinor : h.averageBuyPriceMinor;
                  const totalVal = h.quantity * currentPrice;

                  return (
                    <div key={h.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{h.ticker}</span>
                          <span className="text-[10px] font-normal text-slate-400">{h.companyName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {h.quantity} shares • Avg: <CurrencyDisplay minor={h.averageBuyPriceMinor} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold tabular-nums">
                          <CurrencyDisplay minor={totalVal} />
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          CMP: <CurrencyDisplay minor={currentPrice} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Asset Allocation & Stock Discovery (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <PieChart className="h-4 w-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Asset Allocation Distribution
              </h4>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Equities (Tech Bluechips)</span>
                  <span>100%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Debt / Fixed Income</span>
                  <span>0%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-0" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Diversification Insight:</span>
              </div>
              Your demo portfolio is 100% concentrated in the Indian Information Technology sector. Consider exploring defensive sectors or debt allocations for balanced volatility.
            </div>
          </Card>

          {/* 5-6. Stock Discovery Card */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-500" />
                <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  Sample Stock Discovery
                </h4>
              </div>
              <Badge variant="outline">NSE Quotes</Badge>
            </div>

            <div className="flex gap-2">
              {['TCS', 'INFY', 'HDFCBANK'].map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => setSelectedStock(ticker)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedStock === ticker
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {ticker}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{activeQuote.ticker}</span>
                <span className="font-extrabold text-base tabular-nums">
                  <CurrencyDisplay minor={activeQuote.currentPriceMinor} />
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{activeQuote.companyName}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                <div>Market Cap: <strong>{activeQuote.marketCap}</strong></div>
                <div>P/E Ratio: <strong>{activeQuote.peRatio || 'N/A'}</strong></div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 8. Financial Risk Disclaimer */}
      <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-950 dark:text-amber-200 space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <span>Statutory Investment Risk Disclaimer</span>
        </div>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400">
          Securities market investments are subject to market risks. All stock quotes, P&L calculations, and valuations displayed on EXPENZO are for demonstration and educational purposes only. EXPENZO is not a SEBI-registered investment advisor and does not execute real-money stock trades.
        </p>
      </div>

      {/* 9. CTA */}
      <div className="text-center pt-2">
        <Link to="/app/investments">
          <Button size="lg">
            Explore Investment Demo
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

