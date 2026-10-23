import { describe, it, expect } from 'vitest';
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
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_HOLDINGS,
  INITIAL_STOCK_QUOTES,
} from '@/services/fixtures/seedData';

describe('EXPENZO Accounting & Ledger Mathematics', () => {
  it('correctly calculates derived account balances matching target seeds', () => {
    const hdfc = INITIAL_ACCOUNTS.find((a) => a.id === 'acct_hdfc')!;
    const sbi = INITIAL_ACCOUNTS.find((a) => a.id === 'acct_sbi')!;
    const cash = INITIAL_ACCOUNTS.find((a) => a.id === 'acct_cash')!;

    // Everyday Savings target is exactly ₹50,000 (50,00,000 paise)
    expect(calculateAccountBalance(hdfc, INITIAL_TRANSACTIONS)).toBe(5000000);

    // Goals Savings target is exactly ₹25,200 (25,20,000 paise)
    expect(calculateAccountBalance(sbi, INITIAL_TRANSACTIONS)).toBe(2520000);

    // Cash Wallet target is exactly ₹2,000 (2,00,000 paise)
    expect(calculateAccountBalance(cash, INITIAL_TRANSACTIONS)).toBe(200000);
  });

  it('correctly calculates total liquid cash reconciling all non-credit accounts', () => {
    // ₹50,000 + ₹25,200 + ₹2,000 = ₹77,200 (77,20,000 paise)
    expect(calculateTotalLiquidCash(INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS)).toBe(7720000);
  });

  it('calculates period income and expenses strictly excluding transfers', () => {
    const income = calculatePeriodIncome(INITIAL_TRANSACTIONS, '2026-10-01', '2026-10-15');
    // Salary = ₹52,000 (52,00,000 paise)
    expect(income).toBe(5200000);

    const expenses = calculatePeriodExpenses(INITIAL_TRANSACTIONS, '2026-10-01', '2026-10-15');
    // Rent(12000) + Groceries(2000) + Transport(500) + Dining(800) + Electricity(1500) + Shopping(2000) = ₹18,800
    // Note: The ₹5,000 self-transfer is strictly excluded!
    expect(expenses).toBe(1880000);
  });

  it('correctly aggregates category-level spending', () => {
    // Food & Dining = Groceries (2000) + Dining (800) = ₹2,800
    expect(calculateCategorySpent('Food & Dining', INITIAL_TRANSACTIONS, '2026-10-01', '2026-10-15')).toBe(280000);

    // Housing & Rent = Rent (12000) = ₹12,000
    expect(calculateCategorySpent('Housing & Rent', INITIAL_TRANSACTIONS, '2026-10-01', '2026-10-15')).toBe(1200000);
  });

  it('correctly calculates portfolio current value and invested cost basis', () => {
    // Holdings: 10 TCS @ ₹3,500 = ₹35,000; 5 INFY @ ₹1,500 = ₹7,500. Total = ₹42,500
    expect(calculatePortfolioValue(INITIAL_HOLDINGS, INITIAL_STOCK_QUOTES)).toBe(4250000);

    // Invested cost: 10 TCS @ ₹3,200 = ₹32,000; 5 INFY @ ₹1,400 = ₹7,000. Total = ₹39,000
    expect(calculateTotalInvested(INITIAL_HOLDINGS)).toBe(3900000);
  });

  it('calculates consolidated net worth without double counting cash and goals', () => {
    // Liquid Cash (₹77,200) + Portfolio Value (₹42,500) = ₹1,19,700 (1,19,70,000 paise)
    const netWorth = calculateNetWorth(
      INITIAL_ACCOUNTS,
      INITIAL_TRANSACTIONS,
      INITIAL_HOLDINGS,
      INITIAL_STOCK_QUOTES
    );
    expect(netWorth).toBe(11970000);
  });
});

