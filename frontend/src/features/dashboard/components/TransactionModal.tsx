import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FinancialAccount, Category, TransactionType, Transaction } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import { AccountModal } from '@/features/banking/components/AccountModal';
import {
  PlusCircle,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: FinancialAccount[];
  categories: Category[];
  defaultDate?: string;
  initialType?: TransactionType;
  transactionToEdit?: Transaction | null;
  onSuccess?: (tx: Transaction) => void;
}

const transactionSchema = z.object({
  type: z.enum(['expense', 'income', 'transfer']),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be greater than 0'
  ),
  accountId: z.string().min(1, 'Account is required'),
  targetAccountId: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  merchant: z.string().min(2, 'Description or merchant is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'transfer') {
      return !!data.targetAccountId && data.targetAccountId !== data.accountId;
    }
    return true;
  },
  {
    message: 'Destination account must be selected and different from source account',
    path: ['targetAccountId'],
  }
);

type TransactionFormData = z.infer<typeof transactionSchema>;

export function TransactionModal({
  open,
  onOpenChange,
  accounts,
  categories,
  defaultDate = '2026-10-15',
  initialType = 'expense',
  transactionToEdit = null,
  onSuccess,
}: TransactionModalProps) {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const getAccountBalance = useFinanceStore((state) => state.getAccountBalance);
  const storeAccounts = useFinanceStore((state) => state.accounts);

  // Fallback to store accounts if passed accounts prop is empty
  const activeAccounts = accounts && accounts.length > 0 ? accounts : storeAccounts;

  const [activeType, setActiveType] = useState<TransactionType>(
    transactionToEdit ? transactionToEdit.type : initialType
  );
  const [successToast, setSuccessToast] = useState(false);
  const [balanceWarning, setBalanceWarning] = useState<string | null>(null);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accountSelectTarget, setAccountSelectTarget] = useState<'source' | 'target'>('source');

  const defaultAccount = activeAccounts[0]?.id || '';
  const defaultTargetAccount = activeAccounts[1]?.id || '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transactionToEdit ? transactionToEdit.type : initialType,
      amount: transactionToEdit ? (transactionToEdit.amountMinor / 100).toString() : '',
      accountId: transactionToEdit ? transactionToEdit.accountId : defaultAccount,
      targetAccountId: transactionToEdit?.targetAccountId || defaultTargetAccount,
      category: transactionToEdit ? transactionToEdit.category : 'Food & Dining',
      merchant: transactionToEdit ? transactionToEdit.merchant : '',
      date: transactionToEdit ? transactionToEdit.date : defaultDate,
      notes: transactionToEdit?.notes || '',
    },
  });

  // Keep accountId updated if accounts were empty on initial mount and then added
  const currentAccountId = watch('accountId');
  React.useEffect(() => {
    if (!currentAccountId && activeAccounts.length > 0) {
      setValue('accountId', activeAccounts[0].id, { shouldValidate: true });
    }
  }, [activeAccounts, currentAccountId, setValue]);

  // Sync form when transactionToEdit or open state changes
  React.useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        setActiveType(transactionToEdit.type);
        reset({
          type: transactionToEdit.type,
          amount: (transactionToEdit.amountMinor / 100).toString(),
          accountId: transactionToEdit.accountId,
          targetAccountId: transactionToEdit.targetAccountId || defaultTargetAccount,
          category: transactionToEdit.category,
          merchant: transactionToEdit.merchant,
          date: transactionToEdit.date,
          notes: transactionToEdit.notes || '',
        });
      } else {
        setActiveType(initialType);
        reset({
          type: initialType,
          amount: '',
          accountId: activeAccounts[0]?.id || '',
          targetAccountId: activeAccounts[1]?.id || '',
          category: initialType === 'income' ? 'Salary' : initialType === 'transfer' ? 'Transfer' : 'Food & Dining',
          merchant: '',
          date: defaultDate,
          notes: '',
        });
      }
    }
  }, [open, transactionToEdit, initialType, activeAccounts, defaultTargetAccount, defaultDate, reset]);

  const selectedAccountId = watch('accountId');
  const enteredAmount = watch('amount');

  // Handle transaction type toggle
  const handleTypeChange = (type: TransactionType) => {
    setActiveType(type);
    setValue('type', type);

    if (type === 'income') {
      setValue('category', 'Salary');
    } else if (type === 'transfer') {
      setValue('category', 'Transfer');
    } else {
      setValue('category', 'Food & Dining');
    }
  };

  // Check balance warning on change
  React.useEffect(() => {
    if ((activeType === 'expense' || activeType === 'transfer') && selectedAccountId && enteredAmount) {
      const num = Number(enteredAmount);
      if (!isNaN(num) && num > 0) {
        const amountMinor = Math.round(num * 100);
        const currentBalance = getAccountBalance(selectedAccountId);
        if (amountMinor > currentBalance) {
          const formattedBal = (currentBalance / 100).toLocaleString('en-IN');
          setBalanceWarning(`Account balance (₹${formattedBal}) is lower than transaction amount.`);
          return;
        }
      }
    }
    setBalanceWarning(null);
  }, [selectedAccountId, enteredAmount, activeType, getAccountBalance]);

  const onSubmit = (data: TransactionFormData) => {
    const amountMinor = Math.round(Number(data.amount) * 100);

    let resultingTx: Transaction;

    if (transactionToEdit) {
      resultingTx = {
        ...transactionToEdit,
        accountId: data.accountId,
        targetAccountId: data.type === 'transfer' ? data.targetAccountId : undefined,
        amountMinor,
        type: data.type,
        category: data.category,
        merchant: data.merchant.trim(),
        date: data.date,
        notes: data.notes?.trim() || undefined,
      };
      updateTransaction(resultingTx);
    } else {
      resultingTx = addTransaction({
        accountId: data.accountId,
        targetAccountId: data.type === 'transfer' ? data.targetAccountId : undefined,
        amountMinor,
        type: data.type,
        category: data.category,
        merchant: data.merchant.trim(),
        date: data.date,
        status: 'completed',
        notes: data.notes?.trim() || undefined,
      });
    }

    onSuccess?.(resultingTx);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      reset();
      onOpenChange(false);
    }, 500);
  };

  // Filter categories by type
  const availableCategories = categories.filter((c) => {
    if (activeType === 'income') return c.type === 'income';
    if (activeType === 'transfer') return c.name === 'Transfer';
    return c.type === 'expense' && c.name !== 'Transfer';
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                <PlusCircle className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold">
                {transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
              </DialogTitle>
            </div>
            <Badge variant="outline">Canonical Ledger</Badge>
          </div>
          <DialogDescription className="text-xs pt-1">
            {transactionToEdit
              ? 'Update transaction details in the canonical ledger.'
              : 'Updates your account balances, category budgets, and financial KPIs immediately.'}
          </DialogDescription>
        </DialogHeader>

        {successToast && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-in fade-in-50">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Transaction recorded and ledger synchronized!</span>
          </div>
        )}

        {balanceWarning && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{balanceWarning}</span>
          </div>
        )}

        {activeAccounts.length === 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start justify-between gap-3 text-xs animate-in fade-in-50">
            <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
              <Building2 className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold block">No Bank Accounts Linked</span>
                <span className="text-[11px] text-amber-700 dark:text-amber-300">
                  You need at least one bank account or cash wallet to record transactions and track balances.
                </span>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setAccountSelectTarget('source');
                setIsAddAccountOpen(true);
              }}
              className="shrink-0 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-8 px-2.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Bank
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Type Segmented Buttons */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeType === 'expense'
                  ? 'bg-white dark:bg-[#111C30] text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeType === 'income'
                  ? 'bg-white dark:bg-[#111C30] text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeType === 'transfer'
                  ? 'bg-white dark:bg-[#111C30] text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] pl-8 pr-3.5 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.amount ? 'border-red-500' : ''
                }`}
                {...register('amount')}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          {/* Account Selection */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="transaction-source-account"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                {activeType === 'transfer' ? 'Source Account (From)' : 'Bank / Account'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setAccountSelectTarget('source');
                  setIsAddAccountOpen(true);
                }}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>+ Add Bank Account</span>
              </button>
            </div>
            <select
              id="transaction-source-account"
              className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              {...register('accountId')}
              onChange={(e) => {
                if (e.target.value === '__NEW_ACCOUNT__') {
                  setAccountSelectTarget('source');
                  setIsAddAccountOpen(true);
                  // Don't commit __NEW_ACCOUNT__ as the accountId
                  return;
                }
                register('accountId').onChange(e);
              }}
            >
              {activeAccounts.length === 0 ? (
                <option value="" disabled>-- No Bank Accounts (Click "+ Add Bank Account" above) --</option>
              ) : (
                <>
                  <option value="" disabled>-- Select Bank Account --</option>
                  {activeAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.institution}) — ₹{(getAccountBalance(acc.id) / 100).toLocaleString('en-IN')}
                    </option>
                  ))}
                  <option value="__NEW_ACCOUNT__" className="font-bold text-emerald-600">
                    + Add New Bank Account...
                  </option>
                </>
              )}
            </select>
            {errors.accountId && <p className="text-xs text-red-500">{errors.accountId.message}</p>}
          </div>

          {/* Target Account (Only for transfers) */}
          {activeType === 'transfer' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="transaction-target-account"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Destination Account (To)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAccountSelectTarget('target');
                    setIsAddAccountOpen(true);
                  }}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>+ Add Bank Account</span>
                </button>
              </div>
              <select
                id="transaction-target-account"
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register('targetAccountId')}
                onChange={(e) => {
                  if (e.target.value === '__NEW_ACCOUNT__') {
                    setAccountSelectTarget('target');
                    setIsAddAccountOpen(true);
                    return;
                  }
                  register('targetAccountId').onChange(e);
                }}
              >
                {activeAccounts.length < 2 && (
                  <option value="" disabled>-- Requires at least 2 accounts for transfer --</option>
                )}
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.institution})
                  </option>
                ))}
                <option value="__NEW_ACCOUNT__" className="font-bold text-emerald-600">
                  + Add New Bank Account...
                </option>
              </select>
              {errors.targetAccountId && (
                <p className="text-xs text-red-500">{errors.targetAccountId.message}</p>
              )}
            </div>
          )}

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register('category')}
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>

            <Input
              label="Date"
              type="date"
              error={errors.date?.message}
              {...register('date')}
            />
          </div>

          {/* Merchant / Description */}
          <Input
            label={activeType === 'income' ? 'Source / Payer' : 'Merchant / Payee / Description'}
            placeholder={
              activeType === 'income'
                ? 'e.g. Acme Corp Salary'
                : activeType === 'transfer'
                ? 'e.g. Transfer to Savings Fund'
                : 'e.g. Nature Basket Groceries'
            }
            error={errors.merchant?.message}
            {...register('merchant')}
          />

          {/* Notes (Optional) */}
          <Input
            label="Notes (Optional)"
            placeholder="e.g. Monthly groceries or reference receipt"
            error={errors.notes?.message}
            {...register('notes')}
          />

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {transactionToEdit ? 'Update Transaction' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <AccountModal
      open={isAddAccountOpen}
      onOpenChange={setIsAddAccountOpen}
      onSuccess={(newAccount) => {
        setIsAddAccountOpen(false);
        if (newAccount?.id) {
          if (accountSelectTarget === 'target') {
            setValue('targetAccountId', newAccount.id, { shouldValidate: true });
          } else {
            setValue('accountId', newAccount.id, { shouldValidate: true });
          }
        }
      }}
    />
    </>
  );
}
