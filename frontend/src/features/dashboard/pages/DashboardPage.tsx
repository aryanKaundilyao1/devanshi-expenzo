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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Sparkles, AlertCircle } from 'lucide-react';

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
