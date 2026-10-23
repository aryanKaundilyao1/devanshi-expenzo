import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { router } from '@/app/routes';
import { useAuthStore, DEFAULT_ONBOARDING_PREFS } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { INITIAL_USER } from '@/services/fixtures/seedData';

describe('Phase 4 Core Financial Dashboard Tests', () => {
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

  it('renders dashboard header with user greeting, persona badge and demo date', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: /Aryan/i })).toBeInTheDocument();
    expect(screen.getByText(/Working Professional Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/As of 15 Oct 2026/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Transaction/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Ask AI$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Customize/i })).toBeInTheDocument();
  });

  it('calculates and renders all 6 primary KPI metric cards accurately from seed ledger', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    // 1. Available Cash = ₹77,200
    expect(screen.getByText('Available Cash')).toBeInTheDocument();
    expect(screen.getAllByText('₹77,200').length).toBeGreaterThanOrEqual(1);

    // 2. Total Inflow = ₹52,000
    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getAllByText('₹52,000').length).toBeGreaterThanOrEqual(1);

    // 3. Total Outflow = ₹18,800
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getAllByText('₹18,800').length).toBeGreaterThanOrEqual(1);

    // 4. Portfolio Value = ₹42,500 (10 TCS @ ₹3,500 + 5 INFY @ ₹1,500)
    expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
    expect(screen.getAllByText('₹42,500').length).toBeGreaterThanOrEqual(1);

    // 5. Estimated Net Worth = ₹1,19,700 (Cash ₹77,200 + Portfolio ₹42,500 - Liabilities ₹0)
    expect(screen.getByText('Estimated Net Worth')).toBeInTheDocument();
    expect(screen.getAllByText('₹1,19,700').length).toBeGreaterThanOrEqual(1);

    // 6. Savings Goal Progress = MacBook Pro Upgrade ₹12,000
    expect(screen.getAllByText('MacBook Pro Upgrade').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('₹12,000').length).toBeGreaterThanOrEqual(1);
  });

  it('updates period-dependent metrics when switching from 30D to 7D while keeping point-in-time balances intact', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    // Initially at 30D: Inflow is ₹52,000 and Outflow is ₹18,800
    expect(screen.getAllByText('₹52,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('₹18,800').length).toBeGreaterThanOrEqual(1);

    // Click 7D chip (covers 2026-10-09 to 2026-10-15)
    const chip7D = screen.getByRole('button', { name: '7D' });
    fireEvent.click(chip7D);

    // In 7D:
    // Salary was on Oct 01 -> Inflow is now ₹0
    // Expenses in 7D: Electricity ₹1,500 (Oct 11) + Shopping ₹2,000 (Oct 12) = ₹3,500 (Transfer of ₹5,000 on Oct 10 excluded)
    expect(screen.getAllByText('₹0').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('₹3,500').length).toBeGreaterThanOrEqual(1);

    // Point-in-time measurements must remain unchanged!
    expect(screen.getAllByText('₹77,200').length).toBeGreaterThanOrEqual(1); // Liquid cash
    expect(screen.getAllByText('₹42,500').length).toBeGreaterThanOrEqual(1); // Portfolio
    expect(screen.getAllByText('₹1,19,700').length).toBeGreaterThanOrEqual(1); // Net worth
  });

  it('opens and displays the Net Worth Accounting Breakdown modal on card click', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    // Click Estimated Net Worth card
    const netWorthCard = screen.getByText('Estimated Net Worth').closest('div[class*="cursor-pointer"]');
    expect(netWorthCard).not.toBeNull();
    fireEvent.click(netWorthCard!);

    // Modal dialog appears
    expect(screen.getByRole('heading', { name: /Net Worth Accounting Breakdown/i })).toBeInTheDocument();
    expect(screen.getByText(/Zero Double-Counting Guarantee/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Estimated Net Worth/i)).toBeInTheDocument();

    // Close modal
    const closeBtns = screen.getAllByRole('button', { name: /Close/i });
    fireEvent.click(closeBtns[0]);
  });

  it('records a new expense transaction and immediately recalculates all dashboard values without page reload', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    // Prior values: Liquid cash ₹77,200, Expenses ₹18,800, Net worth ₹1,19,700
    expect(screen.getAllByText('₹77,200').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('₹18,800').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('₹1,19,700').length).toBeGreaterThanOrEqual(1);

    // Open Add Transaction modal
    const addBtn = screen.getByRole('button', { name: /Add Transaction/i });
    fireEvent.click(addBtn);

    expect(screen.getByRole('heading', { name: /Record Transaction/i })).toBeInTheDocument();

    // Fill form with an expense of ₹1,200 at Starbucks
    const amountInput = screen.getByPlaceholderText('0.00');
    const merchantInput = screen.getByLabelText(/Merchant \/ Payee \/ Description/i);

    fireEvent.change(amountInput, { target: { value: '1200' } });
    fireEvent.change(merchantInput, { target: { value: 'Starbucks Coffee' } });

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /Save Transaction/i });
    fireEvent.click(saveBtn);

    // Verify immediate recomputation:
    // Liquid cash drops from ₹77,200 to ₹76,000 (₹77,200 - ₹1,200)
    // Expenses increase from ₹18,800 to ₹20,000 (₹18,800 + ₹1,200)
    // Net worth drops from ₹1,19,700 to ₹1,18,500 (₹1,19,700 - ₹1,200)
    await waitFor(() => {
      expect(screen.getAllByText('₹76,000').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('₹20,000').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('₹1,18,500').length).toBeGreaterThanOrEqual(1);
    });

    // Starbucks Coffee now appears in the recent transactions feed
    expect(screen.getByText('Starbucks Coffee')).toBeInTheDocument();
  });

  it('validates transaction modal for transfer destination account disparity', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Add Transaction/i }));

    // Switch to Transfer
    const transferBtn = screen.getByRole('button', { name: /Transfer/i });
    fireEvent.click(transferBtn);

    // Enter amount and merchant
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/Merchant \/ Payee \/ Description/i), { target: { value: 'Transfer test' } });

    // Set destination account to same as source account
    const sourceSelect = screen.getByLabelText(/Source Account/i) as HTMLSelectElement;
    const destSelect = screen.getByLabelText(/Destination Account/i) as HTMLSelectElement;

    fireEvent.change(destSelect, { target: { value: sourceSelect.value } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Save Transaction/i }));

    await waitFor(() => {
      expect(screen.getByText(/Destination account must be selected and different from source account/i)).toBeInTheDocument();
    });
  });

  it('renders category spending donut breakdown and top category badge', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    expect(screen.getByText(/Top: Housing & Rent \(63.8%\)/i)).toBeInTheDocument();

    // Verify categories listed
    expect(screen.getAllByText('Housing & Rent').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Food & Dining').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Shopping').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Utilities').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Transport').length).toBeGreaterThanOrEqual(1);
  });

  it('renders budget utilization items with threshold warnings', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
    // Housing budget spent ₹12,000 of ₹15,000 = 80%, triggers 80% Alert badge
    expect(screen.getByText(/80% Alert/i)).toBeInTheDocument();
  });

  it('renders investment portfolio snapshot with stock holdings and unrealized P&L', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
    expect(screen.getByText(/2 Holdings Active/i)).toBeInTheDocument();
    expect(screen.getAllByText('TCS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('INFY').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\+8.9%|\+9%/i).length).toBeGreaterThan(0);
  });

  it('renders upcoming bills with scheduled auto-debits relative to demo date', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Upcoming Bills')).toBeInTheDocument();
    expect(screen.getByText('Airtel Broadband & Wi-Fi')).toBeInTheDocument();
    expect(screen.getByText('Cult.fit Gym & Fitness Pass')).toBeInTheDocument();
    expect(screen.getByText('HDFC Life Term Insurance')).toBeInTheDocument();
    expect(screen.getByText('UTI Nifty 50 Index Fund SIP')).toBeInTheDocument();
  });

  it('generates deterministic rules-based AI insights from ledger calculations', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('EXPENZO Intelligence')).toBeInTheDocument();
    expect(screen.getByText(/Top Outflow: Housing & Rent/i)).toBeInTheDocument();
    expect(screen.getByText(/Housing & Rent at 80% of Limit/i)).toBeInTheDocument();
    expect(screen.getByText(/Strong Savings Rate: 63.8%/i)).toBeInTheDocument();
  });

  it('adapts widget ordering for Student persona to prioritize Budgets & Savings Goals', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        ...INITIAL_USER,
        name: 'Aarav Patel',
        persona: 'student',
      },
      onboardingCompleted: true,
      preferences: {
        ...DEFAULT_ONBOARDING_PREFS,
        persona: 'student',
      },
    });

    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText(/Student Workspace/i)).toBeInTheDocument();
    expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
    expect(screen.getByText('Savings Milestone')).toBeInTheDocument();
  });

  it('supports empty workspace mode with zero metrics and helpful empty state CTAs', () => {
    useFinanceStore.setState({
      accounts: [],
      transactions: [],
      budgets: [],
      goals: [],
      holdings: [],
    });

    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    // Shows clean slate workspace banner
    expect(screen.getByText(/Clean Slate Workspace Active/i)).toBeInTheDocument();

    // Zero KPI cards
    const zeros = screen.getAllByText('₹0');
    expect(zeros.length).toBeGreaterThan(0);

    // Empty state callouts
    expect(screen.getByText(/No Transactions Recorded Yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No Budgets Configured/i)).toBeInTheDocument();
    expect(screen.getByText(/No Investment Holdings/i)).toBeInTheDocument();
    expect(screen.getByText(/No Active Savings Goals/i)).toBeInTheDocument();
  });

  it('allows customizing dashboard widget visibility via Customize dialog', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    // Open Customize modal
    const customizeBtn = screen.getByRole('button', { name: /Customize/i });
    fireEvent.click(customizeBtn);

    expect(screen.getByRole('heading', { name: /Customize Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('Cash Flow Dynamics Chart')).toBeInTheDocument();

    // Toggle Cash Flow Dynamics off
    fireEvent.click(screen.getByText('Cash Flow Dynamics Chart'));

    // Click Done
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    // Chart header should now be hidden
    await waitFor(() => {
      expect(screen.queryByText('Cash Flow Dynamics')).not.toBeInTheDocument();
    });
  });
});
