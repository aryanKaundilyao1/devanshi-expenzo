import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Building2,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatRupees } from '@/domain/money/formatters';
import { exportTransactionsToCsv } from '@/features/expenses/utils/transactionCsv';

export function BankingTransactionsPage() {
  const navigate = useNavigate();
  const { accounts, transactions } = useFinanceStore();

  const [search, setSearch] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedAccountId !== 'all') {
        const matchesAccount = tx.accountId === selectedAccountId || tx.targetAccountId === selectedAccountId;
        if (!matchesAccount) return false;
      }
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesMerchant = tx.merchant.toLowerCase().includes(q);
        const matchesCat = tx.category.toLowerCase().includes(q);
        const matchesNote = (tx.notes || '').toLowerCase().includes(q);
        if (!matchesMerchant && !matchesCat && !matchesNote) return false;
      }
      return true;
    });
  }, [transactions, selectedAccountId, typeFilter, search]);

  // Aggregate metrics for filtered view
  const { totalCredits, totalDebits } = useMemo(() => {
    let totalCredits = 0;
    let totalDebits = 0;

    for (const tx of filteredTransactions) {
      if (tx.status === 'flagged') continue;
      if (tx.type === 'income') {
        totalCredits += tx.amountMinor;
      } else if (tx.type === 'expense') {
        totalDebits += tx.amountMinor;
      } else if (tx.type === 'transfer' && selectedAccountId !== 'all') {
        if (tx.targetAccountId === selectedAccountId) totalCredits += tx.amountMinor;
        if (tx.accountId === selectedAccountId) totalDebits += tx.amountMinor;
      }
    }
    return { totalCredits, totalDebits };
  }, [filteredTransactions, selectedAccountId]);

  const handleExportCsv = () => {
    exportTransactionsToCsv(filteredTransactions, accounts);
  };

  const getAccountName = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? acc.name : 'Unknown Account';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/app/banking"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Banking
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Banking Transactions
            </h1>
            <Badge variant="outline" className="text-xs">
              {filteredTransactions.length} Movements
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Canonical account ledger stream, external receipts, and internal transfers.
          </p>
        </div>

        <Button
          onClick={handleExportCsv}
          disabled={filteredTransactions.length === 0}
          variant="outline"
          className="self-start sm:self-auto cursor-pointer"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Inflows (Credits)
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            +{formatRupees(totalCredits)}
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Outflows (Debits)
          </span>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
            -{formatRupees(totalDebits)}
          </div>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Net Cash Flow
          </span>
          <div
            className={`text-xl font-extrabold ${
              totalCredits >= totalDebits
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {totalCredits >= totalDebits ? '+' : ''}
            {formatRupees(totalCredits - totalDebits)}
          </div>
        </Card>
      </div>

      {/* Toolbar Filters */}
      <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, payee or category..."
              className="pl-9"
            />
          </div>

          <div>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.institution})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Movement Types</option>
              <option value="income">Credits (Income)</option>
              <option value="expense">Debits (Expenses)</option>
              <option value="transfer">Internal Transfers</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTransactions.map((tx) => {
                const isCredit = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => navigate(`/app/transactions/${tx.id}`)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {tx.merchant || tx.category}
                      {tx.notes && (
                        <span className="block text-[11px] text-slate-400 font-normal truncate max-w-xs">
                          {tx.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {isTransfer ? (
                        <span>
                          {getAccountName(tx.accountId)} → {getAccountName(tx.targetAccountId || '')}
                        </span>
                      ) : (
                        <span>{getAccountName(tx.accountId)}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 capitalize text-slate-600 dark:text-slate-400">
                      {tx.type}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold whitespace-nowrap ${
                        isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isTransfer
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isCredit ? '+' : isTransfer ? '±' : '-'}{formatRupees(tx.amountMinor)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No transactions match your active filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
