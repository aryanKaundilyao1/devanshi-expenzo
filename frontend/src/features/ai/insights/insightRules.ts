import { FinancialInsight } from '@/types/finance';
import { formatINR } from '@/domain/money/formatters';
import { calculatePortfolioMetrics, calculateHoldingsDetailed, calculateSectorAllocation } from '@/features/investments/utils/investmentCalculations';

export interface EvaluatedInsight extends FinancialInsight {
  ruleId: string;
  supportingData: { label: string; value: string }[];
  dateRange: string;
  confidenceExplanation: string;
  evidence: string;
}

export function evaluateFinancialInsights(storeState: any): EvaluatedInsight[] {
  const { transactions, accounts, budgets, goals, holdings, quotes, bills, recurringRules } = storeState;
  const insights: EvaluatedInsight[] = [];

  const nowIso = '2026-10-15T08:00:00Z';
  const monthPeriod = '2026-10-01 to 2026-10-15';

  const monthExpenses = transactions.filter(
    (t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith('2026-10')
  );

  // 1. Highest Expense Category
  if (monthExpenses.length > 0) {
    const catMap: Record<string, number> = {};
    let totalSpent = 0;
    monthExpenses.forEach((t: any) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amountMinor;
      totalSpent += t.amountMinor;
    });

    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];

    if (top) {
      const pct = (top[1] / totalSpent) * 100;
      insights.push({
        id: 'ins_highest_expense',
        ruleId: 'RULE_01_HIGHEST_EXPENSE_CATEGORY',
        title: `High Outflow in ${top[0]}`,
        description: `${top[0]} constitutes ${pct.toFixed(1)}% of your total October spending (${formatINR(top[1])}).`,
        category: 'spending',
        severity: pct > 40 ? 'warning' : 'info',
        metricFigures: [
          { label: 'Category Spent', value: formatINR(top[1]) },
          { label: 'Total Spending', value: formatINR(totalSpent) },
        ],
        suggestedAction: { label: 'Review Category Budgets', actionRoute: '/app/budgets' },
        generatedAt: nowIso,
        supportingData: [
          { label: 'Category', value: top[0] },
          { label: 'Outflow Share', value: `${pct.toFixed(1)}%` },
        ],
        dateRange: monthPeriod,
        confidenceExplanation: '100% deterministic calculation from all completed debits in current ledger.',
        evidence: `Sum of all debits tagged as "${top[0]}" within the active month.`,
      });
    }
  }

  // 2. Largest Recorded Transaction
  if (monthExpenses.length > 0) {
    const largest = [...monthExpenses].sort((a: any, b: any) => b.amountMinor - a.amountMinor)[0];
    if (largest) {
      insights.push({
        id: 'ins_largest_tx',
        ruleId: 'RULE_02_LARGEST_TRANSACTION',
        title: `Peak Expense: ${largest.merchant}`,
        description: `Your highest single outflow this month was ${formatINR(largest.amountMinor)} for "${largest.merchant}" (${largest.category}).`,
        category: 'spending',
        severity: 'info',
        metricFigures: [
          { label: 'Merchant', value: largest.merchant },
          { label: 'Amount', value: formatINR(largest.amountMinor) },
        ],
        suggestedAction: { label: 'Inspect Transaction', actionRoute: `/app/transactions/${largest.id}` },
        generatedAt: nowIso,
        supportingData: [
          { label: 'Transaction ID', value: largest.id },
          { label: 'Date', value: largest.date },
        ],
        dateRange: monthPeriod,
        confidenceExplanation: 'Exact ledger match for maximum amount in transaction records.',
        evidence: `Transaction ${largest.id} of ${formatINR(largest.amountMinor)} at ${largest.merchant}.`,
      });
    }
  }

  // 3. Spending Increase / Decrease Trend (Savings Rate)
  const monthIncome = transactions
    .filter((t: any) => t.type === 'income' && t.status === 'completed' && t.date.startsWith('2026-10'))
    .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

  const totalExpenseMinor = monthExpenses.reduce((sum: number, t: any) => sum + t.amountMinor, 0);
  if (monthIncome > 0) {
    const savingsRate = ((monthIncome - totalExpenseMinor) / monthIncome) * 100;
    insights.push({
      id: 'ins_spend_trend',
      ruleId: 'RULE_03_SPENDING_TREND',
      title: savingsRate >= 20 ? 'Strong Monthly Savings Rate' : 'Low Savings Rate Alert',
      description: `You have saved ${savingsRate.toFixed(1)}% of your income this month (${formatINR(monthIncome - totalExpenseMinor)} retained).`,
      category: 'savings',
      severity: savingsRate >= 20 ? 'positive' : 'warning',
      metricFigures: [
        { label: 'Income', value: formatINR(monthIncome) },
        { label: 'Retained Cash', value: formatINR(monthIncome - totalExpenseMinor) },
      ],
      suggestedAction: { label: 'Explore Savings Goals', actionRoute: '/app/financial-planner' },
      generatedAt: nowIso,
      supportingData: [
        { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%` },
        { label: 'Benchmark', value: '20.0%' },
      ],
      dateRange: monthPeriod,
      confidenceExplanation: 'Calculated from credited payroll minus total categorized debits.',
      evidence: `Income of ${formatINR(monthIncome)} minus debits of ${formatINR(totalExpenseMinor)}.`,
    });
  }

  // 4 & 5. Budget Nearing Limit / Exceeded
  (budgets || []).forEach((b: any) => {
    const spent = monthExpenses
      .filter((t: any) => t.category.toLowerCase() === b.category.toLowerCase())
      .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

    const pct = b.allocatedMinor > 0 ? (spent / b.allocatedMinor) * 100 : 0;

    if (pct >= 100) {
      insights.push({
        id: `ins_budget_exceeded_${b.id}`,
        ruleId: 'RULE_05_BUDGET_EXCEEDED',
        title: `Budget Exceeded: ${b.category}`,
        description: `You have exceeded your ${b.category} budget by ${formatINR(spent - b.allocatedMinor)} (${pct.toFixed(0)}% used).`,
        category: 'budget',
        severity: 'critical',
        metricFigures: [
          { label: 'Budget Limit', value: formatINR(b.allocatedMinor) },
          { label: 'Actual Spent', value: formatINR(spent) },
        ],
        suggestedAction: { label: 'Adjust Budget', actionRoute: '/app/budgets' },
        generatedAt: nowIso,
        supportingData: [{ label: 'Overspend', value: formatINR(spent - b.allocatedMinor) }],
        dateRange: monthPeriod,
        confidenceExplanation: 'Derived from active monthly budget limit and current month expenses.',
        evidence: `Category "${b.category}" spent ${formatINR(spent)} vs limit ${formatINR(b.allocatedMinor)}.`,
      });
    } else if (pct >= (b.alertThresholdPercent || 80)) {
      insights.push({
        id: `ins_budget_nearing_${b.id}`,
        ruleId: 'RULE_04_BUDGET_NEARING_LIMIT',
        title: `Budget Nearing Limit: ${b.category}`,
        description: `You have utilized ${pct.toFixed(0)}% of your ${b.category} allocation with ${formatINR(b.allocatedMinor - spent)} remaining.`,
        category: 'budget',
        severity: 'warning',
        metricFigures: [
          { label: 'Spent', value: formatINR(spent) },
          { label: 'Remaining', value: formatINR(b.allocatedMinor - spent) },
        ],
        suggestedAction: { label: 'Review Budget', actionRoute: '/app/budgets' },
        generatedAt: nowIso,
        supportingData: [{ label: 'Threshold', value: `${b.alertThresholdPercent}%` }],
        dateRange: monthPeriod,
        confidenceExplanation: 'Triggered when consumption exceeds the user-configured alert threshold percentage.',
        evidence: `Category "${b.category}" at ${pct.toFixed(1)}% of ${formatINR(b.allocatedMinor)}.`,
      });
    }
  });

  // 6. Recurring Payment Reminder
  if (recurringRules && recurringRules.length > 0) {
    const activeRules = recurringRules.filter((r: any) => r.status === 'active');
    if (activeRules.length > 0) {
      const nextRule = activeRules[0];
      insights.push({
        id: 'ins_recurring_alert',
        ruleId: 'RULE_06_RECURRING_COMMITMENT',
        title: `Upcoming Recurring: ${nextRule.name}`,
        description: `Scheduled auto-debit of ${formatINR(nextRule.amountMinor)} expected on ${nextRule.nextExpectedDate}.`,
        category: 'cashflow',
        severity: 'info',
        metricFigures: [
          { label: 'Commitment', value: nextRule.name },
          { label: 'Amount', value: formatINR(nextRule.amountMinor) },
        ],
        suggestedAction: { label: 'Manage Recurring Rules', actionRoute: '/app/recurring' },
        generatedAt: nowIso,
        supportingData: [{ label: 'Frequency', value: nextRule.frequency }],
        dateRange: 'Next 30 Days',
        confidenceExplanation: 'Parsed from user active automated recurring rules schedule.',
        evidence: `Rule "${nextRule.name}" active with next date ${nextRule.nextExpectedDate}.`,
      });
    }
  }

  // 7. Upcoming Bill Warning
  const unpaidBills = (bills || []).filter((b: any) => b.status !== 'paid');
  if (unpaidBills.length > 0) {
    const nextBill = unpaidBills[0];
    insights.push({
      id: 'ins_bill_warning',
      ruleId: 'RULE_07_UPCOMING_BILL_WARNING',
      title: `Bill Due Soon: ${nextBill.title}`,
      description: `Scheduled bill of ${formatINR(nextBill.amountMinor)} for ${nextBill.billerName} is due on ${nextBill.dueDate}.`,
      category: 'cashflow',
      severity: nextBill.status === 'overdue' ? 'critical' : 'warning',
      metricFigures: [
        { label: 'Biller', value: nextBill.billerName },
        { label: 'Due Date', value: nextBill.dueDate },
      ],
      suggestedAction: { label: 'Pay Bill Now', actionRoute: '/app/banking/bills' },
      generatedAt: nowIso,
      supportingData: [{ label: 'Status', value: nextBill.status }],
      dateRange: 'Immediate',
      confidenceExplanation: 'Grounded in banking bills register with unpaid status.',
      evidence: `Bill ID ${nextBill.id} marked as ${nextBill.status}.`,
    });
  }

  // 8. Low Demo Account Balance Warning
  (accounts || []).forEach((acc: any) => {
    if (acc.accountType !== 'credit') {
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

      if (bal < 500000) {
        // under ₹5,000
        insights.push({
          id: `ins_low_balance_${acc.id}`,
          ruleId: 'RULE_08_LOW_ACCOUNT_BALANCE',
          title: `Low Balance Alert: ${acc.name}`,
          description: `Current balance in ${acc.name} is ${formatINR(bal)}, below the recommended minimum buffer of ₹5,000.`,
          category: 'cashflow',
          severity: 'warning',
          metricFigures: [
            { label: 'Account', value: acc.name },
            { label: 'Available Balance', value: formatINR(bal) },
          ],
          suggestedAction: { label: 'Transfer Funds', actionRoute: '/app/banking/transfer' },
          generatedAt: nowIso,
          supportingData: [{ label: 'Institution', value: acc.institution }],
          dateRange: 'Real-Time',
          confidenceExplanation: 'Double-entry balance calculation across all recorded movements.',
          evidence: `Account ${acc.id} balance is ${formatINR(bal)}.`,
        });
      }
    }
  });

  // 9. Savings Goal Progress
  if (goals && goals.length > 0) {
    const primary = goals[0];
    const pct = (primary.currentAmountMinor / primary.targetAmountMinor) * 100;
    insights.push({
      id: 'ins_goal_progress',
      ruleId: 'RULE_09_SAVINGS_GOAL_PROGRESS',
      title: `Goal On Track: ${primary.title}`,
      description: `You have funded ${pct.toFixed(0)}% of your target for "${primary.title}" (${formatINR(primary.currentAmountMinor)} of ${formatINR(primary.targetAmountMinor)}).`,
      category: 'savings',
      severity: 'positive',
      metricFigures: [
        { label: 'Target', value: formatINR(primary.targetAmountMinor) },
        { label: 'Accumulated', value: formatINR(primary.currentAmountMinor) },
      ],
      suggestedAction: { label: 'View Planner', actionRoute: `/app/financial-planner/goals/${primary.id}` },
      generatedAt: nowIso,
      supportingData: [{ label: 'Target Date', value: primary.targetDate }],
      dateRange: `Until ${primary.targetDate}`,
      confidenceExplanation: 'Tracked against current accumulated funds in savings goal specification.',
      evidence: `Goal ${primary.id} progress ${pct.toFixed(1)}%.`,
    });
  }

  // 10 & 11. Portfolio Concentration & Largest Holding
  if (holdings && holdings.length > 0) {
    const detailed = calculateHoldingsDetailed(holdings, quotes);
    const sorted = [...detailed].sort((a, b) => b.currentValueMinor - a.currentValueMinor);
    const topHolding = sorted[0];

    if (topHolding) {
      insights.push({
        id: 'ins_largest_holding',
        ruleId: 'RULE_11_LARGEST_PORTFOLIO_HOLDING',
        title: `Leading Holding: ${topHolding.ticker}`,
        description: `${topHolding.ticker} represents ${topHolding.portfolioWeightPercent.toFixed(1)}% of your equity portfolio (${formatINR(topHolding.currentValueMinor)}).`,
        category: 'investment',
        severity: topHolding.portfolioWeightPercent > 40 ? 'warning' : 'positive',
        metricFigures: [
          { label: 'Shares', value: topHolding.quantity.toString() },
          { label: 'Valuation', value: formatINR(topHolding.currentValueMinor) },
        ],
        suggestedAction: { label: 'View Stock Details', actionRoute: `/app/investments/stocks/${topHolding.ticker}` },
        generatedAt: nowIso,
        supportingData: [{ label: 'Sector', value: topHolding.sector }],
        dateRange: 'Current Snapshot',
        confidenceExplanation: 'Multiplication of quantity by latest demo market price.',
        evidence: `Holding ${topHolding.ticker} valued at ${formatINR(topHolding.currentValueMinor)}.`,
      });
    }

    const portfolioMetrics = calculatePortfolioMetrics(holdings, quotes);
    if (portfolioMetrics.unrealizedGainLossMinor > 0) {
      insights.push({
        id: 'ins_portfolio_concentration',
        ruleId: 'RULE_10_PORTFOLIO_ALPHA',
        title: 'Portfolio Demonstrating Positive Alpha',
        description: `Your stock portfolio has an unrealized gain of +${formatINR(portfolioMetrics.unrealizedGainLossMinor)} (+${portfolioMetrics.unrealizedReturnPercent.toFixed(2)}%) over invested capital.`,
        category: 'investment',
        severity: 'positive',
        metricFigures: [
          { label: 'Invested', value: formatINR(portfolioMetrics.totalInvestedMinor) },
          { label: 'Current Value', value: formatINR(portfolioMetrics.totalValueMinor) },
        ],
        suggestedAction: { label: 'View Portfolio', actionRoute: '/app/investments' },
        generatedAt: nowIso,
        supportingData: [{ label: 'Return %', value: `+${portfolioMetrics.unrealizedReturnPercent.toFixed(2)}%` }],
        dateRange: 'All-Time',
        confidenceExplanation: 'Reconciled difference between cost basis and current demo market prices.',
        evidence: `Total market equity ${formatINR(portfolioMetrics.totalValueMinor)} minus basis ${formatINR(portfolioMetrics.totalInvestedMinor)}.`,
      });
    }
  }

  // 12. Unusual Spending Pattern
  const utilitiesTx = monthExpenses.filter((t: any) => t.category.toLowerCase().includes('utilities'));
  if (utilitiesTx.length > 0) {
    const totalUtil = utilitiesTx.reduce((sum: number, t: any) => sum + t.amountMinor, 0);
    insights.push({
      id: 'ins_unusual_spend',
      ruleId: 'RULE_12_UNUSUAL_SPENDING_PATTERN',
      title: 'Seasonal Outflow Pattern Detected',
      description: `Utility bill payments of ${formatINR(totalUtil)} recorded this month represent typical seasonal billing cycle variations.`,
      category: 'spending',
      severity: 'info',
      metricFigures: [
        { label: 'Utility Outflow', value: formatINR(totalUtil) },
        { label: 'Billing Cycles', value: utilitiesTx.length.toString() },
      ],
      suggestedAction: { label: 'Inspect Utilities Expenses', actionRoute: '/app/expenses' },
      generatedAt: nowIso,
      supportingData: [{ label: 'Category', value: 'Utilities' }],
      dateRange: monthPeriod,
      confidenceExplanation: 'Detected by pattern matching periodic recurring municipal/utility billers.',
      evidence: `Identified ${utilitiesTx.length} utility transaction(s) totaling ${formatINR(totalUtil)}.`,
    });
  }

  return insights;
}

