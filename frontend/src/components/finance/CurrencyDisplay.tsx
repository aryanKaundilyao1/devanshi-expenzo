import React from 'react';
import { formatINR, FormatINROptions } from '@/domain/calculations/money';
import { cn } from '@/utils/cn';

export interface CurrencyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  minor?: number;
  amountMinor?: number;
  options?: FormatINROptions;
}

export function CurrencyDisplay({ minor, amountMinor, options, className, ...props }: CurrencyDisplayProps) {
  const valueMinor = minor ?? amountMinor ?? 0;
  const formatted = formatINR(valueMinor, options);

  return (
    <span className={cn('tabular-nums font-semibold', className)} {...props}>
      {formatted}
    </span>
  );
}

