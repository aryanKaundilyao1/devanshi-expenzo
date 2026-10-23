import React from 'react';
import { cn } from '@/utils/cn';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800/70', className)}
      {...props}
    />
  );
}

