import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Watchlist } from '@/types/finance';
import { WatchlistModal } from '@/features/investments/components/WatchlistModal';
import { formatINR } from '@/domain/money/formatters';
import {
  Eye,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Compass,
  AlertTriangle,
} from 'lucide-react';

export const WatchlistsPage: React.FC = () => {
  const { watchlists, quotes, deleteWatchlist } = useFinanceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [watchlistToEdit, setWatchlistToEdit] = useState<Watchlist | null>(null);
  const [watchlistToDelete, setWatchlistToDelete] = useState<Watchlist | null>(null);

  const handleDeleteConfirm = () => {
    if (watchlistToDelete) {
      deleteWatchlist(watchlistToDelete.id);
      setWatchlistToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Investment Watchlists
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {watchlists.length} {watchlists.length === 1 ? 'list' : 'lists'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curate custom lists of Indian equities to monitor price movements and opportunities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/investments/discover"
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Discover Stocks
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Watchlist
          </button>
        </div>
      </div>

      {/* Watchlist Cards Grid */}
      {watchlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlists.map((wl) => {
            return (
              <div
                key={wl.id}
                className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/app/investments/watchlists/${wl.id}`}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block"
                      >
                        {wl.name}
                      </Link>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {wl.tickers.length} {wl.tickers.length === 1 ? 'symbol' : 'symbols'} tracked
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setWatchlistToEdit(wl)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Watchlist"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setWatchlistToDelete(wl)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {wl.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {wl.description}
                    </p>
                  )}

                  {/* Tickers Snapshot */}
                  <div className="mt-4 space-y-2">
                    {wl.tickers.slice(0, 4).map((tkr) => {
                      const quote = quotes[tkr];
                      const isUp = quote ? quote.dayChangeMinor >= 0 : true;
                      return (
                        <div
                          key={tkr}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
                        >
                          <span className="font-bold text-slate-900 dark:text-white">
                            {tkr}
                          </span>
                          <div className="text-right">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {quote ? formatINR(quote.currentPriceMinor) : '—'}
                            </span>
                            {quote && (
                              <span className={`ml-2 font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isUp ? '+' : ''}{quote.dayChangePercent.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {wl.tickers.length > 4 && (
                      <div className="text-[11px] text-center text-slate-400 pt-1">
                        + {wl.tickers.length - 4} more instruments
                      </div>
                    )}

                    {wl.tickers.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        No symbols added yet. Open watchlist to add equities.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <Link
                    to={`/app/investments/watchlists/${wl.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                  >
                    View Watchlist Detail <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs">
          <Eye className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Watchlists Created
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Create custom lists to track stocks you are researching before making portfolio allocations.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create First Watchlist
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <WatchlistModal
        isOpen={isModalOpen || Boolean(watchlistToEdit)}
        onClose={() => {
          setIsModalOpen(false);
          setWatchlistToEdit(null);
        }}
        watchlistToEdit={watchlistToEdit}
      />

      {/* Delete Confirmation Dialog */}
      {watchlistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 mb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Watchlist
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">{watchlistToDelete.name}</span>?
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 mb-5">
              <span className="font-semibold block mb-0.5 text-slate-700 dark:text-slate-300">Data Preservation Notice:</span>
              Deleting a watchlist will remove its tracking configuration, but will <span className="font-bold underline">not</span> delete any of your actual portfolio holdings.
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setWatchlistToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Delete Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

