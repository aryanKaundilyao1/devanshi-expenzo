import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Receipt, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BankingBill, RecurringFrequency, BillReminderPreference } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';

interface BillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billToEdit?: BankingBill | null;
  onSuccess?: () => void;
}

const BILL_CATEGORIES = [
  'Electricity',
  'Internet',
  'Rent',
  'Subscriptions',
  'Insurance',
  'Education',
  'Mobile Recharge',
  'Water & Gas',
  'Other',
];

export function BillModal({
  open,
  onOpenChange,
  billToEdit,
  onSuccess,
}: BillModalProps) {
  const { accounts, addBill, updateBill, demoAsOf } = useFinanceStore();
  const eligibleAccounts = accounts.filter((a) => !a.isArchived);

  const [title, setTitle] = useState('');
  const [billerName, setBillerName] = useState('');
  const [category, setCategory] = useState('Electricity');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency | ''>('monthly');
  const [reminderPreference, setReminderPreference] = useState<BillReminderPreference>('3_days_before');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (billToEdit) {
      setTitle(billToEdit.title);
      setBillerName(billToEdit.billerName);
      setCategory(billToEdit.category);
      setAmount((billToEdit.amountMinor / 100).toString());
      setDueDate(billToEdit.dueDate);
      setAccountId(billToEdit.accountId);
      setFrequency(billToEdit.frequency || '');
      setReminderPreference(billToEdit.reminderPreference || '3_days_before');
      setNotes(billToEdit.notes || '');
    } else {
      setTitle('');
      setBillerName('');
      setCategory('Electricity');
      setAmount('');
      setDueDate(demoAsOf || '2026-10-25');
      setAccountId(eligibleAccounts[0]?.id || '');
      setFrequency('monthly');
      setReminderPreference('3_days_before');
      setNotes('');
    }
    setError(null);
  }, [billToEdit, open, eligibleAccounts, demoAsOf]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a bill title.');
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid bill amount greater than zero.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }
    if (!accountId) {
      setError('Please select an account.');
      return;
    }

    const amountMinor = Math.round(amountNum * 100);

    if (billToEdit) {
      updateBill({
        ...billToEdit,
        title: title.trim(),
        billerName: billerName.trim() || title.trim(),
        category,
        amountMinor,
        dueDate,
        accountId,
        frequency: frequency ? (frequency as RecurringFrequency) : undefined,
        reminderPreference,
        notes: notes.trim() || undefined,
      });
    } else {
      addBill({
        title: title.trim(),
        billerName: billerName.trim() || title.trim(),
        category,
        amountMinor,
        dueDate,
        accountId,
        frequency: frequency ? (frequency as RecurringFrequency) : undefined,
        reminderPreference,
        status: 'upcoming',
        notes: notes.trim() || undefined,
      });
    }

    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-[#111C30] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              {billToEdit ? 'Edit Scheduled Bill' : 'Schedule Demo Bill'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Accounting Contract:</strong> Scheduled bills do not deduct from account balances until you record payment.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bill Description *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. BESCOM Electricity Bill"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biller / Provider
                </label>
                <Input
                  value={billerName}
                  onChange={(e) => setBillerName(e.target.value)}
                  placeholder="e.g. BESCOM Karnataka"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {BILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount (₹) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date *
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pay From Account *
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {eligibleAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.institution})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RecurringFrequency | '')}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">One-off Bill</option>
                  <option value="monthly">Monthly Recurring</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Annual</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {billToEdit ? 'Save Changes' : 'Schedule Bill'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

