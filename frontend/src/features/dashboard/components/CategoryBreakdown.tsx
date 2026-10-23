import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { CategorySpendShare } from '../utils/dashboardSelectors';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, ArrowRight, Tag } from 'lucide-react';

interface CategoryBreakdownProps {
  categories: CategorySpendShare[];
  periodLabel: string;
}

export function CategoryBreakdown({ categories, periodLabel }: CategoryBreakdownProps) {
  const navigate = useNavigate();

  const totalExpenseMinor = categories.reduce((sum, c) => sum + c.totalMinor, 0);
  const topCategory = categories[0] || null;

  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategorySpendShare;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111C30]/95 p-2.5 shadow-xl text-xs space-y-1 backdrop-blur-md">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.category}</span>
          </div>
          <p className="text-slate-500 tabular-nums">
            ₹{data.totalRupees.toLocaleString('en-IN')} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <PieIcon className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Spending by Category</h3>
          </div>
          <p className="text-xs text-slate-500">
            Outflow allocation for {periodLabel}.
          </p>
        </div>

        {topCategory && (
          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
            Top: {topCategory.category} ({topCategory.percentage}%)
          </Badge>
        )}
      </div>

      {categories.length > 0 ? (
        <div className="space-y-4">
          {/* Donut Chart Visual */}
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={renderTooltip} />
                <Pie
                  data={categories}
                  dataKey="totalRupees"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Spent</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                <CurrencyDisplay amountMinor={totalExpenseMinor} />
              </span>
            </div>
          </div>

          {/* Category Rank List */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {categories.map((item) => (
              <button
                key={item.category}
                onClick={() =>
                  navigate(`/app/transactions?category=${encodeURIComponent(item.category)}`)
                }
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-400">({item.txCount} tx)</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                    <CurrencyDisplay amountMinor={item.totalMinor} />
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/expenses')}
              className="w-full justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600"
            >
              <span>View Full Expense Analysis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20">
          <Tag className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Expenses Recorded</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Category breakdown displays automatically when you log expenses in this period.
          </p>
        </div>
      )}
    </Card>
  );
}
