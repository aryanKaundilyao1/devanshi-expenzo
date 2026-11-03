/**
 * EXPENZO — Expenditure Flows vs. Point-in-Time Holdings Analytics Section
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 *
 * Distinct Dimensions:
 * - Period Cash Flows (Income, Outflow, Net Savings) = Rate of change over month.
 * - Point-in-Time Wealth Holdings (Cash, Investments, Liabilities, Net Worth) = Cumulative stock balance.
 * - Coordinated dual-axis or split visualization preventing misleading additive summation.
 */

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buildHoldingsAnalytics } from '@/domain/calculations/holdingsAnalytics';
import { FinancialAccount, InvestmentHolding, StockQuote, Transaction } from '@/types/finance';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Layers,
  TrendingUp,
  Wallet,
  PiggyBank,
  PieChart as PieIcon,
  ShieldCheck,
  Info,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface ExpenditureHoldingsSectionProps {
  accounts: FinancialAccount[];
  holdings: InvestmentHolding[];
  quotes: Record<string, StockQuote>;
  transactions: Transaction[];
  demoAsOf?: string;
}

export function ExpenditureHoldingsSection({
  accounts,
  holdings,
  quotes,
  transactions,
  demoAsOf = '2026-10-31',
}: ExpenditureHoldingsSectionProps) {
  const [viewMode, setViewMode] = useState<'integrated' | 'flows_only' | 'holdings_only'>('integrated');
  const [monthsRange, setMonthsRange] = useState<number>(6);

  const analytics = useMemo(() => {
    return buildHoldingsAnalytics({
      accounts,
      holdings,
      quotes,
      transactions,
      referenceDate: demoAsOf,
      dataProvenance: 'Authenticated Ledger & Point-in-Time Snapshots',
    });
  }, [accounts, holdings, quotes, transactions, demoAsOf]);

  const seriesData = useMemo(() => {
    return analytics.series.slice(-monthsRange);
  }, [analytics.series, monthsRange]);

  const isGainPositive = analytics.portfolioPeriodGainMinor >= 0;

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Expenditure & Financial Holdings Analytics
                </h3>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                  Flows vs. Stock Balances
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Coordinated separation of period cash flows (rates) and cumulative point-in-time wealth balances.
              </p>
            </div>
          </div>
        </div>

        {/* View Controls & Provenance Tag */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Months Filter */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900/60">
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonthsRange(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  monthsRange === m
                    ? 'bg-white dark:bg-[#111C30] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>

          {/* Perspective Selector */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900/60">
            {[
              { id: 'integrated', label: 'Dual Axis' },
              { id: 'flows_only', label: 'Cash Flows' },
              { id: 'holdings_only', label: 'Holdings' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewMode(v.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === v.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Distinction Explanatory Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3 text-xs text-indigo-950 dark:text-indigo-200">
        <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong>Methodological Measurement Principle:</strong> Monthly expenditure and income are{' '}
          <em>period flows</em> (measuring velocity during each month). Total holdings, liquid cash, and net worth
          are <em>point-in-time stock measurements</em>. They are plotted on separate calibrated vertical axes to
          prevent erroneous additive conflation.
        </div>
      </div>

      {/* Point-in-Time Holdings KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 font-medium block">Liquid Cash & Bank</span>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(analytics.currentCashMinor / 100).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Checking & Savings</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 font-medium block">Investment Holdings</span>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(analytics.currentInvestmentsMinor / 100).toLocaleString('en-IN')}
          </p>
          <span
            className={`text-[10px] font-bold flex items-center gap-0.5 ${
              isGainPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isGainPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            <span>
              {isGainPositive ? '+' : ''}
              {analytics.portfolioPeriodGainPercent}% (₹
              {(Math.abs(analytics.portfolioPeriodGainMinor) / 100).toLocaleString('en-IN')})
            </span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 font-medium block">Total Recorded Assets</span>
          <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(analytics.totalAssetsMinor / 100).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400">Cash + Portfolio Equities</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-500 font-medium block">Net Worth Valuation</span>
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
            ₹{(analytics.currentNetWorthMinor / 100).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400">
            Liabilities: ₹{(analytics.currentLiabilitiesMinor / 100).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Main Interactive Coordinated Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {viewMode === 'integrated'
              ? 'Coordinated Time-Series: Period Flows (Bars) vs. Wealth Holdings (Lines)'
              : viewMode === 'flows_only'
              ? 'Period Cash Flows (Income, Expenditures & Net Savings)'
              : 'Cumulative Point-in-Time Wealth Snapshots (Cash, Portfolio & Net Worth)'}
          </span>
          <span className="text-[10px] text-slate-400">Values in INR (₹)</span>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={seriesData} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />

              {/* Left Y-Axis for Period Flows */}
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />

              {/* Right Y-Axis for Cumulative Wealth Balances (Used in Integrated mode) */}
              {viewMode === 'integrated' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                />
              )}

              <Tooltip
                formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString('en-IN')}`, name]}
                contentStyle={{
                  backgroundColor: '#0B1220',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {/* Period Flow Bars (Left Axis) */}
              {(viewMode === 'integrated' || viewMode === 'flows_only') && (
                <>
                  <Bar yAxisId="left" dataKey="incomeRupees" name="Income (Flow)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="expenseRupees" name="Expenditure (Flow)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="netSavingsRupees" name="Net Savings (Flow)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </>
              )}

              {/* Holdings Lines (Right Axis if Integrated, Left Axis if Holdings only) */}
              {(viewMode === 'integrated' || viewMode === 'holdings_only') && (
                <>
                  <Line
                    yAxisId={viewMode === 'integrated' ? 'right' : 'left'}
                    type="monotone"
                    dataKey="netWorthRupees"
                    name="Net Worth (Snapshot)"
                    stroke="#6366F1"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId={viewMode === 'integrated' ? 'right' : 'left'}
                    type="monotone"
                    dataKey="investmentsRupees"
                    name="Portfolio Equities (Snapshot)"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <Line
                    yAxisId={viewMode === 'integrated' ? 'right' : 'left'}
                    type="monotone"
                    dataKey="cashRupees"
                    name="Liquid Cash (Snapshot)"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    strokeDasharray="2 2"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holdings Breakdown: Asset Allocation Chart + Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Asset Allocation Donut */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <PieIcon className="h-3.5 w-3.5 text-indigo-500" />
              <span>Asset Allocation Breakdown (%)</span>
            </h4>
            <span className="text-[10px] text-slate-400">Point-in-Time Ratio</span>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center">
            {analytics.assetAllocation.length === 0 ? (
              <p className="text-xs text-slate-400">No assets recorded</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amountMinor"
                  >
                    {analytics.assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${(Number(val) / 100).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#0B1220', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Allocation Categories List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Portfolio Asset Classes
          </h4>
          <div className="space-y-1.5">
            {analytics.assetAllocation.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.category}</span>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                    ₹{(item.amountMinor / 100).toLocaleString('en-IN')}
                  </span>
                  <Badge variant="secondary" className="text-[10px] w-12 text-center justify-center">
                    {item.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Data Provenance Indicator */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>{analytics.provenance}</span>
            </span>
            <span className="font-mono">As of {demoAsOf}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
