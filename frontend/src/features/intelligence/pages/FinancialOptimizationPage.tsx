/**
 * EXPENZO — Financial Optimization Dashboard
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { datasetService, USD_TO_INR_RATE } from '../services/datasetService';
import {
  CurrencyMode,
  DatasetSummary,
  DatasetTransaction,
  MonthlySpendingItem,
  CategorySpendingItem,
} from '../types';
import {
  TrendingUp,
  Sparkles,
  Sliders,
  AlertTriangle,
  Layers,
  Calendar,
  CreditCard,
  Users,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  Info,
  ArrowRight,
  ShieldAlert,
  Percent,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: '#10B981',
  Dining: '#F59E0B',
  Transport: '#3B82F6',
  Utilities: '#8B5CF6',
  Shopping: '#EC4899',
  Health: '#EF4444',
  Entertainment: '#6366F1',
  Bills: '#64748B',
  General: '#94A3B8',
};

export function FinancialOptimizationPage() {
  const summary: DatasetSummary = useMemo(() => datasetService.getDatasetSummary(), []);

  // Filter State
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>('USD');
  const [selectedUser, setSelectedUser] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Slider for Graph 4 (Actual vs Optimized Spending)
  const [discretionaryReductionPercent, setDiscretionaryReductionPercent] = useState<number>(15);

  // Drill-down Modal State (Category or Day Click)
  const [drilldownModalOpen, setDrilldownModalOpen] = useState(false);
  const [drilldownTitle, setDrilldownTitle] = useState('');
  const [drilldownTransactions, setDrilldownTransactions] = useState<DatasetTransaction[]>([]);

  // Filtered Monthly Spending
  const filteredMonthly = useMemo(() => {
    let list = summary.monthlySpending;

    if (selectedYear !== 'all') {
      list = list.filter((m) => m.month.startsWith(selectedYear));
    }

    return list.map((m) => {
      let spendUsd = m.totalUsd;
      if (selectedUser !== 'all') {
        spendUsd = m.byUser[String(selectedUser)] || 0;
      }
      if (selectedCategory !== 'all') {
        spendUsd = m.byCategory[selectedCategory] || 0;
      }

      return {
        month: m.month,
        spendUsd,
        spendInr: spendUsd * USD_TO_INR_RATE,
        txCount: m.txCount,
      };
    });
  }, [summary.monthlySpending, selectedYear, selectedUser, selectedCategory]);

  // Dynamic Counterfactual Optimization Scenario (Graph 4)
  const dynamicOptimization = useMemo(() => {
    return datasetService.calculateDynamicOptimization(discretionaryReductionPercent, selectedUser);
  }, [discretionaryReductionPercent, selectedUser]);

  // Reactive Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalExpenditureUsd = filteredMonthly.reduce((acc, m) => acc + m.spendUsd, 0);
    const monthsCount = filteredMonthly.length || 1;
    const avgMonthlySpendUsd = totalExpenditureUsd / monthsCount;

    // Largest spending category
    let topCategory = 'Groceries';
    let maxCatSpend = 0;
    summary.categorySpending.forEach((cat) => {
      const spend = selectedUser === 'all' ? cat.totalUsd : cat.byUser[String(selectedUser)] || 0;
      if (spend > maxCatSpend) {
        maxCatSpend = spend;
        topCategory = cat.category;
      }
    });

    // Top merchant
    const topMerchant = summary.topMerchants[0]?.name || 'Supermarket & Groceries';

    // Highest spending month
    let maxMonthSpend = 0;
    let highestPeriod = 'N/A';
    filteredMonthly.forEach((m) => {
      if (m.spendUsd > maxMonthSpend) {
        maxMonthSpend = m.spendUsd;
        highestPeriod = m.month;
      }
    });

    // Income & Net Savings
    let totalMonthlyIncomeEstimateUsd = 0;
    if (selectedUser === 'all') {
      totalMonthlyIncomeEstimateUsd = summary.users.reduce((acc, u) => acc + u.monthlyIncomeUsdEstimate, 0);
    } else {
      const u = summary.users.find((user) => user.id === selectedUser);
      totalMonthlyIncomeEstimateUsd = u ? u.monthlyIncomeUsdEstimate : 0;
    }
    const netSavingsEstimateUsd = totalMonthlyIncomeEstimateUsd - avgMonthlySpendUsd;

    return {
      totalExpenditureUsd,
      avgMonthlySpendUsd,
      largestCategory: topCategory,
      mostFrequentMerchant: topMerchant,
      highestPeriod,
      potentialAnnualSavingsUsd: dynamicOptimization.annualizedSavingsUsd,
      opportunitiesCount: summary.recommendations.length,
      budgetUtilizationPercent:
        totalMonthlyIncomeEstimateUsd > 0
          ? Math.min(100, Math.round((avgMonthlySpendUsd / totalMonthlyIncomeEstimateUsd) * 100))
          : 0,
      netSavingsEstimateUsd,
      monthlyIncomeEstimateUsd: totalMonthlyIncomeEstimateUsd,
    };
  }, [filteredMonthly, selectedUser, summary, dynamicOptimization]);

  // Graph 2 Data: Category Breakdown
  const categoryData = useMemo(() => {
    return summary.categorySpending.map((cat) => {
      const val = selectedUser === 'all' ? cat.totalUsd : cat.byUser[String(selectedUser)] || 0;
      return {
        category: cat.category,
        totalUsd: val,
        totalInr: val * USD_TO_INR_RATE,
        percentage: cat.percentage,
        txCount: cat.txCount,
      };
    });
  }, [summary.categorySpending, selectedUser]);

  // Graph 3 Data: Income vs Expenses vs Savings by Member
  const incomeVsExpenseData = useMemo(() => {
    return summary.memberRankings.map((m) => ({
      name: m.name.split(' ')[0],
      'Monthly Income (Est)': Math.round(m.monthlyIncomeUsdEstimate),
      'Average Monthly Expenses': Math.round(m.avgMonthlySpendUsd),
      'Net Savings (Est)': Math.round(m.estMonthlyNetSavingsUsd),
    }));
  }, [summary.memberRankings]);

  // Graph 4 Data: Actual vs Optimized Spending Series (Trailing 24 Months)
  const actualVsOptimizedSeries = useMemo(() => {
    const factor = (100 - discretionaryReductionPercent) / 100.0;
    return summary.monthlySpending.slice(-24).map((m) => {
      const actual = m.totalUsd;
      const optimized = Math.round(actual * (0.85 + 0.15 * factor));
      return {
        month: m.month,
        Actual: Math.round(actual),
        Optimized: optimized,
        Savings: Math.max(0, Math.round(actual - optimized)),
      };
    });
  }, [summary.monthlySpending, discretionaryReductionPercent]);

  // Handle Category Click -> Open Drilldown Modal
  const handleCategoryClick = (categoryName: string) => {
    const res = datasetService.queryTransactions({
      category: categoryName,
      userId: selectedUser,
      pageSize: 50,
    });
    setDrilldownTitle(`Underlying Transactions — ${categoryName}`);
    setDrilldownTransactions(res.items);
    setDrilldownModalOpen(true);
  };

  // Handle Day Click in Heatmap -> Open Drilldown Modal
  const handleDayClick = (dateStr: string) => {
    const res = datasetService.queryTransactions({
      dateStart: dateStr,
      dateEnd: dateStr,
      pageSize: 50,
    });
    setDrilldownTitle(`Daily Transactions — ${dateStr}`);
    setDrilldownTransactions(res.items);
    setDrilldownModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in-50">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">Financial Optimization</h1>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 text-[10px] font-bold">
                  Interactive Intelligence
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data-driven scenario simulation, time-series anomaly detection, and empirical optimization models.
              </p>
            </div>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setCurrencyMode('USD')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              currencyMode === 'USD'
                ? 'bg-white dark:bg-[#111C30] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            $ USD
          </button>
          <button
            type="button"
            onClick={() => setCurrencyMode('INR')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              currencyMode === 'INR'
                ? 'bg-white dark:bg-[#111C30] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ₹ INR (1:83)
          </button>
        </div>
      </div>

      {/* Reactive Filter Toolbar */}
      <Card className="p-4 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Member Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Household Member Filter</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Members Combined (Household Cohort)</option>
              {summary.users.map((u) => (
                <option key={u.id} value={u.id}>
                  User {u.id}: {u.name} (FICO: {u.ficoScore})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              {summary.categorySpending.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category} ({c.percentage}%)
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Historical Period Scope</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Historical Years (2002–2020)</option>
              <option value="2019">Year 2019</option>
              <option value="2018">Year 2018</option>
              <option value="2017">Year 2017</option>
              <option value="2016">Year 2016</option>
              <option value="2015">Year 2015</option>
            </select>
          </div>
        </div>
      </Card>

      {/* SUMMARY METRICS GRID (REACTIVE TO FILTERS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card className="p-4 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Expenditure</span>
          <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
            {datasetService.formatCurrency(summaryMetrics.totalExpenditureUsd, currencyMode, true)}
          </p>
          <span className="text-[10px] text-slate-400 block">{filteredMonthly.length} active periods</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Monthly Spend</span>
          <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
            {datasetService.formatCurrency(summaryMetrics.avgMonthlySpendUsd, currencyMode)}
          </p>
          <span className="text-[10px] text-indigo-500 font-semibold block">Rolling velocity</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Largest Category</span>
          <p className="text-base font-black text-slate-900 dark:text-white truncate">
            {summaryMetrics.largestCategory}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">Primary outflow</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Potential Annual Savings</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {datasetService.formatCurrency(summaryMetrics.potentialAnnualSavingsUsd, currencyMode)}
          </p>
          <span className="text-[10px] text-slate-400 block">At {discretionaryReductionPercent}% curtailment</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Net Savings (Est)</span>
          <p className={`text-xl font-black tabular-nums ${summaryMetrics.netSavingsEstimateUsd >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {datasetService.formatCurrency(summaryMetrics.netSavingsEstimateUsd, currencyMode)}
          </p>
          <span className="text-[10px] text-slate-400 block">
            Budget utilization: {summaryMetrics.budgetUtilizationPercent}%
          </span>
        </Card>
      </div>

      {/* GRAPH 1: MONTHLY EXPENDITURE TREND */}
      <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Graph 1 — Monthly Expenditure Trend
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold">
                Time Series Velocity
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive monthly expense trajectory across selected scope with live reactive filters
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredMonthly.length} Months Plotted
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredMonthly.slice(-48)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="month" angle={-30} textAnchor="end" interval={3} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => datasetService.formatCurrency(val, currencyMode, true)} />
              <Tooltip
                formatter={(val: number) => [datasetService.formatCurrency(val, currencyMode), 'Expenditure']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="spendUsd" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* GRAPH 2: CATEGORY-WISE SPENDING DISTRIBUTION (DONUT + BAR WITH DRILL-DOWN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Graph 2A — Category Spending Donut
              </h3>
              <p className="text-xs text-slate-400">Click any slice to inspect underlying transaction records</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              Interactive Drill-Down
            </Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="totalUsd"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  onClick={(entry) => handleCategoryClick(entry.category)}
                  className="cursor-pointer"
                >
                  {categoryData.map((entry, idx) => (
                    <Cell key={`donut-${idx}`} fill={CATEGORY_COLORS[entry.category] || '#6366F1'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [datasetService.formatCurrency(val, currencyMode), 'Spend']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Graph 2B — Category Spending Totals & Share
              </h3>
              <p className="text-xs text-slate-400">Exact volume and percentage attribution</p>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">
              Distribution
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs max-h-64 overflow-y-auto pr-1">
            {categoryData.map((cat) => (
              <div
                key={cat.category}
                onClick={() => handleCategoryClick(cat.category)}
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#6366F1' }} />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{cat.category}</span>
                    <span className="text-[10px] text-slate-400 block">{cat.txCount.toLocaleString()} transactions</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-slate-900 dark:text-white">
                    {datasetService.formatCurrency(cat.totalUsd, currencyMode)}
                  </span>
                  <span className="text-[10px] text-indigo-500 font-semibold block">{cat.percentage}% of total</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* GRAPH 3: INCOME VS EXPENSES VS SAVINGS */}
      <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Graph 3 — Income vs. Expenses vs. Net Savings
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold">
                Household Cash Flow Balance
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Comparative analysis by household member. Note: Monthly Income is allocated from demographic annual income estimates (Annual / 12).
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeVsExpenseData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => datasetService.formatCurrency(val, currencyMode, true)} />
              <Tooltip
                formatter={(val: number) => [datasetService.formatCurrency(val, currencyMode), '']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Monthly Income (Est)" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Average Monthly Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net Savings (Est)" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* GRAPH 4: ACTUAL VS OPTIMIZED SPENDING (INTERACTIVE SLIDER + SIMULATION) */}
      <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Graph 4 — Actual vs. Optimized Counterfactual Spending
              </h3>
              <Badge className="bg-emerald-500 text-white text-[10px] font-bold">
                Simulation Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive target slider recomputes projected discretionary savings immediately using parameterized compression.
            </p>
          </div>

          {/* Slider Control */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Sliders className="h-4 w-4 text-indigo-600 shrink-0" />
            <div className="text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-slate-700 dark:text-slate-300">Discretionary Curtailment:</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  {discretionaryReductionPercent}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={discretionaryReductionPercent}
                onChange={(e) => setDiscretionaryReductionPercent(Number(e.target.value))}
                className="w-48 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-indigo-600 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Scenario Metrics Callout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">Discretionary Baseline</span>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {datasetService.formatCurrency(dynamicOptimization.discretionaryTotalUsd, currencyMode, true)}
            </p>
            <span className="text-[10px] text-slate-400">{dynamicOptimization.discretionarySharePercent.toFixed(1)}% of total</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">Annualized Savings</span>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {datasetService.formatCurrency(dynamicOptimization.annualizedSavingsUsd, currencyMode)}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">Per Year</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">Monthly Savings</span>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {datasetService.formatCurrency(dynamicOptimization.monthlySavingsUsd, currencyMode)}
            </p>
            <span className="text-[10px] text-slate-400">Recurring buffer</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">Cumulative Lifetime Savings</span>
            <p className="text-base font-black text-emerald-700 dark:text-emerald-300">
              {datasetService.formatCurrency(dynamicOptimization.projectedSavingsUsd, currencyMode, true)}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Simulated over 18 years</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={actualVsOptimizedSeries} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="month" angle={-30} textAnchor="end" interval={2} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => datasetService.formatCurrency(val, currencyMode, true)} />
              <Tooltip
                formatter={(val: number) => [datasetService.formatCurrency(val, currencyMode), '']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="Actual" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Optimized" stroke="#10B981" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
              <Area type="monotone" dataKey="Savings" fill="#10B981" opacity={0.15} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          *Formula: Projected Savings = sum(Discretionary Spending in Dining, Shopping, Entertainment) * target_reduction_percentage. No essential utilities or groceries are reduced.
        </p>
      </Card>

      {/* GRAPH 5: DAILY SPENDING HEATMAP (WITH CLICK-TO-REVEAL) */}
      <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Graph 5 — Daily Spending Heatmap (Recent 90 Days)
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold">
                Temporal Density
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Click any day tile to reveal the underlying transactional ledger</p>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            {summary.dailySpendingHeatmap.slice(-90).map((d) => {
              const intensity =
                d.totalUsd > 1000
                  ? 'bg-rose-500 text-white'
                  : d.totalUsd > 400
                  ? 'bg-amber-500 text-white'
                  : d.totalUsd > 100
                  ? 'bg-indigo-400 text-white'
                  : 'bg-indigo-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => handleDayClick(d.date)}
                  className={`h-9 w-9 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center transition-transform hover:scale-110 shadow-2xs ${intensity}`}
                  title={`${d.date}: ${datasetService.formatCurrency(d.totalUsd, currencyMode)} (${d.txCount} txs)`}
                >
                  <span>{d.date.slice(-2)}</span>
                  <span className="text-[7px] font-normal opacity-80">{d.txCount}t</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 text-[10px] text-slate-400">
            <span>Low ($0–100)</span>
            <span className="h-2 w-2 rounded-xs bg-indigo-100 dark:bg-slate-800" />
            <span className="h-2 w-2 rounded-xs bg-indigo-400" />
            <span className="h-2 w-2 rounded-xs bg-amber-500" />
            <span className="h-2 w-2 rounded-xs bg-rose-500" />
            <span>High (&gt;$1000)</span>
          </div>
        </div>
      </Card>

      {/* GRAPH 6: EXPENSE ANOMALY DETECTION */}
      <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Graph 6 — Statistical Expense Anomaly Detection
              </h3>
              <Badge className="bg-rose-500 text-white text-[10px] font-bold">
                {summary.anomalies.length} Statistical Outliers Isolated
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Rigorous rolling 6-month Z-score spikes (&gt; 2.0 std dev) with transparent driver explanations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {summary.anomalies.map((anom) => (
            <div
              key={anom.period}
              className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 dark:text-rose-200">{anom.period} Spending Surge</span>
                <Badge variant="outline" className="text-[10px] font-mono border-rose-300 text-rose-700 dark:text-rose-300">
                  Z-Score: +{anom.zScore}
                </Badge>
              </div>

              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">Actual: {datasetService.formatCurrency(anom.actualUsd, currencyMode)}</span>
                <span className="text-slate-500">Trailing Baseline: {datasetService.formatCurrency(anom.baselineUsd, currencyMode)}</span>
              </div>

              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                {anom.explanation}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* GRAPH 7: SPENDING BY MERCHANT */}
      <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Graph 7 — Top Merchants by Spend & Frequency
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold">
                Counterparty Rankings
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Top 10 commercial entities ranked by cumulative transactional volume</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.topMerchants.slice(0, 10)}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
              <XAxis type="number" tickFormatter={(val) => datasetService.formatCurrency(val, currencyMode, true)} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip
                formatter={(val: number) => [datasetService.formatCurrency(val, currencyMode), 'Total Volume']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              <Bar dataKey="totalSpendUsd" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* DRILLDOWN TRANSACTIONS MODAL */}
      <Dialog open={drilldownModalOpen} onOpenChange={setDrilldownModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>{drilldownTitle}</span>
              <Badge variant="outline" className="text-xs font-normal">
                {drilldownTransactions.length} records shown
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 mt-4 border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-[10px] uppercase font-bold sticky top-0">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Member</th>
                  <th className="px-3 py-2">Merchant</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Card Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {drilldownTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-mono text-[11px] whitespace-nowrap">{tx.date}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{tx.userName}</td>
                    <td className="px-3 py-2 truncate max-w-[200px]">{tx.merchant}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-[10px]">
                        {tx.category}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right font-black whitespace-nowrap font-mono">
                      {datasetService.formatCurrency(tx.amountUsd, currencyMode)}
                    </td>
                    <td className="px-3 py-2 text-slate-400 text-[10px] font-mono whitespace-nowrap">
                      {tx.cardBrand} {tx.cardMasked}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

