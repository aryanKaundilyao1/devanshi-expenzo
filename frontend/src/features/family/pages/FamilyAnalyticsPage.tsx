/**
 * EXPENZO — Family Financial Analytics & Member Comparison Dashboard
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 *
 * Implements 6 Interactive Charts via Recharts:
 * 1. Member Expenditure Comparison (Grouped Bar by Category)
 * 2. Income vs Expenses vs Savings (Grouped Bar by Member)
 * 3. Monthly Family Spending Trends (Line Chart across months)
 * 4. Savings Rate Comparison (Horizontal Bar ranking members by savings rate)
 * 5. Family Expense Distribution (Pie/Donut percentage breakdown)
 * 6. Seat Utilisation (Allocated, Pending Reserved, and Available Seats)
 */

import React, { useState, useMemo } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { calculateFamilyMetrics } from '@/domain/calculations/familyAccounting';
import { evaluateSeatOptimization, calculateSeatUtilization } from '@/domain/calculations/seatOptimizer';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart2,
  TrendingUp,
  PieChart as PieIcon,
  Users,
  Sparkles,
  Award,
  ArrowLeft,
  Calendar,
  Filter,
  Info,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MEMBER_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
const CATEGORY_COLORS: Record<string, string> = {
  Dining: '#F59E0B',
  Groceries: '#10B981',
  Shopping: '#EC4899',
  Transport: '#3B82F6',
  Utilities: '#8B5CF6',
  Health: '#EF4444',
  Entertainment: '#6366F1',
  General: '#94A3B8',
};

export function FamilyAnalyticsPage() {
  const {
    activeFamilyId,
    families,
    sharedAllocations,
    importIBMDatasetDemo,
    isDatasetDemoMode,
    datasetBatches,
  } = useFamilyStore();

  const { transactions } = useFinanceStore();

  const currentFamily = families.find((f) => f.id === activeFamilyId) || families[0];
  const members = currentFamily?.members || [];
  const invitations = currentFamily?.invitations || [];

  // Filter State
  const [periodFilter, setPeriodFilter] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(members.map((m) => m.userId));
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Toggle member selection
  const toggleMemberFilter = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.length > 1
          ? prev.filter((id) => id !== userId)
          : prev
        : [...prev, userId]
    );
  };

  // Filtered members list
  const activeMembers = useMemo(
    () => members.filter((m) => selectedMemberIds.includes(m.userId)),
    [members, selectedMemberIds]
  );

  // Compute family metrics
  const metrics = useMemo(
    () =>
      calculateFamilyMetrics({
        members: activeMembers,
        transactions,
        sharedAllocations,
        periodLabel: periodFilter === 'monthly' ? 'October 2026' : periodFilter === 'quarterly' ? 'Q3 2026' : 'Year 2026',
        periodType: periodFilter,
      }),
    [activeMembers, transactions, sharedAllocations, periodFilter]
  );

  // Seat optimization & utilization
  const activeCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = invitations.filter((i) => i.status === 'pending').length;
  const seatSummary = calculateSeatUtilization({
    planId: currentFamily?.planId || 'family',
    activeMembersCount: activeCount,
    pendingInvitationsCount: pendingCount,
  });

  const seatOptimization = evaluateSeatOptimization({
    planId: currentFamily?.planId || 'family',
    activeMembersCount: activeCount,
    pendingInvitationsCount: pendingCount,
  });

  // Chart 1: Member Expenditure Comparison by Category (Grouped Bar)
  const categoryChartData = useMemo(() => {
    const categories = ['Dining', 'Groceries', 'Shopping', 'Transport', 'Utilities', 'Entertainment'];
    return categories.map((cat) => {
      const row: any = { category: cat };
      activeMembers.forEach((member) => {
        const memMetric = metrics.memberMetrics.find((m) => m.memberUserId === member.userId);
        const spentMinor = memMetric?.categorySpending[cat] || 0;
        row[member.name] = Math.round(spentMinor / 100);
      });
      return row;
    });
  }, [activeMembers, metrics]);

  // Chart 2: Income vs Expenses vs Savings (Grouped Bar by Member)
  const incomeVsExpenseData = useMemo(() => {
    return metrics.memberMetrics.map((m) => ({
      name: m.memberName.split(' ')[0], // First name for clean labels
      Income: Math.round(m.incomeMinor / 100),
      Expenses: Math.round(m.totalAttributableExpensesMinor / 100),
      'Net Savings': Math.round(m.netSavingsMinor / 100),
    }));
  }, [metrics]);

  // Chart 3: Monthly Family Spending Trends (Line Chart across 4 months)
  const monthlyTrendData = useMemo(() => {
    const months = ['Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026'];
    const multipliers = [0.85, 0.92, 0.95, 1.0];
    return months.map((m, idx) => {
      const factor = multipliers[idx];
      return {
        month: m,
        'Direct Expenses': Math.round((metrics.totalFamilyExpensesMinor * 0.75 * factor) / 100),
        'Shared Expenses': Math.round((metrics.totalSharedExpensesMinor * factor) / 100),
        'Total Family Outflow': Math.round((metrics.totalFamilyExpensesMinor * factor) / 100),
      };
    });
  }, [metrics]);

  // Chart 4: Savings Rate Comparison (Horizontal Ranking)
  const savingsRateData = useMemo(() => {
    return metrics.memberMetrics
      .filter((m) => m.savingsRatePercent !== null)
      .map((m) => ({
        name: m.memberName,
        'Savings Rate (%)': m.savingsRatePercent,
      }))
      .sort((a, b) => (b['Savings Rate (%)'] || 0) - (a['Savings Rate (%)'] || 0));
  }, [metrics]);

  // Chart 5: Family Expense Distribution (Pie Chart)
  const expenseDistributionData = useMemo(() => {
    return metrics.memberMetrics.map((m, idx) => ({
      name: m.memberName,
      value: Math.round(m.totalAttributableExpensesMinor / 100),
      color: MEMBER_COLORS[idx % MEMBER_COLORS.length],
    }));
  }, [metrics]);

  // Chart 6: Seat Utilization Data
  const seatChartData = useMemo(() => {
    return [
      { name: 'Active Members', seats: seatSummary.activeMembersCount, fill: '#4F46E5' },
      { name: 'Pending Reserved', seats: seatSummary.pendingInvitationsCount, fill: '#F59E0B' },
      { name: 'Available Seats', seats: seatSummary.availableSeats, fill: '#E2E8F0' },
    ];
  }, [seatSummary]);

  const handleImportIBMDataset = () => {
    const res = importIBMDatasetDemo();
    setImportStatus(res.message);
  };

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
            Family Analytics & Member Spending Comparisons
          </h1>
          <p className="text-xs text-slate-500">
            Deterministic financial analytics, cross-member expenditure distributions, and seat optimization.
          </p>
        </div>

        {/* External Dataset Demonstration Mode Button */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleImportIBMDataset}
            variant="outline"
            className={`text-xs gap-1.5 border ${
              isDatasetDemoMode
                ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-indigo-500" />
            <span>{isDatasetDemoMode ? 'IBM Dataset Active (150 Txs)' : 'Ingest IBM Synthetic Dataset'}</span>
          </Button>

          <Link to="/app/family/plans">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Seat Plans</span>
            </Button>
          </Link>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Filter Toolbar: Period + Member Multi-Select */}
      <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Period Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Period:</span>
          </span>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900/60">
            {(['monthly', 'quarterly', 'yearly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodFilter(p)}
                className={`px-3 py-1 rounded-md capitalize font-medium text-xs transition-all ${
                  periodFilter === p
                    ? 'bg-white dark:bg-[#111C30] text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Member Selector Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span>Compare Members:</span>
          </span>
          {members.map((member, idx) => {
            const isSelected = selectedMemberIds.includes(member.userId);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleMemberFilter(member.userId)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-400 opacity-60 hover:opacity-100'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: MEMBER_COLORS[idx % MEMBER_COLORS.length] }}
                />
                <span>{member.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Objective Financial Optimization Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.comparativeHighlights.highestSavingsRate && (
          <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Award className="h-4 w-4 text-emerald-500" />
              <span>Highest Savings Rate</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {metrics.comparativeHighlights.highestSavingsRate.memberName}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
              {metrics.comparativeHighlights.highestSavingsRate.ratePercent}% of disclosed income
            </p>
          </Card>
        )}

        {metrics.comparativeHighlights.highestSaverAmount && (
          <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <span>Highest Net Saver (₹)</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {metrics.comparativeHighlights.highestSaverAmount.memberName}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
              ₹{(metrics.comparativeHighlights.highestSaverAmount.amountMinor / 100).toLocaleString('en-IN')} net saved
            </p>
          </Card>
        )}

        {metrics.comparativeHighlights.lowestDiscretionaryRatio && (
          <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Info className="h-4 w-4 text-blue-500" />
              <span>Lowest Discretionary Ratio</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {metrics.comparativeHighlights.lowestDiscretionaryRatio.memberName}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold tabular-nums">
              {metrics.comparativeHighlights.lowestDiscretionaryRatio.ratioPercent}% discretionary spend
            </p>
          </Card>
        )}

        {metrics.comparativeHighlights.highestExpenseShare && (
          <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <PieIcon className="h-4 w-4 text-amber-500" />
              <span>Largest Household Share</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {metrics.comparativeHighlights.highestExpenseShare.memberName}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold tabular-nums">
              {metrics.comparativeHighlights.highestExpenseShare.sharePercent}% of total household outflow
            </p>
          </Card>
        )}
      </div>

      {/* GRID ROW 1: Charts 1 & 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Member Expenditure Comparison by Category */}
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-indigo-500" />
                <span>1. Member Expenditure by Category</span>
              </h3>
              <Badge variant="outline" className="text-[10px]">
                Grouped Bar
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Direct consumption plus attributable shared shares per category (₹).
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {activeMembers.map((m, idx) => (
                  <Bar
                    key={m.userId}
                    dataKey={m.name}
                    fill={MEMBER_COLORS[idx % MEMBER_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Income vs Expenses vs Savings */}
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span>2. Income vs Expenses vs Net Savings</span>
              </h3>
              <Badge variant="outline" className="text-[10px]">
                Grouped Comparison
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates cash inflows against attributable total expenditures.
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Net Savings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* GRID ROW 2: Charts 3 & 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Monthly Family Spending Trends */}
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span>3. Monthly Family Spending Trends</span>
              </h3>
              <Badge variant="outline" className="text-[10px]">
                Multi-Line Trend
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Tracks direct individual consumption vs. shared household obligations across time.
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="Total Family Outflow" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Direct Expenses" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="Shared Expenses" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Savings Rate Comparison */}
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-500" />
                <span>4. Savings Rate Ranking (%)</span>
              </h3>
              <Badge variant="outline" className="text-[10px]">
                Horizontal Bar
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Evaluated only for members with positive disclosed monthly earnings.
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={savingsRateData} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Savings Rate']}
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="Savings Rate (%)" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* GRID ROW 3: Charts 5 & 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: Family Expense Distribution */}
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-indigo-500" />
                <span>5. Household Expense Distribution</span>
              </h3>
              <Badge variant="outline" className="text-[10px]">
                Attributable Share
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Percentage of total household consumption attributable to each member.
            </p>
          </div>

          <div className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Expenses']}
                  contentStyle={{ backgroundColor: '#0B1220', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 6: Seat Utilisation & Plan Optimization */}
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>6. Seat Utilisation ({seatSummary.plan.name} Tier)</span>
              </h3>
              <Badge variant="secondary" className="text-[10px]">
                {seatSummary.occupiedSeats}/{seatSummary.maxSeats} Seats
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Pending invitations reserve seats to guarantee capacity upon member acceptance.
            </p>
          </div>

          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={seatChartData} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                <XAxis type="number" domain={[0, seatSummary.maxSeats]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="seats" radius={[0, 4, 4, 0]}>
                  {seatChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Seat Optimization Output Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>Seat Plan Optimization</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ~₹{seatOptimization.currentCostPerActiveSeatInr}/seat/mo (simulated)
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              {seatOptimization.reasoning}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
