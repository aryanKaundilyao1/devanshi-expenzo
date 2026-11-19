import React, { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardMetricGrid } from '../components/DashboardMetricGrid';
import { PeriodFilterChips } from '../components/PeriodFilterChips';
import { IncomeExpenseChart } from '../components/IncomeExpenseChart';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { RecentTransactions } from '../components/RecentTransactions';
import { BudgetOverview } from '../components/BudgetOverview';
import { PortfolioSnapshot } from '../components/PortfolioSnapshot';
import { SavingsGoalWidget } from '../components/SavingsGoalWidget';
import { UpcomingBills } from '../components/UpcomingBills';
import { AIInsightsPreview } from '../components/AIInsightsPreview';
import { NetWorthBreakdownModal } from '../components/NetWorthBreakdownModal';
import { TransactionModal } from '../components/TransactionModal';
import { DashboardCustomizeDialog } from '../components/DashboardCustomizeDialog';
import { ExpenditureHoldingsSection } from '../components/ExpenditureHoldingsSection';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Sparkles, AlertCircle, Database, Play, CheckCircle2 } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';

export function DashboardPage() {
  const {
    period,
    setPeriod,
    dateRange,
    demoAsOf,
    activeUser,
    preferences,
    // Metrics
    liquidCashMinor,
    portfolioValueMinor,
    totalInvestedMinor,
    netWorthMinor,
    incomeMinor,
    expenseMinor,
    // Datasets
    chartSeries,
    categorySpend,
    budgetStatus,
    insights,
    recentTransactions,
    primaryGoal,
    upcomingBills,
    isEmptyWorkspace,
    accounts,
    transactions,
    categories,
    holdings,
    quotes,
    // Customization
    widgetVisibility,
    toggleWidget,
    resetWidgets,
  } = useDashboardData();

  // Modals
  const [netWorthModalOpen, setNetWorthModalOpen] = useState(false);
  const [addTxModalOpen, setAddTxModalOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const { isDatasetActive, runDataset } = useFinanceStore();

  const persona = activeUser.persona || 'professional';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50">
      {/* SECTION A: Welcome Header */}
      <DashboardHeader
        user={activeUser}
        asOfDate={demoAsOf}
        onOpenAddTransaction={() => setAddTxModalOpen(true)}
        onOpenCustomize={() => setCustomizeModalOpen(true)}
      />

      {/* SECTION A1: Dataset Status Banner */}
      {!isDatasetActive ? (
        <Card className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-800 dark:text-slate-200 shadow-sm animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>Null Data Mode Active</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Empty State
                </span>
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                The workspace is currently unpopulated (0 transactions). Click <strong>Run Dataset</strong> to ingest 1,648 external transactions, 19 card accounts, and 4 family members from the external dataset.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => runDataset()}
            className="text-xs shrink-0 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Run Dataset Now</span>
          </Button>
        </Card>
      ) : (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">
              <strong>External Dataset Active:</strong> 1,648 real credit card transactions loaded across 19 accounts.
            </span>
          </div>
          <span className="text-[11px] opacity-75 hidden sm:inline font-mono">Source: data/external/archive/</span>
        </div>
      )}

      {/* Empty Workspace Banner Notice if applicable */}
      {isEmptyWorkspace && (
        <Card className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Clean Slate Workspace Active:</strong> You started with an empty demonstration environment. Use <em>Add Transaction</em> to record your initial deposits and expenses.
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setAddTxModalOpen(true)}
            className="text-xs shrink-0 gap-1.5 shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Record Initial Deposit</span>
          </Button>
        </Card>
      )}

      {/* SECTION B: Financial KPI Cards */}
      <DashboardMetricGrid
        liquidCashMinor={liquidCashMinor}
        incomeMinor={incomeMinor}
        expenseMinor={expenseMinor}
        portfolioValueMinor={portfolioValueMinor}
        totalInvestedMinor={totalInvestedMinor}
        netWorthMinor={netWorthMinor}
        primaryGoal={primaryGoal}
        periodLabel={dateRange.label}
        onOpenNetWorthModal={() => setNetWorthModalOpen(true)}
      />

      {/* SECTION C: Financial Period Filters */}
      <PeriodFilterChips
        currentPeriod={period}
        onSelectPeriod={setPeriod}
        dateRange={dateRange}
      />

      {/* PERSONA-ADAPTIVE CONTENT GRID */}
      {/* 1. Investor Persona Priority: Investments & Net Worth first */}
      {persona === 'investor' && (
        <div className="space-y-6">
          {widgetVisibility.showInvestments && (
            <PortfolioSnapshot
              holdings={holdings}
              quotes={quotes}
              portfolioValueMinor={portfolioValueMinor}
              totalInvestedMinor={totalInvestedMinor}
            />
          )}

          {widgetVisibility.showAIInsights && <AIInsightsPreview insights={insights} />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {widgetVisibility.showChart && (
                <IncomeExpenseChart
                  data={chartSeries}
                  periodLabel={dateRange.label}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}
              {widgetVisibility.showRecentTransactions && (
                <RecentTransactions
                  transactions={recentTransactions}
                  accounts={accounts}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}
            </div>

            <div className="space-y-6">
              {widgetVisibility.showCategoryBreakdown && (
                <CategoryBreakdown categories={categorySpend} periodLabel={dateRange.label} />
              )}
              {widgetVisibility.showBudgets && (
                <BudgetOverview budgets={budgetStatus} periodLabel={dateRange.label} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Student Persona Priority: Budgets & Goals first */}
      {persona === 'student' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {widgetVisibility.showBudgets && (
              <BudgetOverview budgets={budgetStatus} periodLabel={dateRange.label} />
            )}
            {widgetVisibility.showGoals && <SavingsGoalWidget goal={primaryGoal} />}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {widgetVisibility.showChart && (
                <IncomeExpenseChart
                  data={chartSeries}
                  periodLabel={dateRange.label}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}
              {widgetVisibility.showRecentTransactions && (
                <RecentTransactions
                  transactions={recentTransactions}
                  accounts={accounts}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}
            </div>

            <div className="space-y-6">
              {widgetVisibility.showCategoryBreakdown && (
                <CategoryBreakdown categories={categorySpend} periodLabel={dateRange.label} />
              )}
              {widgetVisibility.showAIInsights && <AIInsightsPreview insights={insights} />}
            </div>
          </div>
        </div>
      )}

      {/* 3. Family Persona Priority: Budgets, Recurring Bills & Goals */}
      {persona === 'family' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {widgetVisibility.showBudgets && (
              <BudgetOverview budgets={budgetStatus} periodLabel={dateRange.label} />
            )}
            {widgetVisibility.showBills && <UpcomingBills bills={upcomingBills} />}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {widgetVisibility.showChart && (
                <IncomeExpenseChart
                  data={chartSeries}
                  periodLabel={dateRange.label}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}
              {widgetVisibility.showRecentTransactions && (
                <RecentTransactions
                  transactions={recentTransactions}
                  accounts={accounts}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}
            </div>

            <div className="space-y-6">
              {widgetVisibility.showCategoryBreakdown && (
                <CategoryBreakdown categories={categorySpend} periodLabel={dateRange.label} />
              )}
              {widgetVisibility.showGoals && <SavingsGoalWidget goal={primaryGoal} />}
            </div>
          </div>
        </div>
      )}

      {/* 4. Older Adult Persona Priority: High-contrast clear summaries, bills & balances */}
      {persona === 'senior' && (
        <div className="space-y-6 text-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {widgetVisibility.showBills && <UpcomingBills bills={upcomingBills} />}
            {widgetVisibility.showBudgets && (
              <BudgetOverview budgets={budgetStatus} periodLabel={dateRange.label} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {widgetVisibility.showRecentTransactions && (
                <RecentTransactions
                  transactions={recentTransactions}
                  accounts={accounts}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}
              {widgetVisibility.showChart && (
                <IncomeExpenseChart
                  data={chartSeries}
                  periodLabel={dateRange.label}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}
            </div>

            <div className="space-y-6">
              {widgetVisibility.showCategoryBreakdown && (
                <CategoryBreakdown categories={categorySpend} periodLabel={dateRange.label} />
              )}
              {widgetVisibility.showAIInsights && <AIInsightsPreview insights={insights} />}
            </div>
          </div>
        </div>
      )}

      {/* 5. Working Professional (Default): Standard balanced fintech command center */}
      {persona !== 'investor' && persona !== 'student' && persona !== 'family' && persona !== 'senior' && (
        <div className="space-y-6">
          {/* Main Primary Row: 2 Col Chart + 1 Col Category Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {widgetVisibility.showChart && (
                <IncomeExpenseChart
                  data={chartSeries}
                  periodLabel={dateRange.label}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}
            </div>

            <div>
              {widgetVisibility.showCategoryBreakdown && (
                <CategoryBreakdown categories={categorySpend} periodLabel={dateRange.label} />
              )}
            </div>
          </div>

          {/* Secondary Row: Recent Transactions (2 cols) + Budget & Bills (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {widgetVisibility.showRecentTransactions && (
                <RecentTransactions
                  transactions={recentTransactions}
                  accounts={accounts}
                  onAddTransaction={() => setAddTxModalOpen(true)}
                />
              )}

              {widgetVisibility.showAIInsights && <AIInsightsPreview insights={insights} />}
            </div>

            <div className="space-y-6">
              {widgetVisibility.showBudgets && (
                <BudgetOverview budgets={budgetStatus} periodLabel={dateRange.label} />
              )}

              {widgetVisibility.showInvestments && (
                <PortfolioSnapshot
                  holdings={holdings}
                  quotes={quotes}
                  portfolioValueMinor={portfolioValueMinor}
                  totalInvestedMinor={totalInvestedMinor}
                />
              )}

              {widgetVisibility.showBills && <UpcomingBills bills={upcomingBills} />}

              {widgetVisibility.showGoals && <SavingsGoalWidget goal={primaryGoal} />}
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: Expenditure & Holdings Analytics */}
      <ExpenditureHoldingsSection
        accounts={accounts}
        holdings={holdings}
        quotes={quotes}
        transactions={transactions}
        demoAsOf={demoAsOf}
      />

      {/* MODALS */}
      <NetWorthBreakdownModal
        open={netWorthModalOpen}
        onOpenChange={setNetWorthModalOpen}
        liquidCashMinor={liquidCashMinor}
        portfolioValueMinor={portfolioValueMinor}
        netWorthMinor={netWorthMinor}
      />

      <TransactionModal
        open={addTxModalOpen}
        onOpenChange={setAddTxModalOpen}
        accounts={accounts}
        categories={categories}
        defaultDate={demoAsOf}
      />

      <DashboardCustomizeDialog
        open={customizeModalOpen}
        onOpenChange={setCustomizeModalOpen}
        visibility={widgetVisibility}
        onToggleWidget={toggleWidget}
        onResetWidgets={resetWidgets}
      />
    </div>
  );
}
