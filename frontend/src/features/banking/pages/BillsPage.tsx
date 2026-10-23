import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Plus,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Edit2,
  Trash2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { BankingBill } from '@/types/finance';
import { formatRupees } from '@/domain/money/formatters';
import { BillModal } from '@/features/banking/components/BillModal';
import { PayBillDialog } from '@/features/banking/components/PayBillDialog';
import { DeleteConfirmationDialog } from '@/features/expenses/components/DeleteConfirmationDialog';

export function BillsPage() {
  const { bills, accounts, deleteBill, demoAsOf } = useFinanceStore();

  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<BankingBill | null>(null);

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [billToPay, setBillToPay] = useState<BankingBill | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<BankingBill | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid'>('all');

  const {
    upcomingBills,
    dueSoonBills,
    overdueBills,
    paidBills,
    totalMonthlyCommitmentMinor,
  } = useMemo(() => {
    let upcomingBills: BankingBill[] = [];
    let dueSoonBills: BankingBill[] = [];
    let overdueBills: BankingBill[] = [];
    let paidBills: BankingBill[] = [];
    let totalMonthlyCommitmentMinor = 0;

    for (const bill of bills || []) {
      if (bill.status === 'paid') {
        paidBills.push(bill);
        continue;
      }

      totalMonthlyCommitmentMinor += bill.amountMinor;

      if (bill.dueDate < demoAsOf) {
        overdueBills.push(bill);
      } else {
        const [y1, m1, d1] = demoAsOf.split('-').map(Number);
        const [y2, m2, d2] = bill.dueDate.split('-').map(Number);
        const date1 = new Date(y1, m1 - 1, d1).getTime();
        const date2 = new Date(y2, m2 - 1, d2).getTime();
        const diffDays = (date2 - date1) / (1000 * 60 * 60 * 24);

        if (diffDays <= 7) {
          dueSoonBills.push(bill);
        } else {
          upcomingBills.push(bill);
        }
      }
    }

    return {
      upcomingBills,
      dueSoonBills,
      overdueBills,
      paidBills,
      totalMonthlyCommitmentMinor,
    };
  }, [bills, demoAsOf]);

  const displayedBills = useMemo(() => {
    if (activeTab === 'pending') {
      return (bills || []).filter((b) => b.status !== 'paid');
    }
    if (activeTab === 'paid') {
      return (bills || []).filter((b) => b.status === 'paid');
    }
    return bills || [];
  }, [bills, activeTab]);

  const handlePayClick = (bill: BankingBill) => {
    setBillToPay(bill);
    setPayDialogOpen(true);
  };

  const handleEditClick = (bill: BankingBill) => {
    setBillToEdit(bill);
    setBillModalOpen(true);
  };

  const handleDeleteClick = (bill: BankingBill) => {
    setBillToDelete(bill);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (billToDelete) {
      deleteBill(billToDelete.id);
      setDeleteDialogOpen(false);
      setBillToDelete(null);
    }
  };

  const getAccountName = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? acc.name : 'Primary Account';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/app/banking"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Banking
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Bills & Payments
            </h1>
            <Badge variant="outline" className="text-xs">
              {(bills || []).length} Scheduled
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track utilities, rent, and subscriptions. Record simulated payments into the canonical ledger.
          </p>
        </div>

        <Button
          onClick={() => {
            setBillToEdit(null);
            setBillModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Schedule New Bill
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Monthly Commitment
          </span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
            {formatRupees(totalMonthlyCommitmentMinor)}
          </div>
          <p className="text-[10px] text-slate-400">Total unfulfilled bills</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            Due Soon (&le; 7 Days)
          </span>
          <div className="text-xl font-extrabold text-amber-600">
            {dueSoonBills.length}
          </div>
          <p className="text-[10px] text-slate-400">Action recommended</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
            Overdue Bills
          </span>
          <div className="text-xl font-extrabold text-rose-600">
            {overdueBills.length}
          </div>
          <p className="text-[10px] text-slate-400">Past demo date {demoAsOf}</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
            Paid in Ledger
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {paidBills.length}
          </div>
          <p className="text-[10px] text-slate-400">Recorded expenses</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Bills ({(bills || []).length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pending ({(bills || []).filter((b) => b.status !== 'paid').length})
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'paid'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Paid in Demo ({paidBills.length})
        </button>
      </div>

      {/* Bills Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedBills.map((bill) => {
          const isPaid = bill.status === 'paid';
          const isOverdue = !isPaid && bill.dueDate < demoAsOf;

          return (
            <Card
              key={bill.id}
              className={`p-5 rounded-2xl bg-white dark:bg-[#111C30] border space-y-4 transition-all ${
                isPaid
                  ? 'border-slate-200/60 dark:border-slate-800/60 opacity-75'
                  : isOverdue
                  ? 'border-rose-300 dark:border-rose-900/60 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {bill.title}
                  </h4>
                  <p className="text-xs text-slate-500">{bill.billerName}</p>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase ${
                    isPaid
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                      : isOverdue
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
                  }`}
                >
                  {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Due Soon'}
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Due:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatRupees(bill.amountMinor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Due Date:</span>
                  <span className={`font-mono ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {bill.dueDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pay From:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {getAccountName(bill.accountId)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {bill.category}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {!isPaid ? (
                  <Button
                    size="sm"
                    onClick={() => handlePayClick(bill)}
                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Pay Bill
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Recorded in Ledger
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {!isPaid && (
                    <button
                      onClick={() => handleEditClick(bill)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Bill"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(bill)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Bill"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {displayedBills.length === 0 && (
        <Card className="p-8 text-center rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No bills found in this view
          </p>
          <p className="text-xs text-slate-500">
            Schedule upcoming utility bills or recurring commitments to keep track of payment deadlines.
          </p>
        </Card>
      )}

      {/* Bill Modal */}
      <BillModal
        open={billModalOpen}
        onOpenChange={setBillModalOpen}
        billToEdit={billToEdit}
      />

      {/* Pay Bill Dialog */}
      <PayBillDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        bill={billToPay}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Scheduled Bill"
        description={`Are you sure you want to delete ${billToDelete?.title}?`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

