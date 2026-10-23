import { Transaction, Budget, Category } from '@/types/finance';

export interface ExpenseSummaryMetrics {
  totalExpenseMinor: number;
  totalIncomeMinor: number;
  netCashFlowMinor: number;
  avgDailySpendMinor: number;
  largestExpense: Transaction | null;
  highestCategory: { name: string; amountMinor: number; percentage: number } | null;
  transactionCount: number;
}

export interface DailySpendTrendItem {
  date: string;
  formattedDate: string;
  amountMinor: number;
}

export interface MerchantSpendItem {
  merchant: string;
  amountMinor: number;
  count: number;
  percentage: number;
}

export interface CategorySpendSummary {
  id: string;
  name: string;
  color: string;
  amountMinor: number;
  count: number;
  percentage: number;
}

export interface ExpenseInsightItem {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'positive' | 'warning' | 'critical';
  metricFigure?: string;
  ruleId: string;
  actionRoute: string;
  actionLabel: string;
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: '7D' | '30D' | '90D' | '1Y' | 'ALL',
  referenceDate = '2026-10-15'
): Transaction[] {
  if (period === 'ALL') return transactions;

  const ref = new Date(referenceDate);
  const cutoff = new Date(referenceDate);

  if (period === '7D') {
    cutoff.setDate(ref.getDate() - 6);
  } else if (period === '30D') {
    cutoff.setDate(ref.getDate() - 29);
  } else if (period === '90D') {
    cutoff.setDate(ref.getDate() - 89);
  } else if (period === '1Y') {
    cutoff.setDate(ref.getDate() - 364);
  }

  const cutoffStr = cutoff.toISOString().split('T')[0];

  return transactions.filter((tx) => tx.date >= cutoffStr && tx.date <= referenceDate);
}

export function calculateExpenseSummary(
  transactions: Transaction[],
  periodDays = 30
): ExpenseSummaryMetrics {
  let totalExpenseMinor = 0;
  let totalIncomeMinor = 0;
  let largestExpense: Transaction | null = null;
  const categoryTotals: Record<string, number> = {};

  let expenseCount = 0;

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      totalExpenseMinor += tx.amountMinor;
      expenseCount++;
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amountMinor;

      if (!largestExpense || tx.amountMinor > largestExpense.amountMinor) {
        largestExpense = tx;
      }
    } else if (tx.type === 'income') {
      totalIncomeMinor += tx.amountMinor;
    }
    // transfers are excluded from external income & expense totals
  }

  const netCashFlowMinor = totalIncomeMinor - totalExpenseMinor;
  const days = Math.max(periodDays, 1);
  const avgDailySpendMinor = Math.round(totalExpenseMinor / days);

  let highestCategory: { name: string; amountMinor: number; percentage: number } | null = null;
  let maxCatMinor = 0;

  for (const [name, amountMinor] of Object.entries(categoryTotals)) {
    if (amountMinor > maxCatMinor) {
      maxCatMinor = amountMinor;
      highestCategory = {
        name,
        amountMinor,
        percentage: totalExpenseMinor > 0 ? Math.round((amountMinor / totalExpenseMinor) * 1000) / 10 : 0,
      };
    }
  }

  return {
    totalExpenseMinor,
    totalIncomeMinor,
    netCashFlowMinor,
    avgDailySpendMinor,
    largestExpense,
    highestCategory,
    transactionCount: transactions.length,
  };
}

export function aggregateDailySpending(
  transactions: Transaction[],
  daysCount = 14,
  referenceDate = '2026-10-15'
): DailySpendTrendItem[] {
  const dateMap: Record<string, number> = {};

  // Initialize date range
  const ref = new Date(referenceDate);
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(ref.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateMap[dateStr] = 0;
  }

  // Populate actual expense totals
  for (const tx of transactions) {
    if (tx.type === 'expense' && dateMap[tx.date] !== undefined) {
      dateMap[tx.date] += tx.amountMinor;
    }
  }

  return Object.entries(dateMap).map(([date, amountMinor]) => {
    const d = new Date(date);
    const formattedDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return {
      date,
      formattedDate,
      amountMinor,
    };
  });
}

export function aggregateTopMerchants(
  transactions: Transaction[],
  limit = 5
): MerchantSpendItem[] {
  const expenseTxs = transactions.filter((tx) => tx.type === 'expense');
  const totalExpenseMinor = expenseTxs.reduce((sum, tx) => sum + tx.amountMinor, 0);

  const merchantMap: Record<string, { amountMinor: number; count: number }> = {};

  for (const tx of expenseTxs) {
    const name = tx.merchant.trim();
    if (!merchantMap[name]) {
      merchantMap[name] = { amountMinor: 0, count: 0 };
    }
    merchantMap[name].amountMinor += tx.amountMinor;
    merchantMap[name].count += 1;
  }

  return Object.entries(merchantMap)
    .sort((a, b) => b[1].amountMinor - a[1].amountMinor)
    .slice(0, limit)
    .map(([merchant, data]) => ({
      merchant,
      amountMinor: data.amountMinor,
      count: data.count,
      percentage: totalExpenseMinor > 0 ? Math.round((data.amountMinor / totalExpenseMinor) * 1000) / 10 : 0,
    }));
}

export function aggregateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[]
): CategorySpendSummary[] {
  const expenseTxs = transactions.filter((tx) => tx.type === 'expense');
  const totalExpenseMinor = expenseTxs.reduce((sum, tx) => sum + tx.amountMinor, 0);

  const colorMap = new Map<string, string>();
  categories.forEach((c) => colorMap.set(c.name, c.color));

  const catMap: Record<string, { count: number; amountMinor: number; id: string }> = {};

  for (const tx of expenseTxs) {
    if (!catMap[tx.category]) {
      const catObj = categories.find((c) => c.name === tx.category);
      catMap[tx.category] = {
        id: catObj?.id || `cat_${tx.category}`,
        count: 0,
        amountMinor: 0,
      };
    }
    catMap[tx.category].count += 1;
    catMap[tx.category].amountMinor += tx.amountMinor;
  }

  return Object.entries(catMap)
    .sort((a, b) => b[1].amountMinor - a[1].amountMinor)
    .map(([name, data]) => ({
      id: data.id,
      name,
      color: colorMap.get(name) || '#94A3B8',
      amountMinor: data.amountMinor,
      count: data.count,
      percentage: totalExpenseMinor > 0 ? Math.round((data.amountMinor / totalExpenseMinor) * 1000) / 10 : 0,
    }));
}

export function generateExpenseInsights(
  transactions: Transaction[],
  budgets: Budget[],
  summary: ExpenseSummaryMetrics
): ExpenseInsightItem[] {
  const insights: ExpenseInsightItem[] = [];

  // 1. Top Outflow Category
  if (summary.highestCategory && summary.totalExpenseMinor > 0) {
    insights.push({
      id: 'ins_top_cat',
      title: `Dominant Outflow: ${summary.highestCategory.name}`,
      description: `${summary.highestCategory.name} accounts for ${summary.highestCategory.percentage}% of your tracked period expenditures.`,
      severity: summary.highestCategory.percentage > 50 ? 'warning' : 'info',
      metricFigure: `${summary.highestCategory.percentage}%`,
      ruleId: 'RULE_DOMINANT_CATEGORY',
      actionRoute: `/app/transactions?category=${encodeURIComponent(summary.highestCategory.name)}`,
      actionLabel: `View ${summary.highestCategory.name}`,
    });
  }

  // 2. Budget Alerts (Exceeded or >= 80%)
  const expenseTxs = transactions.filter((tx) => tx.type === 'expense');
  const spentByCat: Record<string, number> = {};
  expenseTxs.forEach((tx) => {
    spentByCat[tx.category] = (spentByCat[tx.category] || 0) + tx.amountMinor;
  });

  for (const bgt of budgets) {
    const spent = spentByCat[bgt.category] || 0;
    const ratio = bgt.allocatedMinor > 0 ? spent / bgt.allocatedMinor : 0;
    if (ratio >= 1.0) {
      insights.push({
        id: `ins_bgt_exceeded_${bgt.id}`,
        title: `Budget Exceeded: ${bgt.category}`,
        description: `Expenditures in ${bgt.category} have surpassed the allocated limit (₹${(spent / 100).toLocaleString('en-IN')} of ₹${(bgt.allocatedMinor / 100).toLocaleString('en-IN')}).`,
        severity: 'critical',
        metricFigure: `${Math.round(ratio * 100)}% Spent`,
        ruleId: 'RULE_BUDGET_OVERRUN',
        actionRoute: `/app/budgets`,
        actionLabel: 'Manage Budgets',
      });
      break; // Only show one critical overrun
    } else if (ratio >= 0.8) {
      insights.push({
        id: `ins_bgt_warning_${bgt.id}`,
        title: `Budget Threshold Alert: ${bgt.category}`,
        description: `${bgt.category} has reached ${Math.round(ratio * 100)}% of its allocated monthly spending limit.`,
        severity: 'warning',
        metricFigure: `${Math.round(ratio * 100)}%`,
        ruleId: 'RULE_BUDGET_THRESHOLD_80',
        actionRoute: `/app/budgets`,
        actionLabel: 'Review Budget',
      });
      break;
    }
  }

  // 3. Largest single expense
  if (summary.largestExpense) {
    insights.push({
      id: 'ins_largest_tx',
      title: `Single Largest Expense: ${summary.largestExpense.merchant}`,
      description: `Payment of ₹${(summary.largestExpense.amountMinor / 100).toLocaleString('en-IN')} on ${summary.largestExpense.date} under ${summary.largestExpense.category}.`,
      severity: 'info',
      metricFigure: `₹${(summary.largestExpense.amountMinor / 100).toLocaleString('en-IN')}`,
      ruleId: 'RULE_LARGEST_EXPENSE',
      actionRoute: `/app/transactions/${summary.largestExpense.id}`,
      actionLabel: 'Inspect Transaction',
    });
  }

  // 4. Frequent Merchant
  const merchants = aggregateTopMerchants(transactions, 3);
  if (merchants.length > 0 && merchants[0].count >= 2) {
    const topM = merchants[0];
    insights.push({
      id: 'ins_frequent_merchant',
      title: `Frequent Payee: ${topM.merchant}`,
      description: `You have made ${topM.count} transactions totaling ₹${(topM.amountMinor / 100).toLocaleString('en-IN')} with ${topM.merchant}.`,
      severity: 'info',
      metricFigure: `${topM.count} Orders`,
      ruleId: 'RULE_FREQUENT_MERCHANT',
      actionRoute: `/app/transactions?search=${encodeURIComponent(topM.merchant)}`,
      actionLabel: `View ${topM.merchant} Ledger`,
    });
  }

  return insights;
}

