import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { SavingsGoal } from '@/types/finance';
import { Target, ArrowRight, Calendar, PlusCircle } from 'lucide-react';

interface SavingsGoalWidgetProps {
  goal: SavingsGoal | null;
}

export function SavingsGoalWidget({ goal }: SavingsGoalWidgetProps) {
  const navigate = useNavigate();

  if (!goal) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Target className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Savings Goals</h3>
        </div>

        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 p-4">
          <Target className="h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Active Savings Goals</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Plan for future milestones like vacations, gadgets, or emergency funds.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/app/financial-planner')} className="text-xs gap-1.5 mt-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Goal</span>
          </Button>
        </div>
      </Card>
    );
  }

  const progressPercent = Math.min(
    100,
    Math.round((goal.currentAmountMinor / goal.targetAmountMinor) * 100)
  );

  const remainingMinor = Math.max(0, goal.targetAmountMinor - goal.currentAmountMinor);

  const formatDate = (iso: string) => {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Savings Milestone</h3>
          </div>
          <p className="text-xs text-slate-500">
            Internal savings allocation from liquid accounts.
          </p>
        </div>

        <Badge variant="outline" className="text-[10px] capitalize">
          {goal.category}
        </Badge>
      </div>

      {/* Goal Card Body */}
      <div
        onClick={() => navigate('/app/financial-planner')}
        className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-500/50 transition-all cursor-pointer group space-y-3"
      >
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {goal.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
              <Calendar className="h-3 w-3" />
              <span>Target Date: {formatDate(goal.targetDate)}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
              <CurrencyDisplay amountMinor={goal.currentAmountMinor} />
            </span>
            <p className="text-[10px] text-slate-400">
              of <CurrencyDisplay amountMinor={goal.targetAmountMinor} />
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-amber-600 dark:text-amber-400">{progressPercent}% Achieved</span>
            <span>₹{(remainingMinor / 100).toLocaleString('en-IN')} remaining</span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/financial-planner')}
          className="w-full justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-amber-600"
        >
          <span>Open Financial Goals Planner</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
