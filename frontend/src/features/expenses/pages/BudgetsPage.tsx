import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BudgetModal } from '../components/BudgetModal';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { Budget } from '@/types/finance';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  Wallet,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export function BudgetsPage() {
  const navigate = useNavigate();

  const budgets = useFinanceStore((state) => state.budgets);
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const deleteBudget = useFinanceStore((state) => state.deleteBudget);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  // Calculate actual spending per budget from transactions
  const budgetAnalytics = useMemo(() => {
    let totalAllocatedMinor = 0;
    let totalSpentMinor = 0;
    let approachingLimitCount = 0;
    let exceededCount = 0;

    const list = budgets.map((b) => {
      totalAllocatedMinor += b.allocatedMinor;

      const spentMinor = transactions
        .filter((tx) => tx.type === 'expense' && tx.category === b.category)
        .reduce((sum, tx) => sum + tx.amountMinor, 0);

      totalSpentMinor += spentMinor;
      const remainingMinor = Math.max(0, b.allocatedMinor - spentMinor);
      const percent = b.allocatedMinor > 0 ? Math.round((spentMinor / b.allocatedMinor) * 100) : 0;

      let status: 'healthy' | 'warning' | 'exceeded' = 'healthy';
      if (percent >= 100) {
        status = 'exceeded';
        exceededCount++;
      } else if (percent >= b.alertThresholdPercent) {
        status = 'warning';
        approachingLimitCount++;
      }

      return {
        ...b,
        spentMinor,
        remainingMinor,
        percent,
        status,
      };
    });

    const remainingTotalMinor = Math.max(0, totalAllocatedMinor - totalSpentMinor);

    return {
      list,
      totalAllocatedMinor,
      totalSpentMinor,
      remainingTotalMinor,
      approachingLimitCount,
      exceededCount,
    };
  }, [budgets, transactions]);

  // Chart data: Budget vs Actual
  const chartData = useMemo(() => {
    return budgetAnalytics.list.map((b) => ({
      category: b.category,
      Allocated: b.allocatedMinor / 100,
      Spent: b.spentMinor / 100,
    }));
  }, [budgetAnalytics]);

  const handleCreate = () => {
    setBudgetToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (b: Budget, e: React.MouseEvent) => {
    e.stopPropagation();
    setBudgetToEdit(b);
    setModalOpen(true);
  };

  const handleDelete = (b: Budget, e: React.MouseEvent) => {
    e.stopPropagation();
    setBudgetToDelete(b);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete.id);
      setBudgetToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Your Budgets
            </h1>
            <Badge variant="outline" className="text-xs">
              {budgets.length} Active Plan{budgets.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control monthly allocation limits and monitor threshold warning triggers.
          </p>
        </div>

        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Budget
        </Button>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Allocated */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 block">Total Allocated</span>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            <CurrencyDisplay amountMinor={budgetAnalytics.totalAllocatedMinor} />
          </p>
          <p className="text-[11px] text-slate-400">Monthly total cap</p>
        </div>

        {/* Spent */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 block">Total Spent</span>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400 tracking-tight">
            <CurrencyDisplay amountMinor={budgetAnalytics.totalSpentMinor} />
          </p>
          <p className="text-[11px] text-slate-400">Debited this month</p>
        </div>

        {/* Remaining */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 block">Remaining Budget</span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            <CurrencyDisplay amountMinor={budgetAnalytics.remainingTotalMinor} />
          </p>
          <p className="text-[11px] text-slate-400">Unspent headroom</p>
        </div>

        {/* Approaching Limit */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 block">Approaching Limit</span>
          <p className="text-lg font-bold text-amber-600 tracking-tight">
            {budgetAnalytics.approachingLimitCount}
          </p>
          <p className="text-[11px] text-slate-400">&gt;= 80% threshold</p>
        </div>

        {/* Exceeded */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 block">Over Budget</span>
          <p className="text-lg font-bold text-red-600 tracking-tight">
            {budgetAnalytics.exceededCount}
          </p>
          <p className="text-[11px] text-slate-400">&gt;= 100% exceeded</p>
        </div>
      </div>

      {/* 3. Budget vs Actual Comparison Chart */}
      {budgetAnalytics.list.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Budget vs. Actual Expenditure
              </h3>
              <p className="text-xs text-slate-500">
                Comparison of allocated caps vs. realized spending across categories
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              ₹ INR Values
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="category" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                  tick={{ fontSize: 11 }}
                  width={70}
                />
                <RechartsTooltip
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '0.75rem',
                    border: '1px solid #334155',
                    fontSize: '0.75rem',
                    color: '#F8FAFC',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                <Bar dataKey="Allocated" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Budget Cards Grid */}
      {budgetAnalytics.list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetAnalytics.list.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/app/transactions?category=${encodeURIComponent(b.category)}`)}
              className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xs transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                    {b.category}
                  </h3>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {b.period} Cycle
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge
                    variant={
                      b.status === 'exceeded'
                        ? 'destructive'
                        : b.status === 'warning'
                        ? 'warning'
                        : 'success'
                    }
                    className="text-[10px] px-2 py-0.5"
                  >
                    {b.status === 'exceeded'
                      ? 'Exceeded'
                      : b.status === 'warning'
                      ? `${b.percent}% Alert`
                      : 'Healthy'}
                  </Badge>

                  <button
                    type="button"
                    onClick={(e) => handleEdit(b, e)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Edit budget"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(b, e)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    title="Delete budget"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    <CurrencyDisplay amountMinor={b.spentMinor} /> spent
                  </span>
                  <span className="text-slate-400">
                    of <CurrencyDisplay amountMinor={b.allocatedMinor} />
                  </span>
                </div>

                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.status === 'exceeded'
                        ? 'bg-red-500'
                        : b.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Footing detail */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Remaining: <strong className="text-slate-700 dark:text-slate-200"><CurrencyDisplay amountMinor={b.remainingMinor} /></strong>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline inline-flex items-center gap-0.5">
                  View Ledger <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center space-y-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111C30]">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <PieChart className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No Budgets Configured
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Set spending targets for categories like Dining, Groceries, or Utilities to receive proactive warnings before overspending.
          </p>
          <div className="pt-2">
            <Button size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Budget
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        budgetToEdit={budgetToEdit}
        categories={categories}
      />

      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Budget"
        description={`Are you sure you want to delete the budget for "${budgetToDelete?.category}"? Existing transactions will NOT be deleted.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

