import { IntentContext, IntentHandler, IntentResult } from './types';
import { formatINR } from '@/domain/money/formatters';
import { calculatePortfolioMetrics, calculateHoldingsDetailed, calculateSectorAllocation } from '@/features/investments/utils/investmentCalculations';

/**
 * Determine active target period from transactions or current date
 */
export function getTargetPeriod(transactions: any[]): { prefix: string; label: string } {
  if (!transactions || transactions.length === 0) {
    const d = new Date();
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return { prefix, label };
  }
  const sorted = [...transactions].sort((a: any, b: any) => b.date.localeCompare(a.date));
  const latestDate = sorted[0]?.date || '2026-10-15';
  const prefix = latestDate.slice(0, 7);
  const [year, month] = prefix.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, 1);
  const label = isNaN(dateObj.getTime())
    ? prefix
    : dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  return { prefix, label };
}

export const INTENT_REGISTRY: IntentHandler[] = [
  // -------------------------------------------------------------
  // 1. EXPENSES INTENTS
  // -------------------------------------------------------------
  {
    id: 'expense_month_total',
    name: 'Total Monthly Spending',
    category: 'expenses',
    keywords: ['spend', 'spent', 'expense', 'expenses', 'month'],
    patterns: [
      /how much (did i|have i) spend/i,
      /total (spending|expenses)/i,
      /monthly (spend|expense)/i,
    ],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('spend') || q.includes('spent') || q.includes('expense')) &&
        (q.includes('this month') || q.includes('total') || q.includes('how much')) &&
        !q.includes('food') &&
        !q.includes('shopping') &&
        !q.includes('dining')
      );
    },
    execute: (ctx) => {
      const { transactions } = ctx.storeState;
      const { prefix, label } = getTargetPeriod(transactions);
      const monthExpenses = transactions
        .filter((t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith(prefix))
        .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

      const count = transactions.filter(
        (t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith(prefix)
      ).length;

      return {
        intentId: 'expense_month_total',
        intentCategory: 'expenses',
        textResponse: `In ${label}, you have recorded ${count} expense transactions totaling ${formatINR(monthExpenses)}.`,
        card: {
          type: 'financial_summary',
          title: `${label} Outflow Summary`,
          subtitle: `${count} debit ledger transactions`,
          metrics: [
            { label: 'Total Spent', value: formatINR(monthExpenses) },
            { label: 'Transactions', value: count.toString() },
          ],
          actionLink: { label: 'View Expense Breakdown', href: '/app/expenses' },
        },
        suggestedFollowUps: [
          'What was my biggest expense?',
          'Which category costs me the most?',
          'How much did I earn this month?',
        ],
      };
    },
  },

  {
    id: 'expense_biggest',
    name: 'Biggest Expense',
    category: 'expenses',
    keywords: ['biggest', 'largest', 'highest', 'expensive'],
    patterns: [/biggest expense/i, /largest (expense|transaction|purchase)/i, /most expensive/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('biggest') || q.includes('largest') || q.includes('highest')) &&
        (q.includes('expense') || q.includes('spend') || q.includes('purchase'))
      );
    },
    execute: (ctx) => {
      const { transactions } = ctx.storeState;
      const expenses = transactions.filter((t: any) => t.type === 'expense' && t.status === 'completed');
      if (expenses.length === 0) {
        return {
          intentId: 'expense_biggest',
          intentCategory: 'expenses',
          textResponse: 'No completed expense transactions are currently recorded in your ledger.',
        };
      }

      const largest = [...expenses].sort((a: any, b: any) => b.amountMinor - a.amountMinor)[0];

      return {
        intentId: 'expense_biggest',
        intentCategory: 'expenses',
        textResponse: `Your largest recorded expense is ${formatINR(largest.amountMinor)} for "${largest.merchant}" (${largest.category}) on ${largest.date}.`,
        card: {
          type: 'financial_summary',
          title: 'Largest Recorded Transaction',
          subtitle: largest.notes || undefined,
          metrics: [
            { label: 'Merchant', value: largest.merchant },
            { label: 'Amount', value: formatINR(largest.amountMinor) },
            { label: 'Category', value: largest.category },
            { label: 'Date', value: largest.date },
          ],
          actionLink: { label: 'Inspect Transaction', href: `/app/transactions/${largest.id}` },
        },
        suggestedFollowUps: ['Which category costs me the most?', 'How much did I spend this month?'],
      };
    },
  },

  {
    id: 'expense_highest_category',
    name: 'Highest Expense Category',
    category: 'expenses',
    keywords: ['which category', 'highest category', 'costs me the most', 'most spend'],
    patterns: [/which category/i, /costs me the most/i, /top category/i, /where did my money go/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('category') && (q.includes('most') || q.includes('highest') || q.includes('top'))) ||
        q.includes('costs me the most') ||
        q.includes('where did my money go')
      );
    },
    execute: (ctx) => {
      const { transactions } = ctx.storeState;
      const map: Record<string, number> = {};
      let total = 0;
      transactions
        .filter((t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith('2026-10'))
        .forEach((t: any) => {
          map[t.category] = (map[t.category] || 0) + t.amountMinor;
          total += t.amountMinor;
        });

      const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
      const top = sorted[0];

      if (!top) {
        return {
          intentId: 'expense_highest_category',
          intentCategory: 'expenses',
          textResponse: 'No expenses have been recorded for this period yet.',
        };
      }

      const topPercent = total > 0 ? (top[1] / total) * 100 : 0;

      return {
        intentId: 'expense_highest_category',
        intentCategory: 'expenses',
        textResponse: `Your highest expense category this month is "${top[0]}" with ${formatINR(top[1])}, representing ${topPercent.toFixed(1)}% of your total spending.`,
        card: {
          type: 'category_breakdown',
          title: 'Top Expense Category',
          subtitle: `Accounts for ${topPercent.toFixed(1)}% of monthly outflow`,
          breakdown: sorted.slice(0, 4).map(([name, amountMinor]) => ({
            name,
            amountMinor,
            percent: total > 0 ? (amountMinor / total) * 100 : 0,
          })),
          actionLink: { label: 'Manage Categories', href: '/app/categories' },
        },
        suggestedFollowUps: ['How much is left in my food budget?', 'What was my biggest expense?'],
      };
    },
  },

  {
    id: 'expense_food_category',
    name: 'Food & Dining Spending',
    category: 'expenses',
    keywords: ['food', 'dining', 'groceries', 'restaurant', 'eat'],
    patterns: [/how much (did i|have i) spend on food/i, /food (spend|expense|budget)/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('food') || q.includes('dining') || q.includes('groceries')) &&
        (q.includes('spend') || q.includes('spent') || q.includes('how much') || q.includes('cost'))
      );
    },
    execute: (ctx) => {
      const { transactions, budgets } = ctx.storeState;
      const foodTxs = transactions.filter(
        (t: any) =>
          t.type === 'expense' &&
          t.status === 'completed' &&
          (t.category.toLowerCase().includes('food') || t.category.toLowerCase().includes('dining'))
      );

      const totalFoodMinor = foodTxs.reduce((sum: number, t: any) => sum + t.amountMinor, 0);
      const foodBudget = budgets.find((b: any) => b.category.toLowerCase().includes('food'));

      return {
        intentId: 'expense_food_category',
        intentCategory: 'expenses',
        textResponse: `You have spent ${formatINR(totalFoodMinor)} across ${foodTxs.length} food & dining transactions in October 2026. ${
          foodBudget
            ? `Your monthly allocated food budget is ${formatINR(foodBudget.allocatedMinor)} (${((totalFoodMinor / foodBudget.allocatedMinor) * 100).toFixed(1)}% utilized).`
            : ''
        }`,
        card: {
          type: 'budget_status',
          title: 'Food & Dining Outflow',
          metrics: [
            { label: 'Amount Spent', value: formatINR(totalFoodMinor) },
            { label: 'Budget Limit', value: foodBudget ? formatINR(foodBudget.allocatedMinor) : 'Not Set' },
            {
              label: 'Remaining',
              value: foodBudget ? formatINR(Math.max(0, foodBudget.allocatedMinor - totalFoodMinor)) : '—',
            },
          ],
          actionLink: { label: 'Review Food Budget', href: '/app/budgets' },
        },
        suggestedFollowUps: ['Which budgets are close to their limit?', 'How much did I spend this month?'],
      };
    },
  },

  // -------------------------------------------------------------
  // 2. INCOME & CASH FLOW INTENTS
  // -------------------------------------------------------------
  {
    id: 'income_total',
    name: 'Total Income / Earnings',
    category: 'income',
    keywords: ['earn', 'earned', 'income', 'salary', 'cash flow', 'net cash flow'],
    patterns: [/how much (did i|have i) earn/i, /total income/i, /net cash flow/i, /compare income and expenses/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        q.includes('earn') ||
        q.includes('earned') ||
        q.includes('income') ||
        q.includes('salary') ||
        q.includes('cash flow')
      );
    },
    execute: (ctx) => {
      const { transactions } = ctx.storeState;
      const { prefix, label } = getTargetPeriod(transactions);
      const monthIncome = transactions
        .filter((t: any) => t.type === 'income' && t.status === 'completed' && t.date.startsWith(prefix))
        .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

      const monthExpenses = transactions
        .filter((t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith(prefix))
        .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

      const netCashFlow = monthIncome - monthExpenses;
      const savingsRate = monthIncome > 0 ? (netCashFlow / monthIncome) * 100 : 0;

      return {
        intentId: 'income_total',
        intentCategory: 'income',
        textResponse: `In ${label}, your total credited income is ${formatINR(monthIncome)}. Total debits are ${formatINR(monthExpenses)}, resulting in a positive net cash flow of ${formatINR(netCashFlow)} (savings rate: ${savingsRate.toFixed(1)}%).`,
        card: {
          type: 'financial_summary',
          title: `${label} Cash Flow Reconciliation`,
          metrics: [
            { label: 'Credits (Income)', value: formatINR(monthIncome) },
            { label: 'Debits (Expenses)', value: formatINR(monthExpenses) },
            { label: 'Net Cash Flow', value: `${netCashFlow >= 0 ? '+' : ''}${formatINR(netCashFlow)}` },
            { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%` },
          ],
          actionLink: { label: 'View Dashboard Analytics', href: '/app/dashboard' },
        },
        suggestedFollowUps: ['What is my available cash balance?', 'What is my portfolio worth?'],
      };
    },
  },

  // -------------------------------------------------------------
  // 3. BANKING INTENTS
  // -------------------------------------------------------------
  {
    id: 'banking_balances',
    name: 'Liquid Cash & Accounts Balance',
    category: 'banking',
    keywords: ['cash balance', 'available cash', 'show my accounts', 'bank balance', 'liquid cash'],
    patterns: [/available cash/i, /cash balance/i, /show my accounts/i, /bank balance/i, /which account has the highest/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('account') || q.includes('balance') || q.includes('bank') || q.includes('cash')) &&
        (q.includes('available') || q.includes('show') || q.includes('highest') || q.includes('total') || q.includes('what'))
      );
    },
    execute: (ctx) => {
      const { accounts, transactions } = ctx.storeState;

      // Pure account balance derivation
      const balances = accounts.map((acc: any) => {
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
        return { ...acc, currentBalanceMinor: bal };
      });

      const nonCredit = balances.filter((a: any) => a.accountType !== 'credit');
      const totalLiquidMinor = nonCredit.reduce((sum: number, a: any) => sum + a.currentBalanceMinor, 0);
      const sortedByBalance = [...nonCredit].sort((a, b) => b.currentBalanceMinor - a.currentBalanceMinor);
      const highest = sortedByBalance[0];

      return {
        intentId: 'banking_balances',
        intentCategory: 'banking',
        textResponse: `You have ${formatINR(totalLiquidMinor)} in total liquid cash across ${nonCredit.length} connected depository accounts. Your highest balance account is "${highest?.name}" at ${formatINR(highest?.currentBalanceMinor || 0)}.`,
        card: {
          type: 'account_balances',
          title: 'Connected Account Balances',
          metrics: [
            { label: 'Total Liquid Cash', value: formatINR(totalLiquidMinor) },
            { label: 'Depository Accounts', value: nonCredit.length.toString() },
          ],
          breakdown: balances.map((a: any) => ({
            name: `${a.name} (${a.institution})`,
            amountMinor: a.currentBalanceMinor,
            percent: totalLiquidMinor > 0 && a.accountType !== 'credit' ? (a.currentBalanceMinor / totalLiquidMinor) * 100 : 0,
          })),
          actionLink: { label: 'Open Banking Hub', href: '/app/banking' },
        },
        suggestedFollowUps: ['What bills are coming up?', 'What is my portfolio worth?'],
      };
    },
  },

  {
    id: 'banking_bills_recurring',
    name: 'Upcoming Bills & Recurring Payments',
    category: 'banking',
    keywords: ['bill', 'bills', 'recurring', 'upcoming', 'due', 'due date'],
    patterns: [/what bills are coming up/i, /upcoming bills/i, /recurring payments/i, /any bills due/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('bill') || q.includes('bills') || q.includes('recurring')) &&
        (q.includes('upcoming') || q.includes('due') || q.includes('coming up') || q.includes('what') || q.includes('have'))
      );
    },
    execute: (ctx) => {
      const { bills, recurringRules } = ctx.storeState;
      const unpaidBills = (bills || []).filter((b: any) => b.status !== 'paid');
      const totalDueMinor = unpaidBills.reduce((sum: number, b: any) => sum + b.amountMinor, 0);

      return {
        intentId: 'banking_bills_recurring',
        intentCategory: 'banking',
        textResponse: `You have ${unpaidBills.length} pending bill payments totaling ${formatINR(totalDueMinor)}, and ${recurringRules?.length || 0} active recurring automated rules.`,
        card: {
          type: 'financial_summary',
          title: 'Upcoming Commitments & Subscriptions',
          metrics: [
            { label: 'Unpaid Bills', value: unpaidBills.length.toString() },
            { label: 'Total Due', value: formatINR(totalDueMinor) },
            { label: 'Recurring Rules', value: (recurringRules?.length || 0).toString() },
          ],
          actionLink: { label: 'Pay Scheduled Bills', href: '/app/banking/bills' },
        },
        suggestedFollowUps: ['What is my available cash balance?', 'Which budgets are close to their limit?'],
      };
    },
  },

  // -------------------------------------------------------------
  // 4. BUDGET INTENTS
  // -------------------------------------------------------------
  {
    id: 'budget_thresholds',
    name: 'Budget Utilization & Warnings',
    category: 'budgets',
    keywords: ['budget', 'budgets', 'limit', 'exceeded', 'close to limit'],
    patterns: [/which budgets are close/i, /exceeded any budgets/i, /budget (status|warning|limits)/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        q.includes('budget') &&
        (q.includes('limit') || q.includes('close') || q.includes('exceeded') || q.includes('warning') || q.includes('status'))
      );
    },
    execute: (ctx) => {
      const { budgets, transactions } = ctx.storeState;

      const summaries = budgets.map((b: any) => {
        const spent = transactions
          .filter(
            (t: any) =>
              t.type === 'expense' &&
              t.status === 'completed' &&
              t.category.toLowerCase() === b.category.toLowerCase() &&
              t.date.startsWith('2026-10')
          )
          .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

        const pct = b.allocatedMinor > 0 ? (spent / b.allocatedMinor) * 100 : 0;
        return {
          category: b.category,
          allocatedMinor: b.allocatedMinor,
          spentMinor: spent,
          percent: pct,
          isNearing: pct >= b.alertThresholdPercent && pct < 100,
          isExceeded: pct >= 100,
        };
      });

      const exceeded = summaries.filter((s: any) => s.isExceeded);
      const nearing = summaries.filter((s: any) => s.isNearing);

      let summaryText = 'All your spending categories are currently within allocated budget bounds.';
      if (exceeded.length > 0) {
        summaryText = `Warning: You have exceeded budget in ${exceeded.map((e: any) => e.category).join(', ')}.`;
      } else if (nearing.length > 0) {
        summaryText = `Notice: ${nearing.map((n: any) => `${n.category} (${n.percent.toFixed(0)}%)`).join(', ')} is nearing its alert threshold.`;
      }

      return {
        intentId: 'budget_thresholds',
        intentCategory: 'budgets',
        textResponse: summaryText,
        card: {
          type: 'budget_status',
          title: 'Budget Performance Tracker',
          breakdown: summaries.map((s: any) => ({
            name: s.category,
            amountMinor: s.spentMinor,
            percent: s.percent,
          })),
          actionLink: { label: 'Review All Budgets', href: '/app/budgets' },
        },
        suggestedFollowUps: ['Which category costs me the most?', 'What was my biggest expense?'],
      };
    },
  },

  // -------------------------------------------------------------
  // 5. INVESTMENT INTENTS
  // -------------------------------------------------------------
  {
    id: 'investments_portfolio_summary',
    name: 'Investment Portfolio Value & Returns',
    category: 'investments',
    keywords: ['portfolio', 'investments', 'stocks', 'profit or loss', 'worth', 'holding'],
    patterns: [/what is my portfolio worth/i, /am i making a profit/i, /portfolio (value|returns|performance)/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('portfolio') || q.includes('invest') || q.includes('stock')) &&
        (q.includes('worth') || q.includes('value') || q.includes('profit') || q.includes('loss') || q.includes('return'))
      );
    },
    execute: (ctx) => {
      const { holdings, quotes } = ctx.storeState;
      const metrics = calculatePortfolioMetrics(holdings, quotes);
      const isPos = metrics.unrealizedGainLossMinor >= 0;

      return {
        intentId: 'investments_portfolio_summary',
        intentCategory: 'investments',
        textResponse: `Your investment portfolio is currently valued at ${formatINR(metrics.totalValueMinor)} over a total invested cost basis of ${formatINR(metrics.totalInvestedMinor)}. You have an unrealized ${isPos ? 'profit' : 'loss'} of ${isPos ? '+' : ''}${formatINR(metrics.unrealizedGainLossMinor)} (${metrics.unrealizedReturnPercent.toFixed(2)}%).`,
        card: {
          type: 'portfolio_summary',
          title: 'Investment Portfolio Snapshot',
          metrics: [
            { label: 'Current Valuation', value: formatINR(metrics.totalValueMinor) },
            { label: 'Total Invested', value: formatINR(metrics.totalInvestedMinor) },
            {
              label: 'Unrealized P&L',
              value: `${isPos ? '+' : ''}${formatINR(metrics.unrealizedGainLossMinor)} (${metrics.unrealizedReturnPercent.toFixed(2)}%)`,
            },
            { label: 'Active Positions', value: metrics.holdingsCount.toString() },
          ],
          actionLink: { label: 'Open Investments Hub', href: '/app/investments' },
        },
        suggestedFollowUps: ['Which stock is my largest holding?', 'How diversified is my portfolio?'],
      };
    },
  },

  {
    id: 'investments_diversification',
    name: 'Portfolio Diversification & Largest Holding',
    category: 'investments',
    keywords: ['largest holding', 'diversified', 'diversification', 'sector allocation'],
    patterns: [/largest holding/i, /how diversified/i, /sector allocation/i, /concentration/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('holding') || q.includes('sector') || q.includes('diversif') || q.includes('concentration')) &&
        (q.includes('largest') || q.includes('how') || q.includes('explain') || q.includes('allocation'))
      );
    },
    execute: (ctx) => {
      const { holdings, quotes } = ctx.storeState;
      const detailed = calculateHoldingsDetailed(holdings, quotes);
      const sectors = calculateSectorAllocation(holdings, quotes);

      const sortedHoldings = [...detailed].sort((a, b) => b.currentValueMinor - a.currentValueMinor);
      const topHolding = sortedHoldings[0];
      const topSector = sectors[0];

      if (!topHolding) {
        return {
          intentId: 'investments_diversification',
          intentCategory: 'investments',
          textResponse: 'No investment positions are currently tracked in your portfolio.',
        };
      }

      return {
        intentId: 'investments_diversification',
        intentCategory: 'investments',
        textResponse: `Your largest holding is ${topHolding.ticker} (${topHolding.companyName}), representing ${topHolding.portfolioWeightPercent.toFixed(1)}% of your portfolio (${formatINR(topHolding.currentValueMinor)}). Your leading sector is ${topSector?.sector || 'IT'} (${topSector?.percent.toFixed(1) || 0}%).`,
        card: {
          type: 'portfolio_summary',
          title: 'Concentration Analysis',
          metrics: [
            { label: 'Top Holding', value: `${topHolding.ticker} (${topHolding.portfolioWeightPercent.toFixed(1)}%)` },
            { label: 'Leading Sector', value: `${topSector?.sector || 'N/A'} (${topSector?.percent.toFixed(1) || 0}%)` },
          ],
          breakdown: sectors.map((s) => ({
            name: s.sector,
            amountMinor: s.valueMinor,
            percent: s.percent,
          })),
          actionLink: { label: 'View Portfolio Analytics', href: '/app/investments/analytics' },
        },
        suggestedFollowUps: ['What is my portfolio worth?', 'Am I making a profit or loss?'],
      };
    },
  },

  // -------------------------------------------------------------
  // 6. FINANCIAL PLANNER & GOAL INTENTS
  // -------------------------------------------------------------
  {
    id: 'planner_goals_progress',
    name: 'Savings Goals & Planning Projections',
    category: 'planner',
    keywords: ['goal', 'goals', 'save', 'saving', 'planner', 'target'],
    patterns: [/reach my goal/i, /how much progress/i, /how much should i save/i, /what if i save/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('goal') || q.includes('save') || q.includes('target')) &&
        (q.includes('progress') || q.includes('reach') || q.includes('should') || q.includes('how much') || q.includes('what if'))
      );
    },
    execute: (ctx) => {
      const { goals } = ctx.storeState;
      const primaryGoal = goals[0];

      if (!primaryGoal) {
        return {
          intentId: 'planner_goals_progress',
          intentCategory: 'planner',
          textResponse: 'You have not configured any savings goals yet. Create a goal in the Financial Planner to simulate monthly contributions.',
          card: {
            type: 'goal_projection',
            title: 'No Active Savings Goals',
            actionLink: { label: 'Create First Goal', href: '/app/financial-planner' },
          },
        };
      }

      const remainingMinor = Math.max(0, primaryGoal.targetAmountMinor - primaryGoal.currentAmountMinor);
      const progressPercent = (primaryGoal.currentAmountMinor / primaryGoal.targetAmountMinor) * 100;

      return {
        intentId: 'planner_goals_progress',
        intentCategory: 'planner',
        textResponse: `For your primary goal "${primaryGoal.title}", you have saved ${formatINR(primaryGoal.currentAmountMinor)} out of ${formatINR(primaryGoal.targetAmountMinor)} (${progressPercent.toFixed(1)}% complete). You have ${formatINR(remainingMinor)} remaining until target date ${primaryGoal.targetDate}.`,
        card: {
          type: 'goal_projection',
          title: primaryGoal.title,
          metrics: [
            { label: 'Target Amount', value: formatINR(primaryGoal.targetAmountMinor) },
            { label: 'Saved So Far', value: formatINR(primaryGoal.currentAmountMinor) },
            { label: 'Remaining', value: formatINR(remainingMinor) },
            { label: 'Monthly Contribution', value: formatINR(primaryGoal.monthlyContributionTargetMinor) },
          ],
          actionLink: { label: 'Inspect Goal Details', href: `/app/financial-planner/goals/${primaryGoal.id}` },
        },
        suggestedFollowUps: ['What is my available cash balance?', 'How much did I save this month?'],
      };
    },
  },

  // -------------------------------------------------------------
  // 7. FINANCIAL EDUCATION INTENTS
  // -------------------------------------------------------------
  {
    id: 'education_concepts',
    name: 'Financial Literacy Concepts (SIP, ETF, Diversification, Compounding)',
    category: 'education',
    keywords: ['what is', 'explain', 'sip', 'etf', 'compounding', 'inflation', 'p/e ratio', 'pe ratio'],
    patterns: [
      /what is (a )?sip/i,
      /what is (an )?etf/i,
      /explain diversification/i,
      /explain compound interest/i,
      /what is inflation/i,
      /what does p\/?e ratio mean/i,
    ],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('what is') || q.includes('explain') || q.includes('meaning') || q.includes('definition')) &&
        (q.includes('sip') ||
          q.includes('etf') ||
          q.includes('diversif') ||
          q.includes('compound') ||
          q.includes('inflation') ||
          q.includes('p/e') ||
          q.includes('pe ratio'))
      );
    },
    execute: (ctx) => {
      const q = ctx.normalizedQuestion;

      if (q.includes('sip')) {
        return {
          intentId: 'education_concepts',
          intentCategory: 'education',
          textResponse:
            'A Systematic Investment Plan (SIP) is an investment vehicle that allows you to invest a fixed amount of money at regular intervals (monthly or quarterly) into a mutual fund scheme, fostering disciplined investing and rupee-cost averaging.',
          card: {
            type: 'concept_explanation',
            title: 'Systematic Investment Plan (SIP)',
            educationalNote:
              'Rupee cost averaging mitigates market volatility by purchasing more mutual fund units when prices are lower and fewer units when prices rise.',
            actionLink: { label: 'Read SIP Masterclass', href: '/app/learning/topics/mutual-funds-and-sips' },
          },
        };
      }

      if (q.includes('etf')) {
        return {
          intentId: 'education_concepts',
          intentCategory: 'education',
          textResponse:
            'An Exchange-Traded Fund (ETF) is a pooled investment fund traded on public stock exchanges like individual equities. ETFs typically track an underlying benchmark index (such as NIFTY 50) with lower expense ratios.',
          card: {
            type: 'concept_explanation',
            title: 'Exchange-Traded Funds (ETFs)',
            educationalNote:
              'ETFs combine the diversification benefits of mutual funds with the real-time pricing and liquidity of individual common stocks.',
            actionLink: { label: 'Explore ETF Academy Guide', href: '/app/learning/topics/index-funds-and-etfs' },
          },
        };
      }

      if (q.includes('diversif')) {
        return {
          intentId: 'education_concepts',
          intentCategory: 'education',
          textResponse:
            'Diversification is a risk-management strategy that mixes a wide variety of investments within a portfolio. A diversified portfolio yields higher long-term returns and lowers risk by preventing single-asset collapse.',
          card: {
            type: 'concept_explanation',
            title: 'Portfolio Diversification Principles',
            educationalNote:
              '"Do not put all your eggs in one basket." Spread capital across equities, debt, gold, and diverse industry sectors.',
            actionLink: { label: 'Check Your Portfolio Risk', href: '/app/investments/analytics' },
          },
        };
      }

      if (q.includes('compound')) {
        return {
          intentId: 'education_concepts',
          intentCategory: 'education',
          textResponse:
            'Compound interest is the addition of interest to the principal sum of an investment, where interest earned also starts generating interest in subsequent compounding cycles.',
          card: {
            type: 'concept_explanation',
            title: 'Power of Compound Interest',
            educationalNote:
              'Formula: A = P(1 + r/n)^(nt). Starting investments just 5 years earlier can double your retirement nest egg.',
            actionLink: { label: 'Learn Compounding Mathematics', href: '/app/learning/topics/power-of-compounding' },
          },
        };
      }

      if (q.includes('inflation')) {
        return {
          intentId: 'education_concepts',
          intentCategory: 'education',
          textResponse:
            'Inflation is the general increase in prices and fall in the purchasing value of money over time. To preserve real wealth, investment returns must exceed the prevailing inflation rate.',
          card: {
            type: 'concept_explanation',
            title: 'Inflation & Purchasing Power',
            educationalNote:
              'If inflation is 6% per annum, ₹1,00,000 today will only buy ₹94,000 worth of equivalent goods next year.',
            actionLink: { label: 'Read Inflation Protection Guide', href: '/app/learning/topics/inflation-and-real-returns' },
          },
        };
      }

      return {
        intentId: 'education_concepts',
        intentCategory: 'education',
        textResponse:
          'The Price-to-Earnings (P/E) ratio measures a company’s current stock price relative to its earnings per share (EPS). High P/E often indicates high market growth expectations.',
        card: {
          type: 'concept_explanation',
          title: 'Price-to-Earnings (P/E) Ratio',
          educationalNote:
            'Formula: Share Price / EPS. Used by value investors to gauge whether an equity is overvalued or undervalued relative to historical sector peers.',
          actionLink: { label: 'Explore Stock Fundamentals', href: '/app/learning/topics/stock-market-fundamentals' },
        },
      };
    },
  },

  // -------------------------------------------------------------
  // 6. GREETINGS & CO-PILOT ASSISTANT
  // -------------------------------------------------------------
  {
    id: 'greeting_intro',
    name: 'Assistant Introduction & Capabilities',
    category: 'education',
    keywords: ['hi', 'hello', 'hey', 'help', 'who are you', 'capabilities'],
    patterns: [/^(hi|hello|hey)\b/i, /who are you/i, /what can you do/i, /help/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        q === 'hi' ||
        q === 'hello' ||
        q === 'hey' ||
        q.startsWith('hi ') ||
        q.startsWith('hello ') ||
        q.includes('who are you') ||
        q.includes('what can you do') ||
        q.includes('help me') ||
        q === 'help'
      );
    },
    execute: (ctx) => {
      const { accounts = [], transactions = [] } = ctx.storeState;
      const totalCash = accounts
        .filter((a: any) => !a.isArchived)
        .reduce((sum: number, a: any) => {
          let b = a.openingBalanceMinor;
          for (const tx of transactions) {
            if (tx.status === 'flagged') continue;
            if (tx.accountId === a.id) {
              if (tx.type === 'expense' || tx.type === 'transfer') b -= tx.amountMinor;
              if (tx.type === 'income') b += tx.amountMinor;
            }
            if (tx.type === 'transfer' && tx.targetAccountId === a.id) b += tx.amountMinor;
          }
          return sum + b;
        }, 0);

      return {
        intentId: 'greeting_intro',
        intentCategory: 'education',
        textResponse: `Hello! I am your EXPENZO Financial Intelligence Co-pilot. You currently have ${accounts.length} linked account(s) with ${formatINR(totalCash)} in total liquid balance.

I can assist you with:
• **Spending Analysis**: "How much did I spend this month?", "What was my biggest expense?"
• **Bank Balances**: "What is my bank balance?", "Show all my accounts"
• **Budget Tracking**: "How much budget is left?", "Am I within budget?"
• **Savings & Goals**: "How are my savings goals?", "Explain the 50/30/20 rule"
• **Investments**: "What is my portfolio worth?", "What is a SIP?"
• **Tax Planning**: "How can I save tax under Section 80C?"

What would you like to explore?`,
        card: {
          type: 'financial_summary',
          title: 'EXPENZO Financial Co-Pilot',
          subtitle: 'Active Portfolio & Financial Assistant',
          metrics: [
            { label: 'Linked Accounts', value: accounts.length.toString() },
            { label: 'Available Balance', value: formatINR(totalCash) },
          ],
          actionLink: { label: 'Go to Financial Dashboard', href: '/app/dashboard' },
        },
        suggestedFollowUps: [
          'How much did I spend this month?',
          'What is my available cash balance?',
          'How much budget is left?',
          'Explain the 50/30/20 rule',
        ],
      };
    },
  },

  // -------------------------------------------------------------
  // 7. BANK ACCOUNTS BREAKDOWN
  // -------------------------------------------------------------
  {
    id: 'bank_accounts_breakdown',
    name: 'Bank Accounts Breakdown',
    category: 'banking',
    keywords: ['accounts', 'bank', 'banks', 'balance', 'balances', 'hdfc', 'sbi', 'icici', 'axis', 'kotak'],
    patterns: [/account(s)?/i, /bank(s)?/i, /balance(s)?/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        (q.includes('account') || q.includes('accounts') || q.includes('bank') || q.includes('banks')) &&
        (q.includes('show') || q.includes('list') || q.includes('my') || q.includes('balance') || q.includes('what') || q.includes('where'))
      );
    },
    execute: (ctx) => {
      const { accounts = [], transactions = [] } = ctx.storeState;
      const active = accounts.filter((a: any) => !a.isArchived);

      const items = active.map((a: any) => {
        let b = a.openingBalanceMinor;
        for (const tx of transactions) {
          if (tx.status === 'flagged') continue;
          if (tx.accountId === a.id) {
            if (tx.type === 'expense' || tx.type === 'transfer') b -= tx.amountMinor;
            if (tx.type === 'income') b += tx.amountMinor;
          }
          if (tx.type === 'transfer' && tx.targetAccountId === a.id) b += tx.amountMinor;
        }
        return {
          id: a.id,
          name: `${a.name} (${a.institution})`,
          balance: b,
          type: a.accountType,
        };
      });

      const totalBalance = items.reduce((sum: number, it: any) => sum + it.balance, 0);

      const breakdownText = items
        .map((it: any) => `• **${it.name}**: ${formatINR(it.balance)}`)
        .join('\n');

      return {
        intentId: 'bank_accounts_breakdown',
        intentCategory: 'banking',
        textResponse: `You have ${active.length} active bank and cash account(s) totaling ${formatINR(totalBalance)} in liquid balance:

${breakdownText}`,
        card: {
          type: 'financial_summary',
          title: 'Connected Accounts Ledger',
          subtitle: `${active.length} Verified Bank Accounts`,
          breakdown: items.map((it: any) => ({
            name: it.name,
            amountMinor: it.balance,
            percent: totalBalance > 0 ? Math.max(0, (it.balance / totalBalance) * 100) : 0,
          })),
          metrics: [
            { label: 'Total Liquid Cash', value: formatINR(totalBalance) },
            { label: 'Active Accounts', value: active.length.toString() },
          ],
          actionLink: { label: 'Manage Accounts & Transfer', href: '/app/banking' },
        },
        suggestedFollowUps: [
          'What is my available cash balance?',
          'How much did I spend this month?',
          'Record a transfer',
        ],
      };
    },
  },

  // -------------------------------------------------------------
  // 8. BUDGET STATUS OVERVIEW
  // -------------------------------------------------------------
  {
    id: 'budget_status_overview',
    name: 'Budget Status Overview',
    category: 'budgets',
    keywords: ['budget', 'budgets', 'limit', 'allocated'],
    patterns: [/budget(s)?/i, /spending limit/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        q.includes('budget') ||
        q.includes('budgets') ||
        (q.includes('within') && q.includes('limit'))
      );
    },
    execute: (ctx) => {
      const { budgets = [], transactions = [] } = ctx.storeState;
      const { prefix, label } = getTargetPeriod(transactions);

      if (budgets.length === 0) {
        return {
          intentId: 'budget_status_overview',
          intentCategory: 'budgets',
          textResponse: `You do not have any active monthly budgets configured yet. Setting category budgets helps avoid overspending.`,
          card: {
            type: 'financial_summary',
            title: 'No Budgets Configured',
            subtitle: 'Establish spending limits for Food, Shopping, and Housing',
            actionLink: { label: 'Create a Budget', href: '/app/budgets' },
          },
        };
      }

      const totalAllocated = budgets.reduce((sum: number, b: any) => sum + b.allocatedMinor, 0);
      let totalSpent = 0;

      const items = budgets.map((b: any) => {
        const spent = transactions
          .filter((t: any) => t.type === 'expense' && t.category === b.category && t.date.startsWith(prefix))
          .reduce((sum: number, t: any) => sum + t.amountMinor, 0);
        totalSpent += spent;
        const remaining = Math.max(0, b.allocatedMinor - spent);
        const percent = b.allocatedMinor > 0 ? (spent / b.allocatedMinor) * 100 : 0;
        return {
          category: b.category,
          allocated: b.allocatedMinor,
          spent,
          remaining,
          percent,
        };
      });

      const overBudgetItems = items.filter((it: any) => it.spent > it.allocated);
      const remainingTotal = Math.max(0, totalAllocated - totalSpent);

      const budgetList = items
        .map(
          (it: any) =>
            `• **${it.category}**: ${formatINR(it.spent)} / ${formatINR(it.allocated)} (${it.percent.toFixed(0)}%) ${
              it.spent > it.allocated ? '⚠️ OVER BUDGET' : `(₹${(it.remaining / 100).toLocaleString('en-IN')} left)`
            }`
        )
        .join('\n');

      return {
        intentId: 'budget_status_overview',
        intentCategory: 'budgets',
        textResponse: `In ${label}, your overall budget utilization is ${(totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0).toFixed(0)}% (${formatINR(totalSpent)} spent out of ${formatINR(totalAllocated)} allocated, with ${formatINR(remainingTotal)} remaining):

${budgetList}
${overBudgetItems.length > 0 ? `\n⚠️ You have exceeded budget in: ${overBudgetItems.map((o: any) => o.category).join(', ')}.` : '\n✅ All tracked categories are within budget limits.'}`,
        card: {
          type: 'financial_summary',
          title: `${label} Budget Status`,
          subtitle: `${budgets.length} Categories Monitored`,
          metrics: [
            { label: 'Total Allocated', value: formatINR(totalAllocated) },
            { label: 'Total Spent', value: formatINR(totalSpent) },
            { label: 'Remaining', value: formatINR(remainingTotal) },
            { label: 'Utilization', value: `${(totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0).toFixed(0)}%` },
          ],
          breakdown: items.map((it: any) => ({
            name: it.category,
            amountMinor: it.spent,
            percent: Math.min(100, it.percent),
          })),
          actionLink: { label: 'Manage Budgets', href: '/app/budgets' },
        },
        suggestedFollowUps: [
          'How much did I spend this month?',
          'What was my biggest expense?',
          'Explain the 50/30/20 rule',
        ],
      };
    },
  },

  // -------------------------------------------------------------
  // 9. 50/30/20 BUDGETING RULE
  // -------------------------------------------------------------
  {
    id: 'planning_50_30_20',
    name: '50-30-20 Budgeting Rule',
    category: 'education',
    keywords: ['50 30 20', '50/30/20', 'rule', 'split', 'allocation'],
    patterns: [/50[ /]30[ /]20/i, /budget rule/i, /salary allocation/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        q.includes('50 30 20') ||
        q.includes('50/30/20') ||
        (q.includes('rule') && (q.includes('budget') || q.includes('save') || q.includes('salary')))
      );
    },
    execute: (ctx) => {
      const { transactions = [] } = ctx.storeState;
      const { prefix } = getTargetPeriod(transactions);
      const income = transactions
        .filter((t: any) => t.type === 'income' && t.status === 'completed' && t.date.startsWith(prefix))
        .reduce((sum: number, t: any) => sum + t.amountMinor, 0) || 5000000;

      const needs = Math.round(income * 0.5);
      const wants = Math.round(income * 0.3);
      const savings = Math.round(income * 0.2);

      return {
        intentId: 'planning_50_30_20',
        intentCategory: 'education',
        textResponse: `The **50/30/20 Rule** is a gold-standard personal finance framework:

• **50% Needs (${formatINR(needs)})**: Essential living expenses (Rent, groceries, utilities, EMIs, healthcare).
• **30% Wants (${formatINR(wants)})**: Discretionary lifestyle spending (Dining out, entertainment, shopping, vacations).
• **20% Savings & Debt (${formatINR(savings)})**: Wealth building and security (SIP mutual funds, emergency fund, PPF, principal prepayments).

Applied to your monthly income of ${formatINR(income)}, you should aim to allocate ${formatINR(needs)} for essentials and build at least ${formatINR(savings)} in long-term savings every month.`,
        card: {
          type: 'financial_summary',
          title: '50/30/20 Allocation Plan',
          subtitle: `Targeted on ${formatINR(income)} Monthly Inflow`,
          breakdown: [
            { name: '50% Needs (Essentials & Fixed Costs)', amountMinor: needs, percent: 50 },
            { name: '30% Wants (Lifestyle & Discretionary)', amountMinor: wants, percent: 30 },
            { name: '20% Savings (SIP, PPF, Emergency Fund)', amountMinor: savings, percent: 20 },
          ],
          actionLink: { label: 'Review Current Spending', href: '/app/expenses' },
        },
        suggestedFollowUps: [
          'How much did I spend this month?',
          'What is a SIP?',
          'How to build an emergency fund?',
        ],
      };
    },
  },

  // -------------------------------------------------------------
  // 10. TAX SAVING UNDER SECTION 80C
  // -------------------------------------------------------------
  {
    id: 'tax_savings_80c',
    name: 'Tax Saving & Section 80C',
    category: 'education',
    keywords: ['tax', '80c', 'income tax', 'regime', 'save tax'],
    patterns: [/tax/i, /80c/i, /regime/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return (
        q.includes('tax') ||
        q.includes('80c') ||
        q.includes('regime')
      );
    },
    execute: () => {
      return {
        intentId: 'tax_savings_80c',
        intentCategory: 'education',
        textResponse: `Under Indian Income Tax laws, you have two primary regimes:

• **New Tax Regime (Default)**: Offers lower tax slab rates (no tax up to ₹7 Lakhs taxable income with rebate under Sec 87A), but disallows most Chapter VI-A deductions.
• **Old Tax Regime**: Beneficial if you utilize major deductions:
  1. **Section 80C (Up to ₹1.5 Lakhs)**: ELSS mutual funds (3-year lock-in), EPF, PPF, National Savings Certificate (NSC), Life Insurance Premiums, Home Loan Principal repayment.
  2. **Section 80CCD(1B) (Additional ₹50,000)**: National Pension System (NPS).
  3. **Section 80D (Up to ₹25,000 to ₹50,000)**: Health insurance premiums for self and senior citizen parents.
  4. **Section 24(b) (Up to ₹2 Lakhs)**: Home loan interest payment.

**Action Tip**: Calculate your total deductions. If deductions exceed ~₹3.75 Lakhs, the Old Regime usually saves more tax; otherwise, the New Regime is typically more tax-efficient.`,
        card: {
          type: 'concept_explanation',
          title: 'Section 80C & Tax Deductions Summary',
          educationalNote: 'ELSS mutual funds offer the shortest lock-in period (3 years) under Section 80C while providing equity market compounding returns.',
          actionLink: { label: 'Learn More in Financial Literacy', href: '/app/learning' },
        },
        suggestedFollowUps: [
          'What is a SIP?',
          'Explain the 50/30/20 rule',
          'What is an ETF?',
        ],
      };
    },
  },

  // -------------------------------------------------------------
  // 11. EMERGENCY FUND SIZING
  // -------------------------------------------------------------
  {
    id: 'emergency_fund_calc',
    name: 'Emergency Fund Calculation',
    category: 'education',
    keywords: ['emergency fund', 'safety net', 'emergency reserve'],
    patterns: [/emergency fund/i, /safety net/i, /emergency reserve/i],
    match: (ctx) => {
      const q = ctx.normalizedQuestion;
      return q.includes('emergency fund') || q.includes('safety net') || q.includes('emergency reserve');
    },
    execute: (ctx) => {
      const { transactions = [], accounts = [] } = ctx.storeState;
      const { prefix } = getTargetPeriod(transactions);
      const monthlySpent = transactions
        .filter((t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith(prefix))
        .reduce((sum: number, t: any) => sum + t.amountMinor, 0) || 2000000;

      const target3Months = monthlySpent * 3;
      const target6Months = monthlySpent * 6;

      const totalCash = accounts
        .filter((a: any) => !a.isArchived)
        .reduce((sum: number, a: any) => {
          let b = a.openingBalanceMinor;
          for (const tx of transactions) {
            if (tx.status === 'flagged') continue;
            if (tx.accountId === a.id) {
              if (tx.type === 'expense' || tx.type === 'transfer') b -= tx.amountMinor;
              if (tx.type === 'income') b += tx.amountMinor;
            }
            if (tx.type === 'transfer' && tx.targetAccountId === a.id) b += tx.amountMinor;
          }
          return sum + b;
        }, 0);

      const status = totalCash >= target6Months ? 'Fully Funded (6+ months)' : totalCash >= target3Months ? 'Adequately Funded (3-6 months)' : 'Under-funded (< 3 months)';

      return {
        intentId: 'emergency_fund_calc',
        intentCategory: 'education',
        textResponse: `An **Emergency Fund** protects you from unexpected job loss, medical emergencies, or urgent repairs without touching your long-term investments.

• **Target Size**: 3 to 6 months of living expenses (${formatINR(target3Months)} to ${formatINR(target6Months)} based on your monthly spending of ${formatINR(monthlySpent)}).
• **Current Liquid Balance**: ${formatINR(totalCash)}.
• **Status**: **${status}**.

**Where to Park**: Keep 1 month of expenses in a high-yield savings account or liquid mutual fund, and 2-5 months in auto-sweep fixed deposits (FD) with instant withdrawal capability.`,
        card: {
          type: 'financial_summary',
          title: 'Emergency Fund Sizing',
          subtitle: `Based on ${formatINR(monthlySpent)} / month living cost`,
          metrics: [
            { label: 'Current Liquid Cash', value: formatINR(totalCash) },
            { label: '3-Month Buffer', value: formatINR(target3Months) },
            { label: '6-Month Buffer', value: formatINR(target6Months) },
            { label: 'Health Status', value: status },
          ],
          actionLink: { label: 'View Liquid Accounts', href: '/app/banking' },
        },
        suggestedFollowUps: [
          'What is my available cash balance?',
          'Explain the 50/30/20 rule',
          'What is a SIP?',
        ],
      };
    },
  },
];

/**
 * Deterministic Query Dispatcher
 */
export function processFinancialQuery(question: string, storeState: any): IntentResult {
  const normalized = question.toLowerCase().trim().replace(/[?!.,]/g, '');
  const ctx: IntentContext = {
    userQuestion: question,
    normalizedQuestion: normalized,
    storeState,
  };

  for (const handler of INTENT_REGISTRY) {
    if (handler.match(ctx)) {
      return handler.execute(ctx);
    }
  }

  // If question specifically asks for future predictions or unsupported speculation
  if (
    normalized.includes('predict') ||
    normalized.includes('tomorrow') ||
    normalized.includes('swing') ||
    normalized.includes('double')
  ) {
    return {
      intentId: 'unsupported_fallback',
      intentCategory: 'fallback',
      textResponse:
        'I am EXPENZO’s client-side rule-based financial assistant. I calculate verified metrics from your financial ledger, budgets, connected bank accounts, and investment holdings. I cannot predict tomorrow’s stock market swings or access external internet databases.',
      card: {
        type: 'unsupported_query',
        title: 'Supported Query Categories',
        subtitle: 'Ask questions grounded in your financial records',
        breakdown: [
          { name: 'Monthly Expenses & Biggest Outflows', amountMinor: 0, percent: 100 },
          { name: 'Liquid Cash & Account Balances', amountMinor: 0, percent: 100 },
          { name: 'Portfolio Valuation & Unrealized Gains', amountMinor: 0, percent: 100 },
          { name: 'Savings Goals Projections', amountMinor: 0, percent: 100 },
          { name: 'Financial Literacy (SIP, ETF, Compounding)', amountMinor: 0, percent: 100 },
        ],
      },
      suggestedFollowUps: [
        'How much did I spend this month?',
        'What is my available cash balance?',
        'What is my portfolio worth?',
        'What is a SIP?',
      ],
    };
  }

  // Graceful Dynamic Assessment for General Financial Queries
  const { accounts = [], transactions = [], budgets = [] } = storeState || {};
  const { label, prefix } = getTargetPeriod(transactions);

  const totalSpent = transactions
    .filter((t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith(prefix))
    .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

  const totalIncome = transactions
    .filter((t: any) => t.type === 'income' && t.status === 'completed' && t.date.startsWith(prefix))
    .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

  const totalCash = accounts
    .filter((a: any) => !a.isArchived)
    .reduce((sum: number, a: any) => {
      let b = a.openingBalanceMinor;
      for (const tx of transactions) {
        if (tx.status === 'flagged') continue;
        if (tx.accountId === a.id) {
          if (tx.type === 'expense' || tx.type === 'transfer') b -= tx.amountMinor;
          if (tx.type === 'income') b += tx.amountMinor;
        }
        if (tx.type === 'transfer' && tx.targetAccountId === a.id) b += tx.amountMinor;
      }
      return sum + b;
    }, 0);

  return {
    intentId: 'general_financial_assessment',
    intentCategory: 'education',
    textResponse: `Here is your current financial posture based on your active verified records for ${label}:

• **Available Liquid Cash**: ${formatINR(totalCash)} across ${accounts.length} linked account(s).
• **Monthly Inflow**: ${formatINR(totalIncome)}.
• **Monthly Outflow**: ${formatINR(totalSpent)}.
• **Active Budgets**: ${budgets.length} configured.

You can ask me to break down your expenses, analyze your bank balances, track your budgets, or explain investment strategies like SIPs and the 50/30/20 rule.`,
    card: {
      type: 'financial_summary',
      title: `${label} Financial Snapshot`,
      subtitle: `${transactions.length} Total Verified Records`,
      metrics: [
        { label: 'Liquid Cash', value: formatINR(totalCash) },
        { label: 'Spent This Month', value: formatINR(totalSpent) },
        { label: 'Income This Month', value: formatINR(totalIncome) },
        { label: 'Active Budgets', value: budgets.length.toString() },
      ],
      actionLink: { label: 'Go to Financial Overview', href: '/app/dashboard' },
    },
    suggestedFollowUps: [
      'How much did I spend this month?',
      'What was my biggest expense?',
      'What is my available cash balance?',
      'Explain the 50/30/20 rule',
    ],
  };
}
