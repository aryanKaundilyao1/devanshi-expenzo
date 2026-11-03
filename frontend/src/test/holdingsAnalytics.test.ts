/**
 * EXPENZO — Expenditure Flows vs. Holdings Analytics Unit Tests
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAssetAllocation,
  generateExpenditureHoldingsSeries,
  buildHoldingsAnalytics,
} from '@/domain/calculations/holdingsAnalytics';
import { FinancialAccount, InvestmentHolding, StockQuote, Transaction } from '@/types/finance';

describe('Expenditure Flows vs. Holdings Analytics Formulas', () => {
  const mockAccounts: FinancialAccount[] = [
    {
      id: 'acc-savings',
      name: 'HDFC Savings',
      institution: 'HDFC Bank',
      accountType: 'savings',
      accountNumberMasked: '•••• 1234',
      openingBalanceMinor: 25000000, // ₹2,50,000 (Liquid Cash)
      currency: 'INR',
      isDemo: true,
      lastUpdated: '2026-10-15',
    },
    {
      id: 'acc-credit',
      name: 'SBI Credit Card',
      institution: 'State Bank of India',
      accountType: 'credit',
      accountNumberMasked: '•••• 5678',
      openingBalanceMinor: 3000000, // ₹30,000 (Liability)
      currency: 'INR',
      isDemo: true,
      lastUpdated: '2026-10-15',
    },
  ];

  const mockHoldings: InvestmentHolding[] = [
    {
      id: 'hold-1',
      ticker: 'TCS',
      companyName: 'Tata Consultancy Services',
      assetClass: 'equity',
      quantity: 10,
      averageBuyPriceMinor: 380000, // Buy: ₹3,800/share -> Total: ₹38,000
    },
    {
      id: 'hold-2',
      ticker: 'HDFCBANK',
      companyName: 'HDFC Bank Ltd',
      assetClass: 'equity',
      quantity: 20,
      averageBuyPriceMinor: 160000, // Buy: ₹1,600/share -> Total: ₹32,000
    },
  ];

  const mockQuotes: Record<string, StockQuote> = {
    TCS: {
      ticker: 'TCS',
      companyName: 'Tata Consultancy Services',
      exchange: 'NSE',
      currentPriceMinor: 420000, // Current: ₹4,200/share -> Total: ₹42,000
      dayChangeMinor: 4000,
      dayChangePercent: 0.96,
      marketCap: '15.2T',
      week52HighMinor: 450000,
      week52LowMinor: 330000,
      sector: 'IT',
      historicalPrices: [],
    },
    HDFCBANK: {
      ticker: 'HDFCBANK',
      companyName: 'HDFC Bank Ltd',
      exchange: 'NSE',
      currentPriceMinor: 175000, // Current: ₹1,750/share -> Total: ₹35,000
      dayChangeMinor: 1500,
      dayChangePercent: 0.86,
      marketCap: '13.1T',
      week52HighMinor: 180000,
      week52LowMinor: 140000,
      sector: 'Banking',
      historicalPrices: [],
    },
  };

  const mockTransactions: Transaction[] = [
    {
      id: 'tx-oct-inc',
      accountId: 'acc-savings',
      amountMinor: 12000000, // ₹1,20,000
      type: 'income',
      category: 'Salary',
      merchant: 'Company',
      date: '2026-10-01',
      status: 'completed',
    },
    {
      id: 'tx-oct-exp',
      accountId: 'acc-savings',
      amountMinor: 4500000, // ₹45,000
      type: 'expense',
      category: 'Dining',
      merchant: 'Restaurant',
      date: '2026-10-15',
      status: 'completed',
    },
  ];

  describe('calculateAssetAllocation', () => {
    it('accurately derives asset allocation percentages across cash and stocks', () => {
      const allocation = calculateAssetAllocation(mockAccounts, mockHoldings, mockQuotes);

      // Cash = ₹2,50,000
      // Equities = 42,000 (TCS) + 35,000 (HDFCBANK) = ₹77,000
      // Total Assets = ₹3,27,000 (32700000 paise)
      expect(allocation.length).toBeGreaterThan(0);

      const cashItem = allocation.find((a) => a.category.includes('Cash'))!;
      expect(cashItem.amountMinor).toBe(25000000);
      // Cash percent = (2,50,000 / 3,27,000) * 100 = ~76.5%
      expect(cashItem.percentage).toBe(76.5);

      const stockItem = allocation.find((a) => a.category.includes('Equities'))!;
      expect(stockItem.amountMinor).toBe(7700000);
      // Stock percent = (77,000 / 3,27,000) * 100 = ~23.5%
      expect(stockItem.percentage).toBe(23.5);
    });

    it('returns empty array when accounts and investments are zero', () => {
      const res = calculateAssetAllocation([], [], {});
      expect(res).toEqual([]);
    });
  });

  describe('generateExpenditureHoldingsSeries (Flows vs Stock Balances Separation)', () => {
    it('generates distinct monthly flow and balance metrics', () => {
      const series = generateExpenditureHoldingsSeries({
        transactions: mockTransactions,
        accounts: mockAccounts,
        holdings: mockHoldings,
        quotes: mockQuotes,
        monthsCount: 3,
        referenceDate: '2026-10-31',
      });

      expect(series.length).toBe(3);

      // Latest month (Oct 2026)
      const octPoint = series[series.length - 1];
      expect(octPoint.date).toBe('2026-10');
      expect(octPoint.incomeRupees).toBe(120000); // ₹1,20,000
      expect(octPoint.expenseRupees).toBe(45000);  // ₹45,000
      expect(octPoint.netSavingsRupees).toBe(75000); // 120,000 - 45,000 = ₹75,000

      // Point-in-time balances
      expect(octPoint.cashRupees).toBe(250000); // ₹2,50,000
      expect(octPoint.investmentsRupees).toBe(77000); // ₹77,000
      expect(octPoint.totalAssetsRupees).toBe(327000); // 2,50,000 + 77,000 = ₹3,27,000
      expect(octPoint.liabilitiesRupees).toBe(30000); // ₹30,000 credit debt
      expect(octPoint.netWorthRupees).toBe(297000); // 3,27,000 - 30,000 = ₹2,97,000
      expect(octPoint.isValuationAvailable).toBe(true);
    });
  });

  describe('buildHoldingsAnalytics', () => {
    it('computes portfolio gain and net worth consistently', () => {
      const summary = buildHoldingsAnalytics({
        accounts: mockAccounts,
        holdings: mockHoldings,
        quotes: mockQuotes,
        transactions: mockTransactions,
        referenceDate: '2026-10-31',
      });

      // Total invested = (10 * 3,800) + (20 * 1,600) = 38,000 + 32,000 = ₹70,000 (7000000 paise)
      // Current valuation = 42,000 + 35,000 = ₹77,000 (7700000 paise)
      // Gain = 77,000 - 70,000 = +₹7,000 (+10.0%)
      expect(summary.currentInvestmentsMinor).toBe(7700000);
      expect(summary.portfolioPeriodGainMinor).toBe(700000);
      expect(summary.portfolioPeriodGainPercent).toBe(10.0);

      // Current Net worth = Total Assets (3,27,000) - Liabilities (30,000) = ₹2,97,000 (29700000 paise)
      expect(summary.currentNetWorthMinor).toBe(29700000);
      expect(summary.provenance).toContain('Authenticated Ledger');
    });
  });
});
