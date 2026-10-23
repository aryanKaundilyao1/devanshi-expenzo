import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { STOCK_CATALOG } from '@/features/investments/data/stockCatalog';
import { StockPriceChart } from '@/features/investments/components/StockPriceChart';
import { HoldingModal } from '@/features/investments/components/HoldingModal';
import { formatINR } from '@/domain/money/formatters';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Star,
  Plus,
  Briefcase,
  Layers,
  AlertCircle,
  Building2,
  PieChart,
} from 'lucide-react';

export const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { quotes, holdings, watchlists, toggleWatchlistTicker } = useFinanceStore();

  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false);

  const upperSymbol = symbol?.toUpperCase() || '';
  const stock = quotes[upperSymbol] || STOCK_CATALOG[upperSymbol];

  // If not found in catalog or quotes, show not-found state
  if (!stock) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Instrument Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          The stock ticker symbol <span className="font-mono font-semibold">{symbol}</span> was not found in our simulated market catalog.
        </p>
        <Link
          to="/app/investments/discover"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stock Discovery
        </Link>
      </div>
    );
  }

  const isUp = stock.dayChangeMinor >= 0;
  const primaryWatchlist = watchlists[0];
  const inWatchlist = primaryWatchlist?.tickers.includes(stock.ticker);

  // Check if user currently holds this stock
  const currentHolding = holdings.find((h) => h.ticker.toUpperCase() === upperSymbol);
  const holdingValuationMinor = currentHolding ? currentHolding.quantity * stock.currentPriceMinor : 0;
  const holdingInvestedMinor = currentHolding ? currentHolding.quantity * currentHolding.averageBuyPriceMinor : 0;
  const holdingGainMinor = holdingValuationMinor - holdingInvestedMinor;
  const holdingGainPercent = holdingInvestedMinor > 0 ? (holdingGainMinor / holdingInvestedMinor) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Nav Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/investments/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discover
        </Link>

        <div className="flex items-center gap-2">
          {primaryWatchlist && (
            <button
              onClick={() => toggleWatchlistTicker(primaryWatchlist.id, stock.ticker)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                inWatchlist
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current' : ''}`} />
              {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          )}

          <button
            onClick={() => setIsHoldingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Portfolio
          </button>
        </div>
      </div>

      {/* Hero Quote Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {stock.ticker}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {stock.exchange}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {stock.sector}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {stock.companyName}
          </p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatINR(stock.currentPriceMinor)}
          </div>
          <div className={`flex items-center justify-end gap-1 text-sm font-bold mt-1 ${
            isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isUp ? '+' : ''}{formatINR(stock.dayChangeMinor)}</span>
            <span>({isUp ? '+' : ''}{stock.dayChangePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Chart & Holding Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2">
          <StockPriceChart
            historicalPrices={stock.historicalPrices}
            currentPriceMinor={stock.currentPriceMinor}
            ticker={stock.ticker}
          />
        </div>

        {/* Portfolio Holding Status & Overview */}
        <div className="space-y-6">
          {/* User Position Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Your Holding Status
              </h3>
              <Briefcase className="w-4 h-4 text-slate-400" />
            </div>

            {currentHolding ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 text-xs">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>Shares Owned:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentHolding.quantity} units</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mt-1">
                    <span>Avg Purchase:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(currentHolding.averageBuyPriceMinor)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mt-1">
                    <span>Current Valuation:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(holdingValuationMinor)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 mt-2 border-t border-emerald-200 dark:border-emerald-900/80">
                    <span>Unrealized P&L:</span>
                    <span className={holdingGainMinor >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {holdingGainMinor >= 0 ? '+' : ''}{formatINR(holdingGainMinor)} ({holdingGainPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <Link
                  to="/app/investments/holdings"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  View in Holdings Ledger
                </Link>
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  You do not currently track any positions of {stock.ticker} in your portfolio.
                </p>
                <button
                  onClick={() => setIsHoldingModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Position
                </button>
              </div>
            )}
          </div>

          {/* Key Fundamentals Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Key Fundamentals
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Market Cap</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stock.marketCap}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">P/E Ratio</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stock.peRatio || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">52-Week High</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(stock.week52HighMinor)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">52-Week Low</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(stock.week52LowMinor)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Exchange</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stock.exchange}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Overview Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            About {stock.companyName}
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {stock.companyOverview ||
            `${stock.companyName} is a constituent of the ${stock.exchange} listed equities. It operates in the ${stock.sector} sector with significant market footprint in India.`}
        </p>
      </div>

      <HoldingModal
        isOpen={isHoldingModalOpen}
        onClose={() => setIsHoldingModalOpen(false)}
        holdingToEdit={currentHolding ? { ...currentHolding } : null}
      />
    </div>
  );
};

