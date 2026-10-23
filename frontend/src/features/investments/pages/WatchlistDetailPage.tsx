import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { STOCK_CATALOG } from '@/features/investments/data/stockCatalog';
import { formatINR } from '@/domain/money/formatters';
import {
  ArrowLeft,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertCircle,
  ExternalLink,
  Search,
  X,
} from 'lucide-react';

export const WatchlistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { watchlists, quotes, addTickerToWatchlist, removeTickerFromWatchlist, deleteWatchlist } = useFinanceStore();

  const [isAddInstrumentOpen, setIsAddInstrumentOpen] = useState(false);
  const [instrumentSearch, setInstrumentSearch] = useState('');

  const watchlist = watchlists.find((w) => w.id === id);

  if (!watchlist) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Watchlist Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          The requested watchlist does not exist or may have been deleted.
        </p>
        <Link
          to="/app/investments/watchlists"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Watchlists
        </Link>
      </div>
    );
  }

  const allAvailableStocks = Object.values({ ...STOCK_CATALOG, ...quotes });
  const candidateStocks = allAvailableStocks.filter((s) => {
    const isNotInList = !watchlist.tickers.includes(s.ticker);
    const matches =
      s.ticker.toLowerCase().includes(instrumentSearch.toLowerCase()) ||
      s.companyName.toLowerCase().includes(instrumentSearch.toLowerCase());
    return isNotInList && matches;
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/investments/watchlists"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Watchlists
        </Link>

        <button
          onClick={() => setIsAddInstrumentOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Symbol
        </button>
      </div>

      {/* Watchlist Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {watchlist.name}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {watchlist.tickers.length} {watchlist.tickers.length === 1 ? 'stock' : 'stocks'}
            </span>
          </div>
          {watchlist.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {watchlist.description}
            </p>
          )}
        </div>
      </div>

      {/* Instruments Table */}
      {watchlist.tickers.length > 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Instrument</th>
                  <th className="py-3.5 px-4">Sector</th>
                  <th className="py-3.5 px-4 text-right">Demo CMP</th>
                  <th className="py-3.5 px-4 text-right">Day Change</th>
                  <th className="py-3.5 px-4 text-right">52W Range</th>
                  <th className="py-3.5 px-4 text-right">Market Cap</th>
                  <th className="py-3.5 px-4 text-right">P/E</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {watchlist.tickers.map((tkr) => {
                  const stock = quotes[tkr] || STOCK_CATALOG[tkr];
                  const isUp = stock ? stock.dayChangeMinor >= 0 : true;

                  return (
                    <tr
                      key={tkr}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/app/investments/stocks/${tkr}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5"
                        >
                          {tkr}
                          {stock && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-normal">
                              {stock.exchange}
                            </span>
                          )}
                        </Link>
                        <span className="text-[11px] text-slate-400 truncate max-w-[150px] block">
                          {stock?.companyName || tkr}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {stock?.sector || 'Diversified'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {stock ? formatINR(stock.currentPriceMinor) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold">
                        {stock ? (
                          <>
                            <span className={isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                              {isUp ? '+' : ''}{formatINR(stock.dayChangeMinor)}
                            </span>
                            <span className={`block text-[10px] ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {isUp ? '+' : ''}{stock.dayChangePercent.toFixed(2)}%
                            </span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400 text-[11px]">
                        {stock ? `${formatINR(stock.week52LowMinor)} - ${formatINR(stock.week52HighMinor)}` : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {stock?.marketCap || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {stock?.peRatio || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => removeTickerFromWatchlist(watchlist.id, tkr)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Remove from Watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs">
          <Eye className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Watchlist is Empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Search and add Indian equities to track live simulated price updates and valuations.
          </p>
          <button
            onClick={() => setIsAddInstrumentOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Stock Symbol
          </button>
        </div>
      )}

      {/* Add Symbol Modal */}
      {isAddInstrumentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Symbol to {watchlist.name}
              </h3>
              <button
                onClick={() => setIsAddInstrumentOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search symbol or name..."
                value={instrumentSearch}
                onChange={(e) => setInstrumentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <div className="mt-3 overflow-y-auto space-y-1.5 flex-1 pr-1">
              {candidateStocks.map((stock) => (
                <div
                  key={stock.ticker}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/60 text-xs transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {stock.ticker}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {stock.companyName}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatINR(stock.currentPriceMinor)}
                    </span>
                    <button
                      onClick={() => {
                        addTickerToWatchlist(watchlist.id, stock.ticker);
                        setIsAddInstrumentOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}

              {candidateStocks.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  No unlisted stocks match your search query.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

