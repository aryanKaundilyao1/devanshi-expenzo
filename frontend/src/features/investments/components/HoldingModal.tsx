import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { InvestmentHolding } from '@/types/finance';
import { STOCK_CATALOG } from '@/features/investments/data/stockCatalog';
import { formatINR } from '@/domain/money/formatters';
import { X, Search, AlertCircle } from 'lucide-react';

interface HoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdingToEdit?: InvestmentHolding | null;
}

export const HoldingModal: React.FC<HoldingModalProps> = ({
  isOpen,
  onClose,
  holdingToEdit,
}) => {
  const { quotes, addHolding, updateHolding } = useFinanceStore();

  const [ticker, setTicker] = useState('TCS');
  const [assetClass, setAssetClass] = useState<InvestmentHolding['assetClass']>('equity');
  const [quantity, setQuantity] = useState<number>(1);
  const [buyPriceRupees, setBuyPriceRupees] = useState<string>('3200');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Available stocks from store quotes or catalog
  const availableQuotes = Object.values({ ...STOCK_CATALOG, ...quotes });

  useEffect(() => {
    if (holdingToEdit) {
      setTicker(holdingToEdit.ticker);
      setAssetClass(holdingToEdit.assetClass);
      setQuantity(holdingToEdit.quantity);
      setBuyPriceRupees((holdingToEdit.averageBuyPriceMinor / 100).toString());
      setPurchaseDate(holdingToEdit.purchaseDate || new Date().toISOString().split('T')[0]);
      setNotes(holdingToEdit.notes || '');
    } else {
      setTicker('TCS');
      setAssetClass('equity');
      setQuantity(10);
      setBuyPriceRupees('3200');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError(null);
  }, [holdingToEdit, isOpen]);

  if (!isOpen) return null;

  const selectedQuote = quotes[ticker] || STOCK_CATALOG[ticker];
  const parsedPrice = parseFloat(buyPriceRupees) || 0;
  const buyPriceMinor = Math.round(parsedPrice * 100);
  const totalInvestedMinor = Math.round(quantity * buyPriceMinor);
  const currentPriceMinor = selectedQuote ? selectedQuote.currentPriceMinor : buyPriceMinor;
  const totalCurrentValueMinor = Math.round(quantity * currentPriceMinor);
  const projectedGainMinor = totalCurrentValueMinor - totalInvestedMinor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) {
      setError('Please select a stock symbol.');
      return;
    }
    if (quantity <= 0 || isNaN(quantity)) {
      setError('Quantity must be greater than zero.');
      return;
    }
    if (parsedPrice <= 0 || isNaN(parsedPrice)) {
      setError('Average purchase price must be greater than zero.');
      return;
    }

    const companyName = selectedQuote ? selectedQuote.companyName : ticker;

    if (holdingToEdit) {
      updateHolding({
        ...holdingToEdit,
        ticker,
        companyName,
        assetClass,
        quantity,
        averageBuyPriceMinor: buyPriceMinor,
        purchaseDate,
        notes,
      });
    } else {
      addHolding({
        ticker,
        companyName,
        assetClass,
        quantity,
        averageBuyPriceMinor: buyPriceMinor,
        purchaseDate,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {holdingToEdit ? 'Edit Tracked Holding' : 'Add Tracked Holding'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track equities and funds with live portfolio calculations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Instrument
            </label>
            <select
              value={ticker}
              onChange={(e) => {
                const newTicker = e.target.value;
                setTicker(newTicker);
                const q = quotes[newTicker] || STOCK_CATALOG[newTicker];
                if (q && !holdingToEdit) {
                  setBuyPriceRupees((q.currentPriceMinor / 100).toString());
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {availableQuotes.map((q) => (
                <option key={q.ticker} value={q.ticker}>
                  {q.ticker} — {q.companyName} ({q.exchange})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Asset Class
              </label>
              <select
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="equity">Equity (Stock)</option>
                <option value="mutual_fund">Mutual Fund</option>
                <option value="etf">Index ETF</option>
                <option value="gold">Digital Gold / SGB</option>
                <option value="bond">Govt Bond</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Quantity (Units)
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Avg Buy Price (₹)
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={buyPriceRupees}
                onChange={(e) => setBuyPriceRupees(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Long-term core portfolio holding"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Valuation Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Cost Basis:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatINR(totalInvestedMinor)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Current Demo Valuation:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatINR(totalCurrentValueMinor)}
              </span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Projected P&L:</span>
              <span className={projectedGainMinor >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                {projectedGainMinor >= 0 ? '+' : ''}{formatINR(projectedGainMinor)} (
                {totalInvestedMinor > 0 ? ((projectedGainMinor / totalInvestedMinor) * 100).toFixed(2) : 0}%)
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
            >
              {holdingToEdit ? 'Save Changes' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

