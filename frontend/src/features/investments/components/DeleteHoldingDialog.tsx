import React from 'react';
import { InvestmentHolding } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteHoldingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  holding: InvestmentHolding | null;
}

export const DeleteHoldingDialog: React.FC<DeleteHoldingDialogProps> = ({
  isOpen,
  onClose,
  holding,
}) => {
  const { deleteHolding } = useFinanceStore();

  if (!isOpen || !holding) return null;

  const handleConfirm = () => {
    deleteHolding(holding.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Remove Tracked Position
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Are you sure you want to remove <span className="font-semibold text-slate-900 dark:text-white">{holding.quantity} units</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{holding.ticker}</span> ({holding.companyName}) from your tracked portfolio?
          </p>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <span className="font-semibold block mb-0.5">Fintech Ledger Policy:</span>
            Removing this tracked holding only updates your portfolio analytics. It does <span className="font-bold underline">not</span> execute a security sale or credit funds to any connected bank account.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            Remove Position
          </button>
        </div>
      </div>
    </div>
  );
};

