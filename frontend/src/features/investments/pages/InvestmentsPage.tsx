import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  calculatePortfolioMetrics,
  calculateAssetAllocation,
  calculateSectorAllocation,
  calculateHoldingsDetailed,
  calculateDiversificationRisk,
} from '@/features/investments/utils/investmentCalculations';
import { formatINR } from '@/domain/money/formatters';
import { HoldingModal } from '@/features/investments/components/HoldingModal';
import { AssetAllocationDonut } from '@/features/investments/components/AssetAllocationDonut';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Compass,
  PieChart,
  ShieldAlert,
  ArrowRight,
  Eye,
  Layers,
  Sparkles,
} from 'lucide-react';

export const InvestmentsPage: React.FC = () => {
  const { holdings, quotes, watchlists, demoAsOf } = useFinanceStore();
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false);

  const metrics = calculatePortfolioMetrics(holdings, quotes);
  const assetAllocation = calculateAssetAllocation(holdings, quotes);
  const sectorAllocation = calculateSectorAllocation(holdings, quotes);
  const detailedHoldings = calculateHoldingsDetailed(holdings, quotes);
  const riskAssessment = calculateDiversificationRisk(holdings, quotes);

  const isPositiveGain = metrics.unrealizedGainLossMinor >= 0;
  const isDayPositive = metrics.dayChangeMinor >= 0;

  // Empty State
  if (holdings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Investment Portfolio
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track equities, mutual funds, ETFs, and gold positions in real time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/app/investments/discover"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Compass className="w-4 h-4" />
              Explore Stocks
            </Link>
            <button
              onClick={() => setIsHoldingModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Position
            </button>
          </div>
        </div>

        {/* Empty Slate Hero */}
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Investment Holdings Tracked
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Your investment portfolio is currently empty. Record your stock, ETF, or mutual fund holdings to monitor unrealized gains, sector allocation, and portfolio risk.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsHoldingModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Tracked Position
            </button>
            <Link
              to="/app/investments/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Explore Market Catalog
            </Link>
          </div>
        </div>

        <HoldingModal
          isOpen={isHoldingModalOpen}
          onClose={() => setIsHoldingModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Investment Portfolio
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              Demo Market Snapshot
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            As of {demoAsOf} • Deterministic simulation data • No live NSE API connection
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/app/investments/discover"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Discover
          </Link>
          <Link
            to="/app/investments/holdings"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Layers className="w-4 h-4" />
            All Holdings
          </Link>
          <button
            onClick={() => setIsHoldingModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Position
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Value */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Portfolio Value
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatINR(metrics.totalValueMinor)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Market valuation</span>
        </div>

        {/* Invested Capital */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Invested
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatINR(metrics.totalInvestedMinor)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Cost basis</span>
        </div>

        {/* Unrealized Gain */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Unrealized P&L
          </span>
          <div className={`text-xl font-bold mt-1 flex items-center gap-1 ${
            isPositiveGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isPositiveGain ? '+' : ''}{formatINR(metrics.unrealizedGainLossMinor)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Total profit / loss</span>
        </div>

        {/* Return % */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Return %
          </span>
          <div className={`text-xl font-bold mt-1 flex items-center gap-1 ${
            isPositiveGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isPositiveGain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositiveGain ? '+' : ''}{metrics.unrealizedReturnPercent.toFixed(2)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Overall gain %</span>
        </div>

        {/* Day Change */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            1-Day Change
          </span>
          <div className={`text-xl font-bold mt-1 ${
            isDayPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isDayPositive ? '+' : ''}{formatINR(metrics.dayChangeMinor)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {isDayPositive ? '+' : ''}{metrics.dayChangePercent.toFixed(2)}% today
          </span>
        </div>

        {/* Holdings Count */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Holdings Count
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.holdingsCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Tracked instruments</span>
        </div>
      </div>

      {/* Analytics & Allocation Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AssetAllocationDonut allocation={assetAllocation} />
        </div>

        {/* Sector Allocation & Concentration Bar */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Sector Exposure & Allocation
              </h3>
              <Link
                to="/app/investments/analytics"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                Deep Analytics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {sectorAllocation.slice(0, 4).map((sec) => (
                <div key={sec.sector} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {sec.sector}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatINR(sec.valueMinor)} ({sec.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(sec.percent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Observation Pill */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-slate-900 dark:text-white">
                  Risk & Diversification Score:
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${riskAssessment.scoreBadgeClass}`}>
                  {riskAssessment.scoreText}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {riskAssessment.observation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Holdings Preview & Watchlist Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Holdings Table */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Holdings Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current valuations and unrealized returns
              </p>
            </div>
            <Link
              to="/app/investments/holdings"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
            >
              View All ({holdings.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-semibold">Instrument</th>
                  <th className="pb-2.5 font-semibold text-right">Quantity</th>
                  <th className="pb-2.5 font-semibold text-right">Avg Buy Price</th>
                  <th className="pb-2.5 font-semibold text-right">Current Price</th>
                  <th className="pb-2.5 font-semibold text-right">Valuation</th>
                  <th className="pb-2.5 font-semibold text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {detailedHoldings.slice(0, 5).map((h) => {
                  const isGain = h.unrealizedGainMinor >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3">
                        <Link
                          to={`/app/investments/stocks/${h.ticker}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 block"
                        >
                          {h.ticker}
                        </Link>
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">
                          {h.companyName}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                        {h.quantity}
                      </td>
                      <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                        {formatINR(h.averageBuyPriceMinor)}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">
                        {formatINR(h.currentPriceMinor)}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatINR(h.currentValueMinor)}
                      </td>
                      <td className="py-3 text-right font-bold">
                        <span className={isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isGain ? '+' : ''}{formatINR(h.unrealizedGainMinor)}
                        </span>
                        <span className={`block text-[10px] ${isGain ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isGain ? '+' : ''}{h.returnPercent.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Watchlist Quick Snapshot */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Watchlists
                </h3>
              </div>
              <Link
                to="/app/investments/watchlists"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                Manage
              </Link>
            </div>

            {watchlists.length > 0 ? (
              <div className="space-y-3">
                {watchlists[0].tickers.slice(0, 5).map((tkr) => {
                  const quote = quotes[tkr];
                  const isUp = quote ? quote.dayChangeMinor >= 0 : true;
                  return (
                    <Link
                      key={tkr}
                      to={`/app/investments/stocks/${tkr}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          {tkr}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                          {quote?.companyName || tkr}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                          {quote ? formatINR(quote.currentPriceMinor) : '—'}
                        </span>
                        {quote && (
                          <span className={`text-[10px] font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isUp ? '+' : ''}{quote.dayChangePercent.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No active watchlists. Create one to monitor equities.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <Link
              to="/app/investments/discover"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Discover More Stocks
            </Link>
          </div>
        </div>
      </div>

      <HoldingModal
        isOpen={isHoldingModalOpen}
        onClose={() => setIsHoldingModalOpen(false)}
      />
    </div>
  );
};

