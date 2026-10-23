import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { TransactionStatus } from '@/types/finance';

export interface FinancialStatusBadgeProps {
  status: TransactionStatus | 'healthy' | 'warning' | 'exceeded';
}

export function FinancialStatusBadge({ status }: FinancialStatusBadgeProps) {
  switch (status) {
    case 'completed':
    case 'healthy':
      return <Badge variant="success">Completed</Badge>;
    case 'pending':
    case 'warning':
      return <Badge variant="warning">Pending</Badge>;
    case 'flagged':
    case 'exceeded':
      return <Badge variant="danger">Flagged</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

