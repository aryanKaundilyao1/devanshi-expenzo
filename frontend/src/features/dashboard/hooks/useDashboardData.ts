import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  DashboardPeriod,
  getPeriodDateRange,
  getDailyIncomeExpenseSeries,
  getCategorySpendingBreakdown,
  getBudgetUtilizationList,
  getDeterministicInsights,
  SEED_UPCOMING_BILLS,
} from '../utils/dashboardSelectors';
import {
  calculateTotalLiquidCash,
  calculatePeriodIncome,
  calculatePeriodExpenses,
  calculatePortfolioValue,
  calculateTotalInvested,
  calculateNetWorth,
} from '@/domain/calculations/accounting';

export interface DashboardWidgetVisibility {
  showChart: boolean;
  showCategoryBreakdown: boolean;
  showRecentTransactions: boolean;
  showBudgets: boolean;
  showInvestments: boolean;
  showGoals: boolean;
  showBills: boolean;
  showAIInsights: boolean;
}

const DEFAULT_WIDGET_VISIBILITY: DashboardWidgetVisibility = {
  showChart: true,
  showCategoryBreakdown: true,
  showRecentTransactions: true,
  showBudgets: true,
  showInvestments: true,
  showGoals: true,
  showBills: true,
  showAIInsights: true,
};

const WIDGET_STORAGE_KEY = 'expenzo-dashboard-widgets:v1';

export function useDashboardData() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');

  // Widget visibility customization state with localStorage persistence
  const [widgetVisibility, setWidgetVisibility] = useState<DashboardWidgetVisibility>(() => {
    if (typeof window === 'undefined') return DEFAULT_WIDGET_VISIBILITY;
    try {
      const stored = localStorage.getItem(WIDGET_STORAGE_KEY);
      return stored ? { ...DEFAULT_WIDGET_VISIBILITY, ...JSON.parse(stored) } : DEFAULT_WIDGET_VISIBILITY;
    } catch {
      return DEFAULT_WIDGET_VISIBILITY;
    }
  });

  const toggleWidget = (key: keyof DashboardWidgetVisibility) => {
    setWidgetVisibility((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not persist widget visibility', e);
      }
      return next;
    });
  };

  const resetWidgets = () => {
    setWidgetVisibility(DEFAULT_WIDGET_VISIBILITY);
    try {
      localStorage.removeItem(WIDGET_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not reset widget visibility', e);
    }
  };

  const {
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    holdings,
    quotes,
    demoAsOf,
    user: financeUser,
  } = useFinanceStore();

  const { user: authUser, preferences } = useAuthStore();
  const activeUser = authUser || financeUser;

  // Derive date range based on period
  const dateRange = useMemo(() => getPeriodDateRange(period, demoAsOf), [period, demoAsOf]);

  // Point-in-time measurements (do NOT fluctuate based on spending filter)
  const liquidCashMinor = useMemo(
    () => calculateTotalLiquidCash(accounts, transactions),
    [accounts, transactions]
  );

  const portfolioValueMinor = useMemo(
    () => calculatePortfolioValue(holdings, quotes),
    [holdings, quotes]
  );

  const totalInvestedMinor = useMemo(
    () => calculateTotalInvested(holdings),
    [holdings]
  );

  const netWorthMinor = useMemo(
    () => calculateNetWorth(accounts, transactions, holdings, quotes),
    [accounts, transactions, holdings, quotes]
  );

  // Period-dependent spending & income metrics
  const incomeMinor = useMemo(
    () => calculatePeriodIncome(transactions, dateRange.startDate, dateRange.endDate),
    [transactions, dateRange.startDate, dateRange.endDate]
  );

  const expenseMinor = useMemo(
    () => calculatePeriodExpenses(transactions, dateRange.startDate, dateRange.endDate),
    [transactions, dateRange.startDate, dateRange.endDate]
  );

  // Chart data
  const chartSeries = useMemo(
    () => getDailyIncomeExpenseSeries(transactions, dateRange.startDate, dateRange.endDate),
    [transactions, dateRange.startDate, dateRange.endDate]
  );

  // Category breakdown
  const categorySpend = useMemo(
    () => getCategorySpendingBreakdown(transactions, dateRange.startDate, dateRange.endDate, categories),
    [transactions, dateRange.startDate, dateRange.endDate, categories]
  );

  // Budgets utilization
  const budgetStatus = useMemo(
    () => getBudgetUtilizationList(budgets, transactions, dateRange.startDate, dateRange.endDate),
    [budgets, transactions, dateRange.startDate, dateRange.endDate]
  );

  // Deterministic insights
  const insights = useMemo(
    () =>
      getDeterministicInsights(
        transactions,
        budgets,
        holdings,
        quotes,
        dateRange.startDate,
        dateRange.endDate
      ),
    [transactions, budgets, holdings, quotes, dateRange.startDate, dateRange.endDate]
  );

  // Recent transactions (last 6 completed)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [transactions]);

  // Primary savings goal
  const primaryGoal = useMemo(() => goals[0] || null, [goals]);

  // Upcoming bills
  const upcomingBills = useMemo(() => {
    // If empty workspace, don't show seed bills
    if (accounts.length === 0 && transactions.length === 0) return [];
    return SEED_UPCOMING_BILLS;
  }, [accounts.length, transactions.length]);

  const isEmptyWorkspace = accounts.length === 0 && transactions.length === 0;

  return {
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
  };
}
