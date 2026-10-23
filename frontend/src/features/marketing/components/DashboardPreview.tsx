import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { PercentageChange } from '@/components/finance/PercentageChange';
import { TransactionAmount } from '@/components/finance/TransactionAmount';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  Wallet,
  TrendingUp,
  Building2,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle,
} from 'lucide-react';

export function DashboardPreview() {
  const store = useFinanceStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'banking' | 'investments'>('overview');
  const [timeFilter, setTimeFilter] = useState<'7D' | '30D' | '90D'>('30D');

  // Multiplier simulation for time periods
  const periodMultiplier = timeFilter === '7D' ? 0.35 : timeFilter === '30D' ? 1.0 : 2.8;

  const simulatedIncome = Math.round(store.getPeriodIncome() * periodMultiplier);
  const simulatedExpense = Math.round(store.getPeriodExpenses() * periodMultiplier);
  const liquidCash = store.getTotalLiquidCash();
  const portfolioVal = store.getPortfolioValue();

  return (
    <section id="interactive-preview" className="py-16 md:py-24 bg-slate-100/60 dark:bg-[#070D18] border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              <Layers className="h-4 w-4" />
              <span>Live Interactive Preview</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Experience the Unified Command Center
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Interact with our multi-asset architecture below. Switch between periods and financial modules to see live responsive calculations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex bg-white dark:bg-[#111C30]">
              <Shield className="h-3.5 w-3.5 mr-1 text-emerald-500" />
              Illustrative Demo Data
            </Badge>

            <Link to="/app/dashboard">
              <Button size="sm">
                Try Live App Dashboard
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Interactive Shell Container */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1726] shadow-xl overflow-hidden">
          {/* Top Control Bar: Tabs & Time Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4 gap-4 bg-slate-50/70 dark:bg-[#111C30]/50">
            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl w-full sm:w-auto">
              {(['overview', 'expenses', 'banking', 'investments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white dark:bg-[#16233B] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Time Period Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Range:</span>
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl">
                {(['7D', '30D', '90D'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFilter(period)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      timeFilter === period
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 space-y-6">
            {/* 4 Core Financial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-slate-50 dark:bg-[#111C30]/80">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Liquid Cash</span>
                  <Wallet className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  <CurrencyDisplay minor={liquidCash} />
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  3 verified accounts
                </div>
              </Card>

              <Card className="p-4 bg-slate-50 dark:bg-[#111C30]/80">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Income ({timeFilter})</span>
                  <Building2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  <CurrencyDisplay minor={simulatedIncome} />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Salary & returns
                </div>
              </Card>

              <Card className="p-4 bg-slate-50 dark:bg-[#111C30]/80">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Expenses ({timeFilter})</span>
                  <Wallet className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  <CurrencyDisplay minor={simulatedExpense} />
                </div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  Housing is top category
                </div>
              </Card>

              <Card className="p-4 bg-slate-50 dark:bg-[#111C30]/80">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>Investments</span>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  <CurrencyDisplay minor={portfolioVal} />
                </div>
                <div className="mt-1">
                  <PercentageChange valuePercent={8.97} />
                </div>
              </Card>
            </div>

            {/* Sub-views depending on active tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Simulated Chart Container (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Inflow vs Outflow Cash Trend ({timeFilter})
                      </h4>
                      <Badge variant="outline">Net Surplus</Badge>
                    </div>

                    {/* Clean SVG Area Chart Illustration */}
                    <div className="h-48 w-full flex items-end gap-3 pt-6 pb-2 px-2">
                      {[
                        { day: 'Oct 02', in: 52000, out: 12000 },
                        { day: 'Oct 05', in: 0, out: 2000 },
                        { day: 'Oct 08', in: 0, out: 800 },
                        { day: 'Oct 11', in: 0, out: 1500 },
                        { day: 'Oct 14', in: 0, out: 2000 },
                        { day: 'Oct 15', in: 0, out: 500 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full flex items-end justify-center gap-1 h-36">
                            {item.in > 0 && (
                              <div
                                className="w-1/2 bg-emerald-500/80 rounded-t-md transition-all duration-500"
                                style={{ height: `${Math.min(100, (item.in / 52000) * 100)}%` }}
                                title={`Inflow: ₹${item.in}`}
                              />
                            )}
                            <div
                              className="w-1/2 bg-amber-500/80 rounded-t-md transition-all duration-500"
                              style={{ height: `${Math.min(100, (item.out / 12000) * 80)}%` }}
                              title={`Outflow: ₹${item.out}`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">{item.day}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-600 dark:text-slate-300">Income Inflow</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-slate-600 dark:text-slate-300">Expense Outflow</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Transactions & AI Insight (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* AI Insight Card */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                      <Sparkles className="h-4 w-4" />
                      <span>EXPENZO AI Observation</span>
                    </div>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      You retained <strong>63.8%</strong> of your income this cycle. Your discretionary spending on Dining and Shopping represents only 14.8% of total outflow.
                    </p>
                  </div>

                  {/* Recent Transactions Preview */}
                  <Card className="p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Sample Transactions (Oct 2026)
                    </h4>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                      {store.transactions.slice(0, 4).map((tx) => (
                        <div key={tx.id} className="py-2.5 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                              {tx.merchant}
                            </div>
                            <div className="text-[11px] text-slate-400">{tx.category} • {tx.date}</div>
                          </div>
                          <TransactionAmount minor={tx.amountMinor} type={tx.type} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="space-y-4 animate-in fade-in-50">
                <Card className="p-5">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle>Spending by Category (October 2026)</CardTitle>
                  </CardHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'Housing & Rent', spent: 1200000, alloc: 1500000, color: 'bg-red-500' },
                      { name: 'Food & Dining', spent: 280000, alloc: 600000, color: 'bg-amber-500' },
                      { name: 'Shopping', spent: 200000, alloc: 400000, color: 'bg-pink-500' },
                      { name: 'Utilities', spent: 150000, alloc: 300000, color: 'bg-purple-500' },
                      { name: 'Transport', spent: 50000, alloc: 200000, color: 'bg-blue-500' },
                    ].map((c) => (
                      <div key={c.name} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>{c.name}</span>
                          <span><CurrencyDisplay minor={c.spent} /> / <CurrencyDisplay minor={c.alloc} /></span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${c.color}`} style={{ width: `${Math.min(100, (c.spent / c.alloc) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'banking' && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {store.accounts.map((acc) => (
                    <Card key={acc.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span className="font-semibold text-slate-900 dark:text-white">{acc.name}</span>
                        <Building2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-xl font-bold">
                        <CurrencyDisplay minor={store.getAccountBalance(acc.id)} />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {acc.institution} • {acc.accountNumberMasked}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'investments' && (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {store.holdings.map((h) => {
                    const quote = store.quotes[h.ticker];
                    const currentVal = h.quantity * (quote ? quote.currentPriceMinor : h.averageBuyPriceMinor);
                    const costVal = h.quantity * h.averageBuyPriceMinor;
                    const gainVal = currentVal - costVal;

                    return (
                      <Card key={h.id} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{h.ticker}</span>
                            <p className="text-[11px] text-slate-400">{h.companyName}</p>
                          </div>
                          <Badge variant="success">+{((gainVal / costVal) * 100).toFixed(1)}%</Badge>
                        </div>
                        <div className="flex justify-between items-end pt-1">
                          <div>
                            <span className="text-[10px] text-slate-400">Position</span>
                            <p className="text-xs font-semibold">{h.quantity} shares</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400">Valuation</span>
                            <p className="text-base font-bold text-slate-900 dark:text-white">
                              <CurrencyDisplay minor={currentVal} />
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

