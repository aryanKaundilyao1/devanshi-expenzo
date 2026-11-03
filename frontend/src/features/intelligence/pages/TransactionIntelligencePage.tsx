/**
 * EXPENZO — Transaction Intelligence & Explorer Page
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { datasetService, USD_TO_INR_RATE } from '../services/datasetService';
import {
  DatasetTransaction,
  CurrencyMode,
  TransactionFilterParams,
  DatasetSummary,
} from '../types';
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Layers,
  Calendar,
  CreditCard,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart2,
  Info,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: '#10B981',
  Dining: '#F59E0B',
  Transport: '#3B82F6',
  Utilities: '#8B5CF6',
  Shopping: '#EC4899',
  Health: '#EF4444',
  Entertainment: '#6366F1',
  Bills: '#64748B',
  General: '#94A3B8',
};

export function TransactionIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'analysis' | 'recommendations'>('explorer');
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>('USD');

  // Filter State
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [sortField, setSortField] = useState<'date' | 'amountUsd' | 'category' | 'merchant' | 'userName'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const summary: DatasetSummary = useMemo(() => datasetService.getDatasetSummary(), []);

  // In-Memory Query Execution
  const queryResult = useMemo(() => {
    return datasetService.queryTransactions({
      search,
      userId: selectedUser,
      category: selectedCategory,
      merchant: selectedMerchant,
      dateStart: dateStart || undefined,
      dateEnd: dateEnd || undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      type: typeFilter,
      sortField,
      sortOrder,
      page,
      pageSize,
    });
  }, [
    search,
    selectedUser,
    selectedCategory,
    selectedMerchant,
    dateStart,
    dateEnd,
    minAmount,
    maxAmount,
    typeFilter,
    sortField,
    sortOrder,
    page,
    pageSize,
  ]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, selectedUser, selectedCategory, selectedMerchant, dateStart, dateEnd, minAmount, maxAmount, typeFilter]);

  const handleExportCsv = () => {
    datasetService.exportTransactionsCsv(queryResult.items, currencyMode);
  };

  const handleSort = (field: 'date' | 'amountUsd' | 'category' | 'merchant' | 'userName') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in-50">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">Transaction Intelligence</h1>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                  IBM Synthetic CC Ingestion Active
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Longitudinal exploration, empirical spending analytics, and explainable optimization for 80,977 verified records.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Currency Toggle & CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                currencyMode === 'USD'
                  ? 'bg-white dark:bg-[#111C30] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              $ USD (Observed)
            </button>
            <button
              type="button"
              onClick={() => setCurrencyMode('INR')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                currencyMode === 'INR'
                  ? 'bg-white dark:bg-[#111C30] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ₹ INR (Fixed 1:83)
            </button>
          </div>

          <Button onClick={handleExportCsv} size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'explorer'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Transaction Explorer</span>
          <Badge variant="outline" className="text-[10px] ml-1">
            {queryResult.total.toLocaleString()}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('analysis')}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'analysis'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          <span>Spending Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'recommendations'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Optimal Recommendations</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* TAB 1: TRANSACTION EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <Card className="p-4 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search merchant, city, card..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* User Selector */}
              <div>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Cohort Members (4 Users)</option>
                  {summary.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      User {u.id}: {u.name} (Age {u.currentAge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Spending Categories</option>
                  {summary.categorySpending.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category} ({c.percentage}% share)
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Type */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Types (Expenses & Refunds)</option>
                  <option value="expense">Expenses Only</option>
                  <option value="income">Refunds / Credits Only</option>
                </select>
              </div>
            </div>

            {/* Date and Amount Filter Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">From Date</label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">To Date</label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Min Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Max Amount ($)</label>
                <input
                  type="number"
                  placeholder="5000.00"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Quick Filter Info & Summary */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong>{queryResult.items.length}</strong> of <strong>{queryResult.total.toLocaleString()}</strong> matching transactions
                </span>
                <span>•</span>
                <span>
                  Volume: <strong>{datasetService.formatCurrency(queryResult.totalSpendUsd, currencyMode)}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedUser('all');
                  setSelectedCategory('all');
                  setSelectedMerchant('');
                  setDateStart('');
                  setDateEnd('');
                  setMinAmount('');
                  setMaxAmount('');
                  setTypeFilter('all');
                }}
                className="text-indigo-600 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            </div>
          </Card>

          {/* Transaction Table */}
          <Card className="overflow-hidden bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th onClick={() => handleSort('date')} className="px-4 py-3 cursor-pointer hover:text-indigo-600">
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('userName')} className="px-4 py-3 cursor-pointer hover:text-indigo-600">
                      <div className="flex items-center gap-1">
                        <span>Member</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('merchant')} className="px-4 py-3 cursor-pointer hover:text-indigo-600">
                      <div className="flex items-center gap-1">
                        <span>Merchant / Counterparty</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('category')} className="px-4 py-3 cursor-pointer hover:text-indigo-600">
                      <div className="flex items-center gap-1">
                        <span>Category</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('amountUsd')} className="px-4 py-3 text-right cursor-pointer hover:text-indigo-600">
                      <div className="flex items-center justify-end gap-1">
                        <span>Amount</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Card / Account Reference</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                  {queryResult.items.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {tx.date}
                        <span className="block text-[10px] text-slate-400 font-normal">{tx.time}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {tx.userId}
                          </div>
                          <span className="font-medium">{tx.userName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        <div className="truncate max-w-[220px]" title={tx.merchant}>
                          {tx.merchant}
                        </div>
                        <span className="text-[10px] text-slate-400">{tx.useChip}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          style={{ borderColor: CATEGORY_COLORS[tx.category] || '#94A3B8' }}
                          className="text-[10px] font-bold"
                        >
                          {tx.category}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap font-black">
                        <span className={tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}>
                          {tx.type === 'income' ? '+' : ''}
                          {datasetService.formatCurrency(tx.amountUsd, currencyMode)}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {tx.cardBrand} {tx.cardMasked}
                        <span className="block text-[9px] text-slate-400 uppercase font-sans">{tx.cardType}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {tx.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold" title={tx.errors || 'Flagged'}>
                            <AlertTriangle className="h-3 w-3" />
                            {tx.errors ? tx.errors.slice(0, 15) : 'Flagged'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-slate-400">
                        IBM v2 / CC
                      </td>
                    </tr>
                  ))}

                  {queryResult.items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500">
                        No transactions found matching your active filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-200 text-xs"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="ml-2">
                  Page <strong>{queryResult.page}</strong> of <strong>{queryResult.totalPages}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={queryResult.page <= 1}
                  className="h-8 px-2.5 text-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(queryResult.totalPages, p + 1))}
                  disabled={queryResult.page >= queryResult.totalPages}
                  className="h-8 px-2.5 text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: SPENDING ANALYSIS */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Statistical Methodology Disclosure Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3 text-xs text-indigo-950 dark:text-indigo-200">
            <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Transparent Statistical Framework:</strong> Expenditure metrics are computed across 18 continuous years using rolling 6-month trailing moving averages, 95th percentile concentration thresholds, and exact category proportions. No black-box classifications or false fraud accusations are applied.
            </div>
          </div>

          {/* Row 1: Category Spending Distribution & Top Merchants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Bar Chart */}
            <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Spending Concentration by Category
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {summary.categorySpending.length} Categories
                </Badge>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.categorySpending} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="category" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => datasetService.formatCurrency(val, currencyMode, true)} />
                    <Tooltip
                      formatter={(val: number) => [datasetService.formatCurrency(val, currencyMode), 'Total Spend']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    />
                    <Bar dataKey="totalUsd" radius={[6, 6, 0, 0]}>
                      {summary.categorySpending.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[entry.category] || '#6366F1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown Table */}
              <div className="space-y-2 pt-2 text-xs">
                {summary.categorySpending.slice(0, 5).map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#6366F1' }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-[11px]">{cat.percentage}%</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {datasetService.formatCurrency(cat.totalUsd, currencyMode)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Most Frequent Merchants Table */}
            <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Top Counterparties & Merchant Frequency
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold">
                  Top 8 of {summary.topMerchants.length}
                </Badge>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {summary.topMerchants.slice(0, 8).map((m, idx) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {m.category} • {m.txCount.toLocaleString()} transactions
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-900 dark:text-white">
                        {datasetService.formatCurrency(m.totalSpendUsd, currencyMode)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        avg {datasetService.formatCurrency(m.avgSpendUsd, currencyMode)}/tx
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Row 2: Monthly Spending Patterns Across Cohort */}
          <Card className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Longitudinal Monthly Spending Patterns
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous expenditure velocity across 216 historical months (2002–2020)
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold">
                216 Months Tracked
              </Badge>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.monthlySpending.slice(-60)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="month" angle={-30} textAnchor="end" interval={5} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => datasetService.formatCurrency(val, currencyMode, true)} />
                  <Tooltip
                    formatter={(val: number) => [datasetService.formatCurrency(val, currencyMode), 'Monthly Spend']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="totalUsd" stroke="#6366F1" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: OPTIMAL RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Methodology & Safety Disclosure */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3 text-xs text-emerald-950 dark:text-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Transparent Heuristic Formulation:</strong> Recommendations are derived strictly from empirical transactional patterns. All projected savings reflect parameterized counterfactual assumptions and do not guarantee future performance.
            </div>
          </div>

          {/* Recommendation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summary.recommendations.map((rec) => (
              <Card
                key={rec.id}
                className="p-6 bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-bold border-indigo-200 text-indigo-700 dark:text-indigo-300">
                      {rec.category}
                    </Badge>
                    <Badge className="text-[10px] font-semibold bg-emerald-500 text-white">
                      {Math.round(rec.confidence * 100)}% Confidence
                    </Badge>
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    {rec.title}
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">
                        What was detected:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rec.detection}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">
                        Why it matters:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{rec.whyItMatters}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-indigo-950 dark:text-indigo-200">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider mb-1">
                        Recommended Action:
                      </span>
                      <p className="leading-relaxed">{rec.recommendedAction}</p>
                    </div>
                  </div>
                </div>

                {/* Savings Projections & Proof */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Estimated Annual Savings:</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {datasetService.formatCurrency(rec.potentialAnnualSavingsUsd, currencyMode)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Supporting records:</span>
                    <span className="font-semibold">{rec.supportingTransactionsCount.toLocaleString()} transactions</span>
                  </div>

                  <p className="text-[10px] text-slate-400 italic leading-normal pt-1">
                    *{rec.assumptions}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

