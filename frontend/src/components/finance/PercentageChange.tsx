import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PercentageChangeProps {
  valuePercent: number;
  className?: string;
  showIcon?: boolean;
}

export function PercentageChange({ valuePercent, className, showIcon = true }: PercentageChangeProps) {
  const isPositive = valuePercent > 0;
  const isNegative = valuePercent < 0;

  const colorClass = isPositive
    ? 'text-emerald-600 dark:text-emerald-400'
    : isNegative
    ? 'text-red-600 dark:text-red-400'
    : 'text-slate-500 dark:text-slate-400';

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums', colorClass, className)}>
      {showIcon && isPositive && <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />}
      {showIcon && isNegative && <ArrowDownRight className="h-3.5 w-3.5 stroke-[2.5]" />}
      {showIcon && !isPositive && !isNegative && <Minus className="h-3.5 w-3.5" />}
      <span>{isPositive ? `+${valuePercent.toFixed(2)}%` : `${valuePercent.toFixed(2)}%`}</span>
    </span>
  );
}

