import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { InvestmentHolding } from '@/types/finance';
import { calculateHoldingsDetailed, calculatePortfolioMetrics } from '@/features/investments/utils/investmentCalculations';
import { formatINR } from '@/domain/money/formatters';
import { HoldingModal } from '@/features/investments/components/HoldingModal';
import { DeleteHoldingDialog } from '@/features/investments/components/DeleteHoldingDialog';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpDown,
  Compass,
} from 'lucide-react';

export const HoldingsPage: React.FC = () => {
  const { holdings, quotes } = useFinanceStore();

  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'value' | 'gain' | 'ticker'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [holdingToEdit, setHoldingToEdit] = useState<InvestmentHolding | null>(null);
  const [holdingToDelete, setHoldingToDelete] = useState<InvestmentHolding | null>(null);

  const metrics = calculatePortfolioMetrics(holdings, quotes);
  const detailedHoldings = useMemo(() => {
    return calculateHoldingsDetailed(holdings, quotes);
  }, [holdings, quotes]);

  const filteredHoldings = useMemo(() => {
    return detailedHoldings
      .filter((h) => {
        const matchesSearch =
          h.ticker.toLowerCase().includes(search.toLowerCase()) ||
          h.companyName.toLowerCase().includes(search.toLowerCase());
        const matchesAsset = assetFilter === 'all' || h.assetClass === assetFilter;
        return matchesSearch && matchesAsset;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'value') diff = a.currentValueMinor - b.currentValueMinor;
        else if (sortField === 'gain') diff = a.unrealizedGainMinor - b.unrealizedGainMinor;
        else if (sortField === 'ticker') diff = a.ticker.localeCompare(b.ticker);
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [detailedHoldings, search, assetFilter, sortField, sortOrder]);

  const toggleSort = (field: 'value' | 'gain' | 'ticker') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Portfolio Holdings Ledger
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {holdings.length} tracked {holdings.length === 1 ? 'position' : 'positions'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage equity positions, acquisition prices, and unrealized returns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/investments"
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Portfolio Dashboard
          </Link>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Position
          </button>
        </div>
      </div>

      {/* Summary Stat Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            Total Valuation
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
            {formatINR(metrics.totalValueMinor)}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            Total Invested
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
            {formatINR(metrics.totalInvestedMinor)}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            Unrealized Gain / Loss
          </span>
          <span className={`text-lg font-bold mt-0.5 block ${
            metrics.unrealizedGainLossMinor >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {metrics.unrealizedGainLossMinor >= 0 ? '+' : ''}
            {formatINR(metrics.unrealizedGainLossMinor)}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            Total Return %
          </span>
          <span className={`text-lg font-bold mt-0.5 flex items-center gap-1 ${
            metrics.unrealizedReturnPercent >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {metrics.unrealizedReturnPercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {metrics.unrealizedReturnPercent >= 0 ? '+' : ''}
            {metrics.unrealizedReturnPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company or ticker (e.g. TCS, Infosys)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Asset Classes</option>
            <option value="equity">Equity (Stocks)</option>
            <option value="mutual_fund">Mutual Funds</option>
            <option value="etf">Index ETFs</option>
            <option value="gold">Digital Gold</option>
            <option value="bond">Bonds</option>
          </select>
        </div>
      </div>

      {/* Holdings Table */}
      {filteredHoldings.length > 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => toggleSort('ticker')}>
                    <div className="flex items-center gap-1">
                      <span>Instrument</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Asset Class</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                  <th className="py-3.5 px-4 text-right">Avg Buy Price</th>
                  <th className="py-3.5 px-4 text-right">Invested Value</th>
                  <th className="py-3.5 px-4 text-right">Current Price</th>
                  <th className="py-3.5 px-4 text-right cursor-pointer" onClick={() => toggleSort('value')}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Current Value</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right cursor-pointer" onClick={() => toggleSort('gain')}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Unrealized P&L</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Weight</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHoldings.map((h) => {
                  const isGain = h.unrealizedGainMinor >= 0;
                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/app/investments/stocks/${h.ticker}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5"
                        >
                          {h.ticker}
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-normal">
                            {h.exchange}
                          </span>
                        </Link>
                        <span className="text-[11px] text-slate-400 truncate max-w-[150px] block">
                          {h.companyName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 capitalize text-slate-600 dark:text-slate-300">
                        {h.assetClass.replace('_', ' ')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                        {h.quantity}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {formatINR(h.averageBuyPriceMinor)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300 font-medium">
                        {formatINR(h.investedValueMinor)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                        {formatINR(h.currentPriceMinor)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatINR(h.currentValueMinor)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold">
                        <span className={isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isGain ? '+' : ''}{formatINR(h.unrealizedGainMinor)}
                        </span>
                        <span className={`block text-[10px] ${isGain ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isGain ? '+' : ''}{h.returnPercent.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-500 dark:text-slate-400">
                        {h.portfolioWeightPercent.toFixed(1)}%
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setHoldingToEdit(h)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Holding"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setHoldingToDelete(h)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Remove Holding"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {holdings.length === 0 ? 'No Investment Positions Tracked' : 'No Matching Holdings'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {holdings.length === 0
              ? 'Start tracking your stock and mutual fund investments by adding your first position.'
              : 'Try clearing your search keyword or selecting a different asset class filter.'}
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tracked Position
            </button>
            <Link
              to="/app/investments/discover"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              Discover Stocks
            </Link>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <HoldingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      <HoldingModal
        isOpen={Boolean(holdingToEdit)}
        onClose={() => setHoldingToEdit(null)}
        holdingToEdit={holdingToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteHoldingDialog
        isOpen={Boolean(holdingToDelete)}
        onClose={() => setHoldingToDelete(null)}
        holding={holdingToDelete}
      />
    </div>
  );
};

