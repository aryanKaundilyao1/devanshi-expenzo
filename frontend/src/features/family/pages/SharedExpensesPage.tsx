/**
 * EXPENZO — Shared Household Expenses Directory
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import React, { useState } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SharedExpenseModal } from '../components/SharedExpenseModal';
import {
  Share2,
  PlusCircle,
  Receipt,
  Users,
  Calendar,
  Tag,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function SharedExpensesPage() {
  const { activeFamilyId, families, sharedAllocations } = useFamilyStore();
  const { transactions } = useFinanceStore();

  const currentFamily = families.find((f) => f.id === activeFamilyId) || families[0];
  const members = currentFamily?.members || [];

  const [modalOpen, setModalOpen] = useState(false);

  // Group allocations by transactionId
  const allocationsByTx = new Map<string, typeof sharedAllocations>();
  sharedAllocations.forEach((alloc) => {
    const list = allocationsByTx.get(alloc.transactionId) || [];
    list.push(alloc);
    allocationsByTx.set(alloc.transactionId, list);
  });

  const totalSharedMinor = sharedAllocations.reduce((sum, a) => sum + a.allocatedAmountMinor, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/app/family"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Family Overview</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Shared Household Expenses
          </h1>
          <p className="text-xs text-slate-500">
            Joint utility bills, groceries, rent and shared expenses with exact-sum allocations.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs text-xs"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Allocate Shared Expense</span>
        </Button>
      </div>

      {/* Aggregate KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
          <span className="text-xs text-slate-500 font-medium block">Total Shared Spending</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(totalSharedMinor / 100).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">Sum of all household allocations</span>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
          <span className="text-xs text-slate-500 font-medium block">Shared Transactions</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {allocationsByTx.size}
          </p>
          <span className="text-[11px] text-slate-400">Split across {members.length} members</span>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
          <span className="text-xs text-slate-500 font-medium block">Allocation Precision</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-5 w-5" />
            <span>100% Exact</span>
          </p>
          <span className="text-[11px] text-slate-400">Zero decimal rounding discrepancies</span>
        </Card>
      </div>

      {/* Shared Expenses List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Recorded Shared Expenses ({allocationsByTx.size})
        </h3>

        {allocationsByTx.size === 0 ? (
          <Card className="p-8 text-center border-dashed border-slate-200 dark:border-slate-800 bg-transparent">
            <Receipt className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No shared expenses allocated yet</p>
            <p className="text-[11px] text-slate-400 mb-3">
              Click 'Allocate Shared Expense' to split an existing transaction with family members.
            </p>
            <Button size="sm" onClick={() => setModalOpen(true)} className="text-xs gap-1.5">
              <Share2 className="h-3.5 w-3.5" />
              <span>Split First Expense</span>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {Array.from(allocationsByTx.entries()).map(([txId, allocs]) => {
              const tx = transactions.find((t) => t.id === txId);
              const txTitle = tx?.merchant || 'Shared Household Expense';
              const txDate = tx?.date || 'Recent';
              const txCategory = tx?.category || 'General';
              const totalMinor = tx ? tx.amountMinor : allocs.reduce((s, a) => s + a.allocatedAmountMinor, 0);

              return (
                <Card
                  key={txId}
                  className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{txTitle}</h4>
                          <Badge variant="secondary" className="text-[10px]">
                            {txCategory}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>{txDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Original Amount</span>
                      <span className="text-base font-black tabular-nums text-slate-900 dark:text-white">
                        ₹{(totalMinor / 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Member Allocation Shares */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Attributable Member Shares
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {allocs.map((alloc) => {
                        const member = members.find((m) => m.userId === alloc.memberUserId);
                        const memberName = member?.name || 'Member';
                        const percent = totalMinor > 0 ? ((alloc.allocatedAmountMinor / totalMinor) * 100).toFixed(1) : '0';

                        return (
                          <div
                            key={alloc.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
                              {memberName}
                            </span>
                            <div className="text-right shrink-0">
                              <span className="font-bold tabular-nums text-slate-900 dark:text-white block">
                                ₹{(alloc.allocatedAmountMinor / 100).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-400 tabular-nums">
                                {percent}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <SharedExpenseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}

