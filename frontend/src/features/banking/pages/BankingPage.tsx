import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowRightLeft,
  Receipt,
  FileText,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Percent,
  Landmark,
  PiggyBank,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatRupees } from '@/domain/money/formatters';
import {
  selectBankingKpiSummary,
  selectAccountBalanceDistribution,
  selectCashFlowTrend,
  generateBankingInsights,
} from '@/features/banking/utils/bankingSelectors';
import { AccountModal } from '@/features/banking/components/AccountModal';
import { PayBillDialog } from '@/features/banking/components/PayBillDialog';
import { BankingBill } from '@/types/finance';

export function BankingPage() {
  const navigate = useNavigate();
  const {
    accounts,
    transactions,
    bills,
    recurringRules,
    getAccountBalance,
    demoAsOf,
  } = useFinanceStore();

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [payBillDialogOpen, setPayBillDialogOpen] = useState(false);
  const [selectedBillToPay, setSelectedBillToPay] = useState<BankingBill | null>(null);

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const kpis = selectBankingKpiSummary(accounts, transactions, bills);
  const balanceDistribution = selectAccountBalanceDistribution(accounts, transactions);
  const cashFlowTrend = selectCashFlowTrend(transactions);
  const insights = generateBankingInsights(accounts, transactions, bills, recurringRules, demoAsOf);

  const pendingBills = (bills || []).filter((b) => b.status !== 'paid');
  const recentTransactions = transactions.slice(0, 5);

  const handlePayBillClick = (bill: BankingBill) => {
    setSelectedBillToPay(bill);
    setPayBillDialogOpen(true);
  };

  const isEmpty = activeAccounts.length === 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Banking
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
              DEMO MODE
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your accounts, transactions and banking activities in one place. As of {demoAsOf}.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAccountModalOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Account
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/app/banking/transfer')}
            className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ArrowRightLeft className="h-4 w-4 mr-1.5" />
            Transfer Money
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/banking/statements')}
            className="cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Statements
          </Button>
        </div>
      </div>

      {/* Clean Slate Workspace Notice */}
      {isEmpty && (
        <Card className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Demo Accounts Found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your banking workspace is currently empty. Create your first simulated bank account or cash wallet to begin tracking liquid cash and balances.
            </p>
          </div>
          <Button onClick={() => setAccountModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Create Demo Account
          </Button>
        </Card>
      )}

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available Cash</span>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            {formatRupees(kpis.totalAvailableCashMinor)}
          </div>
          <p className="text-[10px] text-slate-400">Across liquid accounts</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Deposit Accounts</span>
            <Building2 className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {kpis.totalDepositAccountsCount}
          </div>
          <p className="text-[10px] text-slate-400">Active bank accounts</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Inflow</span>
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            {formatRupees(kpis.bankingInflowMinor)}
          </div>
          <p className="text-[10px] text-slate-400">Total credits</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Outflow</span>
            <ArrowUpRight className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 truncate">
            {formatRupees(kpis.bankingOutflowMinor)}
          </div>
          <p className="text-[10px] text-slate-400">Total debits</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Bills</span>
            <Receipt className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-amber-600 truncate">
            {kpis.upcomingBillsCount}
          </div>
          <p className="text-[10px] text-slate-400">{formatRupees(kpis.upcomingBillsTotalMinor)} total</p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Accounts</span>
            <Landmark className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {kpis.totalActiveAccountsCount}
          </div>
          <p className="text-[10px] text-slate-400">Savings, current & wallet</p>
        </Card>
      </div>

      {/* Account Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Connected Demo Accounts
            </h3>
            <p className="text-xs text-slate-500">
              Derived balances derived directly from the canonical ledger
            </p>
          </div>
          <Link
            to="/app/banking/accounts"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Manage Accounts
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeAccounts.map((account) => {
            const balance = getAccountBalance(account.id);
            return (
              <div
                key={account.id}
                onClick={() => navigate(`/app/banking/accounts/${account.id}`)}
                className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 transition-colors">
                      {account.accountType === 'wallet' ? <Wallet className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {account.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {account.institution}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                    {account.accountType}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Available Balance</span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {formatRupees(balance)}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    {account.accountNumberMasked}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Banking Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cash Flow Trend & Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banking Cash-Flow Chart */}
          <Card className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Banking Cash-Flow Activity
                </h3>
                <p className="text-xs text-slate-500">
                  Daily credits and debits throughout current statement cycle
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Inflows
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Outflows
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {cashFlowTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="inflowMinor"
                      name="Inflows"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#inflowGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="outflowMinor"
                      name="Outflows"
                      stroke="#F43F5E"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#outflowGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No cash-flow transactions recorded yet.
                </div>
              )}
            </div>
          </Card>

          {/* Recent Banking Transactions */}
          <Card className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Banking Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Latest credits, debits and transfers
                </p>
              </div>
              <Link
                to="/app/banking/transactions"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                View All
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => {
                const isCredit = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';
                return (
                  <div
                    key={tx.id}
                    onClick={() => navigate(`/app/transactions/${tx.id}`)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isCredit
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                            : isTransfer
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : isTransfer ? (
                          <ArrowRightLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {tx.merchant || tx.category}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span>{tx.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${
                          isCredit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isCredit ? '+' : isTransfer ? '±' : '-'}
                        {formatRupees(tx.amountMinor)}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Upcoming Bills, Balance Breakdown & Banking Services Shortcuts */}
        <div className="space-y-6">
          {/* Upcoming Bills Widget */}
          <Card className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upcoming Bills
                </h3>
                <p className="text-xs text-slate-500">
                  Scheduled commitments due soon
                </p>
              </div>
              <Link
                to="/app/banking/bills"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                All Bills
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {pendingBills.slice(0, 3).map((bill) => (
                <div
                  key={bill.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {bill.title}
                    </h5>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Due: {bill.dueDate}</span>
                      <span>•</span>
                      <strong className="text-slate-700 dark:text-slate-300">
                        {formatRupees(bill.amountMinor)}
                      </strong>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePayBillClick(bill)}
                    className="cursor-pointer text-xs h-8 px-2.5 bg-white dark:bg-[#0B1220] hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600"
                  >
                    Pay Demo
                  </Button>
                </div>
              ))}
              {pendingBills.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No pending bills. You are fully caught up!
                </div>
              )}
            </div>
          </Card>

          {/* Account Balance Distribution */}
          <Card className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cash Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Asset proportion across liquid deposit accounts
              </p>
            </div>

            <div className="space-y-3">
              {balanceDistribution.map((item) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                      {item.name}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {formatRupees(item.balanceMinor)} ({item.percentageShare}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentageShare}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Services Shortcuts */}
          <Card className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Banking Services
              </h4>
              <Link
                to="/app/banking/services"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Directory
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/app/banking/transfer"
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center gap-2 font-medium transition-all"
              >
                <ArrowRightLeft className="h-4 w-4 text-emerald-600" />
                <span>Transfers</span>
              </Link>
              <Link
                to="/app/banking/statements"
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center gap-2 font-medium transition-all"
              >
                <FileText className="h-4 w-4 text-sky-600" />
                <span>Statements</span>
              </Link>
              <Link
                to="/app/banking/cards"
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center gap-2 font-medium transition-all"
              >
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span>Cards</span>
              </Link>
              <Link
                to="/app/banking/deposits"
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center gap-2 font-medium transition-all"
              >
                <PiggyBank className="h-4 w-4 text-amber-600" />
                <span>FD & RD</span>
              </Link>
              <Link
                to="/app/banking/loans"
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center gap-2 font-medium transition-all"
              >
                <Percent className="h-4 w-4 text-rose-600" />
                <span>EMI Calc</span>
              </Link>
              <Link
                to="/app/banking/beneficiaries"
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center gap-2 font-medium transition-all"
              >
                <Landmark className="h-4 w-4 text-emerald-600" />
                <span>Contacts</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Free Rules-Based AI Banking Insights */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Automated Banking Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.slice(0, 3).map((insight) => (
            <Card
              key={insight.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold uppercase ${
                      insight.severity === 'warning'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
                        : insight.severity === 'positive'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                        : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {insight.category}
                  </Badge>
                  <span className="text-[10px] text-slate-400">Offline Engine</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {insight.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {insight.description}
                </p>
              </div>

              {insight.suggestedAction && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(insight.suggestedAction!.actionRoute)}
                    className="w-full text-xs font-semibold"
                  >
                    {insight.suggestedAction.label}
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Account Modal */}
      <AccountModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />

      {/* Pay Bill Dialog */}
      <PayBillDialog
        open={payBillDialogOpen}
        onOpenChange={setPayBillDialogOpen}
        bill={selectedBillToPay}
      />
    </div>
  );
}

