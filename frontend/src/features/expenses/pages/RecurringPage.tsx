import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecurringRuleModal } from '../components/RecurringRuleModal';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { RecurringRule } from '@/types/finance';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  Building,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';

export function RecurringPage() {
  const navigate = useNavigate();

  const recurringRules = useFinanceStore((state) => state.recurringRules);
  const accounts = useFinanceStore((state) => state.accounts);
  const categories = useFinanceStore((state) => state.categories);
  const toggleRecurringRuleStatus = useFinanceStore((state) => state.toggleRecurringRuleStatus);
  const deleteRecurringRule = useFinanceStore((state) => state.deleteRecurringRule);
  const recordRecurringOccurrence = useFinanceStore((state) => state.recordRecurringOccurrence);

  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<RecurringRule | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<RecurringRule | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return recurringRules.filter((r) => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      return true;
    });
  }, [recurringRules, filterType, filterStatus]);

  // Projected Monthly Impact
  const projection = useMemo(() => {
    let monthlyOutflowMinor = 0;
    let monthlyInflowMinor = 0;

    for (const r of recurringRules) {
      if (r.status === 'paused') continue;

      let monthlyMultiplier = 1;
      if (r.frequency === 'daily') monthlyMultiplier = 30;
      else if (r.frequency === 'weekly') monthlyMultiplier = 4.33;
      else if (r.frequency === 'monthly') monthlyMultiplier = 1;
      else if (r.frequency === 'yearly') monthlyMultiplier = 1 / 12;

      const monthlyAmount = r.amountMinor * monthlyMultiplier;

      if (r.type === 'expense') {
        monthlyOutflowMinor += monthlyAmount;
      } else if (r.type === 'income') {
        monthlyInflowMinor += monthlyAmount;
      }
    }

    return {
      monthlyOutflowMinor: Math.round(monthlyOutflowMinor),
      monthlyInflowMinor: Math.round(monthlyInflowMinor),
      netMonthlyMinor: Math.round(monthlyInflowMinor - monthlyOutflowMinor),
    };
  }, [recurringRules]);

  const handleCreate = () => {
    setRuleToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (rule: RecurringRule, e: React.MouseEvent) => {
    e.stopPropagation();
    setRuleToEdit(rule);
    setModalOpen(true);
  };

  const handleDelete = (rule: RecurringRule, e: React.MouseEvent) => {
    e.stopPropagation();
    setRuleToDelete(rule);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ruleToDelete) {
      deleteRecurringRule(ruleToDelete.id);
      setRuleToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleRecordOccurrence = (rule: RecurringRule, e: React.MouseEvent) => {
    e.stopPropagation();
    const createdTx = recordRecurringOccurrence(rule.id);
    if (createdTx) {
      setToastMessage(
        `Recorded occurrence for "${rule.name}" (₹${(rule.amountMinor / 100).toLocaleString('en-IN')}) into your canonical ledger!`
      );
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Recurring Transactions & Commitments
            </h1>
            <Badge variant="outline" className="text-xs">
              {recurringRules.length} Rule{recurringRules.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track subscriptions, salary credits, rent, and utility commitments without phantom balance deductions.
          </p>
        </div>

        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Recurring Rule
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Projected Monthly Commitments Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Outflow */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Projected Monthly Outflow</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
            <CurrencyDisplay amountMinor={projection.monthlyOutflowMinor} />
          </p>
          <p className="text-[11px] text-slate-400">Rent, bills, subscriptions</p>
        </div>

        {/* Inflow */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Projected Monthly Inflow</span>
            <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            <CurrencyDisplay amountMinor={projection.monthlyInflowMinor} />
          </p>
          <p className="text-[11px] text-slate-400">Payroll, annuities</p>
        </div>

        {/* Net Projected */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Monthly Recurring Gap</span>
            <Clock className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className={`text-xl font-bold tracking-tight ${
            projection.netMonthlyMinor >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
          }`}>
            <CurrencyDisplay amountMinor={projection.netMonthlyMinor} />
          </p>
          <p className="text-[11px] text-slate-400">Guaranteed surplus capacity</p>
        </div>
      </div>

      {/* 3. Accounting Assurance Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs">
        <AlertCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            Zero Phantom Deduction Guarantee
          </span>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Recurring rules serve as forward reminders and projections. Money is never deducted from your accounts silently upon page load. When a payment occurs, click <strong>"Record Occurrence"</strong> to debit the ledger and forward the schedule.
          </p>
        </div>
      </div>

      {/* 4. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Type:</span>
          {(['all', 'expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Status:</span>
          {(['all', 'active', 'paused'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                filterStatus === s
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Recurring Rules List */}
      <div className="space-y-3">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => {
            const account = accounts.find((a) => a.id === rule.accountId);

            return (
              <div
                key={rule.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all"
              >
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      rule.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                    }`}
                  >
                    <Repeat className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {rule.name}
                      </h3>
                      <Badge
                        variant={rule.status === 'active' ? 'success' : 'outline'}
                        className="text-[10px] capitalize"
                      >
                        {rule.status}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {rule.frequency}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>Category: <strong>{rule.category}</strong></span>
                      <span>•</span>
                      <span>Account: <strong>{account?.name || rule.accountId}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        Next Due: <strong className="text-slate-800 dark:text-slate-200">{rule.nextExpectedDate}</strong>
                      </span>
                    </div>

                    {rule.notes && (
                      <p className="text-xs text-slate-400 pt-0.5">
                        {rule.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left md:text-right">
                    <div
                      className={`text-lg font-bold tabular-nums ${
                        rule.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {rule.type === 'income' ? '+' : ''}
                      <CurrencyDisplay amountMinor={rule.amountMinor} />
                    </div>
                    <span className="text-[11px] text-slate-400 capitalize">
                      per {rule.frequency.replace('ly', '')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Record Occurrence Button */}
                    <Button
                      size="sm"
                      onClick={(e) => handleRecordOccurrence(rule, e)}
                      title="Post this occurrence to the canonical ledger"
                      className="text-xs"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Record Occurrence
                    </Button>

                    {/* Pause / Resume */}
                    <button
                      type="button"
                      onClick={() => toggleRecurringRuleStatus(rule.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      title={rule.status === 'active' ? 'Pause rule' : 'Resume rule'}
                    >
                      {rule.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={(e) => handleEdit(rule, e)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      title="Edit rule"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(rule, e)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center space-y-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111C30]">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <Repeat className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No Recurring Rules Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Set up periodic schedules for rent, subscriptions, SIPs, or regular salary credits.
            </p>
            <div className="pt-2">
              <Button size="sm" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add First Recurring Rule
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RecurringRuleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ruleToEdit={ruleToEdit}
        accounts={accounts}
        categories={categories}
      />

      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Recurring Schedule"
        description={`Are you sure you want to delete the schedule for "${ruleToDelete?.name}"? Existing posted transactions in your ledger will not be affected.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

