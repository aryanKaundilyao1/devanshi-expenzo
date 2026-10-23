import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/Tooltip';
import { SavingsGoal } from '@/types/finance';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Landmark,
  Target,
  Info,
  ChevronRight,
} from 'lucide-react';

interface DashboardMetricGridProps {
  liquidCashMinor: number;
  incomeMinor: number;
  expenseMinor: number;
  portfolioValueMinor: number;
  totalInvestedMinor: number;
  netWorthMinor: number;
  primaryGoal: SavingsGoal | null;
  periodLabel: string;
  onOpenNetWorthModal: () => void;
}

export function DashboardMetricGrid({
  liquidCashMinor,
  incomeMinor,
  expenseMinor,
  portfolioValueMinor,
  totalInvestedMinor,
  netWorthMinor,
  primaryGoal,
  periodLabel,
  onOpenNetWorthModal,
}: DashboardMetricGridProps) {
  const navigate = useNavigate();

  // Investment return calculation
  const unrealizedGainMinor = portfolioValueMinor - totalInvestedMinor;
  const unrealizedPercent =
    totalInvestedMinor > 0
      ? Math.round((unrealizedGainMinor / totalInvestedMinor) * 1000) / 10
      : 0;

  // Primary goal progress
  const goalProgressPercent =
    primaryGoal && primaryGoal.targetAmountMinor > 0
      ? Math.min(100, Math.round((primaryGoal.currentAmountMinor / primaryGoal.targetAmountMinor) * 100))
      : 0;

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Available Cash */}
        <Card
          onClick={() => navigate('/app/banking')}
          className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span>Available Cash</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Sum of balances across savings, checking, and cash wallets (excludes credit limits).
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                <CurrencyDisplay amountMinor={liquidCashMinor} />
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>Liquid Bank Balances</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Manage Accounts <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </Card>

        {/* 2. Monthly Income */}
        <Card
          onClick={() => navigate('/app/transactions?type=income')}
          className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span>Total Income</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </TooltipTrigger>
                  <TooltipContent>
                    External income received during {periodLabel} (transfers excluded).
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                <CurrencyDisplay amountMinor={incomeMinor} />
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="truncate">{periodLabel} Inflow</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              View Inflow <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </Card>

        {/* 3. Monthly Expenses */}
        <Card
          onClick={() => navigate('/app/expenses')}
          className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span>Total Expenses</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </TooltipTrigger>
                  <TooltipContent>
                    External expenses spent during {periodLabel} (transfers excluded).
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums tracking-tight">
                <CurrencyDisplay amountMinor={expenseMinor} />
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="truncate">{periodLabel} Outflow</span>
            <span className="flex items-center text-rose-600 dark:text-rose-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Analyze Outflow <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </Card>

        {/* 4. Portfolio Value */}
        <Card
          onClick={() => navigate('/app/investments')}
          className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span>Portfolio Value</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Current marked valuation of equities and mutual funds based on demo quote fixtures.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                <CurrencyDisplay amountMinor={portfolioValueMinor} />
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className={`font-semibold ${unrealizedGainMinor >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
              {unrealizedGainMinor >= 0 ? '+' : ''}{unrealizedPercent}% ({unrealizedGainMinor >= 0 ? '+' : ''}<CurrencyDisplay amountMinor={unrealizedGainMinor} />)
            </span>
            <span className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Holdings <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </Card>

        {/* 5. Net Worth */}
        <Card
          onClick={onOpenNetWorthModal}
          className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span>Estimated Net Worth</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Liquid Cash + Portfolio Value − Credit Liabilities (Click for full breakdown).
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                <CurrencyDisplay amountMinor={netWorthMinor} />
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>Cash + Investments</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Audit Formula <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </Card>

        {/* 6. Savings Goal Progress */}
        <Card
          onClick={() => navigate('/app/financial-planner')}
          className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className="truncate">{primaryGoal ? primaryGoal.title : 'Primary Savings Goal'}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Target savings milestone funded via internal cash sweeps.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {primaryGoal ? (
                  <CurrencyDisplay amountMinor={primaryGoal.currentAmountMinor} />
                ) : (
                  '₹0'
                )}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span>
              {primaryGoal ? `${goalProgressPercent}% of ₹${(primaryGoal.targetAmountMinor / 100).toLocaleString('en-IN')}` : 'No active goal'}
            </span>
            <span className="flex items-center text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Planner <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
