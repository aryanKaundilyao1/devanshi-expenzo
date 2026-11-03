/**
 * EXPENZO — Dataset Integration & Financial Intelligence Test Suite
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import { describe, it, expect } from 'vitest';
import { datasetService, USD_TO_INR_RATE } from '../features/intelligence/services/datasetService';
import { DatasetSummary } from '../features/intelligence/types';

describe('Expenzo Dataset Integration & Financial Intelligence (CSCR2600 PBL-1)', () => {
  const summary: DatasetSummary = datasetService.getDatasetSummary();

  describe('1. Dataset Provenance, Schemas & Exact-Sum Invariants', () => {
    it('verifies dataset provenance and author attribution', () => {
      expect(summary.provenance.author).toBe('Devanshi Singh');
      expect(summary.provenance.datasetName).toContain('IBM Synthetic Credit Card');
      expect(summary.provenance.sourceFiles.length).toBe(4);
    });

    it('verifies cohort transaction counts and deduplication integrity', () => {
      expect(summary.metrics.totalCohortTransactions).toBe(80977);
      expect(summary.metrics.totalDuplicatesIsolated).toBe(0);
      expect(summary.metrics.totalCohortUsers).toBe(4);
      expect(summary.users.length).toBe(4);
    });

    it('enforces integer monetary conversion rules (1 USD = 83 INR)', () => {
      expect(USD_TO_INR_RATE).toBe(83.0);
      const usdTotal = summary.metrics.totalSpendingUsd;
      const inrPaise = summary.metrics.totalSpendingInrPaise;
      // Invariant: inrPaise === round(usdTotal * 83 * 100)
      expect(inrPaise).toBe(Math.round(usdTotal * 83 * 100));
    });

    it('validates exact-sum category invariant: sum of categories equals total cohort spend', () => {
      const sumCategoriesUsd = summary.categorySpending.reduce((acc, c) => acc + c.totalUsd, 0);
      // Precision within rounding of individual float categories
      expect(Math.abs(sumCategoriesUsd - summary.metrics.totalSpendingUsd)).toBeLessThan(1.0);
    });

    it('validates exact-sum monthly invariant: sum of monthly spending equals total cohort spend', () => {
      const sumMonthlyUsd = summary.monthlySpending.reduce((acc, m) => acc + m.totalUsd, 0);
      expect(Math.abs(sumMonthlyUsd - summary.metrics.totalSpendingUsd)).toBeLessThan(1.0);
    });
  });

  describe('2. Query Engine, Multi-Criteria Filtering & Pagination', () => {
    it('retrieves default paginated transactions with valid attributes', () => {
      const result = datasetService.queryTransactions({ page: 1, pageSize: 25 });
      expect(result.items.length).toBe(25);
      expect(result.total).toBeGreaterThanOrEqual(10000);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(25);

      const firstTx = result.items[0];
      expect(firstTx).toHaveProperty('id');
      expect(firstTx).toHaveProperty('date');
      expect(firstTx).toHaveProperty('amountUsd');
      expect(firstTx).toHaveProperty('category');
      expect(firstTx).toHaveProperty('merchant');
      expect(firstTx.cardMasked).toContain('••••');
    });

    it('filters transactions strictly by user ID', () => {
      const resultUser0 = datasetService.queryTransactions({ userId: 0, pageSize: 50 });
      expect(resultUser0.items.length).toBeGreaterThan(0);
      resultUser0.items.forEach((tx) => {
        expect(tx.userId).toBe(0);
      });

      const resultUser3 = datasetService.queryTransactions({ userId: 3, pageSize: 50 });
      expect(resultUser3.items.length).toBeGreaterThan(0);
      resultUser3.items.forEach((tx) => {
        expect(tx.userId).toBe(3);
      });
    });

    it('filters transactions by category and search keyword', () => {
      const result = datasetService.queryTransactions({
        category: 'Groceries',
        search: 'Supermarket',
        pageSize: 50,
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((tx) => {
        expect(tx.category).toBe('Groceries');
        expect(tx.merchant.toLowerCase()).toContain('supermarket');
      });
    });

    it('filters transactions by amount boundaries and sorts descending', () => {
      const result = datasetService.queryTransactions({
        minAmount: 100,
        maxAmount: 500,
        sortField: 'amountUsd',
        sortOrder: 'desc',
        pageSize: 30,
      });

      expect(result.items.length).toBeGreaterThan(0);
      for (let i = 0; i < result.items.length - 1; i++) {
        expect(result.items[i].amountUsd).toBeGreaterThanOrEqual(100);
        expect(result.items[i].amountUsd).toBeLessThanOrEqual(500);
        expect(result.items[i].amountUsd).toBeGreaterThanOrEqual(result.items[i + 1].amountUsd);
      }
    });
  });

  describe('3. Statistical Anomaly & Rolling Spike Isolation', () => {
    it('detects rolling statistical expenditure anomalies with valid Z-scores', () => {
      expect(summary.anomalies.length).toBeGreaterThan(0);
      summary.anomalies.forEach((anom) => {
        expect(anom.zScore).toBeGreaterThanOrEqual(1.5);
        expect(anom.actualUsd).toBeGreaterThan(anom.baselineUsd);
        expect(anom.primaryDriverCategory).toBeTruthy();
        expect(anom.explanation).toContain(anom.primaryDriverCategory);
      });
    });
  });

  describe('4. Explainable Financial Optimization & Counterfactual Simulation', () => {
    it('recalculates discretionary expenditure curtailment with slider adjustments', () => {
      const sim10 = datasetService.calculateDynamicOptimization(10);
      const sim20 = datasetService.calculateDynamicOptimization(20);

      expect(sim20.projectedSavingsUsd).toBeGreaterThan(sim10.projectedSavingsUsd);
      expect(sim20.reductionPercent).toBe(20);
      expect(sim10.reductionPercent).toBe(10);

      // Invariant: optimized total + projected savings = baseline total
      expect(sim10.optimizedTotalUsd + sim10.projectedSavingsUsd).toBe(sim10.baselineTotalUsd);
      expect(sim20.optimizedTotalUsd + sim20.projectedSavingsUsd).toBe(sim20.baselineTotalUsd);
    });

    it('validates recommendation rules and confidence intervals', () => {
      expect(summary.recommendations.length).toBeGreaterThanOrEqual(3);
      summary.recommendations.forEach((rec) => {
        expect(rec.confidence).toBeGreaterThan(0.7);
        expect(rec.confidence).toBeLessThanOrEqual(1.0);
        expect(rec.potentialAnnualSavingsUsd).toBeGreaterThan(0);
        expect(rec.supportingTransactionsCount).toBeGreaterThan(0);
        expect(rec.assumptions).toBeTruthy();
      });
    });
  });

  describe('5. Multi-Member Financial Efficiency & Behavioral Rankings', () => {
    it('ranks members deterministically by savings rate', () => {
      const rankings = summary.memberRankings;
      expect(rankings.length).toBe(4);

      // Verify sorted order
      for (let i = 0; i < rankings.length - 1; i++) {
        expect(rankings[i].savingsRate).toBeGreaterThanOrEqual(rankings[i + 1].savingsRate);
      }

      // Member 3 (Everlee Clark) is high earner with highest savings rate
      expect(rankings[0].name).toContain('Everlee Clark');
      expect(rankings[0].savingsRate).toBeGreaterThan(60);
      expect(rankings[0].estMonthlyNetSavingsUsd).toBeGreaterThan(10000);
    });

    it('validates senior member outlays without false classification', () => {
      const senior = summary.memberRankings.find((m) => m.age === 81);
      expect(senior).toBeDefined();
      expect(senior?.name).toContain('Saanvi Lee');
      // Saanvi has high health/pharmacy spend which is essential, not wasteful
      expect(senior?.categoryBreakdown['Health']).toBeGreaterThan(0);
    });
  });

  describe('6. Security, Masking & Sensitive Card Data Protection', () => {
    it('ensures all card numbers are strictly masked and CVVs are omitted', () => {
      summary.users.forEach((u) => {
        const uCards = summary.cards[String(u.id)] || [];
        uCards.forEach((c) => {
          expect(c.maskedNumber).toMatch(/^•••• •••• •••• \d{4}$/);
          // CVV must not exist in DatasetCard interface
          expect((c as any).cvv).toBeUndefined();
        });
      });
    });
  });
});

