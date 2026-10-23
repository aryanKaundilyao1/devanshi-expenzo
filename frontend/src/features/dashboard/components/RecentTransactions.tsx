import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { Transaction, FinancialAccount } from '@/types/finance';
import {
  Clock,
  ArrowRight,
  PlusCircle,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  accounts: FinancialAccount[];
  onAddTransaction: () => void;
}

export function RecentTransactions({
  transactions,
  accounts,
  onAddTransaction,
}: RecentTransactionsProps) {
  const navigate = useNavigate();

  const accountLookup = React.useMemo(() => {
    const map: Record<string, string> = {};
    accounts.forEach((acc) => {
      map[acc.id] = acc.name;
    });
    return map;
  }, [accounts]);

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
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Transactions</h3>
          </div>
          <p className="text-xs text-slate-500">
            Latest movements recorded in the canonical ledger.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onAddTransaction}
          className="text-xs gap-1.5 hidden sm:inline-flex"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Entry</span>
        </Button>
      </div>

      {transactions.length > 0 ? (
        <div className="space-y-1.5">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const accountName = accountLookup[tx.accountId] || 'Account';

            return (
              <div
                key={tx.id}
                onClick={() => navigate(`/app/transactions/${tx.id}`)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : isTransfer
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : isTransfer ? (
                      <ArrowRightLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {tx.merchant}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{accountName}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Category badge & Amount */}
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className="text-[10px] hidden md:inline-flex capitalize">
                    {tx.category}
                  </Badge>

                  <div
                    className={`text-xs sm:text-sm font-bold tabular-nums text-right ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isTransfer
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isIncome ? '+' : isTransfer ? '' : '−'}
                    <CurrencyDisplay amountMinor={tx.amountMinor} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/transactions')}
              className="w-full justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600"
            >
              <span>View Full Ledger ({transactions.length} shown)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 p-6">
          <Receipt className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Transactions Recorded Yet</p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Add your first transaction to populate your personal financial ledger.
            </p>
          </div>
          <Button size="sm" onClick={onAddTransaction} className="gap-1.5 text-xs">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add First Transaction</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
