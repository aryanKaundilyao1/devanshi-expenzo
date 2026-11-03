/**
 * EXPENZO — Financial Intelligence & Dataset Types
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

export interface DatasetUser {
  id: number;
  name: string;
  currentAge: number;
  retirementAge: number;
  birthYear: number;
  birthMonth: number;
  gender: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  yearlyIncomeUsd: number;
  yearlyIncomeInrPaise: number;
  monthlyIncomeUsdEstimate: number;
  monthlyIncomeInrPaiseEstimate: number;
  totalDebtUsd: number;
  totalDebtInrPaise: number;
  perCapitaIncomeZipUsd: number;
  ficoScore: number;
  numCreditCards: number;
}

export interface DatasetCard {
  cardIndex: number;
  cardBrand: string;
  cardType: string;
  maskedNumber: string;
  expires: string;
  hasChip: boolean;
  cardsIssued: number;
  creditLimitUsd: number;
  creditLimitInrPaise: number;
  acctOpenDate: string;
  yearPinChanged: string;
  onDarkWeb: boolean;
}

export interface DatasetTransaction {
  id: string;
  userId: number;
  userName: string;
  cardIndex: number;
  cardBrand: string;
  cardType: string;
  cardMasked: string;
  date: string;
  year: number;
  month: number;
  day: number;
  time: string;
  amountUsd: number;
  amountCents: number;
  amountInrPaise: number;
  isRefund: boolean;
  type: 'expense' | 'income';
  category: string;
  mcc: number;
  merchantRawId: string;
  merchant: string;
  city: string;
  state: string;
  zip: string;
  useChip: string;
  errors: string;
  isFraud: boolean;
  status: 'completed' | 'flagged';
  isShared: boolean;
  fingerprint: string;
}

export interface MonthlySpendingItem {
  month: string;
  totalUsd: number;
  totalInrPaise: number;
  txCount: number;
  byCategory: Record<string, number>;
  byUser: Record<string, number>;
}

export interface CategorySpendingItem {
  category: string;
  totalUsd: number;
  totalInrPaise: number;
  percentage: number;
  txCount: number;
  byUser: Record<string, number>;
}

export interface TopMerchantItem {
  id: string;
  name: string;
  category: string;
  totalSpendUsd: number;
  totalSpendInrPaise: number;
  txCount: number;
  avgSpendUsd: number;
  city: string;
  state: string;
}

export interface DailySpendingItem {
  date: string;
  totalUsd: number;
  totalInrPaise: number;
  txCount: number;
}

export interface AnomalyItem {
  period: string;
  actualUsd: number;
  actualInrPaise: number;
  baselineUsd: number;
  excessUsd: number;
  zScore: number;
  severity: 'high' | 'medium';
  primaryDriverCategory: string;
  driverCategoryAmountUsd: number;
  driverCategoryShare: number;
  explanation: string;
}

export interface RecommendationItem {
  id: string;
  type: string;
  title: string;
  category: string;
  detection: string;
  whyItMatters: string;
  recommendedAction: string;
  potentialAnnualSavingsUsd: number;
  potentialAnnualSavingsInr: number;
  potentialLifetimeSavingsUsd: number;
  potentialLifetimeSavingsInr: number;
  confidence: number;
  assumptions: string;
  supportingTransactionsCount: number;
}

export interface MemberRankingItem {
  userId: number;
  name: string;
  age: number;
  ficoScore: number;
  totalDebtUsd: number;
  yearlyIncomeUsd: number;
  monthlyIncomeUsdEstimate: number;
  totalSpendUsd: number;
  avgMonthlySpendUsd: number;
  estMonthlyNetSavingsUsd: number;
  savingsRate: number;
  discretionarySpendingRatio: number;
  totalTransactions: number;
  monthsActive: number;
  categoryBreakdown: Record<string, number>;
}

export interface DatasetProvenance {
  datasetName: string;
  license: string;
  author: string;
  project: string;
  generatedAt: string;
  sourceFiles: { name: string; records: number; sizeBytes: number }[];
  samplingMethod: string;
  currencyRules: {
    nativeCurrency: string;
    displayConversion: string;
    conversionRate: number;
    rateDate: string;
    arithmeticMethod: string;
  };
}

export interface DatasetSummary {
  provenance: DatasetProvenance;
  metrics: {
    totalCohortTransactions: number;
    totalCohortUsers: number;
    totalCohortCards: number;
    dateRange: { start: string; end: string };
    totalSpendingUsd: number;
    totalSpendingInrPaise: number;
    totalSpendingInrRupees: number;
    averageTransactionUsd: number;
    totalDuplicatesIsolated: number;
    totalRefundsCount: number;
    totalFlaggedCount: number;
    totalCategories: number;
    totalMerchants: number;
  };
  benchmarks: {
    streamScanDurationSeconds: number;
    streamThroughputRowsPerSec: number;
    aggregationDurationSeconds: number;
    totalPipelineSeconds: number;
    environment: {
      os: string;
      pythonVersion: string;
      memoryModel: string;
    };
  };
  users: DatasetUser[];
  cards: Record<string, DatasetCard[]>;
  monthlySpending: MonthlySpendingItem[];
  categorySpending: CategorySpendingItem[];
  topMerchants: TopMerchantItem[];
  dailySpendingHeatmap: DailySpendingItem[];
  anomalies: AnomalyItem[];
  recommendations: RecommendationItem[];
  memberRankings: MemberRankingItem[];
}

export type CurrencyMode = 'USD' | 'INR';

export interface TransactionFilterParams {
  search?: string;
  userId?: number | 'all';
  category?: string | 'all';
  merchant?: string;
  dateStart?: string;
  dateEnd?: string;
  minAmount?: number;
  maxAmount?: number;
  type?: 'all' | 'expense' | 'income';
  sortField?: 'date' | 'amountUsd' | 'category' | 'merchant' | 'userName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

