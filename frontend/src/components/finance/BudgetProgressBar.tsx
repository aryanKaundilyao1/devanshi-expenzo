import React from 'react';
import { CurrencyDisplay } from './CurrencyDisplay';
import { cn } from '@/utils/cn';

export interface BudgetProgressBarProps {
  category: string;
  spentMinor: number;
  allocatedMinor: number;
  className?: string;
}

export function BudgetProgressBar({
  category,
  spentMinor,
  allocatedMinor,
  className,
}: BudgetProgressBarProps) {
  const percent = allocatedMinor > 0 ? Math.min(Math.round((spentMinor / allocatedMinor) * 100), 100) : 0;
  const actualPercent = allocatedMinor > 0 ? Math.round((spentMinor / allocatedMinor) * 100) : 0;

  const isExceeded = actualPercent >= 100;
  const isWarning = actualPercent >= 80 && !isExceeded;

  const progressColor = isExceeded
    ? 'bg-red-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  const badgeColor = isExceeded
    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60'
    : isWarning
    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-800 dark:text-slate-200">{category}</span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-slate-500 dark:text-slate-400">
            <CurrencyDisplay minor={spentMinor} /> of <CurrencyDisplay minor={allocatedMinor} />
          </span>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold tabular-nums', badgeColor)}>
            {actualPercent}%
          </span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', progressColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

