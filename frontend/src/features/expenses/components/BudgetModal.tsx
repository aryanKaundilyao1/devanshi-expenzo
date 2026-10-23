import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Budget, Category } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import { PieChart, Sliders } from 'lucide-react';

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetToEdit?: Budget | null;
  categories: Category[];
  onSuccess?: () => void;
}

export function BudgetModal({
  open,
  onOpenChange,
  budgetToEdit,
  categories,
  onSuccess,
}: BudgetModalProps) {
  const upsertBudget = useFinanceStore((state) => state.upsertBudget);
  const existingBudgets = useFinanceStore((state) => state.budgets);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const [category, setCategory] = useState(expenseCategories[0]?.name || 'Food & Dining');
  const [amountRupees, setAmountRupees] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'custom'>('monthly');
  const [thresholdPercent, setThresholdPercent] = useState<number>(80);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (budgetToEdit) {
        setCategory(budgetToEdit.category);
        setAmountRupees((budgetToEdit.allocatedMinor / 100).toString());
        setPeriod(budgetToEdit.period);
        setThresholdPercent(budgetToEdit.alertThresholdPercent);
      } else {
        setCategory(expenseCategories[0]?.name || 'Food & Dining');
        setAmountRupees('');
        setPeriod('monthly');
        setThresholdPercent(80);
      }
      setError(null);
    }
  }, [open, budgetToEdit, expenseCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amountRupees);
    if (isNaN(num) || num <= 0) {
      setError('Budget amount must be greater than zero.');
      return;
    }

    // Check duplicate active budget for same category and period
    const isDuplicate = existingBudgets.some(
      (b) =>
        b.category === category &&
        b.period === period &&
        b.id !== budgetToEdit?.id
    );

    if (isDuplicate) {
      setError(`An active ${period} budget for "${category}" already exists.`);
      return;
    }

    const allocatedMinor = Math.round(num * 100);
    const id = budgetToEdit?.id || `bgt_${Date.now()}`;

    upsertBudget({
      id,
      category,
      allocatedMinor,
      period,
      alertThresholdPercent: thresholdPercent,
    });

    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <PieChart className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              {budgetToEdit ? 'Edit Budget' : 'Create Category Budget'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs pt-1">
            Establish spending caps with proactive notification warnings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
          )}

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Allocated Limit (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="5000"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                className="pl-8 font-bold"
                required
              />
            </div>
          </div>

          {/* Period Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Budget Period
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {(['monthly', 'weekly', 'custom'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    period === p
                      ? 'bg-white dark:bg-[#111C30] text-emerald-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Threshold Slider */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                Alert Warning Threshold
              </span>
              <span className="tabular-nums font-bold text-emerald-600">{thresholdPercent}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={thresholdPercent}
              onChange={(e) => setThresholdPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Triggers a proactive warning badge when category expenditure reaches {thresholdPercent}% of the limit.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {budgetToEdit ? 'Update Budget' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

