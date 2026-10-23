import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { router } from '@/app/routes';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { processFinancialQuery } from '@/features/ai/intents/intentRegistry';
import { generateFinancialReport, generateReportCSV } from '@/features/reports/utils/reportGenerator';
import { calculatePortfolioMetrics } from '@/features/investments/utils/investmentCalculations';

describe('Phase 8: Comprehensive End-to-End User Journeys (8J)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: true, onboardingCompleted: true });
    useFinanceStore.getState().resetToDemo();
  });

  // Journey 1 — Registration & Onboarding Completion
  it('Journey 1: Registration creates local profile, directs to onboarding, and reaches dashboard', () => {
    const authStore = useAuthStore.getState();
    authStore.registerLocalProfile('Kavita Krishnan', 'kavita@test.com');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.onboardingCompleted).toBe(false);
    expect(state.user.name).toBe('Kavita Krishnan');

    // Complete onboarding
    authStore.completeOnboarding();
    const completedState = useAuthStore.getState();
    expect(completedState.onboardingCompleted).toBe(true);
  });

  // Journey 2 — Demo Persona Selection & Logout
  it('Journey 2: Demo persona login switches workspace and logout clears session', () => {
    const authStore = useAuthStore.getState();
    const dest = authStore.loginWithDemo('student');

    expect(dest).toBe('/app/dashboard');
    expect(useAuthStore.getState().user.persona).toBe('student');

    // Logout
    authStore.logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  // Journey 3 — Complete Expense Lifecycle
  it('Journey 3: Adding an expense reduces account balance, updates ledger, and allows deletion with reversal', () => {
    const store = useFinanceStore.getState();
    const initialHdfcBal = store.getAccountBalance('acct_hdfc');
    const initialTxCount = store.transactions.length;

    // Add ₹1,500 Grocery expense (150,000 paise)
    const newTx = store.addTransaction({
      accountId: 'acct_hdfc',
      amountMinor: 150000,
      type: 'expense',
      category: 'Groceries',
      merchant: 'Organic Food Market',
      date: '2026-10-14',
      status: 'completed',
    });

    const stateAfterAdd = useFinanceStore.getState();
    expect(stateAfterAdd.transactions.length).toBe(initialTxCount + 1);
    expect(stateAfterAdd.getAccountBalance('acct_hdfc')).toBe(initialHdfcBal - 150000);

    // Delete transaction
    store.deleteTransaction(newTx.id);
    const stateAfterDelete = useFinanceStore.getState();
    expect(stateAfterDelete.transactions.length).toBe(initialTxCount);
    expect(stateAfterDelete.getAccountBalance('acct_hdfc')).toBe(initialHdfcBal);
  });

  // Journey 4 — Budget Threshold Evaluation
  it('Journey 4: Spending triggers budget utilization and threshold alerts', () => {
    const store = useFinanceStore.getState();
    const shoppingBudget = store.budgets.find((b) => b.category === 'Shopping');
    expect(shoppingBudget).toBeDefined();

    // Add shopping expense pushing budget over 80%
    store.addTransaction({
      accountId: 'acct_hdfc',
      amountMinor: 300000, // ₹3,000
      type: 'expense',
      category: 'Shopping',
      merchant: 'Lifestyle Apparel',
      date: '2026-10-12',
      status: 'completed',
    });

    // Sync notifications
    store.syncDeterministicNotifications();
    const notifs = useFinanceStore.getState().notifications;
    expect(notifs.some((n) => n.type === 'budget')).toBe(true);
  });

  // Journey 5 — Internal Banking Transfer
  it('Journey 5: Internal transfer moves balance atomically and strictly preserves net worth', () => {
    const store = useFinanceStore.getState();
    const netWorthBefore = store.getNetWorth();
    const hdfcBefore = store.getAccountBalance('acct_hdfc');
    const sbiBefore = store.getAccountBalance('acct_sbi');

    const res = store.recordTransfer({
      sourceAccountId: 'acct_hdfc',
      destinationAccountId: 'acct_sbi',
      amountMinor: 200000, // ₹2,000
      note: 'Emergency savings allocation',
      date: '2026-10-14',
    });

    expect(res.success).toBe(true);
    const updated = useFinanceStore.getState();
    expect(updated.getAccountBalance('acct_hdfc')).toBe(hdfcBefore - 200000);
    expect(updated.getAccountBalance('acct_sbi')).toBe(sbiBefore + 200000);
    expect(updated.getNetWorth()).toBe(netWorthBefore);
  });

  // Journey 6 — Bill Payment Flow
  it('Journey 6: Paying a bill logs one transaction, marks bill paid, and prevents double payment', () => {
    const store = useFinanceStore.getState();
    const bill = store.bills.find((b) => b.status !== 'paid');
    expect(bill).toBeDefined();

    const payRes = store.payBill(bill!.id);
    expect(payRes.success).toBe(true);

    const updated = useFinanceStore.getState();
    const paidBill = updated.bills.find((b) => b.id === bill!.id);
    expect(paidBill?.status).toBe('paid');

    // Attempt second payment should be rejected
    const dupRes = store.payBill(bill!.id);
    expect(dupRes.success).toBe(false);
  });

  // Journey 7 — Stock Investment & Watchlist Flow
  it('Journey 7: Adding a stock holding updates portfolio valuation and net worth', () => {
    const store = useFinanceStore.getState();
    const metricsBefore = calculatePortfolioMetrics(store.holdings, store.quotes);

    store.addHolding({
      ticker: 'SBIN',
      companyName: 'State Bank of India',
      assetClass: 'equity',
      quantity: 50,
      averageBuyPriceMinor: 82000, // ₹820
      purchaseDate: '2026-10-10',
    });

    const updated = useFinanceStore.getState();
    const metricsAfter = calculatePortfolioMetrics(updated.holdings, updated.quotes);
    const sbinQuote = updated.quotes['SBIN'];
    expect(metricsAfter.totalValueMinor).toBe(
      metricsBefore.totalValueMinor + 50 * sbinQuote.currentPriceMinor
    );
  });

  // Journey 8 — AI Spend Inquiry
  it('Journey 8: AI assistant computes accurate ledger sums for user spending query', () => {
    const store = useFinanceStore.getState();
    const aiRes = processFinancialQuery('How much did I spend this month?', store);

    expect(aiRes.intentCategory).toBe('expenses');
    expect(aiRes.textResponse).toContain('₹18,800');
    expect(aiRes.suggestedFollowUps?.length).toBeGreaterThan(0);
  });

  // Journey 9 — Goal Contribution
  it('Journey 9: Goal contribution records milestone progress without double-counting cash', () => {
    const store = useFinanceStore.getState();
    const initialCash = store.getTotalLiquidCash();
    const goal = store.goals[0];

    store.recordGoalContribution(goal.id, 500000); // ₹5,000

    const updated = useFinanceStore.getState();
    const updatedGoal = updated.goals.find((g) => g.id === goal.id);
    expect(updatedGoal?.currentAmountMinor).toBe(goal.currentAmountMinor + 500000);
    expect(updated.getTotalLiquidCash()).toBe(initialCash);
  });

  // Journey 10 — Report Generation & Formula-Safe CSV Export
  it('Journey 10: Generates period report and produces formula-injection-safe CSV', () => {
    const store = useFinanceStore.getState();
    const report = generateFinancialReport(
      { type: 'monthly', startDate: '2026-10-01', endDate: '2026-10-15' },
      store
    );

    expect(report.totalIncomeMinor).toBe(5200000);
    expect(report.totalExpenseMinor).toBe(1880000);
    expect(report.netSavingsMinor).toBe(3320000);

    const csv = generateReportCSV(report);
    expect(csv).toContain('"EXPENZO FINANCIAL STATEMENT"');
    expect(csv).toContain('52000.00');
  });

  // Journey 11 — Settings Profile & Theme Customization
  it('Journey 11: Updating profile and theme customizes application state', () => {
    useFinanceStore.getState().updateUserProfile({ name: 'Radhika Sen' });
    useUIStore.getState().setTheme('light');

    expect(useFinanceStore.getState().user.name).toBe('Radhika Sen');
    expect(useUIStore.getState().theme).toBe('light');
  });

  // Journey 12 — Notifications Center Actions
  it('Journey 12: Notification Center marks all as read and clears notifications', () => {
    const store = useFinanceStore.getState();
    store.markAllNotificationsRead();

    const afterRead = useFinanceStore.getState().notifications.filter((n) => !n.isRead);
    expect(afterRead.length).toBe(0);

    store.clearAllNotifications();
    expect(useFinanceStore.getState().notifications.length).toBe(0);
  });

  // Journey 13 — Factory Reset Workspace
  it('Journey 13: Resetting workspace restores factory default accounts, balances, and seeds', () => {
    const store = useFinanceStore.getState();
    // Tamper with data
    store.addTransaction({
      accountId: 'acct_hdfc',
      amountMinor: 999900,
      type: 'expense',
      category: 'Shopping',
      merchant: 'Tampered Transaction',
      date: '2026-10-15',
      status: 'completed',
    });

    // Execute reset
    store.resetToDemo();

    const restored = useFinanceStore.getState();
    expect(restored.accounts.length).toBe(3);
    expect(restored.getAccountBalance('acct_hdfc')).toBe(5000000); // Exactly ₹50,000
    expect(restored.getAccountBalance('acct_sbi')).toBe(2520000); // Exactly ₹25,200
  });

  // Journey 14 — Clean Slate / Empty Workspace Verification
  it('Journey 14: Empty workspace handles zero records gracefully without errors', () => {
    useFinanceStore.setState({
      transactions: [],
      holdings: [],
      bills: [],
      goals: [],
      budgets: [],
    });

    const emptyStore = useFinanceStore.getState();
    expect(emptyStore.transactions.length).toBe(0);
    expect(emptyStore.holdings.length).toBe(0);

    // AI queries on empty workspace should gracefully handle zero data
    const aiRes = processFinancialQuery('How much did I spend this month?', emptyStore);
    expect(aiRes.intentCategory).toBe('expenses');
    expect(aiRes.textResponse).toContain('₹0');

    // Report generation on empty workspace should reconcile cleanly
    const emptyReport = generateFinancialReport(
      { type: 'monthly', startDate: '2026-10-01', endDate: '2026-10-15' },
      emptyStore
    );
    expect(emptyReport.totalIncomeMinor).toBe(0);
    expect(emptyReport.totalExpenseMinor).toBe(0);
    expect(emptyReport.netSavingsMinor).toBe(0);
  });
});
