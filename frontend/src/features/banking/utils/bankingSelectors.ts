/**
 * Pure selectors and deterministic insights for the Banking domain.
 */

import {
  FinancialAccount,
  Transaction,
  BankingBill,
  RecurringRule,
  FinancialInsight,
} from '@/types/finance';
import { calculateAccountBalance } from '@/domain/calculations/accounting';
import { formatRupees } from '@/domain/money/formatters';

export interface BankingKpiSummary {
  totalAvailableCashMinor: number;
  totalDepositAccountsCount: number;
  bankingInflowMinor: number;
  bankingOutflowMinor: number;
  netCashFlowMinor: number;
  upcomingBillsCount: number;
  upcomingBillsTotalMinor: number;
  totalActiveAccountsCount: number;
}

export function selectBankingKpiSummary(
  accounts: FinancialAccount[],
  transactions: Transaction[],
  bills: BankingBill[],
  startDate = '2026-10-01',
  endDate = '2026-10-31'
): BankingKpiSummary {
  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const liquidAccounts = activeAccounts.filter((a) => a.accountType !== 'credit');

  // Total available cash across liquid accounts
  const totalAvailableCashMinor = liquidAccounts.reduce(
    (sum, a) => sum + calculateAccountBalance(a, transactions),
    0
  );

  const totalDepositAccountsCount = liquidAccounts.length;

  // Banking inflow and outflow (external transactions + transfers involving banking accounts)
  let bankingInflowMinor = 0;
  let bankingOutflowMinor = 0;

  for (const tx of transactions) {
    if (tx.status === 'flagged') continue;
    if (tx.date < startDate || tx.date > endDate) continue;

    if (tx.type === 'income') {
      bankingInflowMinor += tx.amountMinor;
    } else if (tx.type === 'expense') {
      bankingOutflowMinor += tx.amountMinor;
    }
  }

  // Upcoming bills
  const pendingBills = (bills || []).filter((b) => b.status !== 'paid');
  const upcomingBillsTotalMinor = pendingBills.reduce((sum, b) => sum + b.amountMinor, 0);

  return {
    totalAvailableCashMinor,
    totalDepositAccountsCount,
    bankingInflowMinor,
    bankingOutflowMinor,
    netCashFlowMinor: bankingInflowMinor - bankingOutflowMinor,
    upcomingBillsCount: pendingBills.length,
    upcomingBillsTotalMinor,
    totalActiveAccountsCount: activeAccounts.length,
  };
}

export interface AccountBalanceDistributionItem {
  id: string;
  name: string;
  institution: string;
  accountType: string;
  balanceMinor: number;
  percentageShare: number;
  color: string;
}

const ACCOUNT_COLORS = [
  '#059669', // Emerald
  '#0284C7', // Sky
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#10B981', // Mint
];

export function selectAccountBalanceDistribution(
  accounts: FinancialAccount[],
  transactions: Transaction[]
): AccountBalanceDistributionItem[] {
  const activeAccounts = accounts.filter((a) => !a.isArchived && a.accountType !== 'credit');
  const totalBalance = activeAccounts.reduce(
    (sum, a) => sum + Math.max(0, calculateAccountBalance(a, transactions)),
    0
  );

  return activeAccounts.map((account, index) => {
    const balance = calculateAccountBalance(account, transactions);
    const positiveBalance = Math.max(0, balance);
    const percentageShare = totalBalance > 0 ? (positiveBalance / totalBalance) * 100 : 0;

    return {
      id: account.id,
      name: account.name,
      institution: account.institution,
      accountType: account.accountType,
      balanceMinor: balance,
      percentageShare: Math.round(percentageShare * 10) / 10,
      color: ACCOUNT_COLORS[index % ACCOUNT_COLORS.length],
    };
  });
}

export interface CashFlowTrendPoint {
  date: string;
  formattedDate: string;
  inflowMinor: number;
  outflowMinor: number;
  netFlowMinor: number;
}

export function selectCashFlowTrend(
  transactions: Transaction[],
  startDate = '2026-10-01',
  endDate = '2026-10-31'
): CashFlowTrendPoint[] {
  const dailyMap = new Map<string, { inflowMinor: number; outflowMinor: number }>();

  for (const tx of transactions) {
    if (tx.status === 'flagged' || tx.type === 'transfer') continue;
    if (tx.date < startDate || tx.date > endDate) continue;

    if (!dailyMap.has(tx.date)) {
      dailyMap.set(tx.date, { inflowMinor: 0, outflowMinor: 0 });
    }
    const entry = dailyMap.get(tx.date)!;
    if (tx.type === 'income') {
      entry.inflowMinor += tx.amountMinor;
    } else if (tx.type === 'expense') {
      entry.outflowMinor += tx.amountMinor;
    }
  }

  const sortedDates = Array.from(dailyMap.keys()).sort();

  return sortedDates.map((date) => {
    const { inflowMinor, outflowMinor } = dailyMap.get(date)!;
    const parts = date.split('-');
    const formattedDate = `${parts[2]} Oct`;

    return {
      date,
      formattedDate,
      inflowMinor,
      outflowMinor,
      netFlowMinor: inflowMinor - outflowMinor,
    };
  });
}

/**
 * Free, deterministic, rules-based AI Banking Insights.
 * Zero paid external API keys required.
 */
export function generateBankingInsights(
  accounts: FinancialAccount[],
  transactions: Transaction[],
  bills: BankingBill[],
  recurringRules: RecurringRule[],
  asOfDate = '2026-10-15'
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const activeAccounts = accounts.filter((a) => !a.isArchived);

  if (activeAccounts.length === 0 && transactions.length === 0) {
    return [
      {
        id: 'ins_clean_banking',
        title: 'Clean Slate Workspace Ready',
        description: 'You are viewing an empty demo environment. Add your initial demo account or log an expense to activate automated banking insights.',
        category: 'cashflow',
        severity: 'info',
        suggestedAction: { label: 'Add Demo Account', actionRoute: '/app/banking/accounts' },
        generatedAt: asOfDate,
      },
    ];
  }

  // Rule A: Highest Outflow Account
  const accountOutflowMap = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.status === 'flagged' || tx.type !== 'expense') continue;
    accountOutflowMap.set(tx.accountId, (accountOutflowMap.get(tx.accountId) || 0) + tx.amountMinor);
  }

  let highestOutflowAccountId = '';
  let highestOutflowMinor = 0;
  for (const [acctId, total] of accountOutflowMap.entries()) {
    if (total > highestOutflowMinor) {
      highestOutflowMinor = total;
      highestOutflowAccountId = acctId;
    }
  }

  if (highestOutflowAccountId && highestOutflowMinor > 0) {
    const highestAcct = activeAccounts.find((a) => a.id === highestOutflowAccountId);
    if (highestAcct) {
      insights.push({
        id: 'ins_highest_outflow',
        title: `Primary Outflow Account: ${highestAcct.name}`,
        description: `${highestAcct.institution} accounts for ${formatRupees(highestOutflowMinor)} in debits this month. Review your statements to verify charges.`,
        category: 'spending',
        severity: 'info',
        metricFigures: [
          { label: 'Total Debits', value: formatRupees(highestOutflowMinor) },
          { label: 'Institution', value: highestAcct.institution },
        ],
        suggestedAction: { label: 'View Account', actionRoute: `/app/banking/accounts/${highestAcct.id}` },
        generatedAt: asOfDate,
      });
    }
  }

  // Rule B: Largest Banking Expense
  const bankingExpenses = transactions.filter((t) => t.type === 'expense' && t.status === 'completed');
  if (bankingExpenses.length > 0) {
    const largestExpense = [...bankingExpenses].sort((a, b) => b.amountMinor - a.amountMinor)[0];
    if (largestExpense && largestExpense.amountMinor >= 50000) {
      insights.push({
        id: 'ins_largest_expense',
        title: `Largest Outflow: ${largestExpense.merchant}`,
        description: `Single largest single debit of ${formatRupees(largestExpense.amountMinor)} recorded on ${largestExpense.date} under ${largestExpense.category}.`,
        category: 'spending',
        severity: 'info',
        metricFigures: [
          { label: 'Amount', value: formatRupees(largestExpense.amountMinor) },
          { label: 'Category', value: largestExpense.category },
        ],
        suggestedAction: { label: 'Inspect Transaction', actionRoute: `/app/transactions/${largestExpense.id}` },
        generatedAt: asOfDate,
      });
    }
  }

  // Rule C: Upcoming Bill Warning (due within next 7 days from asOfDate)
  const pendingBills = (bills || []).filter((b) => b.status !== 'paid');
  const soonBills = pendingBills.filter((b) => {
    if (b.dueDate < asOfDate) return true; // overdue
    const [y1, m1, d1] = asOfDate.split('-').map(Number);
    const [y2, m2, d2] = b.dueDate.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1).getTime();
    const date2 = new Date(y2, m2 - 1, d2).getTime();
    const diffDays = (date2 - date1) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  if (soonBills.length > 0) {
    const totalSoonMinor = soonBills.reduce((sum, b) => sum + b.amountMinor, 0);
    insights.push({
      id: 'ins_upcoming_bills_warning',
      title: `${soonBills.length} Bill${soonBills.length > 1 ? 's' : ''} Due Within 7 Days`,
      description: `Commitments totaling ${formatRupees(totalSoonMinor)} are approaching due dates. Ensure your primary savings account maintains sufficient balance.`,
      category: 'cashflow',
      severity: soonBills.some((b) => b.dueDate < asOfDate) ? 'warning' : 'info',
      metricFigures: [
        { label: 'Total Due Soon', value: formatRupees(totalSoonMinor) },
        { label: 'Bill Count', value: `${soonBills.length}` },
      ],
      suggestedAction: { label: 'Review & Pay Bills', actionRoute: '/app/banking/bills' },
      generatedAt: asOfDate,
    });
  }

  // Rule D: Cash-Flow Summary
  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of transactions) {
    if (tx.status === 'flagged') continue;
    if (tx.type === 'income') totalIncome += tx.amountMinor;
    if (tx.type === 'expense') totalExpense += tx.amountMinor;
  }
  const netSavings = totalIncome - totalExpense;
  if (totalIncome > 0) {
    const savingsRate = Math.round((netSavings / totalIncome) * 100);
    insights.push({
      id: 'ins_cashflow_summary',
      title: `Monthly Net Savings: ${savingsRate}%`,
      description: `Inflows of ${formatRupees(totalIncome)} exceeded outflows of ${formatRupees(totalExpense)}, yielding a net positive liquidity of ${formatRupees(netSavings)}.`,
      category: 'cashflow',
      severity: netSavings >= 0 ? 'positive' : 'warning',
      metricFigures: [
        { label: 'Net Surplus', value: formatRupees(netSavings) },
        { label: 'Savings Rate', value: `${savingsRate}%` },
      ],
      suggestedAction: { label: 'Explore Deposits', actionRoute: '/app/banking/deposits' },
      generatedAt: asOfDate,
    });
  }

  // Rule E: Balance Warning (accounts below threshold ₹5,000)
  const LOW_BALANCE_THRESHOLD = 500000; // ₹5,000 in paise
  for (const acct of activeAccounts) {
    if (acct.accountType === 'savings' || acct.accountType === 'checking') {
      const balance = calculateAccountBalance(acct, transactions);
      if (balance > 0 && balance < LOW_BALANCE_THRESHOLD) {
        insights.push({
          id: `ins_low_balance_${acct.id}`,
          title: `Low Balance Alert: ${acct.name}`,
          description: `Current balance of ${formatRupees(balance)} is below the recommended ₹5,000 reserve threshold. Consider transferring funds from another account.`,
          category: 'budget',
          severity: 'warning',
          metricFigures: [
            { label: 'Available', value: formatRupees(balance) },
            { label: 'Threshold', value: '₹5,000.00' },
          ],
          suggestedAction: { label: 'Transfer Funds', actionRoute: '/app/banking/transfer' },
          generatedAt: asOfDate,
        });
      }
    }
  }

  // Rule F: Recurring Payment Summary
  const activeRecurring = (recurringRules || []).filter((r) => r.status === 'active');
  const monthlyRecurringOutflow = activeRecurring
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amountMinor, 0);

  if (monthlyRecurringOutflow > 0) {
    insights.push({
      id: 'ins_recurring_summary',
      title: 'Automated Monthly Commitments',
      description: `You have ${activeRecurring.length} scheduled recurring rules projecting ${formatRupees(monthlyRecurringOutflow)} in monthly debits.`,
      category: 'spending',
      severity: 'info',
      metricFigures: [
        { label: 'Committed Total', value: formatRupees(monthlyRecurringOutflow) },
        { label: 'Active Rules', value: `${activeRecurring.length}` },
      ],
      suggestedAction: { label: 'Manage Recurring', actionRoute: '/app/recurring' },
      generatedAt: asOfDate,
    });
  }

  return insights;
}

