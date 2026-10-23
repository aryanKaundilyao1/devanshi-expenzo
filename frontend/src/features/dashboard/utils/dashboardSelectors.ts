import { Transaction, Category, Budget, FinancialAccount, InvestmentHolding, StockQuote, UpcomingBill, FinancialInsight } from '@/types/finance';
import {
  calculateAccountBalance,
  calculateTotalLiquidCash,
  calculatePeriodIncome,
  calculatePeriodExpenses,
  calculateCategorySpent,
  calculatePortfolioValue,
  calculateTotalInvested,
  calculateNetWorth,
} from '@/domain/calculations/accounting';
import { DEMO_AS_OF } from '@/services/fixtures/seedData';

export type DashboardPeriod = '7d' | '30d' | '90d' | '1y';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
}

/**
 * Calculates deterministic start and end dates relative to the demo clock (2026-10-15).
 */
export function getPeriodDateRange(period: DashboardPeriod, asOf: string = DEMO_AS_OF): DateRange {
  const asOfDate = new Date(`${asOf}T00:00:00Z`);

  let daysBack = 30;
  let label = 'Last 30 Days';

  switch (period) {
    case '7d':
      daysBack = 7;
      label = 'Last 7 Days';
      break;
    case '30d':
      daysBack = 30;
      label = 'Last 30 Days';
      break;
    case '90d':
      daysBack = 90;
      label = 'Last 90 Days';
      break;
    case '1y':
      daysBack = 365;
      label = 'Past 1 Year';
      break;
  }

  const startDateObj = new Date(asOfDate);
  startDateObj.setUTCDate(startDateObj.getUTCDate() - (daysBack - 1));

  const startDate = startDateObj.toISOString().slice(0, 10);
  const endDate = asOf;

  return { startDate, endDate, label };
}

export interface DailyChartPoint {
  date: string;
  displayDate: string;
  incomeRupees: number;
  expenseRupees: number;
}

/**
 * Groups income and expense transactions chronologically for the Recharts trend chart.
 */
export function getDailyIncomeExpenseSeries(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): DailyChartPoint[] {
  const relevantTx = transactions.filter(
    (tx) => tx.status === 'completed' && tx.date >= startDate && tx.date <= endDate
  );

  // Group by date
  const dateMap: Record<string, { incomeMinor: number; expenseMinor: number }> = {};

  // Find all distinct dates with activity + ensure start and end are anchored
  relevantTx.forEach((tx) => {
    if (!dateMap[tx.date]) {
      dateMap[tx.date] = { incomeMinor: 0, expenseMinor: 0 };
    }
    if (tx.type === 'income') {
      dateMap[tx.date].incomeMinor += tx.amountMinor;
    } else if (tx.type === 'expense') {
      dateMap[tx.date].expenseMinor += tx.amountMinor;
    }
  });

  // Ensure default anchor points if sparse
  if (Object.keys(dateMap).length === 0) {
    return [];
  }

  const sortedDates = Object.keys(dateMap).sort();

  return sortedDates.map((dateStr) => {
    const d = new Date(`${dateStr}T00:00:00Z`);
    const displayDate = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });

    return {
      date: dateStr,
      displayDate,
      incomeRupees: dateMap[dateStr].incomeMinor / 100,
      expenseRupees: dateMap[dateStr].expenseMinor / 100,
    };
  });
}

export interface CategorySpendShare {
  category: string;
  totalMinor: number;
  totalRupees: number;
  percentage: number;
  color: string;
  txCount: number;
}

const CATEGORY_PALETTE: Record<string, string> = {
  'Housing & Rent': '#EF4444',
  'Food & Dining': '#F59E0B',
  Shopping: '#EC4899',
  Utilities: '#8B5CF6',
  Transport: '#3B82F6',
  Investments: '#10B981',
  Healthcare: '#06B6D4',
  Entertainment: '#F97316',
};

const FALLBACK_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

/**
 * Calculates category-level spending breakdown for donut charts and ranked tables.
 */
export function getCategorySpendingBreakdown(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
  categories: Category[] = []
): CategorySpendShare[] {
  const expenseTxs = transactions.filter(
    (tx) =>
      tx.type === 'expense' &&
      tx.status === 'completed' &&
      tx.date >= startDate &&
      tx.date <= endDate
  );

  const totalExpenseMinor = expenseTxs.reduce((sum, tx) => sum + tx.amountMinor, 0);

  if (totalExpenseMinor === 0) {
    return [];
  }

  const catMap: Record<string, { totalMinor: number; count: number }> = {};

  expenseTxs.forEach((tx) => {
    if (!catMap[tx.category]) {
      catMap[tx.category] = { totalMinor: 0, count: 0 };
    }
    catMap[tx.category].totalMinor += tx.amountMinor;
    catMap[tx.category].count += 1;
  });

  const categoryColorLookup: Record<string, string> = {};
  categories.forEach((cat) => {
    categoryColorLookup[cat.name] = cat.color;
  });

  return Object.keys(catMap)
    .map((catName, index) => {
      const data = catMap[catName];
      const percentage = Math.round((data.totalMinor / totalExpenseMinor) * 1000) / 10;
      const color =
        categoryColorLookup[catName] ||
        CATEGORY_PALETTE[catName] ||
        FALLBACK_COLORS[index % FALLBACK_COLORS.length];

      return {
        category: catName,
        totalMinor: data.totalMinor,
        totalRupees: data.totalMinor / 100,
        percentage,
        color,
        txCount: data.count,
      };
    })
    .sort((a, b) => b.totalMinor - a.totalMinor);
}

export interface BudgetUtilizationItem {
  id: string;
  category: string;
  allocatedMinor: number;
  spentMinor: number;
  remainingMinor: number;
  percentageUsed: number;
  status: 'healthy' | 'warning' | 'exceeded';
}

/**
 * Computes live budget utilization from the transactions ledger.
 */
export function getBudgetUtilizationList(
  budgets: Budget[],
  transactions: Transaction[],
  startDate: string,
  endDate: string
): BudgetUtilizationItem[] {
  return budgets.map((b) => {
    const spentMinor = calculateCategorySpent(b.category, transactions, startDate, endDate);
    const remainingMinor = Math.max(0, b.allocatedMinor - spentMinor);
    const percentageUsed = b.allocatedMinor > 0 ? Math.round((spentMinor / b.allocatedMinor) * 100) : 0;

    let status: 'healthy' | 'warning' | 'exceeded' = 'healthy';
    if (percentageUsed >= 100) {
      status = 'exceeded';
    } else if (percentageUsed >= b.alertThresholdPercent) {
      status = 'warning';
    }

    return {
      id: b.id,
      category: b.category,
      allocatedMinor: b.allocatedMinor,
      spentMinor,
      remainingMinor,
      percentageUsed,
      status,
    };
  });
}

export const SEED_UPCOMING_BILLS: UpcomingBill[] = [
  {
    id: 'bill_01',
    title: 'Airtel Broadband & Wi-Fi',
    amountMinor: 100000, // ₹1,000
    dueDate: '2026-10-18',
    accountName: 'Everyday Savings',
    category: 'Utilities',
    status: 'upcoming',
    isAutoDebit: true,
  },
  {
    id: 'bill_02',
    title: 'Cult.fit Gym & Fitness Pass',
    amountMinor: 150000, // ₹1,500
    dueDate: '2026-10-22',
    accountName: 'Everyday Savings',
    category: 'Health & Fitness',
    status: 'upcoming',
    isAutoDebit: false,
  },
  {
    id: 'bill_03',
    title: 'HDFC Life Term Insurance',
    amountMinor: 240000, // ₹2,400
    dueDate: '2026-10-28',
    accountName: 'Everyday Savings',
    category: 'Insurance',
    status: 'upcoming',
    isAutoDebit: true,
  },
  {
    id: 'bill_04',
    title: 'UTI Nifty 50 Index Fund SIP',
    amountMinor: 500000, // ₹5,000
    dueDate: '2026-11-01',
    accountName: 'Goals Savings',
    category: 'Investments',
    status: 'upcoming',
    isAutoDebit: true,
  },
];

/**
 * Generates deterministic rule-based AI financial insights grounded in current ledger numbers.
 */
export function getDeterministicInsights(
  transactions: Transaction[],
  budgets: Budget[],
  holdings: InvestmentHolding[],
  quotes: Record<string, StockQuote>,
  startDate: string,
  endDate: string
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  const incomeMinor = calculatePeriodIncome(transactions, startDate, endDate);
  const expenseMinor = calculatePeriodExpenses(transactions, startDate, endDate);
  const categories = getCategorySpendingBreakdown(transactions, startDate, endDate);
  const budgetStatus = getBudgetUtilizationList(budgets, transactions, startDate, endDate);

  // 1. Spending Concentration / Top Category Insight
  if (categories.length > 0) {
    const top = categories[0];
    insights.push({
      id: 'ins_top_spend',
      title: `Top Outflow: ${top.category}`,
      description: `${top.category} represents ${top.percentage}% of your expenses (₹${(
        top.totalMinor / 100
      ).toLocaleString('en-IN')}) for the selected period.`,
      category: 'spending',
      severity: top.percentage > 50 ? 'warning' : 'info',
      metricFigures: [
        { label: 'Category Outflow', value: `₹${(top.totalMinor / 100).toLocaleString('en-IN')}` },
        { label: 'Share of Total', value: `${top.percentage}%` },
      ],
      suggestedAction: {
        label: 'View Category Ledger',
        actionRoute: `/app/transactions?category=${encodeURIComponent(top.category)}`,
      },
      generatedAt: '2026-10-15T08:00:00Z',
    });
  }

  // 2. Budget Alert Insight
  const alertBudget = budgetStatus.find((b) => b.status === 'exceeded' || b.status === 'warning');
  if (alertBudget) {
    insights.push({
      id: 'ins_budget_alert',
      title: `${alertBudget.category} at ${alertBudget.percentageUsed}% of Limit`,
      description: `Spent ₹${(alertBudget.spentMinor / 100).toLocaleString('en-IN')} of your allocated ₹${(
        alertBudget.allocatedMinor / 100
      ).toLocaleString('en-IN')} threshold.`,
      category: 'budget',
      severity: alertBudget.status === 'exceeded' ? 'critical' : 'warning',
      metricFigures: [
        { label: 'Spent', value: `₹${(alertBudget.spentMinor / 100).toLocaleString('en-IN')}` },
        { label: 'Remaining', value: `₹${(alertBudget.remainingMinor / 100).toLocaleString('en-IN')}` },
      ],
      suggestedAction: {
        label: 'Manage Budget Limit',
        actionRoute: '/app/budgets',
      },
      generatedAt: '2026-10-15T08:00:00Z',
    });
  }

  // 3. Savings Rate / Cash Flow Insight
  if (incomeMinor > 0) {
    const netSavingsMinor = incomeMinor - expenseMinor;
    const savingsRate = Math.round((netSavingsMinor / incomeMinor) * 1000) / 10;

    insights.push({
      id: 'ins_savings_rate',
      title: `${savingsRate >= 20 ? 'Strong' : 'Moderate'} Savings Rate: ${savingsRate}%`,
      description: `You have retained ₹${(netSavingsMinor / 100).toLocaleString(
        'en-IN'
      )} of your income across the active period.`,
      category: 'savings',
      severity: savingsRate >= 20 ? 'positive' : 'info',
      metricFigures: [
        { label: 'Period Inflow', value: `₹${(incomeMinor / 100).toLocaleString('en-IN')}` },
        { label: 'Period Outflow', value: `₹${(expenseMinor / 100).toLocaleString('en-IN')}` },
      ],
      suggestedAction: {
        label: 'Allocate to Savings Goal',
        actionRoute: '/app/financial-planner',
      },
      generatedAt: '2026-10-15T08:00:00Z',
    });
  } else if (holdings.length > 0) {
    // Fallback: Portfolio Insight
    const currentVal = calculatePortfolioValue(holdings, quotes);
    const invested = calculateTotalInvested(holdings);
    const gainMinor = currentVal - invested;
    const gainPercent = invested > 0 ? Math.round((gainMinor / invested) * 1000) / 10 : 0;

    insights.push({
      id: 'ins_portfolio_alpha',
      title: `Portfolio Unrealized Gain: +${gainPercent}%`,
      description: `Current market valuation of ₹${(currentVal / 100).toLocaleString(
        'en-IN'
      )} reflects an unrealized gain of +₹${(gainMinor / 100).toLocaleString('en-IN')}.`,
      category: 'investment',
      severity: gainMinor >= 0 ? 'positive' : 'warning',
      metricFigures: [
        { label: 'Market Valuation', value: `₹${(currentVal / 100).toLocaleString('en-IN')}` },
        { label: 'Unrealized P&L', value: `+₹${(gainMinor / 100).toLocaleString('en-IN')}` },
      ],
      suggestedAction: {
        label: 'Inspect Holdings',
        actionRoute: '/app/investments',
      },
      generatedAt: '2026-10-15T08:00:00Z',
    });
  }

  return insights;
}

