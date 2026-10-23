import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Category } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess?: () => void;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDeleteDialogProps) {
  const deleteCategory = useFinanceStore((state) => state.deleteCategory);
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);

  const usageCount = category
    ? transactions.filter((tx) => tx.category === category.name).length
    : 0;

  // Filter compatible categories of the same type excluding this one
  const compatibleCategories = category
    ? categories.filter((c) => c.id !== category.id && c.type === category.type)
    : [];

  const [reassignCategoryName, setReassignCategoryName] = useState<string>(
    compatibleCategories[0]?.name || 'Other'
  );

  React.useEffect(() => {
    if (compatibleCategories.length > 0) {
      setReassignCategoryName(compatibleCategories[0].name);
    }
  }, [category]);

  if (!category) return null;

  const handleConfirm = () => {
    deleteCategory(category.id, reassignCategoryName);
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Delete Category: {category.name}
              </DialogTitle>
              <DialogDescription className="text-xs pt-0.5 text-slate-500">
                Prevent orphaned transactions in your financial ledger.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          {usageCount > 0 ? (
            <>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200">
                <strong>{usageCount} transaction{usageCount > 1 ? 's' : ''}</strong> currently use this category. To protect ledger integrity, choose a replacement category to reassign them to.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Reassign existing transactions to:
                </label>
                <select
                  value={reassignCategoryName}
                  onChange={(e) => setReassignCategoryName(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {compatibleCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              No transactions currently reference this category. It will be removed immediately.
            </p>
          )}
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
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleConfirm}
          >
            Confirm & Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

