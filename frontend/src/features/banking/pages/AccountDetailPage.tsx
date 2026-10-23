import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Wallet,
  CreditCard,
  ArrowRightLeft,
  FileText,
  Plus,
  Edit2,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatRupees } from '@/domain/money/formatters';
import { calculateAccountBalance } from '@/domain/calculations/accounting';
import { AccountModal } from '@/features/banking/components/AccountModal';
import { TransactionModal } from '@/features/dashboard/components/TransactionModal';
import { exportTransactionsToCsv } from '@/features/expenses/utils/transactionCsv';

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accounts, transactions, recurringRules, categories, getAccountBalance } = useFinanceStore();

  const account = accounts.find((a) => a.id === id);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addTxModalOpen, setAddTxModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');

  // If account not found, show friendly not-found page
  if (!account) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-4 animate-in fade-in-50">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Account Not Found
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          The requested financial account ID does not exist or may have been deleted.
        </p>
        <div className="pt-2">
          <Button onClick={() => navigate('/app/banking/accounts')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Accounts Directory
          </Button>
        </div>
      </div>
    );
  }

  const currentBalance = getAccountBalance(account.id);

  // Transactions linked to this account
  const accountTransactions = useMemo(() => {
    return transactions.filter(
      (tx) => tx.accountId === account.id || tx.targetAccountId === account.id
    );
  }, [transactions, account.id]);

  // Breakdown metrics
  const {
    periodIncome,
    periodExpense,
    transfersIn,
    transfersOut,
  } = useMemo(() => {
    let periodIncome = 0;
    let periodExpense = 0;
    let transfersIn = 0;
    let transfersOut = 0;

    for (const tx of accountTransactions) {
      if (tx.status === 'flagged') continue;
      if (tx.type === 'income' && tx.accountId === account.id) {
        periodIncome += tx.amountMinor;
      } else if (tx.type === 'expense' && tx.accountId === account.id) {
        periodExpense += tx.amountMinor;
      } else if (tx.type === 'transfer') {
        if (tx.targetAccountId === account.id) {
          transfersIn += tx.amountMinor;
        } else if (tx.accountId === account.id) {
          transfersOut += tx.amountMinor;
        }
      }
    }

    return { periodIncome, periodExpense, transfersIn, transfersOut };
  }, [accountTransactions, account.id]);

  // Historical chronological balance progression curve
  const balanceCurve = useMemo(() => {
    // Sort transactions chronologically ascending
    const chronological = [...accountTransactions]
      .filter((t) => t.status !== 'flagged')
      .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

    let running = account.openingBalanceMinor;
    const points: { date: string; balanceMinor: number; formattedDate: string }[] = [
      {
        date: 'Opening',
        formattedDate: 'Opening',
        balanceMinor: running,
      },
    ];

    for (const tx of chronological) {
      if (tx.type === 'income' && tx.accountId === account.id) {
        running += tx.amountMinor;
      } else if (tx.type === 'expense' && tx.accountId === account.id) {
        running -= tx.amountMinor;
      } else if (tx.type === 'transfer') {
        if (tx.accountId === account.id) running -= tx.amountMinor;
        if (tx.targetAccountId === account.id) running += tx.amountMinor;
      }
      points.push({
        date: tx.date,
        formattedDate: tx.date.split('-').slice(1).join('/'),
        balanceMinor: running,
      });
    }

    return points;
  }, [accountTransactions, account]);

  // Filtered transactions for the table
  const displayedTransactions = useMemo(() => {
    return accountTransactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchMerchant = tx.merchant.toLowerCase().includes(query);
        const matchCategory = tx.category.toLowerCase().includes(query);
        const matchNotes = (tx.notes || '').toLowerCase().includes(query);
        if (!matchMerchant && !matchCategory && !matchNotes) return false;
      }
      return true;
    });
  }, [accountTransactions, typeFilter, search]);

  // Account specific insights
  const accountInsights = useMemo(() => {
    const expenses = accountTransactions.filter((t) => t.type === 'expense' && t.status === 'completed');
    const largestExpense = [...expenses].sort((a, b) => b.amountMinor - a.amountMinor)[0];
    const recurringForAccount = (recurringRules || []).filter((r) => r.accountId === account.id && r.status === 'active');
    const totalRecurringMinor = recurringForAccount.reduce((sum, r) => sum + r.amountMinor, 0);

    return {
      largestExpense,
      recurringCount: recurringForAccount.length,
      totalRecurringMinor,
    };
  }, [accountTransactions, recurringRules, account.id]);

  const handleExportCsv = () => {
    exportTransactionsToCsv(accountTransactions, accounts);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Top Breadcrumb & Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/app/banking/accounts"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Accounts Directory
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-lg">
              {account.accountType === 'wallet' ? (
                <Wallet className="h-6 w-6" />
              ) : account.accountType === 'credit' ? (
                <CreditCard className="h-6 w-6" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {account.name}
                </h1>
                <Badge variant="outline" className="text-xs uppercase font-bold text-slate-500">
                  {account.accountType}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{account.institution}</span>
                <span>•</span>
                <span className="font-mono">{account.accountNumberMasked}</span>
                <span>•</span>
                <span>Last updated: {account.lastUpdated ? account.lastUpdated.split('T')[0] : 'Today'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setAddTxModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Transaction
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/app/banking/transfer?source=${account.id}`)}
            className="cursor-pointer"
          >
            <ArrowRightLeft className="h-4 w-4 mr-1.5" />
            Transfer
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/app/banking/statements?account=${account.id}`)}
            className="cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Statement
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditModalOpen(true)}
            className="cursor-pointer"
          >
            <Edit2 className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* Balance Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Available Balance
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            {formatRupees(currentBalance)}
          </div>
          <p className="text-[10px] text-slate-400">Derived from ledger</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Opening Balance
          </span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
            {formatRupees(account.openingBalanceMinor)}
          </div>
          <p className="text-[10px] text-slate-400">Baseline seed</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Inflow
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            +{formatRupees(periodIncome)}
          </div>
          <p className="text-[10px] text-slate-400">Income credits</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Outflow
          </span>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 truncate">
            -{formatRupees(periodExpense)}
          </div>
          <p className="text-[10px] text-slate-400">Expense debits</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Transfers In
          </span>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 truncate">
            +{formatRupees(transfersIn)}
          </div>
          <p className="text-[10px] text-slate-400">From other accounts</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Transfers Out
          </span>
          <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300 truncate">
            -{formatRupees(transfersOut)}
          </div>
          <p className="text-[10px] text-slate-400">To other accounts</p>
        </Card>
      </div>

      {/* Historical Balance Progression Curve */}
      <Card className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chronological Balance Progression
            </h3>
            <p className="text-xs text-slate-500">
              Audited historical balance after each sequential ledger entry
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
            {balanceCurve.length} Ledger Points
          </Badge>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="formattedDate" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val / 100000}k`}
              />
              <Tooltip
                formatter={(val: any) => formatRupees(Number(val) || 0)}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="balanceMinor"
                name="Balance"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Account Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accountInsights.largestExpense ? (
          <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Largest Account Debit
              </h4>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {accountInsights.largestExpense.merchant} — {formatRupees(accountInsights.largestExpense.amountMinor)}
              </p>
              <p className="text-xs text-slate-500">
                Recorded on {accountInsights.largestExpense.date} under {accountInsights.largestExpense.category}.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Expense Profile
              </h4>
              <p className="text-xs text-slate-500">
                No recorded expense debits on this account yet.
              </p>
            </div>
          </Card>
        )}

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recurring Commitments
            </h4>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {accountInsights.recurringCount} Active Scheduled Rules ({formatRupees(accountInsights.totalRecurringMinor)}/mo)
            </p>
            <p className="text-xs text-slate-500">
              Projected auto-debits linked to this account.
            </p>
          </div>
        </Card>
      </div>

      {/* Account Transactions Ledger */}
      <Card className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Account Transaction Ledger
            </h3>
            <p className="text-xs text-slate-500">
              All chronological movements affecting {account.name}
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            disabled={accountTransactions.length === 0}
            className="cursor-pointer self-start sm:self-auto"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, category, or note..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Movements</option>
              <option value="income">Credits (Income)</option>
              <option value="expense">Debits (Expenses)</option>
              <option value="transfer">Internal Transfers</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {displayedTransactions.map((tx) => {
                const isIncomingIncome = tx.type === 'income' && tx.accountId === account.id;
                const isIncomingTransfer = tx.type === 'transfer' && tx.targetAccountId === account.id;
                const isCredit = isIncomingIncome || isIncomingTransfer;
                const isTransfer = tx.type === 'transfer';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => navigate(`/app/transactions/${tx.id}`)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-slate-500">{tx.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {tx.merchant || tx.category}
                      {tx.notes && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {tx.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 capitalize text-slate-600 dark:text-slate-400">
                      {isTransfer ? (isCredit ? 'Transfer In' : 'Transfer Out') : tx.type}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{formatRupees(tx.amountMinor)}
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

          {displayedTransactions.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No transactions found matching your criteria.
            </div>
          )}
        </div>
      </Card>

      {/* Edit Account Modal */}
      <AccountModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        accountToEdit={account}
      />

      {/* Add Transaction Modal tied to this account */}
      <TransactionModal
        open={addTxModalOpen}
        onOpenChange={setAddTxModalOpen}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}
