/**
 * EXPENZO — Financial Intelligence & Dataset Service
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import datasetSummaryRaw from '@/data/dataset/datasetSummary.json';
import sampleTransactionsRaw from '@/data/dataset/sampleTransactions.json';
import {
  DatasetSummary,
  DatasetTransaction,
  TransactionFilterParams,
  CurrencyMode,
} from '../types';

export const USD_TO_INR_RATE = 83.0; // 1 USD = ₹83.00

class DatasetService {
  private summary: DatasetSummary = datasetSummaryRaw as DatasetSummary;
  private transactions: DatasetTransaction[] = sampleTransactionsRaw as DatasetTransaction[];

  /**
   * Returns precomputed summary aggregates, metrics, anomalies, and benchmarks.
   */
  public getDatasetSummary(): DatasetSummary {
    return this.summary;
  }

  /**
   * Returns cached transactions or fetches from public static path if needed.
   */
  public async getTransactions(): Promise<DatasetTransaction[]> {
    if (this.transactions && this.transactions.length > 0) {
      return this.transactions;
    }
    try {
      const res = await fetch('/data/sampleTransactions.json');
      if (res.ok) {
        this.transactions = await res.json();
      }
    } catch (err) {
      console.warn('[DatasetService] Failed to fetch external sampleTransactions.json, using bundled sample:', err);
    }
    return this.transactions;
  }

  /**
   * In-memory query engine supporting searching, multi-criteria filtering, sorting, and pagination.
   */
  public queryTransactions(params: TransactionFilterParams = {}): {
    items: DatasetTransaction[];
    total: number;
    totalSpendUsd: number;
    totalSpendInrPaise: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const {
      search = '',
      userId = 'all',
      category = 'all',
      merchant = '',
      dateStart,
      dateEnd,
      minAmount,
      maxAmount,
      type = 'all',
      sortField = 'date',
      sortOrder = 'desc',
      page = 1,
      pageSize = 25,
    } = params;

    let filtered = [...this.transactions];

    // Filter by search string
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.merchant.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          tx.userName.toLowerCase().includes(q) ||
          tx.cardMasked.toLowerCase().includes(q) ||
          tx.city.toLowerCase().includes(q) ||
          tx.date.includes(q)
      );
    }

    // Filter by User
    if (userId !== 'all' && userId !== undefined) {
      filtered = filtered.filter((tx) => tx.userId === Number(userId));
    }

    // Filter by Category
    if (category !== 'all' && category !== undefined) {
      filtered = filtered.filter((tx) => tx.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Merchant
    if (merchant.trim()) {
      const m = merchant.trim().toLowerCase();
      filtered = filtered.filter((tx) => tx.merchant.toLowerCase().includes(m));
    }

    // Filter by Date Range
    if (dateStart) {
      filtered = filtered.filter((tx) => tx.date >= dateStart);
    }
    if (dateEnd) {
      filtered = filtered.filter((tx) => tx.date <= dateEnd);
    }

    // Filter by Amount Range (USD)
    if (minAmount !== undefined && !isNaN(minAmount)) {
      filtered = filtered.filter((tx) => tx.amountUsd >= minAmount);
    }
    if (maxAmount !== undefined && !isNaN(maxAmount)) {
      filtered = filtered.filter((tx) => tx.amountUsd <= maxAmount);
    }

    // Filter by Type
    if (type !== 'all') {
      filtered = filtered.filter((tx) => tx.type === type);
    }

    // Compute Totals of filtered set
    let totalSpendUsd = 0;
    let totalSpendInrPaise = 0;
    for (const tx of filtered) {
      if (tx.type === 'expense') {
        totalSpendUsd += tx.amountUsd;
        totalSpendInrPaise += tx.amountInrPaise;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'amountUsd':
          comparison = a.amountUsd - b.amountUsd;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'merchant':
          comparison = a.merchant.localeCompare(b.merchant);
          break;
        case 'userName':
          comparison = a.userName.localeCompare(b.userName);
          break;
        default:
          comparison = a.date.localeCompare(b.date);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const validPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (validPage - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total,
      totalSpendUsd: Math.round(totalSpendUsd * 100) / 100,
      totalSpendInrPaise,
      page: validPage,
      pageSize,
      totalPages,
    };
  }

  /**
   * Formats a monetary amount into USD or INR based on active mode.
   */
  public formatCurrency(amountUsd: number, mode: CurrencyMode = 'USD', compact: boolean = false): string {
    if (mode === 'INR') {
      const inrRupees = amountUsd * USD_TO_INR_RATE;
      if (compact) {
        if (inrRupees >= 10000000) return `₹${(inrRupees / 10000000).toFixed(2)} Cr`;
        if (inrRupees >= 100000) return `₹${(inrRupees / 100000).toFixed(2)} L`;
        if (inrRupees >= 1000) return `₹${(inrRupees / 1000).toFixed(1)}k`;
      }
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(inrRupees);
    }

    // Default USD
    if (compact) {
      if (amountUsd >= 1000000) return `$${(amountUsd / 1000000).toFixed(2)}M`;
      if (amountUsd >= 1000) return `$${(amountUsd / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amountUsd);
  }

  /**
   * Exports filtered transactions to a downloadable CSV file.
   */
  public exportTransactionsCsv(transactions: DatasetTransaction[], currencyMode: CurrencyMode = 'USD'): void {
    const headers = [
      'Transaction ID',
      'Date',
      'User',
      'Merchant',
      'Category',
      `Amount (${currencyMode})`,
      'Type',
      'Card Reference',
      'Card Type',
      'City',
      'State',
      'Chip Status',
      'Transaction Status',
    ];

    const rows = transactions.map((tx) => [
      tx.id,
      tx.date,
      `"${tx.userName}"`,
      `"${tx.merchant.replace(/"/g, '""')}"`,
      tx.category,
      currencyMode === 'INR' ? (tx.amountInrPaise / 100).toFixed(2) : tx.amountUsd.toFixed(2),
      tx.type,
      `"${tx.cardBrand} ${tx.cardMasked}"`,
      tx.cardType,
      `"${tx.city}"`,
      tx.state,
      tx.useChip,
      tx.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenzo_dataset_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Calculates counterfactual optimization scenarios with user-adjustable target slider.
   */
  public calculateDynamicOptimization(
    targetDiscretionaryReductionPercent: number = 15,
    selectedUser: number | 'all' = 'all'
  ) {
    const summary = this.getDatasetSummary();
    const discretionaryCategories = ['Dining', 'Shopping', 'Entertainment'];

    let baselineTotalUsd = 0;
    let discretionaryTotalUsd = 0;

    summary.categorySpending.forEach((cat) => {
      let catSpend = cat.totalUsd;
      if (selectedUser !== 'all') {
        catSpend = cat.byUser[String(selectedUser)] || 0;
      }
      baselineTotalUsd += catSpend;
      if (discretionaryCategories.includes(cat.category)) {
        discretionaryTotalUsd += catSpend;
      }
    });

    const factor = targetDiscretionaryReductionPercent / 100.0;
    const projectedSavingsUsd = discretionaryTotalUsd * factor;
    const projectedSavingsInr = projectedSavingsUsd * USD_TO_INR_RATE;
    const baselineRoundedUsd = Math.round(baselineTotalUsd);
    const savingsRoundedUsd = Math.round(projectedSavingsUsd);
    const optimizedTotalUsd = baselineRoundedUsd - savingsRoundedUsd;

    const yearsActive = 17.5; // 2002-2020
    const annualizedSavingsUsd = projectedSavingsUsd / yearsActive;
    const annualizedSavingsInr = annualizedSavingsUsd * USD_TO_INR_RATE;
    const monthlySavingsUsd = annualizedSavingsUsd / 12.0;
    const monthlySavingsInr = monthlySavingsUsd * USD_TO_INR_RATE;

    return {
      baselineTotalUsd: baselineRoundedUsd,
      baselineTotalInr: Math.round(baselineTotalUsd * USD_TO_INR_RATE),
      discretionaryTotalUsd: Math.round(discretionaryTotalUsd),
      discretionarySharePercent: baselineTotalUsd > 0 ? (discretionaryTotalUsd / baselineTotalUsd) * 100 : 0,
      reductionPercent: targetDiscretionaryReductionPercent,
      projectedSavingsUsd: savingsRoundedUsd,
      projectedSavingsInr: Math.round(projectedSavingsInr),
      annualizedSavingsUsd: Math.round(annualizedSavingsUsd),
      annualizedSavingsInr: Math.round(annualizedSavingsInr),
      monthlySavingsUsd: Math.round(monthlySavingsUsd),
      monthlySavingsInr: Math.round(monthlySavingsInr),
      optimizedTotalUsd,
      optimizedTotalInr: Math.round(optimizedTotalUsd * USD_TO_INR_RATE),
    };
  }
}

export const datasetService = new DatasetService();
