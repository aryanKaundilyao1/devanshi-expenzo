import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from '@/store/useFinanceStore';

describe('useFinanceStore Centralized Reactive Store', () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
  });

  it('initializes with seed data matching canonical requirements', () => {
    const state = useFinanceStore.getState();

    expect(state.user.persona).toBe('professional');
    expect(state.accounts.length).toBe(3);
    expect(state.getTotalLiquidCash()).toBe(7720000); // ₹77,200
    expect(state.getPortfolioValue()).toBe(4250000);   // ₹42,500
    expect(state.getPeriodIncome()).toBe(5200000);     // ₹52,000
    expect(state.getPeriodExpenses()).toBe(1880000);   // ₹18,800
  });

  it('updates account balances and expenses immediately when adding a new transaction', () => {
    const store = useFinanceStore.getState();

    const initialHDFC = store.getAccountBalance('acct_hdfc');
    expect(initialHDFC).toBe(5000000); // ₹50,000

    // Add a new expense of ₹1,000 (1,00,000 paise)
    store.addTransaction({
      accountId: 'acct_hdfc',
      amountMinor: 100000,
      type: 'expense',
      category: 'Food & Dining',
      merchant: 'Blue Tokai Coffee',
      date: '2026-10-15',
      status: 'completed',
    });

    // Re-check derived balances
    const updatedHDFC = useFinanceStore.getState().getAccountBalance('acct_hdfc');
    expect(updatedHDFC).toBe(4900000); // Deducted to ₹49,000

    const updatedExpenses = useFinanceStore.getState().getPeriodExpenses();
    expect(updatedExpenses).toBe(1980000); // ₹18,800 + ₹1,000 = ₹19,800
  });

  it('restores initial seed data when resetToDemo is invoked', () => {
    const store = useFinanceStore.getState();

    // Mutate state
    store.addTransaction({
      accountId: 'acct_cash',
      amountMinor: 50000,
      type: 'expense',
      category: 'Transport',
      merchant: 'Auto Rickshaw',
      date: '2026-10-15',
      status: 'completed',
    });

    expect(useFinanceStore.getState().getAccountBalance('acct_cash')).toBe(150000);

    // Reset
    useFinanceStore.getState().resetToDemo();

    expect(useFinanceStore.getState().getAccountBalance('acct_cash')).toBe(200000);
    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(7720000);
  });
});

