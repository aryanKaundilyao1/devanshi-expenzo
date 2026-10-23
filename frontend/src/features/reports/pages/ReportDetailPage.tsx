import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { ReportType } from '@/types/finance';
import { generateFinancialReport, generateReportCSV } from '@/features/reports/utils/reportGenerator';
import { formatINR } from '@/domain/money/formatters';
import {
  ArrowLeft,
  Printer,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const financeState = useFinanceStore();

  // Parse type and dates from id: rep_{type}_{startDate}_{endDate}
  const report = useMemo(() => {
    let type: ReportType = 'monthly';
    let startDate = '2026-10-01';
    let endDate = '2026-10-15';

    if (id && id.startsWith('rep_')) {
      const parts = id.split('_');
      if (parts.length >= 4) {
        type = parts[1] as ReportType;
        startDate = parts[2];
        endDate = parts[3];
      }
    }

    return generateFinancialReport({ type, startDate, endDate }, financeState);
  }, [id, financeState]);

  const handleDownloadCsv = () => {
    const csvContent = generateReportCSV(report);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const isPositive = report.netSavingsMinor >= 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/app/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Statement
          </button>
        </div>
      </div>

      {/* Main Print-Ready Statement Container */}
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm print:p-0 print:border-none space-y-6 text-xs">
        {/* Statement Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Official Statement
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{report.id}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {report.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Window: <span className="font-semibold text-slate-900 dark:text-white">{report.startDate}</span> to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{report.endDate}</span> • Reconciled
            </p>
          </div>

          <div className="text-right text-[11px]">
            <span className="text-slate-400 block font-semibold">EXPENZO PROTOTYPE LEDGER</span>
            <span className="text-slate-500 block">Generated: {report.generatedAt}</span>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Inflow (Income)
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
              {formatINR(report.totalIncomeMinor)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Outflow (Expenses)
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
              {formatINR(report.totalExpenseMinor)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Net Savings
            </span>
            <span className={`text-lg font-bold mt-0.5 block ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isPositive ? '+' : ''}{formatINR(report.netSavingsMinor)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Savings Rate
            </span>
            <span className={`text-lg font-bold mt-0.5 block ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {report.savingsRatePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Spending by Category
          </h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-2">Category</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-right">Share of Outflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {report.topExpenseCategories.map((c) => (
                <tr key={c.category}>
                  <td className="py-2.5 font-medium text-slate-900 dark:text-white">{c.category}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">{formatINR(c.amountMinor)}</td>
                  <td className="py-2.5 text-right font-medium text-slate-500">{c.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Transactions Table */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Largest Period Transactions
          </h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-2">Date</th>
                <th className="pb-2">Merchant</th>
                <th className="pb-2">Category</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {report.topTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2.5 text-slate-500">{tx.date}</td>
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white">{tx.merchant}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{tx.category}</td>
                  <td className="py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">-{formatINR(tx.amountMinor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

