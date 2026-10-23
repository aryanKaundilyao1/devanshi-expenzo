import {
  FinancialAccount,
  Transaction,
  Budget,
  InvestmentHolding,
  StockQuote,
  Watchlist,
  FinancialInsight,
  GeneratedReport,
} from '@/types/finance';

export interface FinanceServiceContract {
  getAccounts(): Promise<FinancialAccount[]>;
  getTransactions(): Promise<Transaction[]>;
  createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction>;
  updateTransaction(tx: Transaction): Promise<Transaction>;
  deleteTransaction(id: string): Promise<boolean>;
  getBudgets(): Promise<Budget[]>;
  upsertBudget(budget: Budget): Promise<Budget>;
}

export interface BankingServiceContract {
  getAccounts(): Promise<FinancialAccount[]>;
  executeDemoTransfer(
    fromAccountId: string,
    toAccountId: string,
    amountMinor: number,
    notes?: string
  ): Promise<{ success: boolean; transaction: Transaction }>;
}

export interface InvestmentServiceContract {
  getQuotes(): Promise<Record<string, StockQuote>>;
  getHoldings(): Promise<InvestmentHolding[]>;
  upsertHolding(holding: InvestmentHolding): Promise<InvestmentHolding>;
  getWatchlists(): Promise<Watchlist[]>;
}

export interface AIServiceContract {
  generateInsights(): Promise<FinancialInsight[]>;
  processPrompt(prompt: string): Promise<{
    intent: string;
    text: string;
    structuredCard?: any;
    actionRoute?: string;
  }>;
}

export interface ReportServiceContract {
  generateReport(period: string): Promise<GeneratedReport>;
  exportTransactionsCSV(transactions: Transaction[]): string;
}

