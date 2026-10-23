import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, CheckCircle2, Wallet, Building2, TrendingUp, Sparkles } from 'lucide-react';

export function FeatureShowcaseSection() {
  return (
    <section className="py-20 md:py-28 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Feature A: Expense Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <Badge variant="success">Pillar 1 • Expense Management</Badge>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Know Exactly Where Your Money Goes.
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Gain granular control over every rupee. Categorize expenses automatically, monitor budget thresholds in real time, and audit your complete financial history through a single canonical ledger.
          </p>
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Multi-category budget tracking with 80% and 100% threshold alerts</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Natural-language expense parser: type what you spent in plain English</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>CSV and periodic ledger export with zero hidden calculations</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link to="/features#expenses">
              <Button variant="outline">
                Explore Expense Tracking
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-500">Live Category Progress</span>
              <span className="text-xs font-semibold text-emerald-600">46.7% Overall Spent</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span>Food & Dining</span>
                  <span>₹2,800 / ₹6,000 (46%)</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[46%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span>Housing & Rent (Warning)</span>
                  <span className="text-amber-600">₹12,000 / ₹15,000 (80%)</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[80%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span>Shopping</span>
                  <span>₹2,000 / ₹4,000 (50%)</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[50%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature B: Banking Overview (Reversed layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-500">Connected Demo Institutions</span>
              <Badge variant="success">All Reconciled</Badge>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    HDFC
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Everyday Savings</h5>
                    <p className="text-[11px] text-slate-400">•••• 4892</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums">₹50,000</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                    SBI
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Goals Savings</h5>
                    <p className="text-[11px] text-slate-400">•••• 8104</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums">₹25,200</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                    CASH
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Physical Wallet</h5>
                    <p className="text-[11px] text-slate-400">Cash in Hand</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums">₹2,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
          <Badge variant="info">Pillar 2 • Account Aggregation</Badge>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your Accounts, Organized in One Place.
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Eliminate app hopping between bank portals. View checking, savings, and wallet balances in a unified dashboard, simulate atomic transfers between accounts, and download clean audit statements.
          </p>
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Transfers between owned accounts debit and credit atomically without double counting</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Clear delineation between demonstration sandboxes and future authorized bank connectors</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link to="/banking-info">
              <Button variant="outline">
                Explore Banking
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature C: Investments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <Badge variant="warning">Pillar 3 • Wealth & Stocks</Badge>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Understand Your Portfolio.
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Track equities, ETFs, and mutual funds alongside your everyday cash. Analyze asset allocation, examine historical price charts, and evaluate risk concentrations with transparent formulas.
          </p>
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Real-time illustrative valuation for Indian equities (TCS, INFY, HDFC Bank)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Separate tracking for cost basis, current market price, and unrealized return</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link to="/investments-info">
              <Button variant="outline">
                Explore Investments
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-500">Portfolio Breakdown</span>
              <span className="text-xs font-bold text-emerald-600">+₹3,500 (+8.97%)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] text-slate-400">Total Invested</span>
                <p className="text-base font-bold tabular-nums">₹39,000</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] text-slate-400">Current Valuation</span>
                <p className="text-base font-bold tabular-nums">₹42,500</p>
              </div>
            </div>
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Asset Allocation</span>
                <span>Equity: 100%</span>
              </div>
              <div className="h-2 bg-emerald-500 rounded-full" />
              <p className="text-[10px] text-slate-400">Tech sector concentration: 100% (TCS & INFY)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature D: EXPENZO AI (Reversed layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Explainable Diagnostic Cards
              </span>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/40 text-xs">
                <p className="font-semibold text-emerald-950 dark:text-emerald-200">High Savings Rate Observation</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  October income surplus is ₹33,200. You are tracking 14 days ahead on your MacBook savings goal.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/40 text-xs">
                <p className="font-semibold text-amber-950 dark:text-amber-200">Budget Warning: Housing</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  ₹12,000 rent payment has reached 80% threshold of your allocated ₹15,000 category limit.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
          <Badge variant="default">Pillar 4 • Financial Intelligence</Badge>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Clarity, Powered by Intelligence.
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            EXPENZO turns complex financial spreadsheets into clear, transparent English explanations. Get deterministic answers to questions about your spending, savings rates, and upcoming bills with zero external API costs.
          </p>
          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>100% deterministic rules engine — zero data sent to external LLMs</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Structured financial response bubbles with micro-charts and direct deep-links</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link to="/ai">
              <Button variant="outline">
                Explore EXPENZO AI
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

