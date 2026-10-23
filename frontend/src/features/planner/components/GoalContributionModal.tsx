import React, { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SavingsGoal } from '@/types/finance';
import { formatINR } from '@/domain/money/formatters';
import { X, AlertCircle, PlusCircle } from 'lucide-react';

interface GoalContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const GoalContributionModal: React.FC<GoalContributionModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { accounts, recordGoalContribution } = useFinanceStore();

  const [amountRupees, setAmountRupees] = useState('5000');
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const remainingMinor = Math.max(0, goal.targetAmountMinor - goal.currentAmountMinor);
  const amountMinor = Math.round((parseFloat(amountRupees) || 0) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountMinor <= 0) {
      setError('Contribution amount must be greater than zero.');
      return;
    }

    const res = recordGoalContribution(goal.id, amountMinor, sourceAccountId, note);
    if (!res.success) {
      setError(res.error || 'Could not record contribution.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Goal Contribution
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Allocate funds toward <span className="font-semibold text-slate-800 dark:text-slate-200">{goal.title}</span>. Remaining target: {formatINR(remainingMinor)}.
        </p>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contribution Amount (₹)
            </label>
            <input
              type="number"
              min="100"
              step="any"
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Source Account (Mental Allocation)
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.institution})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. October monthly savings allocation"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold block mb-0.5 text-slate-700 dark:text-slate-300">
              Fintech Accounting Rule:
            </span>
            A savings goal contribution marks funds as assigned to your milestone plan. It preserves total liquid cash and does not duplicate or alter external bank ledgers.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors"
            >
              Confirm Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

