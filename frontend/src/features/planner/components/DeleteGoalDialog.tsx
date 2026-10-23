import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SavingsGoal } from '@/types/finance';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const DeleteGoalDialog: React.FC<DeleteGoalDialogProps> = ({ isOpen, onClose, goal }) => {
  const { deleteGoal } = useFinanceStore();

  if (!isOpen || !goal) return null;

  const handleConfirm = () => {
    deleteGoal(goal.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Savings Goal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          Are you sure you want to delete the goal <span className="font-semibold text-slate-900 dark:text-white">"{goal.title}"</span>? All progress tracking and contribution history for this goal will be removed.
        </p>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm transition-colors"
          >
            Delete Goal
          </button>
        </div>
      </div>
    </div>
  );
};

