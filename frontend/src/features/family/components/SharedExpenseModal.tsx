/**
 * EXPENZO — Shared Expense Allocation Dialog Component
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 *
 * Enforces the Exact-Sum Invariant:
 * The sum of member allocations must equal the original transaction amount down to the last paise.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { FamilyMember } from '@/types/family';
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateSharedExpenseAllocations } from '@/domain/calculations/familyAccounting';

interface SharedExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedTransactionId?: string;
}

export function SharedExpenseModal({
  open,
  onOpenChange,
  preselectedTransactionId,
}: SharedExpenseModalProps) {
  const { activeFamilyId, families, allocateSharedExpense } = useFamilyStore();
  const { transactions } = useFinanceStore();

  const currentFamily = families.find((f) => f.id === activeFamilyId) || families[0];
  const members = currentFamily?.members || [];

  // Filter eligible expense transactions
  const expenseTxs = transactions.filter((t) => t.type === 'expense' && !t.targetAccountId);

  const [selectedTxId, setSelectedTxId] = useState<string>(preselectedTransactionId || expenseTxs[0]?.id || '');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage' | 'custom_exact'>('equal');

  // Map of memberUserId -> allocated amount in paise
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedTx = transactions.find((t) => t.id === selectedTxId);
  const totalAmountMinor = selectedTx ? selectedTx.amountMinor : 0;

  // Recompute allocations whenever selected transaction, members, or splitMethod change
  useEffect(() => {
    if (!selectedTx || members.length === 0) return;

    if (splitMethod === 'equal') {
      const count = members.length;
      const baseShare = Math.floor(totalAmountMinor / count);
      const remainder = totalAmountMinor % count;

      const newAlloc: Record<string, number> = {};
      members.forEach((m, idx) => {
        // Distribute remainder paise to first members
        newAlloc[m.userId] = baseShare + (idx < remainder ? 1 : 0);
      });
      setAllocations(newAlloc);
    } else if (splitMethod === 'percentage') {
      const defaultPercent = Math.floor(100 / members.length);
      let runningSum = 0;
      const newAlloc: Record<string, number> = {};

      members.forEach((m, idx) => {
        if (idx === members.length - 1) {
          // Last member receives remaining paise to guarantee 100% exact sum
          newAlloc[m.userId] = Math.max(0, totalAmountMinor - runningSum);
        } else {
          const share = Math.round((totalAmountMinor * defaultPercent) / 100);
          newAlloc[m.userId] = share;
          runningSum += share;
        }
      });
      setAllocations(newAlloc);
    }
  }, [selectedTxId, splitMethod, members.length, totalAmountMinor]);

  const handleCustomAmountChange = (userId: string, rupeesStr: string) => {
    const rupees = parseFloat(rupeesStr) || 0;
    const paise = Math.round(Math.abs(rupees) * 100);
    setAllocations((prev) => ({ ...prev, [userId]: paise }));
  };

  // Validate exact sum
  const allocList = members.map((m) => ({
    allocatedAmountMinor: allocations[m.userId] || 0,
  }));
  const validation = validateSharedExpenseAllocations(totalAmountMinor, allocList);

  const handleSave = () => {
    if (!validation.isValid) {
      setErrorMsg(
        `Allocations must sum exactly to ₹${(totalAmountMinor / 100).toFixed(2)}. Difference: ₹${(
          Math.abs(validation.differenceMinor) / 100
        ).toFixed(2)}.`
      );
      return;
    }

    const payload = members.map((m) => {
      const allocMinor = allocations[m.userId] || 0;
      const percent = totalAmountMinor > 0 ? Number(((allocMinor / totalAmountMinor) * 100).toFixed(2)) : 0;
      return {
        memberUserId: m.userId,
        allocatedAmountMinor: allocMinor,
        splitPercentage: percent,
        allocationMethod: splitMethod,
        notes: notes[m.userId] || undefined,
      };
    });

    const result = allocateSharedExpense(selectedTxId, currentFamily.id, payload);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to save shared expense.');
      return;
    }

    setErrorMsg(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Split & Share Expense</DialogTitle>
              <DialogDescription className="text-xs">
                Share a ledger expense across members of {currentFamily?.name || 'Family Workspace'}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Transaction Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Select Ledger Transaction
            </label>
            <select
              value={selectedTxId}
              onChange={(e) => setSelectedTxId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-xs font-medium"
            >
              {expenseTxs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.date} — {t.merchant} (₹{(t.amountMinor / 100).toLocaleString('en-IN')}) [{t.category}]
                </option>
              ))}
            </select>
          </div>

          {selectedTx && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedTx.merchant}</p>
                <p className="text-[11px] text-slate-500">
                  {selectedTx.category} • {selectedTx.date}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Total Amount</span>
                <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white">
                  ₹{(selectedTx.amountMinor / 100).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* Split Method Tabs */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Split Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'equal', label: 'Equal Split' },
                { id: 'percentage', label: 'Percentage' },
                { id: 'custom_exact', label: 'Custom Exact (₹)' },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSplitMethod(method.id as any)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    splitMethod === method.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Member Allocations Table */}
          <div className="space-y-2 pt-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Member Share Allocation
            </label>

            <div className="space-y-2">
              {members.map((member) => {
                const allocMinor = allocations[member.userId] || 0;
                const rupeesVal = (allocMinor / 100).toFixed(2);
                const percentVal = totalAmountMinor > 0 ? ((allocMinor / totalAmountMinor) * 100).toFixed(1) : '0';

                return (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{member.role}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {splitMethod === 'custom_exact' ? (
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                            ₹
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            value={allocMinor ? (allocMinor / 100).toString() : ''}
                            onChange={(e) => handleCustomAmountChange(member.userId, e.target.value)}
                            placeholder="0.00"
                            className="h-8 pl-6 pr-2 text-xs font-bold text-right"
                          />
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="font-bold tabular-nums text-slate-900 dark:text-white block">
                            ₹{rupeesVal}
                          </span>
                          <span className="text-[10px] text-slate-500 tabular-nums">
                            {percentVal}% of total
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Status Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              validation.isValid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>
                {validation.isValid
                  ? 'Allocations perfectly match transaction total (₹' + (totalAmountMinor / 100).toFixed(2) + ')'
                  : `Discrepancy: ₹${(Math.abs(validation.differenceMinor) / 100).toFixed(2)} (${
                      validation.differenceMinor > 0 ? 'Underallocated' : 'Overallocated'
                    })`}
              </span>
            </div>
            <span className="font-bold tabular-nums">
              ₹{(validation.sumAllocatedMinor / 100).toFixed(2)}
            </span>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMsg}</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!validation.isValid}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            Save Shared Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

