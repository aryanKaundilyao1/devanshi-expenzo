import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BankingBill } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatRupees } from '@/domain/money/formatters';

interface PayBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: BankingBill | null;
  onSuccess?: () => void;
}

export function PayBillDialog({
  open,
  onOpenChange,
  bill,
  onSuccess,
}: PayBillDialogProps) {
  const { accounts, getAccountBalance, payBill } = useFinanceStore();
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!bill) return null;

  const currentAccountId = selectedAccountId || bill.accountId;
  const currentAccount = accounts.find((a) => a.id === currentAccountId);
  const accountBalance = currentAccount ? getAccountBalance(currentAccount.id) : 0;
  const hasSufficientFunds = currentAccount?.accountType === 'credit' || accountBalance >= bill.amountMinor;

  const handleConfirmPayment = () => {
    setError(null);
    const res = payBill(bill.id, currentAccountId);
    if (!res.success) {
      setError(res.error || 'Payment execution failed.');
      return;
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
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Confirm Demo Bill Payment
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

          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Bill Title:</span>
                <strong className="text-slate-900 dark:text-white">{bill.title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Biller:</span>
                <span className="text-slate-700 dark:text-slate-300">{bill.billerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-slate-700 dark:text-slate-300">{bill.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Due Date:</span>
                <span className="text-slate-700 dark:text-slate-300">{bill.dueDate}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
                <span className="text-slate-900 dark:text-white">Amount Due:</span>
                <span className="text-rose-600 dark:text-rose-400">{formatRupees(bill.amountMinor)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Debit From Account
              </label>
              <select
                value={currentAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.filter((a) => !a.isArchived).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.institution}) — Bal: {formatRupees(getAccountBalance(a.id))}
                  </option>
                ))}
              </select>
            </div>

            {/* Balance Preview */}
            {currentAccount && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Current Available:</span>
                  <span>{formatRupees(accountBalance)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Deduction:</span>
                  <span className="text-rose-600">-{formatRupees(bill.amountMinor)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <span>Balance After Payment:</span>
                  <span>{formatRupees(accountBalance - bill.amountMinor)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {!hasSufficientFunds && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Insufficient funds in selected account to complete this bill payment. Please choose another account or transfer funds.
                </span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Simulated Payment:</strong> Records a single canonical expense transaction in your local ledger. No real banking APIs are called.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={!hasSufficientFunds}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm Demo Payment
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

