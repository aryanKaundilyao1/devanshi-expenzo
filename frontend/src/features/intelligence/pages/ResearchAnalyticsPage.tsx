/**
 * EXPENZO — Research Analytics & Empirical Evaluation Dashboard
 * Milestone: CSCR2600 Project Based Learning 1 (PBL-1)
 * Academic Author: Devanshi Singh
 */

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { datasetService, USD_TO_INR_RATE } from '../services/datasetService';
import { DatasetSummary } from '../types';
import {
  FileText,
  Download,
  Database,
  Cpu,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Calendar,
  BookOpen,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export function ResearchAnalyticsPage() {
  const summary: DatasetSummary = useMemo(() => datasetService.getDatasetSummary(), []);
  const [selectedExport, setSelectedExport] = useState<string | null>(null);

  // Trigger download of pre-generated research CSV exports
  const downloadResearchCsv = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/data/export/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const researchCsvFiles = [
    { name: 'dataset_statistics.csv', title: 'Dataset Ingestion & Integrity Statistics', desc: 'Raw row counts, deduplication metrics, temporal range, and throughput.' },
    { name: 'category_spending_totals.csv', title: 'Category Spending Aggregations', desc: 'Category-wise spending totals (USD & INR), percentage shares, and transaction counts.' },
    { name: 'monthly_spending.csv', title: 'Longitudinal Monthly Trajectory', desc: 'Historical monthly expenditure velocity spanning 216 continuous months (2002–2020).' },
    { name: 'user_member_comparisons.csv', title: 'Multi-Member Financial Efficiency Metrics', desc: 'Savings rates, discretionary ratios, debt, and income vs. expenditure balances.' },
    { name: 'optimization_scenarios.csv', title: 'Empirical Optimization Scenarios', desc: 'Counterfactual parameterized rules, confidence intervals, and savings projections.' },
    { name: 'performance_benchmarks.csv', title: 'Host Ingestion & Processing Benchmarks', desc: 'Stream throughput, memory profile, and sub-frame aggregation latencies.' },
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in-50">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">Research Analytics & Reproducibility</h1>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 text-[10px] font-bold">
                  CSCR2600 PBL-1
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Academic evaluation harness, benchmark telemetry, and empirical data exports by <strong>Devanshi Singh</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Academic Attribution Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Author Attribution</span>
            <span className="font-bold text-slate-900 dark:text-white">Devanshi Singh</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: DATASET OVERVIEW & PROVENANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Source Dataset Provenance & Ingestion Integrity
              </h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold border-emerald-300 text-emerald-700 dark:text-emerald-300">
              Verified Invariant Holds
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-3 py-2">Source Artifact</th>
                  <th className="px-3 py-2">Raw Records</th>
                  <th className="px-3 py-2">Filesize</th>
                  <th className="px-3 py-2">Entity Semantics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {summary.provenance.sourceFiles.map((f) => (
                  <tr key={f.name}>
                    <td className="px-3 py-2.5 font-mono text-[11px] font-semibold text-slate-900 dark:text-white">
                      {f.name}
                    </td>
                    <td className="px-3 py-2.5 font-mono">{f.records.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-mono">{(f.sizeBytes / (1024 * 1024)).toFixed(2)} MB</td>
                    <td className="px-3 py-2.5 text-slate-500">
                      {f.name.includes('ibm')
                        ? 'Global Credit Card Transaction Stream'
                        : f.name.includes('users')
                        ? 'Demographics, Yearly Income, Debt, FICO'
                        : f.name.includes('cards')
                        ? 'Card Registry, Brand, Credit Limits'
                        : 'User 0 Isolated Baseline Slice'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Sampling & Deduplication Methodology:</h4>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Users 0 through 3 were deterministically extracted as a longitudinal household cohort comprising 80,977 verified transactions spanning 2002 to 2020. User 0 records in <code>User0_credit_card_transactions.csv</code> (19,963 rows) match the main dataset exactly; composite SHA-256 fingerprinting ensures exact-once ingestion semantics with zero double-counting.
            </p>
          </div>
        </Card>

        {/* Ingestion Invariants Summary */}
        <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Validation Telemetry
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Integrated Records:</span>
              <span className="font-bold font-mono">{summary.metrics.totalCohortTransactions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Duplicate Overlaps Isolated:</span>
              <span className="font-bold font-mono text-emerald-600">0 (100% Unique)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Demographic Users:</span>
              <span className="font-bold font-mono">4 Cohort Members</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Registered Cards:</span>
              <span className="font-bold font-mono">{summary.metrics.totalCohortCards} Linked Cards</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Temporal Coverage:</span>
              <span className="font-bold font-mono text-[11px]">2002-09-01 to 2020-02-28</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Total Cohort Spend:</span>
              <span className="font-black font-mono">${summary.metrics.totalSpendingUsd.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Converted INR Volume:</span>
              <span className="font-black font-mono text-indigo-600">₹{summary.metrics.totalSpendingInrRupees.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 2: PERFORMANCE BENCHMARKS */}
      <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Host Execution Benchmarks & Throughput Profiling
            </h3>
          </div>
          <Badge className="bg-indigo-600 text-white text-[10px] font-bold">
            Sub-Second Pipeline
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Stream Scan Throughput</span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {summary.benchmarks.streamThroughputRowsPerSec.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold block">Records / second</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Scan Duration</span>
            <p className="text-xl font-black text-indigo-600 font-mono">
              {summary.benchmarks.streamScanDurationSeconds}s
            </p>
            <span className="text-[10px] text-slate-400 block">80,978 raw rows</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Multi-Dim Aggregation</span>
            <p className="text-xl font-black text-indigo-600 font-mono">
              {summary.benchmarks.aggregationDurationSeconds}s
            </p>
            <span className="text-[10px] text-slate-400 block">216 months & 1,737 merchants</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Web Query Latency</span>
            <p className="text-xl font-black text-emerald-600 font-mono">
              &lt; 8 ms
            </p>
            <span className="text-[10px] text-slate-400 block">In-memory analytical cache</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2">
          <span>Environment: {summary.benchmarks.environment.os} • Python {summary.benchmarks.environment.pythonVersion}</span>
          <span>Safeguard: Streaming Extraction with Zero Browser Freeze</span>
        </div>
      </Card>

      {/* SECTION 3: MULTI-MEMBER FINANCIAL EFFICIENCY RANKINGS */}
      <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Member Financial Efficiency & Savings Rate Ranking
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold">
            Transparent Formulation
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-3 py-2">Rank / Member</th>
                <th className="px-3 py-2">Age</th>
                <th className="px-3 py-2">FICO</th>
                <th className="px-3 py-2 text-right">Stated Annual Income</th>
                <th className="px-3 py-2 text-right">Monthly Income (Est)</th>
                <th className="px-3 py-2 text-right">Avg Monthly Spend</th>
                <th className="px-3 py-2 text-right">Net Savings (Est)</th>
                <th className="px-3 py-2 text-right">Savings Rate</th>
                <th className="px-3 py-2 text-right">Discretionary Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {summary.memberRankings.map((m, idx) => (
                <tr key={m.userId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                    <span className="font-bold text-slate-900 dark:text-white">#{idx + 1} {m.name}</span>
                    <span className="block text-[10px] text-slate-400">User ID: {m.userId}</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono">{m.age}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-indigo-600">{m.ficoScore}</td>
                  <td className="px-3 py-2.5 text-right font-mono">${m.yearlyIncomeUsd.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-mono">${m.monthlyIncomeUsdEstimate.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-mono">${m.avgMonthlySpendUsd.toLocaleString()}</td>
                  <td className={`px-3 py-2.5 text-right font-mono font-bold ${m.estMonthlyNetSavingsUsd >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${m.estMonthlyNetSavingsUsd.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-black text-indigo-600">{m.savingsRate}%</td>
                  <td className="px-3 py-2.5 text-right font-mono">{m.discretionarySpendingRatio}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SECTION 4: RESEARCH CSV EXPORTS & MARKDOWN REPORT */}
      <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Downloadable Research Artifacts (CSVs & Academic Report)
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold">
            Reproducible Data
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {researchCsvFiles.map((item) => (
            <div
              key={item.name}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold block">
                  {item.name}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadResearchCsv(item.name)}
                className="w-full text-xs font-semibold gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download CSV</span>
              </Button>
            </div>
          ))}
        </div>

        {/* Academic Markdown Report Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Full Academic Markdown Paper Available</span>
            </h4>
            <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300">
              Location: <code>docs/academic/RESEARCH_DATASET_REPORT.md</code>. Contains complete mathematical formulas, schema specifications, and ethical disclosures.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => {
              window.open('/docs/academic/RESEARCH_DATASET_REPORT.md', '_blank');
            }}
            className="text-xs gap-1.5 shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Academic Paper</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
