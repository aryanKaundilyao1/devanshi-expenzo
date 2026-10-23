import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { STOCK_CATALOG } from '@/features/investments/data/stockCatalog';
import { formatINR } from '@/domain/money/formatters';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  ExternalLink,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const StockDiscoverPage: React.FC = () => {
  const { quotes, watchlists, toggleWatchlistTicker } = useFinanceStore();

  const [search, setSearch] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ticker' | 'gainers' | 'losers' | 'price_desc' | 'price_asc'>('gainers');

  // Merged catalog with any runtime updates
  const allStocks = useMemo(() => {
    return Object.values({ ...STOCK_CATALOG, ...quotes });
  }, [quotes]);

  // Primary watchlist for quick toggle
  const primaryWatchlist = watchlists[0];

  // Distinct sectors
  const sectors = useMemo(() => {
    const set = new Set<string>();
    allStocks.forEach((s) => set.add(s.sector));
    return Array.from(set).sort();
  }, [allStocks]);

  // Filtered and sorted list
  const filteredStocks = useMemo(() => {
    return allStocks
      .filter((s) => {
        const matchesSearch =
          s.ticker.toLowerCase().includes(search.toLowerCase()) ||
          s.companyName.toLowerCase().includes(search.toLowerCase());
        const matchesExchange =
          exchangeFilter === 'all' || s.exchange.toLowerCase() === exchangeFilter.toLowerCase();
        const matchesSector =
          sectorFilter === 'all' || s.sector.toLowerCase() === sectorFilter.toLowerCase();
        return matchesSearch && matchesExchange && matchesSector;
      })
      .sort((a, b) => {
        if (sortBy === 'gainers') return b.dayChangePercent - a.dayChangePercent;
        if (sortBy === 'losers') return a.dayChangePercent - b.dayChangePercent;
        if (sortBy === 'price_desc') return b.currentPriceMinor - a.currentPriceMinor;
        if (sortBy === 'price_asc') return a.currentPriceMinor - b.currentPriceMinor;
        return a.ticker.localeCompare(b.ticker);
      });
  }, [allStocks, search, exchangeFilter, sectorFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Stock & Market Discovery
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              NSE / BSE Catalog
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore simulated Indian equities across key sectors with realistic quotes and metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/investments"
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Portfolio
          </Link>
          <Link
            to="/app/investments/watchlists"
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            My Watchlists
          </Link>
        </div>
      </div>

      {/* Market Overview Ticker Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            NIFTY 50 Demo Index
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white">24,850.40</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +0.65%
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            SENSEX Demo Index
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white">81,320.15</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +0.58%
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            NIFTY BANK Demo
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white">51,480.90</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +0.82%
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            NIFTY IT Demo
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white">42,110.30</span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> -0.32%
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company or ticker (e.g. TCS, HDFC, Reliance, Sun Pharma)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        <div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
          >
            <option value="all">All Sectors ({sectors.length})</option>
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
          >
            <option value="gainers">Top Day Gainers (%)</option>
            <option value="losers">Top Day Losers (%)</option>
            <option value="ticker">Symbol (A - Z)</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Stock Cards Grid */}
      {filteredStocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => {
            const isUp = stock.dayChangeMinor >= 0;
            const inWatchlist = primaryWatchlist?.tickers.includes(stock.ticker);

            return (
              <div
                key={stock.ticker}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/app/investments/stocks/${stock.ticker}`}
                          className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                        >
                          {stock.ticker}
                        </Link>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {stock.exchange}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate max-w-[200px] mt-0.5">
                        {stock.companyName}
                      </span>
                    </div>

                    {/* Watchlist Toggle */}
                    {primaryWatchlist && (
                      <button
                        onClick={() => toggleWatchlistTicker(primaryWatchlist.id, stock.ticker)}
                        className={`p-2 rounded-xl transition-colors ${
                          inWatchlist
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Price & Day Change */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatINR(stock.currentPriceMinor)}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold ${
                      isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{isUp ? '+' : ''}{formatINR(stock.dayChangeMinor)}</span>
                      <span>({isUp ? '+' : ''}{stock.dayChangePercent.toFixed(2)}%)</span>
                    </div>
                  </div>

                  {/* Fundamentals Snapshot */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Sector</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                        {stock.sector}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Market Cap</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {stock.marketCap}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/app/investments/stocks/${stock.ticker}`}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    View Chart & Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <span className="text-[10px] text-slate-400">
                    P/E {stock.peRatio || 'N/A'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs">
          <Compass className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Stocks Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            No equities match your current search query or sector filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSectorFilter('all');
              setExchangeFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

