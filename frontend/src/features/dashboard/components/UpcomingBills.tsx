import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { UpcomingBill } from '@/types/finance';
import { CalendarClock, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface UpcomingBillsProps {
  bills: UpcomingBill[];
}

export function UpcomingBills({ bills }: UpcomingBillsProps) {
  const navigate = useNavigate();

  const formatDate = (iso: string) => {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CalendarClock className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Upcoming Bills</h3>
          </div>
          <p className="text-xs text-slate-500">
            Expected auto-debits & recurring commitments.
          </p>
        </div>

        <Badge variant="outline" className="text-[10px]">
          Demo Schedule
        </Badge>
      </div>

      {bills.length > 0 ? (
        <div className="space-y-2">
          {bills.map((bill) => (
            <div
              key={bill.id}
              onClick={() => navigate('/app/banking/bills')}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {bill.title}
                    </p>
                    {bill.isAutoDebit && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-0.5">
                        <RefreshCw className="h-2.5 w-2.5" /> Auto-Debit
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Due {formatDate(bill.dueDate)} • {bill.accountName}
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                <CurrencyDisplay amountMinor={bill.amountMinor} />
              </div>
            </div>
          ))}

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/banking/bills')}
              className="w-full justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600"
            >
              <span>Manage Bills & Subscriptions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 p-4">
          <CalendarClock className="h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Upcoming Reminders</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            Recurring obligations and utility bills appear here automatically.
          </p>
        </div>
      )}
    </Card>
  );
}
