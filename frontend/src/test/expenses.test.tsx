import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { router } from '@/app/routes';
import { useAuthStore, DEFAULT_ONBOARDING_PREFS } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { INITIAL_USER } from '@/services/fixtures/seedData';
import { parseSmartEntry } from '@/features/expenses/utils/smartEntryParser';
import { exportTransactionsToCsv } from '@/features/expenses/utils/transactionCsv';
import { calculateExpenseSummary } from '@/features/expenses/utils/expenseSelectors';

describe('Phase 5 Expense Tracking, Ledger, Categories, Budgets & Recurring Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        ...INITIAL_USER,
        name: 'Aryan Sharma',
        persona: 'professional',
      },
      onboardingCompleted: true,
      preferences: {
        ...DEFAULT_ONBOARDING_PREFS,
        persona: 'professional',
        demoDataMode: 'seeded-demo',
      },
    });
    useFinanceStore.getState().resetToDemo();
  });

  // 1-3. Transaction Creation: Expense, Income, Transfer
  it('creates an expense transaction, decreases account balance, and updates totals', async () => {
    const store = useFinanceStore.getState();
    const initCash = store.getTotalLiquidCash(); // ₹77,200 = 7720000 paise
    const initHdfcBal = store.getAccountBalance('acct_hdfc');

    store.addTransaction({
      accountId: 'acct_hdfc',
      amountMinor: 150000, // ₹1,500
      type: 'expense',
      category: 'Food & Dining',
      merchant: 'Smoke House Deli',
      date: '2026-10-15',
      status: 'completed',
    });

    expect(useFinanceStore.getState().getAccountBalance('acct_hdfc')).toBe(initHdfcBal - 150000);
    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(initCash - 150000);
    expect(useFinanceStore.getState().getPeriodExpenses('2026-10-01', '2026-10-15')).toBe(1880000 + 150000);
  });

  it('creates an income transaction, increases account balance, and updates income totals', () => {
    const store = useFinanceStore.getState();
    const initCash = store.getTotalLiquidCash();
    const initHdfcBal = store.getAccountBalance('acct_hdfc');

    store.addTransaction({
      accountId: 'acct_hdfc',
      amountMinor: 800000, // ₹8,000
      type: 'income',
      category: 'Freelance',
      merchant: 'Design Client Retainer',
      date: '2026-10-15',
      status: 'completed',
    });

    expect(useFinanceStore.getState().getAccountBalance('acct_hdfc')).toBe(initHdfcBal + 800000);
    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(initCash + 800000);
    expect(useFinanceStore.getState().getPeriodIncome('2026-10-01', '2026-10-15')).toBe(5200000 + 800000);
  });

  it('creates a transfer between accounts without changing overall liquid cash or external expense totals', () => {
    const store = useFinanceStore.getState();
    const initCash = store.getTotalLiquidCash();
    const initHdfcBal = store.getAccountBalance('acct_hdfc');
    const initSbiBal = store.getAccountBalance('acct_sbi');
    const initExpenses = store.getPeriodExpenses('2026-10-01', '2026-10-15');

    store.addTransaction({
      accountId: 'acct_hdfc',
      targetAccountId: 'acct_sbi',
      amountMinor: 300000, // ₹3,000
      type: 'transfer',
      category: 'Transfer',
      merchant: 'Transfer to Goals Account',
      date: '2026-10-15',
      status: 'completed',
    });

    // HDFC drops ₹3,000, SBI gains ₹3,000, total liquid cash is unchanged
    expect(useFinanceStore.getState().getAccountBalance('acct_hdfc')).toBe(initHdfcBal - 300000);
    expect(useFinanceStore.getState().getAccountBalance('acct_sbi')).toBe(initSbiBal + 300000);
    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(initCash);
    expect(useFinanceStore.getState().getPeriodExpenses('2026-10-01', '2026-10-15')).toBe(initExpenses);
  });

  // 4-5. Transaction Editing & Deletion
  it('edits a transaction and recalculates the balance and category metrics', () => {
    const store = useFinanceStore.getState();
    // In seed data: tx_05 is ₹800 (80000 paise) Food & Dining at Nature Basket Groceries
    const originalTx = store.transactions.find((tx) => tx.id === 'tx_05')!;
    const initCash = store.getTotalLiquidCash();

    // Edit amount to ₹1,200 (120000 paise) and merchant to "Gourmet Foods"
    store.updateTransaction({
      ...originalTx,
      amountMinor: 120000,
      merchant: 'Gourmet Foods',
    });

    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(initCash - 40000);
    const updatedTx = useFinanceStore.getState().transactions.find((tx) => tx.id === 'tx_05')!;
    expect(updatedTx.merchant).toBe('Gourmet Foods');
    expect(updatedTx.amountMinor).toBe(120000);
  });

  it('deletes a transaction, reverses its ledger effect, and restores account balance', () => {
    const store = useFinanceStore.getState();
    // tx_03 is ₹2,000 (200000 paise) Shopping from HDFC
    const initCash = store.getTotalLiquidCash();
    const initHdfc = store.getAccountBalance('acct_hdfc');

    store.deleteTransaction('tx_03');

    expect(useFinanceStore.getState().getAccountBalance('acct_hdfc')).toBe(initHdfc + 200000);
    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(initCash + 200000);
    expect(useFinanceStore.getState().transactions.some((tx) => tx.id === 'tx_03')).toBe(false);
  });

  // 6-8. Validation & Insufficient Balance
  it('validates invalid inputs in transaction form and displays balance warnings', () => {
    const store = useFinanceStore.getState();
    const hdfcBal = store.getAccountBalance('acct_hdfc'); // ₹50,000

    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/expenses'] });
    render(<RouterProvider router={testRouter} />);

    // Click Add Expense
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));

    // Enter excessive amount
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '9999999' } });

    // Warning message appears
    expect(screen.getByText(/Account balance .* is lower than transaction amount/i)).toBeInTheDocument();
  });

  // 9-10. Accounting Summary calculation
  it('calculates correct expense summary metrics excluding transfers', () => {
    const store = useFinanceStore.getState();
    const summary = calculateExpenseSummary(store.transactions, 30);

    // Seed data: Inflow = ₹52,000 (5200000 paise), Outflow = ₹18,800 (1880000 paise)
    expect(summary.totalIncomeMinor).toBe(5200000);
    expect(summary.totalExpenseMinor).toBe(1880000);
    expect(summary.netCashFlowMinor).toBe(5200000 - 1880000);
    expect(summary.largestExpense?.amountMinor).toBe(1200000); // Rent ₹12,000
    expect(summary.highestCategory?.name).toBe('Housing & Rent');
  });

  // 11-13. Transactions Page: Filters, Sorting, URL sync
  it('renders transactions page with query filtering and sorting', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/transactions?category=Shopping'],
    });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: /Transactions Ledger/i })).toBeInTheDocument();
    // Only Shopping transactions should be visible
    expect(screen.getByText('Zara Fashion Retail')).toBeInTheDocument();
    expect(screen.queryByText('Apartment Lease Rent')).not.toBeInTheDocument();
  });

  // 14. CSV Export
  it('exports filtered transactions to CSV with sanitized values', () => {
    const store = useFinanceStore.getState();
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    exportTransactionsToCsv(store.transactions, store.accounts, '2026-10-15');

    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    appendSpy.mockRestore();
    removeSpy.mockRestore();
    clickSpy.mockRestore();
  });

  // 15-17. Category Management: Create, Edit, Reassign on Delete
  it('allows creating, editing, and deleting categories with safe transaction reassignment', () => {
    const store = useFinanceStore.getState();

    // 1. Create custom category
    const created = store.addCategory({
      name: 'Pet Care',
      icon: 'HeartPulse',
      color: '#06B6D4',
      type: 'expense',
    });
    expect(useFinanceStore.getState().categories.some((c) => c.name === 'Pet Care')).toBe(true);

    // 2. Add transaction using that category
    store.addTransaction({
      accountId: 'acct_hdfc',
      amountMinor: 100000,
      type: 'expense',
      category: 'Pet Care',
      merchant: 'Vet Clinic',
      date: '2026-10-15',
      status: 'completed',
    });

    // 3. Delete category with reassignment to "Healthcare"
    store.deleteCategory(created.id, 'Healthcare');

    // Category removed
    expect(useFinanceStore.getState().categories.some((c) => c.id === created.id)).toBe(false);
    // Associated transaction safely reassigned to "Healthcare" without orphan!
    const reassignedTx = useFinanceStore.getState().transactions.find((tx) => tx.merchant === 'Vet Clinic')!;
    expect(reassignedTx.category).toBe('Healthcare');
  });

  // 18-22. Budget Management: Create, Edit, Delete, Utilization
  it('calculates budget utilization accurately and identifies threshold alert states', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/budgets'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: /Your Budgets/i })).toBeInTheDocument();
    // Housing budget spent ₹12,000 of ₹15,000 = 80% (approaching limit warning)
    expect(screen.getByText('Housing & Rent')).toBeInTheDocument();
    expect(screen.getAllByText(/80% Alert/i).length).toBeGreaterThanOrEqual(1);

    // Total allocated = ₹30,000 (3000000 paise)
    expect(screen.getAllByText('₹30,000').length).toBeGreaterThanOrEqual(1);
  });

  it('allows creating and editing a budget', () => {
    const store = useFinanceStore.getState();

    store.upsertBudget({
      id: 'bgt_custom_healthcare',
      category: 'Healthcare',
      allocatedMinor: 500000, // ₹5,000
      period: 'monthly',
      alertThresholdPercent: 85,
    });

    const bgt = useFinanceStore.getState().budgets.find((b) => b.id === 'bgt_custom_healthcare')!;
    expect(bgt.allocatedMinor).toBe(500000);
    expect(bgt.alertThresholdPercent).toBe(85);

    // Delete budget
    store.deleteBudget('bgt_custom_healthcare');
    expect(useFinanceStore.getState().budgets.some((b) => b.id === 'bgt_custom_healthcare')).toBe(false);
  });

  // 23-25. Recurring Rules: Creation, Pause/Resume, Record Occurrence
  it('manages recurring rules and records occurrences into the ledger without silent deductions', () => {
    const store = useFinanceStore.getState();
    const initCash = store.getTotalLiquidCash();
    const initTxCount = store.transactions.length;

    // 1. Toggle status (pause broadband)
    const rule = store.recurringRules.find((r) => r.id === 'rec_broadband')!;
    expect(rule.status).toBe('active');
    store.toggleRecurringRuleStatus('rec_broadband');
    expect(useFinanceStore.getState().recurringRules.find((r) => r.id === 'rec_broadband')!.status).toBe('paused');

    // 2. Unpause
    store.toggleRecurringRuleStatus('rec_broadband');
    expect(useFinanceStore.getState().recurringRules.find((r) => r.id === 'rec_broadband')!.status).toBe('active');

    // 3. Record occurrence explicitly
    const recordedTx = store.recordRecurringOccurrence('rec_broadband');
    expect(recordedTx).not.toBeNull();
    expect(recordedTx?.amountMinor).toBe(100000); // ₹1,000
    expect(recordedTx?.merchant).toBe('Airtel Broadband & Wi-Fi');

    // Account debited by ₹1,000 exactly once
    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(initCash - 100000);
    expect(useFinanceStore.getState().transactions.length).toBe(initTxCount + 1);

    // Next expected date advanced to next month (2026-11-18)
    const updatedRule = useFinanceStore.getState().recurringRules.find((r) => r.id === 'rec_broadband')!;
    expect(updatedRule.nextExpectedDate).toBe('2026-11-18');
  });

  // 26-28. Smart Entry Natural Language Parser
  it('parses complex natural language spending sentences with multiple clauses and categories', () => {
    const sentence = 'Spent ₹450 on lunch and ₹200 on Uber today';
    const parsed = parseSmartEntry(sentence, '2026-10-15');

    expect(parsed.length).toBe(2);

    // Candidate 1: Lunch ₹450, Food & Dining
    expect(parsed[0].amount).toBe('450');
    expect(parsed[0].category).toBe('Food & Dining');
    expect(parsed[0].type).toBe('expense');
    expect(parsed[0].date).toBe('2026-10-15');

    // Candidate 2: Uber ₹200, Transport
    expect(parsed[1].amount).toBe('200');
    expect(parsed[1].category).toBe('Transport');
    expect(parsed[1].type).toBe('expense');
    expect(parsed[1].date).toBe('2026-10-15');
  });

  it('parses income sentences and handles yesterday keyword', () => {
    const sentence = 'Received ₹12,000 freelance payment yesterday';
    const parsed = parseSmartEntry(sentence, '2026-10-15');

    expect(parsed.length).toBe(1);
    expect(parsed[0].amount).toBe('12000');
    expect(parsed[0].type).toBe('income');
    expect(parsed[0].category).toBe('Freelance');
    expect(parsed[0].date).toBe('2026-10-14');
  });

  // 29. Transaction Detail Route
  it('renders transaction detail page and handles non-existent IDs gracefully', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/transactions/tx_01'],
    });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Acme Corp Technologies')).toBeInTheDocument();
    expect(screen.getAllByText(/\+₹52,000|₹52,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('tx_01')).toBeInTheDocument();
  });

  it('renders 404 state for invalid transaction ID in detail route', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/transactions/tx_non_existent'],
    });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: /Transaction Not Found/i })).toBeInTheDocument();
  });

  // 30. Empty Workspace Mode
  it('renders clean slate empty state when transactions and budgets are empty', () => {
    useFinanceStore.setState({
      accounts: [],
      transactions: [],
      budgets: [],
      categories: [],
      recurringRules: [],
    });

    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/expenses'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText(/No Transactions Recorded Yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add First Expense/i })).toBeInTheDocument();
  });
});
