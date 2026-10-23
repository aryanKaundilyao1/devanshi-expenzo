import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { router } from '@/app/routes';
import { useAuthStore, DEFAULT_ONBOARDING_PREFS } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { INITIAL_USER } from '@/services/fixtures/seedData';
import {
  calculateFdMaturity,
  calculateRdMaturity,
  calculateLoanEmi,
  generateAmortizationSchedule,
  generateAccountStatement,
} from '@/features/banking/utils/bankingCalculations';
import {
  selectBankingKpiSummary,
  selectAccountBalanceDistribution,
  selectCashFlowTrend,
  generateBankingInsights,
} from '@/features/banking/utils/bankingSelectors';

describe('Phase 6 Banking, Accounts, Transfers, Statements, Bills & Services Tests', () => {
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

  // 1. Banking Overview KPIs
  it('calculates correct banking KPI metrics matching canonical ledger', () => {
    const store = useFinanceStore.getState();
    const kpis = selectBankingKpiSummary(store.accounts, store.transactions, store.bills);

    // Initial seeded liquid accounts: HDFC (₹50,000) + SBI (₹25,200) + Cash (₹2,000) = ₹77,200 = 7720000 paise
    expect(kpis.totalAvailableCashMinor).toBe(7720000);
    expect(kpis.totalDepositAccountsCount).toBe(3);
    expect(kpis.bankingInflowMinor).toBe(5200000); // ₹52,000
    expect(kpis.bankingOutflowMinor).toBe(1880000); // ₹18,800
    expect(kpis.netCashFlowMinor).toBe(3320000); // +₹33,200
    expect(kpis.upcomingBillsCount).toBe(5);
    expect(kpis.totalActiveAccountsCount).toBe(3);
  });

  // 2. Account Directory & Metadata Management
  it('supports creating, editing, and listing demo accounts in store', () => {
    const store = useFinanceStore.getState();
    const initCount = store.accounts.length;

    // Create new account
    const newAccount = store.addAccount({
      name: 'Emergency Reserve',
      institution: 'ICICI Bank',
      accountType: 'savings',
      accountNumberMasked: '•••• 7712',
      openingBalanceMinor: 1000000, // ₹10,000
      currency: 'INR',
      isDemo: true,
    });

    expect(useFinanceStore.getState().accounts.length).toBe(initCount + 1);
    expect(useFinanceStore.getState().getAccountBalance(newAccount.id)).toBe(1000000);

    // Edit account metadata
    useFinanceStore.getState().updateAccount({
      id: newAccount.id,
      name: 'Primary Emergency Fund',
    });

    const updated = useFinanceStore.getState().accounts.find((a) => a.id === newAccount.id);
    expect(updated?.name).toBe('Primary Emergency Fund');
  });

  // 3. Account Archival Zero-Balance Enforcement
  it('enforces zero-balance rule for account archival: blocks non-zero, allows zero', () => {
    const store = useFinanceStore.getState();

    // HDFC has ₹50,000 balance -> must fail archival
    const failRes = store.archiveAccount('acct_hdfc');
    expect(failRes.success).toBe(false);
    expect(failRes.message).toContain('Cannot archive account with non-zero balance');

    // Create an empty account with ₹0 balance
    const zeroAcct = store.addAccount({
      name: 'Zero Balance Temporary Account',
      institution: 'Axis Bank',
      accountType: 'savings',
      accountNumberMasked: '•••• 0001',
      openingBalanceMinor: 0,
      currency: 'INR',
      isDemo: true,
    });

    // Archiving zero-balance account must succeed
    const successRes = useFinanceStore.getState().archiveAccount(zeroAcct.id);
    expect(successRes.success).toBe(true);
    const archived = useFinanceStore.getState().accounts.find((a) => a.id === zeroAcct.id);
    expect(archived?.isArchived).toBe(true);
  });

  // 4. Simulated Fund Transfers - Validation & Invariant Preservation
  it('validates transfers, executes atomic double-entry movement, and preserves total cash and net worth', () => {
    const store = useFinanceStore.getState();
    const initCash = store.getTotalLiquidCash();
    const initNetWorth = store.getNetWorth();
    const initHdfc = store.getAccountBalance('acct_hdfc'); // ₹50,000
    const initSbi = store.getAccountBalance('acct_sbi'); // ₹25,200

    // Reject transfer with same source and destination
    const sameRes = store.recordTransfer({
      sourceAccountId: 'acct_hdfc',
      destinationAccountId: 'acct_hdfc',
      amountMinor: 500000,
    });
    expect(sameRes.success).toBe(false);

    // Reject negative or zero amount
    const zeroRes = store.recordTransfer({
      sourceAccountId: 'acct_hdfc',
      destinationAccountId: 'acct_sbi',
      amountMinor: 0,
    });
    expect(zeroRes.success).toBe(false);

    // Reject insufficient funds
    const excessRes = store.recordTransfer({
      sourceAccountId: 'acct_cash', // holds ₹2,000
      destinationAccountId: 'acct_hdfc',
      amountMinor: 1000000, // ₹10,000
    });
    expect(excessRes.success).toBe(false);
    expect(excessRes.error).toContain('Insufficient eligible funds');

    // Execute valid transfer: ₹5,000 from HDFC to SBI
    const transferRes = store.recordTransfer({
      sourceAccountId: 'acct_hdfc',
      destinationAccountId: 'acct_sbi',
      amountMinor: 500000, // ₹5,000
      note: 'Allocation to SBI goals fund',
      date: '2026-10-15',
    });

    expect(transferRes.success).toBe(true);
    expect(transferRes.receipt).toBeDefined();
    expect(transferRes.receipt?.referenceNumber).toContain('EXP-TRF-');

    // Balance verification
    const finalHdfc = useFinanceStore.getState().getAccountBalance('acct_hdfc');
    const finalSbi = useFinanceStore.getState().getAccountBalance('acct_sbi');
    const finalCash = useFinanceStore.getState().getTotalLiquidCash();
    const finalNetWorth = useFinanceStore.getState().getNetWorth();

    expect(finalHdfc).toBe(initHdfc - 500000); // ₹45,000
    expect(finalSbi).toBe(initSbi + 500000); // ₹30,200

    // Critical Invariant: Total liquid cash and Net Worth remain strictly identical
    expect(finalCash).toBe(initCash);
    expect(finalNetWorth).toBe(initNetWorth);

    // Critical Invariant: Transfers are strictly excluded from external income & expenses
    expect(useFinanceStore.getState().getPeriodIncome('2026-10-01', '2026-10-15')).toBe(5200000);
    expect(useFinanceStore.getState().getPeriodExpenses('2026-10-01', '2026-10-15')).toBe(1880000);
  });

  // 5. Beneficiary Management CRUD
  it('supports beneficiary CRUD operations', () => {
    const store = useFinanceStore.getState();
    const initCount = store.beneficiaries.length;

    // Add beneficiary
    const ben = store.addBeneficiary({
      name: 'Electricity Board',
      bankName: 'Canara Bank',
      accountNumberMasked: '•••• 1122',
      nickname: 'BESCOM Karnataka',
      notes: 'Monthly domestic bill',
    });

    expect(useFinanceStore.getState().beneficiaries.length).toBe(initCount + 1);

    // Update beneficiary
    useFinanceStore.getState().updateBeneficiary({
      ...ben,
      nickname: 'BESCOM Urban Division',
    });
    const updated = useFinanceStore.getState().beneficiaries.find((b) => b.id === ben.id);
    expect(updated?.nickname).toBe('BESCOM Urban Division');

    // Delete beneficiary
    useFinanceStore.getState().deleteBeneficiary(ben.id);
    expect(useFinanceStore.getState().beneficiaries.length).toBe(initCount);
  });

  // 6. Bills Management & Local Payment Recording
  it('manages bills and confirms demo bill payment into canonical ledger', () => {
    const store = useFinanceStore.getState();
    const initCash = store.getTotalLiquidCash();
    const initHdfc = store.getAccountBalance('acct_hdfc');
    const initExpenses = store.getPeriodExpenses('2026-10-01', '2026-10-15');

    // Add scheduled bill
    const newBill = store.addBill({
      title: 'Water Supply Utility',
      billerName: 'City Water Board',
      category: 'Utilities',
      amountMinor: 65000, // ₹650
      dueDate: '2026-10-28',
      accountId: 'acct_hdfc',
      status: 'upcoming',
    });

    // Scheduled bill does NOT immediately decrease cash balance
    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(initCash);

    // Pay the bill
    const payRes = useFinanceStore.getState().payBill(newBill.id, 'acct_hdfc');
    expect(payRes.success).toBe(true);
    expect(payRes.transaction).toBeDefined();

    // Verify canonical double-entry ledger mutation
    expect(useFinanceStore.getState().getAccountBalance('acct_hdfc')).toBe(initHdfc - 65000);
    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(initCash - 65000);
    expect(useFinanceStore.getState().getPeriodExpenses('2026-10-01', '2026-10-15')).toBe(initExpenses + 65000);

    // Verify bill status updated to paid
    const updatedBill = useFinanceStore.getState().bills.find((b) => b.id === newBill.id);
    expect(updatedBill?.status).toBe('paid');
    expect(updatedBill?.paymentTransactionId).toBe(payRes.transaction?.id);

    // Duplicate payment prevention
    const duplicateRes = useFinanceStore.getState().payBill(newBill.id, 'acct_hdfc');
    expect(duplicateRes.success).toBe(false);
    expect(duplicateRes.error).toContain('already been paid');
  });

  // 7. Statement Generation & Mathematical Reconciliation
  it('generates statements that strictly reconcile: Closing = Opening + Inflows - Outflows', () => {
    const store = useFinanceStore.getState();
    const hdfc = store.accounts.find((a) => a.id === 'acct_hdfc')!;

    const statement = generateAccountStatement(
      hdfc,
      store.transactions,
      '2026-10-01',
      '2026-10-31'
    );

    expect(statement.isReconciled).toBe(true);
    expect(statement.closingBalanceMinor).toBe(
      statement.openingBalanceMinor + statement.totalCreditsMinor - statement.totalDebitsMinor
    );

    // Running balances must match closing balance on last row
    if (statement.rows.length > 0) {
      const lastRow = statement.rows[statement.rows.length - 1];
      expect(lastRow.runningBalanceMinor).toBe(statement.closingBalanceMinor);
    }
  });

  // 8. Card Freeze & Unfreeze Simulation
  it('toggles card freeze status without destroying card details', () => {
    const store = useFinanceStore.getState();
    const card = store.cards[0];
    expect(card.status).toBe('active');

    // Freeze
    store.toggleCardFreeze(card.id);
    expect(useFinanceStore.getState().cards.find((c) => c.id === card.id)?.status).toBe('frozen');

    // Unfreeze
    useFinanceStore.getState().toggleCardFreeze(card.id);
    expect(useFinanceStore.getState().cards.find((c) => c.id === card.id)?.status).toBe('active');

    // Update nickname
    useFinanceStore.getState().updateCardNickname(card.id, 'Everyday Preferred Card');
    expect(useFinanceStore.getState().cards.find((c) => c.id === card.id)?.cardNickname).toBe('Everyday Preferred Card');
  });

  // 9. Fixed Deposit (FD) Compound Interest & Maturity
  it('calculates Fixed Deposit maturity correctly with quarterly compounding', () => {
    // ₹1,00,000 for 1 year @ 7.10% compounded quarterly
    const principal = 10000000; // paise
    const rate = 7.1;
    const months = 12;

    const res = calculateFdMaturity(principal, rate, months, 'quarterly');
    // A = 100000 * (1 + 0.071/4)^4 ~= 107291.6 -> 10729160 paise
    expect(res.maturityAmountMinor).toBeGreaterThan(principal);
    expect(res.interestEarnedMinor).toBe(res.maturityAmountMinor - principal);
    expect(Math.round(res.interestEarnedMinor / 100)).toBeCloseTo(7292, -1);
  });

  // 10. Recurring Deposit (RD) Compound Interest & Maturity
  it('calculates Recurring Deposit maturity correctly with monthly instalments and quarterly compounding', () => {
    const monthlyInstalment = 500000; // ₹5,000 monthly
    const rate = 6.8;
    const months = 24; // 2 years

    const res = calculateRdMaturity(monthlyInstalment, rate, months);
    expect(res.totalInvestedMinor).toBe(500000 * 24); // ₹1,20,000
    expect(res.maturityAmountMinor).toBeGreaterThan(res.totalInvestedMinor);
    expect(res.interestEarnedMinor).toBe(res.maturityAmountMinor - res.totalInvestedMinor);
  });

  // 11. Loan EMI & Amortization Schedule
  it('calculates Loan EMI and generates yearly amortization schedule', () => {
    // Home Loan: ₹30,00,000 @ 8.5% for 20 years (240 months)
    const principal = 300000000; // paise
    const rate = 8.5;
    const tenureMonths = 240;

    const res = calculateLoanEmi(principal, rate, tenureMonths);
    expect(res.monthlyEmiMinor).toBeGreaterThan(0);
    expect(res.totalRepaymentMinor).toBe(res.monthlyEmiMinor * tenureMonths);
    expect(res.totalInterestMinor).toBe(res.totalRepaymentMinor - principal);

    const schedule = generateAmortizationSchedule(principal, rate, tenureMonths);
    expect(schedule.length).toBe(20); // 20 years
    expect(schedule[0].openingBalanceMinor).toBe(principal);
    expect(schedule[schedule.length - 1].closingBalanceMinor).toBe(0);
  });

  // 12. Deterministic AI Banking Insights
  it('generates data-driven banking insights based on active transactions and bills', () => {
    const store = useFinanceStore.getState();
    const insights = generateBankingInsights(
      store.accounts,
      store.transactions,
      store.bills,
      store.recurringRules,
      '2026-10-15'
    );

    expect(insights.length).toBeGreaterThan(0);
    expect(insights.some((ins) => ins.id.includes('highest_outflow'))).toBe(true);
    expect(insights.some((ins) => ins.id.includes('cashflow_summary'))).toBe(true);
  });

  // 13. UI Navigation & Page Rendering Tests
  it('renders Banking Overview page with account cards and actions', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Your accounts, transactions and banking activities in one place. As of 2026-10-15.')).toBeInTheDocument();
    expect(screen.getAllByText('Everyday Savings').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Goals Savings').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cash Wallet').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Transfer Money').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Accounts Directory page and filters by type', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/accounts'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: 'Accounts Directory', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Add Demo Account')).toBeInTheDocument();
  });

  it('renders Account Detail page with chronological balance progression and handles unknown account', () => {
    // Valid account
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/accounts/acct_hdfc'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: 'Everyday Savings', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Chronological Balance Progression')).toBeInTheDocument();
    expect(screen.getByText('Account Transaction Ledger')).toBeInTheDocument();

    // Invalid account ID test
    const invalidRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/accounts/non_existent_account_xyz'],
    });

    render(<RouterProvider router={invalidRouter} />);

    expect(screen.getByText('Account Not Found')).toBeInTheDocument();
    expect(screen.getAllByText('Back to Accounts Directory').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Transfer simulator page with preview and accounts dropdown', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/transfer'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: 'Transfer Money', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Confirm Demo Transfer')).toBeInTheDocument();
  });

  it('renders Statements page with reconciled balance breakdown', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/statements?account=acct_hdfc'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('EXPENZO DEMO STATEMENT')).toBeInTheDocument();
    expect(screen.getByText('Mathematical Balance Reconciliation')).toBeInTheDocument();
    expect(screen.getByText('RECONCILED (100% MATCH)')).toBeInTheDocument();
    expect(screen.getByText('Print Statement')).toBeInTheDocument();
    expect(screen.getByText('Download CSV')).toBeInTheDocument();
  });

  it('renders Bills & Payments page with upcoming commitments', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/bills'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: 'Bills & Payments', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Schedule New Bill')).toBeInTheDocument();
    expect(screen.getByText('Apartment Lease Rent')).toBeInTheDocument();
    expect(screen.getByText('Airtel Fiber Broadband')).toBeInTheDocument();
  });

  it('renders Payment Cards page with freeze controls', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/cards'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: 'Payment Cards', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('HDFC Millennia Platinum')).toBeInTheDocument();
    expect(screen.getAllByText('Freeze Card').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Deposits calculator page', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/deposits'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: 'Term Deposits (FD & RD)', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Save Demo Plan')).toBeInTheDocument();
    expect(screen.getByText('Quarterly Compounded')).toBeInTheDocument();
  });

  it('renders Loans & EMI calculator page with yearly amortization schedule', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/loans'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: 'Loan & EMI Calculator', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Yearly Amortization Schedule')).toBeInTheDocument();
    expect(screen.getByText('Save Loan Simulation')).toBeInTheDocument();
  });

  it('renders Banking Services Directory with active routes and roadmap dialogs', () => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking/services'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: 'Banking Services Directory', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Internal Demo Transfers')).toBeInTheDocument();
    expect(screen.getByText('UPI & Instant QR Payments')).toBeInTheDocument();
  });

  it('handles clean slate workspace gracefully with zero crashes', () => {
    // Clear out accounts and transactions
    useFinanceStore.setState({
      accounts: [],
      transactions: [],
      bills: [],
      recurringRules: [],
    });

    const testRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/app/banking'],
    });

    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('No Demo Accounts Found')).toBeInTheDocument();
    expect(screen.getByText('Create Demo Account')).toBeInTheDocument();
  });
});
