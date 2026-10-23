import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TransactionModal } from '@/features/dashboard/components/TransactionModal';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import {
  ArrowLeft,
  Calendar,
  Building,
  Tag,
  CreditCard,
  FileText,
  Hash,
  Edit2,
  Trash2,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const transactions = useFinanceStore((state) => state.transactions);
  const accounts = useFinanceStore((state) => state.accounts);
  const categories = useFinanceStore((state) => state.categories);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  const transaction = transactions.find((tx) => tx.id === id);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // If transaction does not exist, render 404 state
  if (!transaction) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Transaction Not Found
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The transaction record with identifier "{id}" does not exist in the active financial ledger or was previously deleted.
        </p>
        <div className="pt-2">
          <Button size="sm" onClick={() => navigate('/app/transactions')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Transactions Ledger
          </Button>
        </div>
      </div>
    );
  }

  const account = accounts.find((a) => a.id === transaction.accountId);
  const targetAccount = transaction.targetAccountId
    ? accounts.find((a) => a.id === transaction.targetAccountId)
    : null;
  const categoryObj = categories.find((c) => c.name === transaction.category);

  const handleDeleteConfirm = () => {
    deleteTransaction(transaction.id);
    setDeleteDialogOpen(false);
    navigate('/app/transactions');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/transactions')}
          className="text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to Ledger
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Card Header with Amount */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-slate-50/50 dark:from-slate-800/20 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  transaction.type === 'income'
                    ? 'success'
                    : transaction.type === 'transfer'
                    ? 'info'
                    : 'secondary'
                }
                className="uppercase tracking-wider text-[10px]"
              >
                {transaction.type}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                {transaction.status.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {transaction.merchant}
            </h1>
            <p className="text-xs text-slate-400">
              Recorded on {transaction.date}
            </p>
          </div>

          <div className="text-left md:text-right">
            <div
              className={`text-3xl font-extrabold tabular-nums tracking-tight ${
                transaction.type === 'income'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : transaction.type === 'transfer'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '−' : ''}
              <CurrencyDisplay amountMinor={transaction.amountMinor} />
            </div>
            <p className="text-[11px] text-slate-400">Canonical double-entry verified</p>
          </div>
        </div>

        {/* Audit Details Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Category */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-600" />
              Category
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: categoryObj?.color || '#94A3B8' }}
              />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {transaction.category}
              </span>
            </div>
          </div>

          {/* Account */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-emerald-600" />
              {transaction.type === 'transfer' ? 'Source Account' : 'Account'}
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 pt-0.5">
              {account?.name || transaction.accountId} ({account?.institution || 'Bank'})
            </p>
            {account && (
              <p className="text-[11px] text-slate-400">
                {account.accountNumberMasked}
              </p>
            )}
          </div>

          {/* Target Account (Transfers) */}
          {transaction.type === 'transfer' && targetAccount && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5 text-blue-500" />
                Destination Account
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 pt-0.5">
                {targetAccount.name} ({targetAccount.institution})
              </p>
              <p className="text-[11px] text-slate-400">
                {targetAccount.accountNumberMasked}
              </p>
            </div>
          )}

          {/* Date & Demo Timestamp */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              Effective Value Date
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 pt-0.5">
              {transaction.date}
            </p>
            <p className="text-[11px] text-slate-400">
              Demo Period Calendar
            </p>
          </div>

          {/* Ledger ID */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-emerald-600" />
              Ledger Identifier
            </span>
            <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 pt-0.5">
              {transaction.id}
            </p>
          </div>

          {/* Notes */}
          <div className="sm:col-span-2 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              Notes & Metadata
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0D1525] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              {transaction.notes || 'No user notes or memo attached to this transaction.'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TransactionModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        accounts={accounts}
        categories={categories}
        transactionToEdit={transaction}
      />

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Transaction"
        description={`Are you sure you want to delete the transaction "${transaction.merchant}" for ₹${(transaction.amountMinor / 100).toLocaleString('en-IN')}? This will reverse the account balance effect in the canonical ledger.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

