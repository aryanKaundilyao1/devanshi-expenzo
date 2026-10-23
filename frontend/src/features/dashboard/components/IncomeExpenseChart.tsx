import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DailyChartPoint } from '../utils/dashboardSelectors';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, BarChart2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface IncomeExpenseChartProps {
  data: DailyChartPoint[];
  periodLabel: string;
  onAddTransaction: () => void;
}

export function IncomeExpenseChart({
  data,
  periodLabel,
  onAddTransaction,
}: IncomeExpenseChartProps) {
  const [showInflow, setShowInflow] = useState(true);
  const [showOutflow, setShowOutflow] = useState(true);

  const hasData = data.length > 0 && data.some((d) => d.incomeRupees > 0 || d.expenseRupees > 0);

  // Custom Recharts Tooltip
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111C30]/95 p-3 shadow-xl text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-slate-900 dark:text-slate-100">{label}</p>
          <div className="space-y-1 pt-0.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  ₹{Number(entry.value).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cash Flow Dynamics</h3>
            <Badge variant="outline" className="text-[10px]">{periodLabel}</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Compare incoming salary and credits against category expenses.
          </p>
        </div>

        {/* Legend Series Toggles */}
        {hasData && (
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowInflow(!showInflow)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                showInflow
                  ? 'border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Inflow</span>
            </button>

            <button
              onClick={() => setShowOutflow(!showOutflow)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                showOutflow
                  ? 'border-rose-500/40 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Outflow</span>
            </button>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis
                dataKey="displayDate"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={renderTooltip} />
              {showInflow && (
                <Area
                  type="monotone"
                  dataKey="incomeRupees"
                  name="Inflow (Income)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#inflowGrad)"
                />
              )}
              {showOutflow && (
                <Area
                  type="monotone"
                  dataKey="expenseRupees"
                  name="Outflow (Expenses)"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#outflowGrad)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 text-center p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Transaction Data in this Period</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Record your first expense or income to visualize live cash flow dynamics.
              </p>
            </div>
            <Button size="sm" onClick={onAddTransaction} className="gap-1.5 text-xs">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Record Transaction</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

