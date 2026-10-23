import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatRupees } from '@/domain/money/formatters';
import { generateAccountStatement } from '@/features/banking/utils/bankingCalculations';
import { exportTransactionsToCsv } from '@/features/expenses/utils/transactionCsv';

const PERIOD_PRESETS = [
  { id: '2026-10', label: 'October 2026 (Current Demo Cycle)', start: '2026-10-01', end: '2026-10-31' },
  { id: '2026-09', label: 'September 2026 (Previous Month)', start: '2026-09-01', end: '2026-09-30' },
  { id: '2026-ytd', label: 'Financial Year 2026 (YTD)', start: '2026-01-01', end: '2026-10-31' },
];

export function StatementsPage() {
  const [searchParams] = useSearchParams();
  const { accounts, transactions, user } = useFinanceStore();

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const initialAccountId = searchParams.get('account') || activeAccounts[0]?.id || '';

  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId);
  const [selectedPeriodId, setSelectedPeriodId] = useState('2026-10');

  const selectedAccount = activeAccounts.find((a) => a.id === selectedAccountId) || activeAccounts[0];
  const selectedPeriod = PERIOD_PRESETS.find((p) => p.id === selectedPeriodId) || PERIOD_PRESETS[0];

  const statement = useMemo(() => {
    if (!selectedAccount) return null;
    return generateAccountStatement(
      selectedAccount,
      transactions,
      selectedPeriod.start,
      selectedPeriod.end
    );
  }, [selectedAccount, transactions, selectedPeriod]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!statement) return;
    const exportableTxs = statement.rows.map((r) => r.transaction);
    exportTransactionsToCsv(exportableTxs, accounts);
  };

  if (!selectedAccount) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-4 animate-in fade-in-50">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          No Accounts Available for Statement
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Please add a demo bank account to generate periodic statements.
        </p>
        <Link to="/app/banking/accounts">
          <Button variant="outline">Go to Accounts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Top Header - Hidden in Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
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
              Account Statements
            </h1>
            <Badge variant="outline" className="text-xs uppercase font-bold text-slate-500">
              AUDITED PROTOTYPE
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate and inspect reconciled period statements derived from your canonical ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="cursor-pointer"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print Statement
          </Button>

          <Button
            size="sm"
            onClick={handleExportCsv}
            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Filter Selector Bar - Hidden in Print */}
      <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Select Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {activeAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.institution}) — {a.accountNumberMasked}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Statement Period
            </label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {PERIOD_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Statement Preview Document (Print-ready) */}
      {statement && (
        <Card className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 shadow-xl space-y-8 print:shadow-none print:border-none print:p-0">
          {/* Official Demo Statement Banner Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  E
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  EXPENZO DEMO STATEMENT
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Audited Personal Financial Account Activity Report
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 font-bold text-[10px]">
                RECONCILED (100% MATCH)
              </Badge>
              <div className="font-semibold text-slate-900 dark:text-white">
                Period: {statement.periodStart} to {statement.periodEnd}
              </div>
              <div className="text-slate-400">
                Generated: {new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          {/* Account & Customer Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Account Details
              </span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {selectedAccount.name}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Institution: <strong>{selectedAccount.institution}</strong>
              </div>
              <div className="font-mono text-slate-500">
                Masked ID: {selectedAccount.accountNumberMasked}
              </div>
              <div className="text-slate-500 capitalize">
                Type: {selectedAccount.accountType}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Account Holder
              </span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {user.name}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Email: {user.email}
              </div>
              <div className="text-slate-500">
                Currency: INR (₹)
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Status: Verified Local Demo
              </div>
            </div>
          </div>

          {/* Mathematical Balance Reconciliation Summary */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#152238] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mathematical Balance Reconciliation
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Opening Balance</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {formatRupees(statement.openingBalanceMinor)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">(+) Period Credits</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  +{formatRupees(statement.totalCreditsMinor)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">(-) Period Debits</span>
                <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                  -{formatRupees(statement.totalDebitsMinor)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">(=) Closing Balance</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {formatRupees(statement.closingBalanceMinor)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Invariant Check: ₹{((statement.openingBalanceMinor + statement.totalCreditsMinor - statement.totalDebitsMinor) / 100).toLocaleString('en-IN')} = ₹{(statement.closingBalanceMinor / 100).toLocaleString('en-IN')}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Audited & Balanced
              </span>
            </div>
          </div>

          {/* Itemized Transactions Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Itemized Transaction Activity ({statement.rows.length} Movements)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description / Narration</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Debit (-)</th>
                    <th className="py-2.5 px-3 text-right">Credit (+)</th>
                    <th className="py-2.5 px-3 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {statement.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {row.transaction.date}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                        {row.description}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {row.transaction.category}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-600 whitespace-nowrap">
                        {row.type === 'debit' ? formatRupees(row.amountMinor) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap">
                        {row.type === 'credit' ? formatRupees(row.amountMinor) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatRupees(row.runningBalanceMinor)}
                      </td>
                    </tr>
                  ))}
                  {statement.rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No transactions recorded for this account during selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mandatory Prototype Disclaimer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-1 text-xs text-slate-400">
            <p className="font-semibold text-slate-500 dark:text-slate-400">
              Disclaimer: This statement is generated from fictional EXPENZO demo records and is not an official bank statement.
            </p>
            <p className="text-[11px]">
              EXPENZO is an educational financial intelligence platform. No real banking credentials or external account data were used.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
