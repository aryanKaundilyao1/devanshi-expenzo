import {
  FinanceServiceContract,
  BankingServiceContract,
  InvestmentServiceContract,
  AIServiceContract,
  ReportServiceContract,
} from '@/services/contracts/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Transaction } from '@/types/finance';
import { formatINR } from '@/domain/calculations/money';
import { isGeminiConfigured, callGeminiFlash } from '@/features/ai/services/geminiService';

export const mockFinanceService: FinanceServiceContract = {
  async getAccounts() {
    return useFinanceStore.getState().accounts;
  },

  async getTransactions() {
    return useFinanceStore.getState().transactions;
  },

  async createTransaction(txData) {
    return useFinanceStore.getState().addTransaction(txData);
  },

  async updateTransaction(tx) {
    useFinanceStore.getState().updateTransaction(tx);
    return tx;
  },

  async deleteTransaction(id) {
    useFinanceStore.getState().deleteTransaction(id);
    return true;
  },

  async getBudgets() {
    return useFinanceStore.getState().budgets;
  },

  async upsertBudget(budget) {
    useFinanceStore.getState().upsertBudget(budget);
    return budget;
  },
};

export const mockBankingService: BankingServiceContract = {
  async getAccounts() {
    return useFinanceStore.getState().accounts;
  },

  async executeDemoTransfer(fromAccountId, toAccountId, amountMinor, notes) {
    const store = useFinanceStore.getState();
    const fromAcc = store.accounts.find((a) => a.id === fromAccountId);
    const toAcc = store.accounts.find((a) => a.id === toAccountId);

    if (!fromAcc || !toAcc) {
      throw new Error('Invalid account IDs for transfer.');
    }

    const currentBalance = store.getAccountBalance(fromAccountId);
    if (fromAcc.accountType !== 'credit' && currentBalance < amountMinor) {
      throw new Error(`Insufficient funds in ${fromAcc.name}. Available: ${formatINR(currentBalance)}`);
    }

    const tx: Omit<Transaction, 'id'> = {
      accountId: fromAccountId,
      targetAccountId: toAccountId,
      amountMinor,
      type: 'transfer',
      category: 'Transfer',
      merchant: `Transfer to ${toAcc.name}`,
      date: store.demoAsOf,
      status: 'completed',
      notes: notes || `Demo transfer from ${fromAcc.name} to ${toAcc.name}`,
    };

    const createdTx = store.addTransaction(tx);
    return { success: true, transaction: createdTx };
  },
};

export const mockInvestmentService: InvestmentServiceContract = {
  async getQuotes() {
    return useFinanceStore.getState().quotes;
  },

  async getHoldings() {
    return useFinanceStore.getState().holdings;
  },

  async upsertHolding(holding) {
    useFinanceStore.getState().updateHolding(holding);
    return holding;
  },

  async getWatchlists() {
    return useFinanceStore.getState().watchlists;
  },
};

export const mockAIService: AIServiceContract = {
  async generateInsights() {
    return useFinanceStore.getState().insights;
  },

  async processPrompt(prompt: string) {
    const store = useFinanceStore.getState();

    // 1. If Gemini Free AI is configured, query Gemini Flash
    if (isGeminiConfigured()) {
      try {
        const geminiRes = await callGeminiFlash(prompt, store);
        return {
          intent: geminiRes.intent || 'gemini_flash',
          text: geminiRes.text,
          structuredCard: geminiRes.card,
        };
      } catch (err) {
        console.warn('[mockAIService] Gemini Flash call failed, falling back:', err);
      }
    }

    const lower = prompt.toLowerCase();

    if (lower.includes('spend') || lower.includes('spent') || lower.includes('expense')) {
      const spent = store.getPeriodExpenses();
      return {
        intent: 'query_expenses',
        text: `You have spent a total of ${formatINR(spent)} so far in October 2026. Your top expense category is Housing & Rent.`,
        actionRoute: '/app/expenses',
        structuredCard: {
          type: 'metric',
          label: 'Total October Spending',
          value: formatINR(spent),
        },
      };
    }

    if (lower.includes('income') || lower.includes('salary') || lower.includes('earn')) {
      const income = store.getPeriodIncome();
      return {
        intent: 'query_income',
        text: `Your recorded income for this period is ${formatINR(income)}, primarily from your October Salary credit.`,
        actionRoute: '/app/transactions?type=income',
        structuredCard: {
          type: 'metric',
          label: 'Total October Income',
          value: formatINR(income),
        },
      };
    }

    if (lower.includes('balance') || lower.includes('cash') || lower.includes('worth')) {
      const liquid = store.getTotalLiquidCash();
      const net = store.getNetWorth();
      return {
        intent: 'query_networth',
        text: `Your total liquid cash across all accounts is ${formatINR(liquid)}. Your overall net worth including investments is ${formatINR(net)}.`,
        actionRoute: '/app/dashboard',
        structuredCard: {
          type: 'metric',
          label: 'Total Net Worth',
          value: formatINR(net),
        },
      };
    }

    if (lower.includes('portfolio') || lower.includes('stock') || lower.includes('invest')) {
      const portVal = store.getPortfolioValue();
      const invested = store.getTotalInvested();
      const gain = portVal - invested;
      return {
        intent: 'query_portfolio',
        text: `Your investment portfolio is valued at ${formatINR(portVal)} against an invested cost of ${formatINR(invested)}, with an unrealized gain of ${formatINR(gain)}.`,
        actionRoute: '/app/investments',
        structuredCard: {
          type: 'metric',
          label: 'Portfolio Valuation',
          value: formatINR(portVal),
        },
      };
    }

    // Default fallback (honest, transparent AI behavior)
    return {
      intent: 'general_query',
      text: `I analyzed your demonstration financial records for as of October 15, 2026. You can ask me about your spending, income, budget status, or portfolio valuation.`,
      actionRoute: '/app/dashboard',
    };
  },
};

export const mockReportService: ReportServiceContract = {
  async generateReport(period: string) {
    const store = useFinanceStore.getState();
    const income = store.getPeriodIncome();
    const expenses = store.getPeriodExpenses();
    const savings = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return {
      id: `rep_${Date.now()}`,
      title: `Financial Health Report (${period})`,
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        incomeMinor: income,
        expensesMinor: expenses,
        savingsRatePercent: Math.round(savings * 10) / 10,
      },
    };
  },

  exportTransactionsCSV(transactions: Transaction[]) {
    const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Merchant', 'Amount (INR)', 'Account ID', 'Status'];
    const rows = transactions.map((tx) => [
      tx.id,
      tx.date,
      tx.type,
      `"${tx.category}"`,
      `"${tx.merchant}"`,
      (tx.amountMinor / 100).toFixed(2),
      tx.accountId,
      tx.status,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};

