import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, ArrowRightLeft, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FinancialAccount } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatRupees } from '@/domain/money/formatters';

interface ArchiveAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: FinancialAccount | null;
  onSuccess?: () => void;
}

export function ArchiveAccountDialog({
  open,
  onOpenChange,
  account,
  onSuccess,
}: ArchiveAccountDialogProps) {
  const navigate = useNavigate();
  const { getAccountBalance, archiveAccount } = useFinanceStore();

  if (!account) return null;

  const currentBalance = getAccountBalance(account.id);
  const hasZeroBalance = currentBalance === 0;

  const handleArchive = () => {
    const res = archiveAccount(account.id);
    if (res.success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleGoToTransfer = () => {
    onOpenChange(false);
    navigate(`/app/banking/transfer?source=${account.id}`);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-[#111C30] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Close / Archive Account
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
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Target Account:</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {account.name} ({account.institution})
              </div>
              <div className="text-xs text-slate-500">
                Identifier: {account.accountNumberMasked}
              </div>
              <div className="text-xs font-semibold pt-1 text-slate-700 dark:text-slate-300">
                Derived Balance: <strong className={currentBalance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600'}>{formatRupees(currentBalance)}</strong>
              </div>
            </div>

            {!hasZeroBalance ? (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong>Zero-Balance Closure Policy:</strong>
                    <p>
                      Accounts cannot be archived while holding a non-zero balance ({formatRupees(currentBalance)}). All funds must be transferred to another eligible demo account or reconciled before closure.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                This account holds a ₹0.00 balance and can be safely archived. Existing transactions in the canonical ledger will be preserved for historical reporting.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {!hasZeroBalance ? (
              <Button onClick={handleGoToTransfer} className="bg-amber-600 hover:bg-amber-700 text-white">
                <ArrowRightLeft className="h-4 w-4 mr-1.5" />
                Transfer Balance First
              </Button>
            ) : (
              <Button onClick={handleArchive} className="bg-rose-600 hover:bg-rose-700 text-white">
                Confirm Archival
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

