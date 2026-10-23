import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { BudgetUtilizationItem } from '../utils/dashboardSelectors';
import { PiggyBank, ArrowRight, AlertTriangle, CheckCircle2, AlertOctagon, PlusCircle } from 'lucide-react';

interface BudgetOverviewProps {
  budgets: BudgetUtilizationItem[];
  periodLabel: string;
}

export function BudgetOverview({ budgets, periodLabel }: BudgetOverviewProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Budget Utilization</h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time limits for {periodLabel}.
          </p>
        </div>

        <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
          {budgets.length} Monitored
        </Badge>
      </div>

      {budgets.length > 0 ? (
        <div className="space-y-3">
          {budgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b.id}
                onClick={() => navigate('/app/budgets')}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {b.category}
                    </span>
                    {isExceeded && (
                      <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 py-0">
                        <AlertOctagon className="h-3 w-3" /> Exceeded
                      </Badge>
                    )}
                    {isWarning && (
                      <Badge variant="warning" className="text-[10px] gap-1 px-1.5 py-0">
                        <AlertTriangle className="h-3 w-3" /> 80% Alert
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs tabular-nums text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      <CurrencyDisplay amountMinor={b.spentMinor} />
                    </span>
                    <span className="text-slate-400"> / <CurrencyDisplay amountMinor={b.allocatedMinor} /></span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>{b.percentageUsed}% utilized</span>
                    <span>
                      {isExceeded
                        ? 'Limit exceeded'
                        : `₹${(b.remainingMinor / 100).toLocaleString('en-IN')} remaining`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/budgets')}
              className="w-full justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600"
            >
              <span>Manage All Category Budgets</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 p-4">
          <PiggyBank className="h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Budgets Configured</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Set category limits to track monthly spending and prevent overspending.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/app/budgets')} className="text-xs gap-1.5 mt-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Budget</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
