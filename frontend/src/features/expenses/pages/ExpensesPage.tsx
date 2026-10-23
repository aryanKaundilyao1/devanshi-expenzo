import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  filterTransactionsByPeriod,
  calculateExpenseSummary,
  aggregateDailySpending,
  aggregateTopMerchants,
  aggregateCategoryBreakdown,
  generateExpenseInsights,
} from '../utils/expenseSelectors';
import { TransactionModal } from '@/features/dashboard/components/TransactionModal';
import { SmartEntryDialog } from '../components/SmartEntryDialog';
import { ReceiptUploadDialog } from '../components/ReceiptUploadDialog';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { Transaction, TransactionType } from '@/types/finance';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  Receipt,
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Building,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  Wallet,
  Calendar,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';

export function ExpensesPage() {
  const navigate = useNavigate();

  const transactions = useFinanceStore((state) => state.transactions);
  const accounts = useFinanceStore((state) => state.accounts);
  const categories = useFinanceStore((state) => state.categories);
  const budgets = useFinanceStore((state) => state.budgets);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  const [period, setPeriod] = useState<'7D' | '30D' | '90D' | '1Y' | 'ALL'>('30D');

  // Modals
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [initialType, setInitialType] = useState<TransactionType>('expense');
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  const [smartEntryOpen, setSmartEntryOpen] = useState(false);
  const [receiptUploadOpen, setReceiptUploadOpen] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Filtered transactions for selected period
  const periodTransactions = useMemo(() => {
    return filterTransactionsByPeriod(transactions, period);
  }, [transactions, period]);

  // Derived summaries
  const periodDays = period === '7D' ? 7 : period === '30D' ? 30 : period === '90D' ? 90 : period === '1Y' ? 365 : 30;
  const summary = useMemo(() => {
    return calculateExpenseSummary(periodTransactions, periodDays);
  }, [periodTransactions, periodDays]);

  const dailyTrend = useMemo(() => {
    const daysCount = period === '7D' ? 7 : period === '30D' ? 14 : period === '90D' ? 30 : 14;
    return aggregateDailySpending(periodTransactions, daysCount);
  }, [periodTransactions, period]);

  const topMerchants = useMemo(() => {
    return aggregateTopMerchants(periodTransactions, 5);
  }, [periodTransactions]);

  const categoryBreakdown = useMemo(() => {
    return aggregateCategoryBreakdown(periodTransactions, categories);
  }, [periodTransactions, categories]);

  const insights = useMemo(() => {
    return generateExpenseInsights(periodTransactions, budgets, summary);
  }, [periodTransactions, budgets, summary]);

  // Recent 6 expenses for ledger feed
  const recentExpenses = useMemo(() => {
    return transactions.filter((tx) => tx.type === 'expense').slice(0, 6);
  }, [transactions]);

  // Handlers
  const handleOpenAddExpense = () => {
    setTxToEdit(null);
    setInitialType('expense');
    setTxModalOpen(true);
  };

  const handleOpenAddIncome = () => {
    setTxToEdit(null);
    setInitialType('income');
    setTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setTxToEdit(tx);
    setTxModalOpen(true);
  };

  const handleDeletePrompt = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setTxToDelete(tx);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setTxToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const isEmpty = transactions.length === 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Expenses
            </h1>
            <Badge variant="outline" className="text-xs">
              Canonical Ledger
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Understand, organize, and control your spending.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={handleOpenAddExpense}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Expense
          </Button>

          <Button variant="outline" size="sm" onClick={handleOpenAddIncome}>
            <ArrowDownRight className="h-4 w-4 mr-1.5 text-emerald-600" />
            Add Income
          </Button>

          <Button variant="outline" size="sm" onClick={() => setSmartEntryOpen(true)}>
            <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" />
            Smart Entry
          </Button>

          <Button variant="outline" size="sm" onClick={() => setReceiptUploadOpen(true)}>
            <Receipt className="h-4 w-4 mr-1.5 text-blue-500" />
            Scan Receipt
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/transactions')}
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5 text-slate-500" />
            View Transactions
          </Button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1">
          {(['7D', '30D', '90D', '1Y', 'ALL'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === p
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p === 'ALL' ? 'All Time' : p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-2 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>Demo Date: 15 Oct 2026</span>
        </div>
      </div>

      {/* Clean Slate Empty State */}
      {isEmpty && (
        <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111C30] text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <Wallet className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No Transactions Recorded Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your workspace is clean. Start tracking your finances by logging your first expense or parsing a receipt.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button size="sm" onClick={handleOpenAddExpense}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add First Expense
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSmartEntryOpen(true)}>
              <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" />
              Try Smart Entry
            </Button>
          </div>
        </div>
      )}

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Expenses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Expenses</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400 tracking-tight">
            <CurrencyDisplay amountMinor={summary.totalExpenseMinor} />
          </p>
          <p className="text-[11px] text-slate-400">In {period} window</p>
        </div>

        {/* Card 2: Total Income */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Income</span>
            <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            <CurrencyDisplay amountMinor={summary.totalIncomeMinor} />
          </p>
          <p className="text-[11px] text-slate-400">Payroll & receipts</p>
        </div>

        {/* Card 3: Net Cash Flow */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Cash Flow</span>
            {summary.netCashFlowMinor >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            )}
          </div>
          <p className={`text-lg font-bold tracking-tight ${
            summary.netCashFlowMinor >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
          }`}>
            <CurrencyDisplay amountMinor={summary.netCashFlowMinor} />
          </p>
          <p className="text-[11px] text-slate-400">Inflow minus outflow</p>
        </div>

        {/* Card 4: Daily Average */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Daily Average</span>
            <CreditCard className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            <CurrencyDisplay amountMinor={summary.avgDailySpendMinor} />
          </p>
          <p className="text-[11px] text-slate-400">Across {periodDays} days</p>
        </div>

        {/* Card 5: Largest Expense */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Largest Outflow</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {summary.largestExpense ? (
              <CurrencyDisplay amountMinor={summary.largestExpense.amountMinor} />
            ) : (
              '₹0'
            )}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {summary.largestExpense ? summary.largestExpense.merchant : 'None recorded'}
          </p>
        </div>

        {/* Card 6: Highest Category */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Top Category</span>
            <Layers className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {summary.highestCategory ? summary.highestCategory.name : 'None'}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {summary.highestCategory ? (
              `${summary.highestCategory.percentage}% of expenses`
            ) : (
              '0%'
            )}
          </p>
        </div>
      </div>

      {/* 3. Charts Section: Daily Spending Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Spending Trend Recharts AreaChart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Daily Spending Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Daily expenditure trend for the active {period} window
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Expenditures Only
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="formattedDate" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val / 100).toLocaleString('en-IN')}`}
                  tick={{ fontSize: 11 }}
                  width={60}
                />
                <RechartsTooltip
                  formatter={(val: number) => [`₹${(val / 100).toLocaleString('en-IN')}`, 'Spent']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '0.75rem',
                    border: '1px solid #334155',
                    fontSize: '0.75rem',
                    color: '#F8FAFC',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amountMinor"
                  name="Spent"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseTrendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Category Donut & Quick Jump */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Spending by Category
            </h3>
            <Link
              to="/app/categories"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              Manage
            </Link>
          </div>

          {categoryBreakdown.length > 0 ? (
            <>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="amountMinor"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: number) => [`₹${(val / 100).toLocaleString('en-IN')}`, 'Spent']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '0.75rem',
                        border: '1px solid #334155',
                        fontSize: '0.75rem',
                        color: '#F8FAFC',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Ranking List */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {categoryBreakdown.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => navigate(`/app/transactions?category=${encodeURIComponent(cat.name)}`)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-semibold tabular-nums">
                      <span>{cat.percentage}%</span>
                      <span className="text-slate-400">
                        <CurrencyDisplay amountMinor={cat.amountMinor} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center text-xs text-slate-400">
              <p>No category expenditures in this timeframe.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Top Merchants & Budget Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="h-4 w-4 text-emerald-600" />
              Top Payees & Merchants
            </h3>
            <span className="text-xs text-slate-400">By expenditure</span>
          </div>

          <div className="space-y-2">
            {topMerchants.length > 0 ? (
              topMerchants.map((m) => (
                <div
                  key={m.merchant}
                  onClick={() => navigate(`/app/transactions?search=${encodeURIComponent(m.merchant)}`)}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs cursor-pointer transition-all"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {m.merchant}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {m.count} order{m.count > 1 ? 's' : ''} • {m.percentage}% of spending
                    </p>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm shrink-0">
                    <CurrencyDisplay amountMinor={m.amountMinor} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No merchant data recorded.</p>
            )}
          </div>
        </div>

        {/* Category Budget Preview */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Monthly Budget Utilization
            </h3>
            <Link
              to="/app/budgets"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              All Budgets
            </Link>
          </div>

          <div className="space-y-3">
            {budgets.slice(0, 4).map((b) => {
              const spentMinor = transactions
                .filter((tx) => tx.type === 'expense' && tx.category === b.category)
                .reduce((sum, tx) => sum + tx.amountMinor, 0);

              const percent = b.allocatedMinor > 0 ? Math.round((spentMinor / b.allocatedMinor) * 100) : 0;
              const isOver = percent >= 100;
              const isWarning = percent >= b.alertThresholdPercent && !isOver;

              return (
                <div
                  key={b.id}
                  onClick={() => navigate(`/app/transactions?category=${encodeURIComponent(b.category)}`)}
                  className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {b.category}
                      </span>
                      {isOver && (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                          Exceeded
                        </Badge>
                      )}
                      {isWarning && (
                        <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                          {percent}% Alert
                        </Badge>
                      )}
                    </div>
                    <span className="tabular-nums font-semibold text-slate-600 dark:text-slate-400">
                      <CurrencyDisplay amountMinor={spentMinor} /> / <CurrencyDisplay amountMinor={b.allocatedMinor} />
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Spending Insights Section */}
      {insights.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-900/10 to-transparent border border-emerald-500/20 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              EXPENZO Spending Intelligence
            </h3>
            <Badge variant="outline" className="text-[10px]">
              Offline Rules Engine
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111C30]/80 backdrop-blur-sm space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        ins.severity === 'critical'
                          ? 'destructive'
                          : ins.severity === 'warning'
                          ? 'warning'
                          : 'default'
                      }
                      className="text-[9px] px-1.5 py-0"
                    >
                      {ins.severity.toUpperCase()}
                    </Badge>
                    {ins.metricFigure && (
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {ins.metricFigure}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {ins.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {ins.description}
                  </p>
                </div>

                <Link
                  to={ins.actionRoute}
                  className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
                >
                  {ins.actionLabel}
                  <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Recent Expenses Table Feed */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent Expense Records
            </h3>
            <p className="text-xs text-slate-500">
              Latest debits posted to your financial ledger
            </p>
          </div>
          <Link
            to="/app/transactions?type=expense"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 inline-flex items-center gap-1"
          >
            Full Ledger
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Payee / Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {recentExpenses.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => navigate(`/app/transactions/${tx.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {tx.merchant}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-[10px]">
                        {tx.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {accounts.find((a) => a.id === tx.accountId)?.name || tx.accountId}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      −<CurrencyDisplay amountMinor={tx.amountMinor} />
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleEditTx(tx, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Edit transaction"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePrompt(tx, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No expense records found.</p>
        )}
      </div>

      {/* Dialogs */}
      <TransactionModal
        open={txModalOpen}
        onOpenChange={setTxModalOpen}
        accounts={accounts}
        categories={categories}
        initialType={initialType}
        transactionToEdit={txToEdit}
      />

      <SmartEntryDialog
        open={smartEntryOpen}
        onOpenChange={setSmartEntryOpen}
        accounts={accounts}
        categories={categories}
      />

      <ReceiptUploadDialog
        open={receiptUploadOpen}
        onOpenChange={setReceiptUploadOpen}
        accounts={accounts}
        categories={categories}
      />

      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Transaction"
        description={`Are you sure you want to delete the transaction with "${txToDelete?.merchant}" for ₹${txToDelete ? (txToDelete.amountMinor / 100).toLocaleString('en-IN') : '0'}? This will reverse the account balance adjustment in your ledger.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

