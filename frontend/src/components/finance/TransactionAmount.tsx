import React from 'react';
import { TransactionType } from '@/types/finance';
import { formatINR } from '@/domain/calculations/money';
import { cn } from '@/utils/cn';

export interface TransactionAmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  minor: number;
  type: TransactionType;
}

export function TransactionAmount({ minor, type, className, ...props }: TransactionAmountProps) {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';

  const colorClass = isIncome
    ? 'text-emerald-600 dark:text-emerald-400'
    : isExpense
    ? 'text-red-600 dark:text-red-400'
    : 'text-slate-600 dark:text-slate-300';

  const prefix = isIncome ? '+' : isExpense ? '−' : '';
  const formatted = formatINR(minor);

  return (
    <span className={cn('tabular-nums font-semibold tracking-tight', colorClass, className)} {...props}>
      {prefix}
      {formatted}
    </span>
  );
}

