import {
  NotificationItem,
  NotificationPreferences,
  FinancialAccount,
  Transaction,
  Budget,
  BankingBill,
  SavingsGoal,
  InvestmentHolding,
  StockQuote,
} from '@/types/finance';
import { calculateCategorySpent } from '@/domain/calculations/accounting';
import { calculateSectorAllocation } from '@/features/investments/utils/investmentCalculations';

export interface NotificationEvaluationContext {
  accounts: FinancialAccount[];
  transactions: Transaction[];
  budgets: Budget[];
  bills: BankingBill[];
  goals: SavingsGoal[];
  holdings: InvestmentHolding[];
  quotes: Record<string, StockQuote>;
  notificationPreferences: NotificationPreferences;
  existingNotifications: NotificationItem[];
  dismissedNotificationIds: string[];
}

export function evaluateDeterministicNotifications(
  ctx: NotificationEvaluationContext
): NotificationItem[] {
  const {
    accounts,
    transactions,
    budgets,
    bills,
    goals,
    holdings,
    quotes,
    notificationPreferences: prefs,
    existingNotifications,
    dismissedNotificationIds: dismissed,
  } = ctx;

  const generated: NotificationItem[] = [];
  const readMap = new Map<string, boolean>();
  for (const n of existingNotifications) {
    if (n.isRead) {
      readMap.set(n.id, true);
    }
  }

  // 1. Budget Alerts
  if (prefs.budgetAlerts || prefs.budgetExceededAlerts) {
    for (const b of budgets) {
      if (!b.category) continue;
      const spentMinor = calculateCategorySpent(
        b.category,
        transactions,
        '2026-10-01',
        '2026-10-31'
      );
      const limit = b.allocatedMinor || 0;
      const ratio = limit > 0 ? spentMinor / limit : 0;
      const pct = Math.round(ratio * 100);

      if (ratio >= 1.0 && prefs.budgetExceededAlerts) {
        const id = `notif_bgt_exceeded_${b.id}`;
        if (!dismissed.includes(id)) {
          generated.push({
            id,
            title: `Critical: ${b.category} Budget Exceeded`,
            message: `You have spent ₹${(spentMinor / 100).toLocaleString('en-IN')} against your limit of ₹${(limit / 100).toLocaleString('en-IN')} (${pct}%).`,
            type: 'budget',
            isRead: !!readMap.get(id),
            createdAt: '2026-10-15T08:00:00Z',
            linkRoute: '/app/budgets',
          });
        }
      } else if (ratio >= 0.8 && prefs.budgetAlerts) {
        const id = `notif_bgt_80_${b.id}`;
        if (!dismissed.includes(id)) {
          generated.push({
            id,
            title: `Warning: ${b.category} Budget at ${pct}%`,
            message: `You have spent ₹${(spentMinor / 100).toLocaleString('en-IN')} of your ₹${(limit / 100).toLocaleString('en-IN')} monthly allocation.`,
            type: 'budget',
            isRead: !!readMap.get(id),
            createdAt: '2026-10-14T09:30:00Z',
            linkRoute: '/app/budgets',
          });
        }
      }
    }
  }

  // 2. Upcoming Bills
  if (prefs.billReminders) {
    for (const bill of bills) {
      if (bill.status !== 'paid') {
        const id = `notif_bill_${bill.id}`;
        if (!dismissed.includes(id)) {
          generated.push({
            id,
            title: `Upcoming Bill: ${bill.title}`,
            message: `₹${(bill.amountMinor / 100).toLocaleString('en-IN')} due on ${bill.dueDate} (${bill.billerName}).`,
            type: 'bill',
            isRead: !!readMap.get(id),
            createdAt: '2026-10-13T10:00:00Z',
            linkRoute: '/app/banking/bills',
          });
        }
      }
    }
  }

  // 3. Low Account Balance
  if (prefs.lowBalanceAlerts) {
    for (const acc of accounts) {
      if (!acc.isArchived && acc.accountType !== 'credit') {
        // Calculate account current balance from opening balance + txs
        let currentBal = acc.openingBalanceMinor;
        for (const tx of transactions) {
          if (tx.status === 'completed') {
            if (tx.accountId === acc.id) {
              if (tx.type === 'expense' || tx.type === 'transfer') currentBal -= tx.amountMinor;
              else if (tx.type === 'income') currentBal += tx.amountMinor;
            }
            if (tx.targetAccountId === acc.id && tx.type === 'transfer') {
              currentBal += tx.amountMinor;
            }
          }
        }

        if (currentBal < 500000) {
          // Less than ₹5,000
          const id = `notif_bal_${acc.id}`;
          if (!dismissed.includes(id)) {
            generated.push({
              id,
              title: `Low Balance Alert: ${acc.name}`,
              message: `Available balance is ₹${(currentBal / 100).toLocaleString('en-IN')}, below the recommended ₹5,000 safety threshold.`,
              type: 'balance',
              isRead: !!readMap.get(id),
              createdAt: '2026-10-15T07:45:00Z',
              linkRoute: `/app/banking/accounts/${acc.id}`,
            });
          }
        }
      }
    }
  }

  // 4. Savings Goal Milestones
  if (prefs.goalMilestones) {
    for (const goal of goals) {
      const ratio = goal.targetAmountMinor > 0 ? goal.currentAmountMinor / goal.targetAmountMinor : 0;
      if (ratio >= 1.0) {
        const id = `notif_goal_${goal.id}_100`;
        if (!dismissed.includes(id)) {
          generated.push({
            id,
            title: `Goal Achieved: ${goal.title}`,
            message: `Congratulations! You reached 100% of your target amount (₹${(goal.targetAmountMinor / 100).toLocaleString('en-IN')}).`,
            type: 'goal',
            isRead: !!readMap.get(id),
            createdAt: '2026-10-12T14:20:00Z',
            linkRoute: `/app/financial-planner/goals/${goal.id}`,
          });
        }
      } else if (ratio >= 0.5) {
        const id = `notif_goal_${goal.id}_50`;
        if (!dismissed.includes(id)) {
          generated.push({
            id,
            title: `Goal Milestone: Halfway to ${goal.title}`,
            message: `You have accumulated ₹${(goal.currentAmountMinor / 100).toLocaleString('en-IN')} towards your ₹${(goal.targetAmountMinor / 100).toLocaleString('en-IN')} goal.`,
            type: 'goal',
            isRead: !!readMap.get(id),
            createdAt: '2026-10-10T11:00:00Z',
            linkRoute: `/app/financial-planner/goals/${goal.id}`,
          });
        }
      }
    }
  }

  // 5. Portfolio Concentration Insights
  if (prefs.portfolioInsights && holdings.length > 0) {
    const sectors = calculateSectorAllocation(holdings, quotes);
    const topSector = sectors[0];
    if (topSector && topSector.percent > 40) {
      const id = 'notif_port_concentration';
      if (!dismissed.includes(id)) {
        generated.push({
          id,
          title: 'Portfolio Alert: High Sector Concentration',
          message: `${topSector.percent}% of your stock holdings are concentrated in ${topSector.sector}. Consider diversifying.`,
          type: 'investment',
          isRead: !!readMap.get(id),
          createdAt: '2026-10-14T16:00:00Z',
          linkRoute: '/app/investments/analytics',
        });
      }
    }
  }

  // 6. System & Security Announcements
  if (prefs.systemAnnouncements) {
    const id = 'notif_sys_sandbox';
    if (!dismissed.includes(id)) {
      generated.push({
        id,
        title: 'Demo Environment Active',
        message: 'EXPENZO is running with simulated data. All financial changes are persisted locally in your browser.',
        type: 'security',
        isRead: !!readMap.get(id),
        createdAt: '2026-10-01T08:00:00Z',
        linkRoute: '/app/settings/security',
      });
    }
  }

  // Preserve any custom or manual notifications that aren't dynamically generated
  const dynamicIds = new Set(generated.map((g) => g.id));
  const preservedExisting = existingNotifications.filter(
    (n) => !dynamicIds.has(n.id) && !dismissed.includes(n.id)
  );

  return [...generated, ...preservedExisting];
}
