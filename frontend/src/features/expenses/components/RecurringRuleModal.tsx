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
import { RecurringRule, FinancialAccount, Category, RecurringFrequency, TransactionType } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Repeat, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RecurringRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleToEdit?: RecurringRule | null;
  accounts: FinancialAccount[];
  categories: Category[];
  onSuccess?: () => void;
}

export function RecurringRuleModal({
  open,
  onOpenChange,
  ruleToEdit,
  accounts,
  categories,
  onSuccess,
}: RecurringRuleModalProps) {
  const addRecurringRule = useFinanceStore((state) => state.addRecurringRule);
  const updateRecurringRule = useFinanceStore((state) => state.updateRecurringRule);

  const [name, setName] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Housing & Rent');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [nextExpectedDate, setNextExpectedDate] = useState('2026-11-01');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (ruleToEdit) {
        setName(ruleToEdit.name);
        setAmountRupees((ruleToEdit.amountMinor / 100).toString());
        setType(ruleToEdit.type);
        setCategory(ruleToEdit.category);
        setAccountId(ruleToEdit.accountId);
        setFrequency(ruleToEdit.frequency);
        setStartDate(ruleToEdit.startDate);
        setNextExpectedDate(ruleToEdit.nextExpectedDate);
        setNotes(ruleToEdit.notes || '');
      } else {
        setName('');
        setAmountRupees('');
        setType('expense');
        setCategory('Housing & Rent');
        setAccountId(accounts[0]?.id || '');
        setFrequency('monthly');
        setStartDate('2026-10-15');
        setNextExpectedDate('2026-11-01');
        setNotes('');
      }
      setError(null);
    }
  }, [open, ruleToEdit, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amountRupees);
    if (isNaN(num) || num <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!name.trim()) {
      setError('Rule name or payee is required.');
      return;
    }

    const amountMinor = Math.round(num * 100);

    if (ruleToEdit) {
      updateRecurringRule({
        ...ruleToEdit,
        name: name.trim(),
        amountMinor,
        type,
        category,
        accountId,
        frequency,
        startDate,
        nextExpectedDate,
        notes: notes.trim() || undefined,
      });
    } else {
      addRecurringRule({
        name: name.trim(),
        amountMinor,
        type,
        category,
        accountId,
        frequency,
        startDate,
        nextExpectedDate,
        status: 'active',
        notes: notes.trim() || undefined,
      });
    }

    onSuccess?.();
    onOpenChange(false);
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <Repeat className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              {ruleToEdit ? 'Edit Recurring Schedule' : 'New Recurring Commitment'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs pt-1">
            Configure periodic subscriptions, bills, or regular income schedules.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
          )}

          {/* Type Toggle */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Commitment Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('Housing & Rent');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-white dark:bg-[#111C30] text-rose-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Recurring Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('Salary');
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-white dark:bg-[#111C30] text-emerald-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
                Recurring Income
              </button>
            </div>
          </div>

          {/* Rule Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Commitment Title / Payee
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apartment Rent, Cult.fit Gym, Netflix"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="1500"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                className="pl-8 font-bold"
                required
              />
            </div>
          </div>

          {/* Frequency & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Designated Account
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.institution})
                </option>
              ))}
            </select>
          </div>

          {/* Next Expected Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Next Expected Occurrence Date
            </label>
            <Input
              type="date"
              value={nextExpectedDate}
              onChange={(e) => setNextExpectedDate(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Auto-debit active on 1st of month"
            />
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
              {ruleToEdit ? 'Update Schedule' : 'Create Recurring Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

