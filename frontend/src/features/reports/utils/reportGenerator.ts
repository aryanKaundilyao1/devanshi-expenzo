import { ComprehensiveReportData, ReportType, Transaction } from '@/types/finance';
import { formatINR } from '@/domain/money/formatters';
import { calculatePortfolioMetrics } from '@/features/investments/utils/investmentCalculations';

export interface ReportFilterOptions {
  type: ReportType;
  startDate: string;
  endDate: string;
  accountId?: string;
}

export function generateFinancialReport(
  options: ReportFilterOptions,
  storeState: any
): ComprehensiveReportData {
  const { type, startDate, endDate, accountId } = options;
  const { transactions, accounts, budgets, goals, holdings, quotes } = storeState;

  // Filter transactions by date range & account
  const filteredTxs = transactions.filter((tx: Transaction) => {
    if (tx.status === 'flagged') return false;
    const inRange = tx.date >= startDate && tx.date <= endDate;
    if (!inRange) return false;
    if (accountId && accountId !== 'all') {
      return tx.accountId === accountId || tx.targetAccountId === accountId;
    }
    return true;
  });

  const totalIncomeMinor = filteredTxs
    .filter((tx: Transaction) => tx.type === 'income')
    .reduce((sum: number, tx: Transaction) => sum + tx.amountMinor, 0);

  const totalExpenseMinor = filteredTxs
    .filter((tx: Transaction) => tx.type === 'expense')
    .reduce((sum: number, tx: Transaction) => sum + tx.amountMinor, 0);

  const netSavingsMinor = totalIncomeMinor - totalExpenseMinor;
  const savingsRatePercent = totalIncomeMinor > 0 ? (netSavingsMinor / totalIncomeMinor) * 100 : 0;

  // Category breakdown of expenses
  const catMap = new Map<string, number>();
  filteredTxs
    .filter((tx: Transaction) => tx.type === 'expense')
    .forEach((tx: Transaction) => {
      catMap.set(tx.category, (catMap.get(tx.category) || 0) + tx.amountMinor);
    });

  const topExpenseCategories = Array.from(catMap.entries())
    .map(([category, amountMinor]) => ({
      category,
      amountMinor,
      percentage: totalExpenseMinor > 0 ? (amountMinor / totalExpenseMinor) * 100 : 0,
    }))
    .sort((a, b) => b.amountMinor - a.amountMinor);

  // Accounts snapshot with current balances
  const accountBalances = accounts.map((acc: any) => {
    let bal = acc.openingBalanceMinor;
    for (const tx of transactions) {
      if (tx.status === 'flagged') continue;
      if (tx.type === 'income' && tx.accountId === acc.id) bal += tx.amountMinor;
      else if (tx.type === 'expense' && tx.accountId === acc.id) bal -= tx.amountMinor;
      else if (tx.type === 'transfer') {
        if (tx.accountId === acc.id) bal -= tx.amountMinor;
        else if (tx.targetAccountId === acc.id) bal += tx.amountMinor;
      }
    }
    return {
      accountName: acc.name,
      institution: acc.institution,
      balanceMinor: bal,
    };
  });

  const totalLiquidCashMinor = accounts
    .filter((a: any) => a.accountType !== 'credit')
    .reduce((sum: number, a: any) => {
      const b = accountBalances.find((ab: any) => ab.accountName === a.name);
      return sum + (b?.balanceMinor || 0);
    }, 0);

  const portfolioMetrics = calculatePortfolioMetrics(holdings, quotes);

  // Credit card liabilities
  const creditLiabilities = accounts
    .filter((a: any) => a.accountType === 'credit')
    .reduce((sum: number, a: any) => {
      const b = accountBalances.find((ab: any) => ab.accountName === a.name);
      return b && b.balanceMinor < 0 ? sum + Math.abs(b.balanceMinor) : sum;
    }, 0);

  const netWorthMinor = totalLiquidCashMinor + portfolioMetrics.totalValueMinor - creditLiabilities;

  // Budget summaries
  const budgetSummaries = (budgets || []).map((b: any) => {
    const spent = filteredTxs
      .filter((tx: Transaction) => tx.type === 'expense' && tx.category.toLowerCase() === b.category.toLowerCase())
      .reduce((sum: number, tx: Transaction) => sum + tx.amountMinor, 0);

    const percentUsed = b.allocatedMinor > 0 ? (spent / b.allocatedMinor) * 100 : 0;
    let status: 'ok' | 'warning' | 'exceeded' = 'ok';
    if (percentUsed >= 100) status = 'exceeded';
    else if (percentUsed >= b.alertThresholdPercent) status = 'warning';

    return {
      category: b.category,
      allocatedMinor: b.allocatedMinor,
      spentMinor: spent,
      percentUsed,
      status,
    };
  });

  // Top 5 largest expenses in period
  const topTransactions = [...filteredTxs]
    .filter((tx: Transaction) => tx.type === 'expense')
    .sort((a, b) => b.amountMinor - a.amountMinor)
    .slice(0, 5);

  // Derived narrative insights
  const narrativeInsights: string[] = [];
  if (totalIncomeMinor > 0) {
    narrativeInsights.push(
      `Retained ${savingsRatePercent.toFixed(1)}% of total credited income as net savings (${formatINR(netSavingsMinor)}).`
    );
  }
  if (topExpenseCategories[0]) {
    narrativeInsights.push(
      `Top spending area was "${topExpenseCategories[0].category}" representing ${topExpenseCategories[0].percentage.toFixed(1)}% of period expenses.`
    );
  }
  const exceededCount = budgetSummaries.filter((b: any) => b.status === 'exceeded').length;
  if (exceededCount > 0) {
    narrativeInsights.push(`${exceededCount} budget categories exceeded their limits during this reporting window.`);
  } else {
    narrativeInsights.push(`All monitored budget categories remained within planned thresholds.`);
  }

  const titleMap: Record<ReportType, string> = {
    daily: 'Daily Cash Flow & Expense Ledger',
    weekly: 'Weekly Financial Operations Summary',
    monthly: 'Monthly Financial Performance Statement',
    custom: 'Custom Period Audit Statement',
    income_vs_expense: 'Income vs Expenditure Statement',
    category_breakdown: 'Category Spending Deep Dive',
    budget_performance: 'Budget Compliance & Variance Report',
    cash_flow: 'Depository Cash Flow Statement',
    investment_overview: 'Investment Portfolio & Returns Audit',
    goals_progress: 'Savings Goals Milestone Report',
  };

  const id = `rep_${type}_${startDate}_${endDate}`;

  return {
    id,
    type,
    title: titleMap[type] || 'Financial Audit Statement',
    subtitle: `Statement window: ${startDate} to ${endDate}`,
    startDate,
    endDate,
    generatedAt: '2026-10-15T08:00:00Z',
    totalIncomeMinor,
    totalExpenseMinor,
    netSavingsMinor,
    savingsRatePercent,
    totalLiquidCashMinor,
    portfolioValueMinor: portfolioMetrics.totalValueMinor,
    netWorthMinor,
    topExpenseCategories,
    accountBalances,
    budgetSummaries,
    transactionCount: filteredTxs.length,
    topTransactions,
    insights: narrativeInsights,
  };
}

/**
 * Escapes CSV values with Formula Injection Protection (=, +, -, @ prepended with ')
 */
function sanitizeCsvValue(val: string | number | undefined): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  let sanitized = str;
  if (dangerousChars.some((char) => str.startsWith(char))) {
    sanitized = `'${str}`;
  }
  return `"${sanitized.replace(/"/g, '""')}"`;
}

export function generateReportCSV(report: ComprehensiveReportData): string {
  const lines: string[] = [];

  // Metadata headers
  lines.push(`${sanitizeCsvValue('EXPENZO FINANCIAL STATEMENT')},${sanitizeCsvValue(report.title)}`);
  lines.push(`${sanitizeCsvValue('Reporting Period')},${sanitizeCsvValue(`${report.startDate} to ${report.endDate}`)}`);
  lines.push(`${sanitizeCsvValue('Generated On')},${sanitizeCsvValue(report.generatedAt)}`);
  lines.push('');

  // Executive Summary
  lines.push(`${sanitizeCsvValue('EXECUTIVE SUMMARY METRICS')}`);
  lines.push(`${sanitizeCsvValue('Metric')},${sanitizeCsvValue('Amount (INR)')}`);
  lines.push(`${sanitizeCsvValue('Total Credited Income')},${sanitizeCsvValue((report.totalIncomeMinor / 100).toFixed(2))}`);
  lines.push(`${sanitizeCsvValue('Total Expenses Outflow')},${sanitizeCsvValue((report.totalExpenseMinor / 100).toFixed(2))}`);
  lines.push(`${sanitizeCsvValue('Net Savings')},${sanitizeCsvValue((report.netSavingsMinor / 100).toFixed(2))}`);
  lines.push(`${sanitizeCsvValue('Savings Rate %')},${sanitizeCsvValue(`${report.savingsRatePercent.toFixed(2)}%`)}`);
  lines.push(`${sanitizeCsvValue('Liquid Cash')},${sanitizeCsvValue((report.totalLiquidCashMinor / 100).toFixed(2))}`);
  lines.push(`${sanitizeCsvValue('Portfolio Valuation')},${sanitizeCsvValue((report.portfolioValueMinor / 100).toFixed(2))}`);
  lines.push(`${sanitizeCsvValue('Total Net Worth')},${sanitizeCsvValue((report.netWorthMinor / 100).toFixed(2))}`);
  lines.push('');

  // Category Breakdown
  lines.push(`${sanitizeCsvValue('SPENDING BY CATEGORY')}`);
  lines.push(`${sanitizeCsvValue('Category')},${sanitizeCsvValue('Spent (INR)')},${sanitizeCsvValue('Share %')}`);
  report.topExpenseCategories.forEach((cat) => {
    lines.push(
      `${sanitizeCsvValue(cat.category)},${sanitizeCsvValue((cat.amountMinor / 100).toFixed(2))},${sanitizeCsvValue(`${cat.percentage.toFixed(1)}%`)}`
    );
  });
  lines.push('');

  // Top Transactions
  lines.push(`${sanitizeCsvValue('PEAK EXPENSE TRANSACTIONS')}`);
  lines.push(`${sanitizeCsvValue('Date')},${sanitizeCsvValue('Merchant')},${sanitizeCsvValue('Category')},${sanitizeCsvValue('Amount (INR)')}`);
  report.topTransactions.forEach((tx) => {
    lines.push(
      `${sanitizeCsvValue(tx.date)},${sanitizeCsvValue(tx.merchant)},${sanitizeCsvValue(tx.category)},${sanitizeCsvValue((tx.amountMinor / 100).toFixed(2))}`
    );
  });

  return lines.join('\n');
}
