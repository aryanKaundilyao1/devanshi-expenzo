import { IntentContext, IntentHandler, IntentResult } from './types';
import { formatINR } from '@/domain/money/formatters';
import { calculatePortfolioMetrics, calculateHoldingsDetailed, calculateSectorAllocation } from '@/features/investments/utils/investmentCalculations';

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
      const monthExpenses = transactions
        .filter((t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith('2026-10'))
        .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

      const count = transactions.filter(
        (t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith('2026-10')
      ).length;

      return {
        intentId: 'expense_month_total',
        intentCategory: 'expenses',
        textResponse: `In October 2026, you have recorded ${count} expense transactions totaling ${formatINR(monthExpenses)}.`,
        card: {
          type: 'financial_summary',
          title: 'October 2026 Outflow Summary',
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
      const monthIncome = transactions
        .filter((t: any) => t.type === 'income' && t.status === 'completed' && t.date.startsWith('2026-10'))
        .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

      const monthExpenses = transactions
        .filter((t: any) => t.type === 'expense' && t.status === 'completed' && t.date.startsWith('2026-10'))
        .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

      const netCashFlow = monthIncome - monthExpenses;
      const savingsRate = monthIncome > 0 ? (netCashFlow / monthIncome) * 100 : 0;

      return {
        intentId: 'income_total',
        intentCategory: 'income',
        textResponse: `In October 2026, your total credited income is ${formatINR(monthIncome)}. Total debits are ${formatINR(monthExpenses)}, resulting in a positive net cash flow of ${formatINR(netCashFlow)} (savings rate: ${savingsRate.toFixed(1)}%).`,
        card: {
          type: 'financial_summary',
          title: 'Cash Flow Reconciliation',
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

  // Graceful Fallback for Unsupported Questions
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
