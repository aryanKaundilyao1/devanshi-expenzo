/**
 * EXPENZO — Family Financial Accounting & Member Comparison Formulas
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 *
 * Deterministic Financial Formulations:
 * - Net Savings = Income - Attributable Expenses
 * - Savings Rate = (Net Savings / Income) * 100 [only when Income > 0]
 * - Budget Utilisation = (Spending / Allocated Budget) * 100 [only when Budget > 0]
 * - Expense Contribution = (Attributable Expenses / Total Family Expenses) * 100 [when Total > 0]
 * - Non-consumption exclusions: transfers, investment additions, debt payoffs, savings goal contributions.
 * - Exact-sum invariant: Sum(member allocations) === original shared expense.
 */

import { Transaction } from '@/types/finance';
import {
  FamilyMember,
  SharedExpenseAllocation,
  MemberFinancialMetric,
  FamilyAggregateMetrics,
} from '@/types/family';

// Category classification for essential vs discretionary spending
const DISCRETIONARY_CATEGORIES = new Set([
  'dining',
  'entertainment',
  'shopping',
  'travel',
  'electronics',
  'leisure',
  'hobbies',
  'personal care',
]);

/**
 * Validates whether a transaction represents ordinary household consumption.
 * Excludes transfers, debt principal payoffs, goal contributions, and portfolio movements.
 */
export function isOrdinaryConsumptionExpense(tx: Transaction): boolean {
  if (tx.type !== 'expense') return false;

  // Filter out internal transfers or transfers mislabelled
  if (tx.targetAccountId) return false;

  const categoryLower = (tx.category || '').toLowerCase().trim();
  const notesLower = (tx.notes || '').toLowerCase().trim();

  // Exclude investments & asset buys (these are balance-sheet shifts, not consumption)
  if (categoryLower.includes('investment') || categoryLower.includes('stocks') || categoryLower.includes('mutual fund')) {
    return false;
  }

  // Exclude savings goal deposits
  if (categoryLower.includes('goal contribution') || notesLower.includes('goal contribution')) {
    return false;
  }

  // Exclude transfer keywords
  if (categoryLower.includes('transfer') || notesLower.includes('transfer to')) {
    return false;
  }

  return true;
}

/**
 * Validates the exact-sum invariant for shared expense allocations.
 * Every shared expense must be allocated exactly once, and individual allocations
 * must sum precisely to the original transaction amount.
 */
export function validateSharedExpenseAllocations(
  originalAmountMinor: number,
  allocations: { allocatedAmountMinor: number }[]
): { isValid: boolean; differenceMinor: number; sumAllocatedMinor: number } {
  const sumAllocatedMinor = allocations.reduce((acc, a) => acc + a.allocatedAmountMinor, 0);
  const differenceMinor = originalAmountMinor - sumAllocatedMinor;
  return {
    isValid: differenceMinor === 0,
    differenceMinor,
    sumAllocatedMinor,
  };
}

/**
 * Computes deterministic member metrics and aggregate household comparisons for a given period.
 */
export function calculateFamilyMetrics(params: {
  members: FamilyMember[];
  transactions: Transaction[];
  sharedAllocations: SharedExpenseAllocation[];
  periodLabel?: string;
  periodType?: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
}): FamilyAggregateMetrics {
  const {
    members,
    transactions,
    sharedAllocations,
    periodLabel = 'Current Period',
    periodType = 'monthly',
    startDate,
    endDate,
  } = params;

  // Filter transactions by date range
  const filteredTxs = transactions.filter((tx) => {
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;
    return true;
  });

  // Build lookup of shared allocations by transactionId
  const allocationsByTx = new Map<string, SharedExpenseAllocation[]>();
  sharedAllocations.forEach((alloc) => {
    const list = allocationsByTx.get(alloc.transactionId) || [];
    list.push(alloc);
    allocationsByTx.set(alloc.transactionId, list);
  });

  // Calculate metrics per member
  const memberMetrics: MemberFinancialMetric[] = members.map((member) => {
    // 1. Incomes for this member
    const memberIncomes = filteredTxs
      .filter((tx) => (tx as any).userId === member.userId || (tx as any).memberId === member.id)
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amountMinor, 0);

    const totalIncomeMinor = memberIncomes > 0 ? memberIncomes : member.knownMonthlyIncomeMinor || 0;

    // 2. Direct expenses (non-shared consumption belonging to this member)
    const directConsumptionTxs = filteredTxs
      .filter((tx) => (tx as any).userId === member.userId || (tx as any).memberId === member.id)
      .filter((tx) => !(tx as any).isShared)
      .filter(isOrdinaryConsumptionExpense);

    const totalDirectExpensesMinor = directConsumptionTxs.reduce((sum, tx) => sum + tx.amountMinor, 0);

    // 3. Attributable shared expenses from sharedAllocations
    const memberSharedAllocations = sharedAllocations.filter(
      (alloc) => alloc.memberUserId === member.userId
    );
    const totalSharedExpensesMinor = memberSharedAllocations.reduce(
      (sum, alloc) => sum + alloc.allocatedAmountMinor,
      0
    );

    // Total attributable = direct + shared
    const totalAttributableExpensesMinor = totalDirectExpensesMinor + totalSharedExpensesMinor;

    // Net savings = income - attributable expenses
    const netSavingsMinor = totalIncomeMinor - totalAttributableExpensesMinor;

    // Savings rate % = (netSavings / income) * 100 [only when income > 0]
    const savingsRatePercent =
      totalIncomeMinor > 0 ? Number(((netSavingsMinor / totalIncomeMinor) * 100).toFixed(1)) : null;

    // Discretionary spending breakdown
    let discretionarySpendingMinor = 0;
    const categorySpending: Record<string, number> = {};

    directConsumptionTxs.forEach((tx) => {
      const cat = tx.category || 'General';
      categorySpending[cat] = (categorySpending[cat] || 0) + tx.amountMinor;
      if (DISCRETIONARY_CATEGORIES.has(cat.toLowerCase().trim())) {
        discretionarySpendingMinor += tx.amountMinor;
      }
    });

    // Also include category proportion of shared allocations
    memberSharedAllocations.forEach((alloc) => {
      const parentTx = filteredTxs.find((t) => t.id === alloc.transactionId);
      const cat = parentTx?.category || 'Shared General';
      categorySpending[cat] = (categorySpending[cat] || 0) + alloc.allocatedAmountMinor;
      if (DISCRETIONARY_CATEGORIES.has(cat.toLowerCase().trim())) {
        discretionarySpendingMinor += alloc.allocatedAmountMinor;
      }
    });

    const discretionaryRatioPercent =
      totalIncomeMinor > 0
        ? Number(((discretionarySpendingMinor / totalIncomeMinor) * 100).toFixed(1))
        : null;

    return {
      memberUserId: member.userId,
      memberName: member.name,
      email: member.email,
      role: member.role,
      incomeMinor: totalIncomeMinor,
      totalDirectExpensesMinor,
      totalSharedExpensesMinor,
      totalAttributableExpensesMinor,
      netSavingsMinor,
      savingsRatePercent,
      discretionarySpendingMinor,
      discretionaryRatioPercent,
      expenseContributionPercent: 0, // Populated below once family total is known
      categorySpending,
    };
  });

  // Calculate family aggregate totals
  const totalFamilyIncomeMinor = memberMetrics.reduce((sum, m) => sum + m.incomeMinor, 0);
  const totalFamilyExpensesMinor = memberMetrics.reduce(
    (sum, m) => sum + m.totalAttributableExpensesMinor,
    0
  );
  const periodNetSavingsMinor = totalFamilyIncomeMinor - totalFamilyExpensesMinor;

  const totalSharedExpensesMinor = sharedAllocations.reduce(
    (sum, a) => sum + a.allocatedAmountMinor,
    0
  );

  const familySavingsRatePercent =
    totalFamilyIncomeMinor > 0
      ? Number(((periodNetSavingsMinor / totalFamilyIncomeMinor) * 100).toFixed(1))
      : null;

  // Calculate expense contribution % for each member
  memberMetrics.forEach((m) => {
    m.expenseContributionPercent =
      totalFamilyExpensesMinor > 0
        ? Number(((m.totalAttributableExpensesMinor / totalFamilyExpensesMinor) * 100).toFixed(1))
        : 0;
  });

  // Family budget utilization calculation
  const totalBudgetMinor = members.reduce((sum, m) => sum + (m.allocatedBudgetMinor || 0), 0);
  const budgetUtilizationPercent =
    totalBudgetMinor > 0
      ? Number(((totalFamilyExpensesMinor / totalBudgetMinor) * 100).toFixed(1))
      : 0;

  // Derive comparative highlights (Objective & Neutral labels)
  const comparativeHighlights: FamilyAggregateMetrics['comparativeHighlights'] = {};

  // 1. Highest saver by amount
  const validSavers = memberMetrics.filter((m) => m.netSavingsMinor > 0);
  if (validSavers.length > 0) {
    const highestSaver = [...validSavers].sort((a, b) => b.netSavingsMinor - a.netSavingsMinor)[0];
    comparativeHighlights.highestSaverAmount = {
      memberName: highestSaver.memberName,
      amountMinor: highestSaver.netSavingsMinor,
    };
  }

  // 2. Highest savings rate (only for positive income)
  const validRateMembers = memberMetrics.filter((m) => m.savingsRatePercent !== null && m.incomeMinor > 0);
  if (validRateMembers.length > 0) {
    const highestRate = [...validRateMembers].sort(
      (a, b) => (b.savingsRatePercent || 0) - (a.savingsRatePercent || 0)
    )[0];
    comparativeHighlights.highestSavingsRate = {
      memberName: highestRate.memberName,
      ratePercent: highestRate.savingsRatePercent!,
    };
  }

  // 3. Lowest discretionary spending ratio
  const validDiscretionary = memberMetrics.filter((m) => m.discretionaryRatioPercent !== null && m.incomeMinor > 0);
  if (validDiscretionary.length > 0) {
    const lowestDisc = [...validDiscretionary].sort(
      (a, b) => (a.discretionaryRatioPercent || 0) - (b.discretionaryRatioPercent || 0)
    )[0];
    comparativeHighlights.lowestDiscretionaryRatio = {
      memberName: lowestDisc.memberName,
      ratioPercent: lowestDisc.discretionaryRatioPercent!,
    };
  }

  // 4. Highest share of household expenses
  if (totalFamilyExpensesMinor > 0) {
    const highestSpender = [...memberMetrics].sort(
      (a, b) => b.totalAttributableExpensesMinor - a.totalAttributableExpensesMinor
    )[0];
    comparativeHighlights.highestExpenseShare = {
      memberName: highestSpender.memberName,
      sharePercent: highestSpender.expenseContributionPercent,
    };
  }

  return {
    period: periodType,
    periodLabel,
    totalFamilyIncomeMinor,
    totalFamilyExpensesMinor,
    periodNetSavingsMinor,
    totalSharedExpensesMinor,
    familySavingsRatePercent,
    budgetUtilizationPercent,
    memberMetrics,
    comparativeHighlights,
  };
}
