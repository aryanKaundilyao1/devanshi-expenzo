/**
 * EXPENZO — Family Financial Accounting Unit Tests
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import { describe, it, expect } from 'vitest';
import {
  isOrdinaryConsumptionExpense,
  validateSharedExpenseAllocations,
  calculateFamilyMetrics,
} from '@/domain/calculations/familyAccounting';
import { Transaction } from '@/types/finance';
import { FamilyMember, SharedExpenseAllocation } from '@/types/family';

describe('Family Financial Accounting & Member Comparison Formulas', () => {
  describe('isOrdinaryConsumptionExpense', () => {
    it('identifies genuine consumption expenses', () => {
      const tx: Transaction = {
        id: 'tx-1',
        accountId: 'acc-1',
        amountMinor: 150000,
        type: 'expense',
        category: 'Groceries',
        merchant: 'Supermart',
        date: '2026-10-10',
        status: 'completed',
      };
      expect(isOrdinaryConsumptionExpense(tx)).toBe(true);
    });

    it('excludes income and internal transfers from ordinary consumption', () => {
      const incomeTx: Transaction = {
        id: 'tx-2',
        accountId: 'acc-1',
        amountMinor: 5000000,
        type: 'income',
        category: 'Salary',
        merchant: 'Employer',
        date: '2026-10-01',
        status: 'completed',
      };
      expect(isOrdinaryConsumptionExpense(incomeTx)).toBe(false);

      const transferTx: Transaction = {
        id: 'tx-3',
        accountId: 'acc-1',
        targetAccountId: 'acc-2',
        amountMinor: 100000,
        type: 'transfer',
        category: 'Transfer',
        merchant: 'Internal Transfer',
        date: '2026-10-05',
        status: 'completed',
      };
      expect(isOrdinaryConsumptionExpense(transferTx)).toBe(false);
    });

    it('excludes balance-sheet investment additions and savings-goal deposits', () => {
      const investTx: Transaction = {
        id: 'tx-4',
        accountId: 'acc-1',
        amountMinor: 2500000,
        type: 'expense',
        category: 'Investment Mutual Funds',
        merchant: 'Zerodha',
        date: '2026-10-08',
        status: 'completed',
      };
      expect(isOrdinaryConsumptionExpense(investTx)).toBe(false);

      const goalTx: Transaction = {
        id: 'tx-5',
        accountId: 'acc-1',
        amountMinor: 500000,
        type: 'expense',
        category: 'Goal Contribution',
        merchant: 'Emergency Fund',
        date: '2026-10-12',
        status: 'completed',
        notes: 'Deposit towards goal contribution',
      };
      expect(isOrdinaryConsumptionExpense(goalTx)).toBe(false);
    });
  });

  describe('validateSharedExpenseAllocations (Exact-Sum Invariant)', () => {
    it('passes when allocations sum exactly to original transaction paise', () => {
      const originalAmountMinor = 3500000; // ₹35,000.00
      const allocations = [
        { allocatedAmountMinor: 1500000 },
        { allocatedAmountMinor: 1200000 },
        { allocatedAmountMinor: 800000 },
      ];
      const result = validateSharedExpenseAllocations(originalAmountMinor, allocations);
      expect(result.isValid).toBe(true);
      expect(result.differenceMinor).toBe(0);
      expect(result.sumAllocatedMinor).toBe(3500000);
    });

    it('fails when allocations are underallocated or overallocated by even 1 paise', () => {
      const originalAmountMinor = 100000; // ₹1,000.00
      const underAllocated = [
        { allocatedAmountMinor: 50000 },
        { allocatedAmountMinor: 49999 }, // 1 paise short
      ];
      const resUnder = validateSharedExpenseAllocations(originalAmountMinor, underAllocated);
      expect(resUnder.isValid).toBe(false);
      expect(resUnder.differenceMinor).toBe(1);

      const overAllocated = [
        { allocatedAmountMinor: 50000 },
        { allocatedAmountMinor: 50001 }, // 1 paise over
      ];
      const resOver = validateSharedExpenseAllocations(originalAmountMinor, overAllocated);
      expect(resOver.isValid).toBe(false);
      expect(resOver.differenceMinor).toBe(-1);
    });
  });

  describe('calculateFamilyMetrics (Single, 4-Member, and 8-Member Households)', () => {
    it('correctly calculates metrics for a 4-member household', () => {
      const members: FamilyMember[] = [
        {
          id: 'mem-1',
          familyId: 'fam-1',
          userId: 'user-1',
          name: 'Devanshi Singh',
          email: 'devanshi@expenzo.local',
          role: 'owner',
          status: 'active',
          joinedAt: '2026-08-01',
          knownMonthlyIncomeMinor: 10000000, // ₹1,00,000
          allocatedBudgetMinor: 4000000,      // ₹40,000
        },
        {
          id: 'mem-2',
          familyId: 'fam-1',
          userId: 'user-2',
          name: 'Priya Singh',
          email: 'priya@expenzo.local',
          role: 'member',
          status: 'active',
          joinedAt: '2026-08-05',
          knownMonthlyIncomeMinor: 6000000,  // ₹60,000
          allocatedBudgetMinor: 2500000,     // ₹25,000
        },
      ];

      const transactions: Transaction[] = [
        // User 1 Direct Expense
        {
          id: 'tx-10',
          accountId: 'acc-1',
          amountMinor: 1500000, // ₹15,000
          type: 'expense',
          category: 'Dining',
          merchant: 'Bistro',
          date: '2026-10-05',
          status: 'completed',
          userId: 'user-1',
        } as any,
        // User 2 Direct Expense
        {
          id: 'tx-11',
          accountId: 'acc-2',
          amountMinor: 800000, // ₹8,000
          type: 'expense',
          category: 'Groceries',
          merchant: 'Freshmart',
          date: '2026-10-06',
          status: 'completed',
          userId: 'user-2',
        } as any,
      ];

      const sharedAllocations: SharedExpenseAllocation[] = [
        {
          id: 'alloc-1',
          transactionId: 'tx-shared-1',
          familyId: 'fam-1',
          memberUserId: 'user-1',
          allocatedAmountMinor: 1000000, // ₹10,000
          splitPercentage: 50,
          allocationMethod: 'equal',
          createdAt: '2026-10-01',
        },
        {
          id: 'alloc-2',
          transactionId: 'tx-shared-1',
          familyId: 'fam-1',
          memberUserId: 'user-2',
          allocatedAmountMinor: 1000000, // ₹10,000
          splitPercentage: 50,
          allocationMethod: 'equal',
          createdAt: '2026-10-01',
        },
      ];

      const metrics = calculateFamilyMetrics({
        members,
        transactions,
        sharedAllocations,
        periodLabel: 'October 2026',
      });

      // Total Family Income = 1,00,000 + 60,000 = 1,60,000
      expect(metrics.totalFamilyIncomeMinor).toBe(16000000);

      // User 1 Attributable = 15,000 direct + 10,000 shared = 25,000 (2500000 paise)
      const u1 = metrics.memberMetrics.find((m) => m.memberUserId === 'user-1')!;
      expect(u1.totalDirectExpensesMinor).toBe(1500000);
      expect(u1.totalSharedExpensesMinor).toBe(1000000);
      expect(u1.totalAttributableExpensesMinor).toBe(2500000);
      // Net savings = 1,00,000 - 25,000 = 75,000
      expect(u1.netSavingsMinor).toBe(7500000);
      // Savings rate = (75,000 / 1,00,000) * 100 = 75.0%
      expect(u1.savingsRatePercent).toBe(75.0);

      // User 2 Attributable = 8,000 direct + 10,000 shared = 18,000 (1800000 paise)
      const u2 = metrics.memberMetrics.find((m) => m.memberUserId === 'user-2')!;
      expect(u2.totalDirectExpensesMinor).toBe(800000);
      expect(u2.totalSharedExpensesMinor).toBe(1000000);
      expect(u2.totalAttributableExpensesMinor).toBe(1800000);
      // Net savings = 60,000 - 18,000 = 42,000
      expect(u2.netSavingsMinor).toBe(4200000);
      // Savings rate = (42,000 / 60,000) * 100 = 70.0%
      expect(u2.savingsRatePercent).toBe(70.0);

      // Total Family Expenses = 25,000 + 18,000 = 43,000
      expect(metrics.totalFamilyExpensesMinor).toBe(4300000);
      // Period Net Savings = 1,60,000 - 43,000 = 1,17,000
      expect(metrics.periodNetSavingsMinor).toBe(11700000);

      // Highlights
      expect(metrics.comparativeHighlights.highestSavingsRate?.memberName).toBe('Devanshi Singh');
      expect(metrics.comparativeHighlights.highestSavingsRate?.ratePercent).toBe(75.0);
      expect(metrics.comparativeHighlights.highestSaverAmount?.memberName).toBe('Devanshi Singh');
      expect(metrics.comparativeHighlights.highestSaverAmount?.amountMinor).toBe(7500000);
    });

    it('gracefully handles empty datasets and missing income without divide-by-zero errors', () => {
      const members: FamilyMember[] = [
        {
          id: 'mem-zero',
          familyId: 'fam-zero',
          userId: 'user-zero',
          name: 'Student Member',
          email: 'student@expenzo.local',
          role: 'member',
          status: 'active',
          joinedAt: '2026-10-01',
          // No disclosed income
        },
      ];

      const metrics = calculateFamilyMetrics({
        members,
        transactions: [],
        sharedAllocations: [],
      });

      expect(metrics.totalFamilyIncomeMinor).toBe(0);
      expect(metrics.totalFamilyExpensesMinor).toBe(0);
      expect(metrics.familySavingsRatePercent).toBeNull();
      const m = metrics.memberMetrics[0];
      expect(m.savingsRatePercent).toBeNull();
      expect(m.discretionaryRatioPercent).toBeNull();
    });

    it('correctly handles an 8-member household (Family Plus tier scale)', () => {
      const eightMembers: FamilyMember[] = Array.from({ length: 8 }).map((_, i) => ({
        id: `mem-${i}`,
        familyId: 'fam-8',
        userId: `user-${i}`,
        name: `Member ${i + 1}`,
        email: `member${i + 1}@expenzo.local`,
        role: i === 0 ? 'owner' : 'member',
        status: 'active',
        joinedAt: '2026-08-01',
        knownMonthlyIncomeMinor: (i + 1) * 2000000, // ₹20k to ₹160k
        allocatedBudgetMinor: 1500000,
      }));

      const metrics = calculateFamilyMetrics({
        members: eightMembers,
        transactions: [],
        sharedAllocations: [],
      });

      expect(metrics.memberMetrics.length).toBe(8);
      // Sum of 1..8 is 36 * 20,000 = ₹7,20,000 (72000000 paise)
      expect(metrics.totalFamilyIncomeMinor).toBe(72000000);
      expect(metrics.periodNetSavingsMinor).toBe(72000000);
    });
  });
});
