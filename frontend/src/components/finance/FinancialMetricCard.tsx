import React from 'react';
import { Card } from '@/components/ui/Card';
import { CurrencyDisplay } from './CurrencyDisplay';
import { PercentageChange } from './PercentageChange';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FinancialMetricCardProps {
  title: string;
  amountMinor: number;
  changePercent?: number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  className?: string;
}

export function FinancialMetricCard({
  title,
  amountMinor,
  changePercent,
  subtitle,
  icon: Icon,
  badge,
  className,
}: FinancialMetricCardProps) {
  return (
    <Card className={cn('p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
          <CurrencyDisplay minor={amountMinor} />
        </div>

        <div className="mt-2 flex items-center gap-2">
          {changePercent !== undefined && <PercentageChange valuePercent={changePercent} />}
          {subtitle && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </span>
          )}
          {badge && (
            <span className="ml-auto inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
              {badge}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

