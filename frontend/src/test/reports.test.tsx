import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { generateFinancialReport, generateReportCSV } from '@/features/reports/utils/reportGenerator';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { ReportDetailPage } from '@/features/reports/pages/ReportDetailPage';

describe('Phase 7D: Financial Reports & Reconciled Statements', () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
  });

  it('aggregates period financial metrics and reconciles accounting invariants', () => {
    const storeState = useFinanceStore.getState();

    // Default October 2026 reporting window (2026-10-01 to 2026-10-15)
    const report = generateFinancialReport(
      {
        type: 'monthly',
        startDate: '2026-10-01',
        endDate: '2026-10-15',
      },
      storeState
    );

    // Income: ₹52,000 (5,200,000 paise)
    // Expenses: ₹18,800 (1,880,000 paise)
    // Net Savings: ₹33,200 (3,320,000 paise)
    // Savings Rate: (33,200 / 52,000) * 100 = 63.846%
    expect(report.totalIncomeMinor).toBe(5200000);
    expect(report.totalExpenseMinor).toBe(1880000);
    expect(report.netSavingsMinor).toBe(3320000);
    expect(report.savingsRatePercent).toBeCloseTo(63.85, 1);

    // Category breakdown sum must equal total expenses
    const categorySum = report.topExpenseCategories.reduce((sum, c) => sum + c.amountMinor, 0);
    expect(categorySum).toBe(report.totalExpenseMinor);

    // Portfolio valuation must equal TCS + INFY valuation (₹42,500 = 4,250,000 paise)
    expect(report.portfolioValueMinor).toBe(4250000);
  });

  it('generates CSV with formula injection protection against malicious characters', () => {
    const storeState = useFinanceStore.getState();
    const report = generateFinancialReport(
      {
        type: 'monthly',
        startDate: '2026-10-01',
        endDate: '2026-10-15',
      },
      storeState
    );

    const csv = generateReportCSV(report);
    expect(csv).toContain('EXPENZO FINANCIAL STATEMENT');
    expect(csv).toContain('EXECUTIVE SUMMARY METRICS');
    expect(csv).toContain('Total Credited Income');
    expect(csv).toContain('52000.00');
    expect(csv).toContain('18800.00');

    // Test formula injection protection
    const maliciousReport = {
      ...report,
      topTransactions: [
        {
          id: 'mal_1',
          accountId: 'acct_hdfc',
          amountMinor: 10000,
          type: 'expense' as const,
          category: 'Shopping',
          merchant: '=cmd|/c calc.exe',
          date: '2026-10-10',
          status: 'completed' as const,
        },
      ],
    };
    const sanitizedCsv = generateReportCSV(maliciousReport);
    // Formula starting with '=' must be escaped with single quote
    expect(sanitizedCsv).toContain("'=cmd|/c calc.exe");
  });

  it('renders Reports page with quick presets and executive metrics', () => {
    render(
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Financial Reports & Audited Statements/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Month \(Oct 2026\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Inflow \(Income\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Outflow \(Expenses\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Download CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/Print \/ Save PDF/i)).toBeInTheDocument();
  });

  it('renders Report Detail page with full audit statement layout', () => {
    render(
      <MemoryRouter initialEntries={['/app/reports/rep_monthly_2026-10-01_2026-10-15']}>
        <Routes>
          <Route path="/app/reports/:id" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Official Statement/i)).toBeInTheDocument();
    expect(screen.getByText(/Spending by Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Largest Period Transactions/i)).toBeInTheDocument();
  });

  it('displays a clean empty state when selected date range has no transactions', () => {
    render(
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>
    );

    // Change From Date to a future range with 0 transactions
    const fromInput = screen.getByLabelText(/From Date/i);
    const toInput = screen.getByLabelText(/To Date/i);

    fireEvent.change(fromInput, { target: { value: '2028-01-01' } });
    fireEvent.change(toInput, { target: { value: '2028-01-15' } });

    expect(screen.getByText(/No Transactions Recorded in this Period/i)).toBeInTheDocument();
  });
});
