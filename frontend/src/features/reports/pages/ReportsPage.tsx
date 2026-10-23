import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { ReportType } from '@/types/finance';
import { generateFinancialReport, generateReportCSV } from '@/features/reports/utils/reportGenerator';
import { formatINR } from '@/domain/money/formatters';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  PieChart,
  Wallet,
  AlertCircle,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const financeState = useFinanceStore();
  const navigate = useNavigate();

  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-15');
  const [accountId, setAccountId] = useState('all');

  const report = useMemo(() => {
    return generateFinancialReport(
      {
        type: reportType,
        startDate,
        endDate,
        accountId: accountId === 'all' ? undefined : accountId,
      },
      financeState
    );
  }, [reportType, startDate, endDate, accountId, financeState]);

  const handlePreset = (type: ReportType, start: string, end: string) => {
    setReportType(type);
    setStartDate(start);
    setEndDate(end);
  };

  const handleDownloadCsv = () => {
    const csvContent = generateReportCSV(report);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EXPENZO_${report.type}_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const isNetPositive = report.netSavingsMinor >= 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Financial Reports & Audited Statements
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              Double-Entry Reconciled
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate period statements with verified ledger balances, category analytics, and CSV exports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Preset Buttons & Filters */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Quick Presets:
          </span>
          {[
            { label: 'Current Month (Oct 2026)', type: 'monthly' as ReportType, start: '2026-10-01', end: '2026-10-15' },
            { label: 'Past 7 Days', type: 'weekly' as ReportType, start: '2026-10-08', end: '2026-10-15' },
            { label: 'Daily (Today)', type: 'daily' as ReportType, start: '2026-10-15', end: '2026-10-15' },
            { label: 'September 2026', type: 'monthly' as ReportType, start: '2026-09-01', end: '2026-09-30' },
            { label: 'Year to Date (2026)', type: 'custom' as ReportType, start: '2026-01-01', end: '2026-10-15' },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePreset(preset.type, preset.start, preset.end)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                startDate === preset.start && endDate === preset.end && reportType === preset.type
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="monthly">Monthly Performance Statement</option>
              <option value="weekly">Weekly Operations Summary</option>
              <option value="daily">Daily Cash Flow</option>
              <option value="custom">Custom Date Range</option>
              <option value="income_vs_expense">Income vs Expenditure</option>
              <option value="category_breakdown">Category Spending Deep Dive</option>
              <option value="budget_performance">Budget Compliance & Variance</option>
              <option value="cash_flow">Depository Cash Flow</option>
              <option value="investment_overview">Investment Portfolio & Returns</option>
              <option value="goals_progress">Savings Goals Progress</option>
            </select>
          </div>

          <div>
            <label htmlFor="from-date" className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              id="from-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="to-date" className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              id="to-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Account Scope
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Accounts (Consolidated)</option>
              {financeState.accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.institution})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generated Statement View */}
      {report.transactionCount > 0 ? (
        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm print:p-0 print:border-none">
          {/* Statement Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Audited Financial Statement
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {report.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Period: <span className="font-semibold text-slate-800 dark:text-slate-200">{report.startDate}</span> to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{report.endDate}</span> • {report.transactionCount} transactions analyzed
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 block">Reconciliation Reference:</span>
              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                {report.id}
              </span>
              <Link
                to={`/app/reports/${report.id}`}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1 mt-1 print:hidden"
              >
                Direct Statement Link <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Inflow (Income)
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                {formatINR(report.totalIncomeMinor)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Outflow (Expenses)
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                {formatINR(report.totalExpenseMinor)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Net Period Savings
              </span>
              <span className={`text-xl font-bold mt-1 block ${
                isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {isNetPositive ? '+' : ''}{formatINR(report.netSavingsMinor)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Savings Rate %
              </span>
              <span className={`text-xl font-bold mt-1 flex items-center gap-1 ${
                isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {isNetPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {report.savingsRatePercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Narrative Observations */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 text-xs space-y-1.5">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
              Automated Statement Observations:
            </span>
            <ul className="list-disc list-inside space-y-1 text-emerald-800 dark:text-emerald-300">
              {report.insights.map((ins, idx) => (
                <li key={idx}>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Category Breakdown & Budget Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Outflow */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Category Spending Breakdown
              </h3>
              <div className="space-y-2.5">
                {report.topExpenseCategories.map((cat) => (
                  <div key={cat.category} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cat.category}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatINR(cat.amountMinor)} ({cat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconciled Depository Balances */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Reconciled Account Balances
              </h3>
              <div className="space-y-2 text-xs">
                {report.accountBalances.map((acc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{acc.accountName}</span>
                      <span className="text-[10px] text-slate-400 block">{acc.institution}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatINR(acc.balanceMinor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Transactions Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Top Outflow Transactions in Period
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5 font-semibold">Date</th>
                    <th className="pb-2.5 font-semibold">Merchant / Description</th>
                    <th className="pb-2.5 font-semibold">Category</th>
                    <th className="pb-2.5 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {report.topTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{tx.date}</td>
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">{tx.merchant}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{tx.category}</td>
                      <td className="py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                        -{formatINR(tx.amountMinor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Transactions Recorded in this Period
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            The selected date range from {startDate} to {endDate} has no completed financial ledger debits or credits.
          </p>
          <button
            onClick={() => handlePreset('monthly', '2026-10-01', '2026-10-15')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Switch to Active Month (Oct 2026)
          </button>
        </div>
      )}
    </div>
  );
};
