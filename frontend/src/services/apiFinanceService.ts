import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useFinanceStore } from '@/store/useFinanceStore';
import { callGeminiFlash, isGeminiConfigured } from '@/features/ai/services/geminiService';
import { processFinancialQuery } from '@/features/ai/intents/intentRegistry';
import {
  FinanceServiceContract,
  BankingServiceContract,
  InvestmentServiceContract,
  AIServiceContract,
  ReportServiceContract,
} from '@/services/contracts/finance';
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

/**
 * Real Supabase implementation of the Finance Service Contract.
 * Connects directly to PostgreSQL tables with Row Level Security (RLS).
 */
export const apiFinanceService: FinanceServiceContract = {
  async getAccounts(): Promise<FinancialAccount[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[apiFinanceService] getAccounts error:', error);
      throw error;
    }

    return ((data as any[]) || []).map((row) => ({
      id: row.id,
      name: row.name,
      institution: row.institution_name,
      accountType: (row.account_type === 'current' ? 'checking' : row.account_type === 'cash' ? 'wallet' : row.account_type) as any,
      accountNumberMasked: row.account_number_mask || '••••',
      openingBalanceMinor: Number(row.opening_balance_minor),
      currency: (row.currency as any) || 'INR',
      isDemo: false,
      lastUpdated: row.updated_at,
      isArchived: row.is_archived,
    }));
  },

  async getTransactions(): Promise<Transaction[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('[apiFinanceService] getTransactions error:', error);
      throw error;
    }

    return ((data as any[]) || []).map((row) => ({
      id: row.id,
      accountId: row.account_id,
      targetAccountId: row.target_account_id || undefined,
      amountMinor: Number(row.amount_minor),
      type: row.type as any,
      category: row.category,
      merchant: row.merchant,
      date: row.date,
      status: row.status as any,
      notes: row.notes || undefined,
    }));
  },

  async createTransaction(txData: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('User not authenticated.');

    const insertPayload = {
      user_id: userData.user.id,
      account_id: txData.accountId,
      target_account_id: txData.targetAccountId || null,
      amount_minor: Math.round(txData.amountMinor),
      type: txData.type,
      category: txData.category,
      merchant: txData.merchant,
      date: txData.date,
      status: txData.status || 'completed',
      notes: txData.notes || null,
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertPayload as any)
      .select('*')
      .single();

    if (error) {
      console.error('[apiFinanceService] createTransaction error:', error);
      throw error;
    }

    const created = data as any;
    return {
      id: created.id,
      accountId: created.account_id,
      targetAccountId: created.target_account_id || undefined,
      amountMinor: Number(created.amount_minor),
      type: created.type as any,
      category: created.category,
      merchant: created.merchant,
      date: created.date,
      status: created.status as any,
      notes: created.notes || undefined,
    };
  },

  async updateTransaction(tx: Transaction): Promise<Transaction> {
    const updatePayload = {
      account_id: tx.accountId,
      target_account_id: tx.targetAccountId || null,
      amount_minor: Math.round(tx.amountMinor),
      type: tx.type,
      category: tx.category,
      merchant: tx.merchant,
      date: tx.date,
      status: tx.status,
      notes: tx.notes || null,
    };

    const { data, error } = await supabase
      .from('transactions')
      .update(updatePayload as any)
      .eq('id', tx.id)
      .select('*')
      .single();

    if (error) {
      console.error('[apiFinanceService] updateTransaction error:', error);
      throw error;
    }

    const updated = data as any;
    return {
      id: updated.id,
      accountId: updated.account_id,
      targetAccountId: updated.target_account_id || undefined,
      amountMinor: Number(updated.amount_minor),
      type: updated.type as any,
      category: updated.category,
      merchant: updated.merchant,
      date: updated.date,
      status: updated.status as any,
      notes: updated.notes || undefined,
    };
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      console.error('[apiFinanceService] deleteTransaction error:', error);
      throw error;
    }
    return true;
  },

  async getBudgets(): Promise<Budget[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('[apiFinanceService] getBudgets error:', error);
      throw error;
    }

    return ((data as any[]) || []).map((row) => ({
      id: row.id,
      category: row.category,
      allocatedMinor: Number(row.allocated_minor),
      period: (row.period as any) || 'monthly',
      alertThresholdPercent: Number(row.alert_threshold_percent) || 80,
    }));
  },

  async upsertBudget(budget: Budget): Promise<Budget> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('User not authenticated.');

    const payload = {
      id: budget.id && !budget.id.startsWith('b_') ? budget.id : undefined,
      user_id: userData.user.id,
      category: budget.category,
      allocated_minor: Math.round(budget.allocatedMinor),
      period: budget.period || 'monthly',
      alert_threshold_percent: budget.alertThresholdPercent || 80,
    };

    const { data, error } = await supabase
      .from('budgets')
      .upsert(payload as any)
      .select('*')
      .single();

    if (error) {
      console.error('[apiFinanceService] upsertBudget error:', error);
      throw error;
    }

    const upserted = data as any;
    return {
      id: upserted.id,
      category: upserted.category,
      allocatedMinor: Number(upserted.allocated_minor),
      period: (upserted.period as any) || 'monthly',
      alertThresholdPercent: Number(upserted.alert_threshold_percent) || 80,
    };
  },
};

/**
 * Real Supabase Banking Service using Atomic PostgreSQL RPC
 */
export const apiBankingService: BankingServiceContract = {
  async getAccounts(): Promise<FinancialAccount[]> {
    return apiFinanceService.getAccounts();
  },

  async executeDemoTransfer(fromAccountId, toAccountId, amountMinor, notes) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    // Call atomic PostgreSQL RPC function
    const { data, error } = await supabase.rpc('execute_transfer', {
      p_from_account_id: fromAccountId,
      p_to_account_id: toAccountId,
      p_amount_minor: Math.round(amountMinor),
      p_notes: notes || 'Account transfer',
    });

    if (error) {
      console.error('[apiBankingService] executeDemoTransfer error:', error);
      throw new Error(error.message || 'Transfer failed in database.');
    }

    const txRow = data as any;
    const createdTx: Transaction = {
      id: txRow.id,
      accountId: txRow.account_id,
      targetAccountId: txRow.target_account_id,
      amountMinor: Number(txRow.amount_minor),
      type: 'transfer',
      category: 'Transfer',
      merchant: txRow.merchant || 'Transfer',
      date: txRow.date || new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: txRow.notes,
    };

    return { success: true, transaction: createdTx };
  },
};

/**
 * Real Supabase Investment Service
 */
export const apiInvestmentService: InvestmentServiceContract = {
  async getQuotes(): Promise<Record<string, StockQuote>> {
    return {};
  },

  async getHoldings(): Promise<InvestmentHolding[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('investment_holdings')
      .select('*')
      .order('ticker', { ascending: true });

    if (error) {
      console.error('[apiInvestmentService] getHoldings error:', error);
      throw error;
    }

    return ((data as any[]) || []).map((row) => ({
      id: row.id,
      ticker: row.ticker,
      companyName: row.name || row.ticker,
      assetClass: (row.asset_type as any) || 'equity',
      quantity: Number(row.quantity),
      averageBuyPriceMinor: Number(row.avg_buy_price_minor),
      purchaseDate: row.created_at,
    }));
  },

  async upsertHolding(holding: InvestmentHolding): Promise<InvestmentHolding> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('User not authenticated.');

    const payload = {
      id: holding.id && !holding.id.startsWith('h_') ? holding.id : undefined,
      user_id: userData.user.id,
      ticker: holding.ticker,
      name: holding.companyName || holding.ticker,
      asset_type: holding.assetClass || 'equity',
      quantity: holding.quantity,
      avg_buy_price_minor: Math.round(holding.averageBuyPriceMinor),
    };

    const { data, error } = await supabase
      .from('investment_holdings')
      .upsert(payload as any)
      .select('*')
      .single();

    if (error) {
      console.error('[apiInvestmentService] upsertHolding error:', error);
      throw error;
    }

    const saved = data as any;
    return {
      ...holding,
      id: saved.id,
    };
  },

  async getWatchlists(): Promise<Watchlist[]> {
    if (!isSupabaseConfigured) return [];
    const { data: lists, error: lError } = await supabase.from('watchlists').select('*');
    if (lError) throw lError;

    const { data: items, error: iError } = await supabase.from('watchlist_items').select('*');
    if (iError) throw iError;

    const listRows = (lists as any[]) || [];
    const itemRows = (items as any[]) || [];

    return listRows.map((list) => {
      const tickers = itemRows
        .filter((it) => it.watchlist_id === list.id)
        .map((it) => it.ticker);
      return {
        id: list.id,
        name: list.name,
        tickers,
      };
    });
  },
};

/**
 * AI Service implementation targeting Supabase Edge Function
 */
export const apiAIService: AIServiceContract = {
  async generateInsights(): Promise<FinancialInsight[]> {
    return [];
  },

  async processPrompt(prompt: string) {
    // 1. If Gemini Free AI is configured (from localStorage or environment variables), call Gemini Flash
    if (isGeminiConfigured()) {
      try {
        const financeState = useFinanceStore.getState();
        const geminiResult = await callGeminiFlash(prompt, financeState);
        return {
          text: geminiResult.text,
          structuredCard: geminiResult.card,
          intent: geminiResult.intent,
        };
      } catch (geminiError) {
        console.warn('[apiAIService] Gemini Flash direct API error, falling back:', geminiError);
      }
    }

    // 2. Try Supabase Edge Function 'ai-assistant' if available
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
          body: { prompt },
        });

        if (!error && data && data.text) {
          return data;
        }
      } catch (edgeError) {
        // Fall through to local intelligent engine
      }
    }

    // 3. Robust client-side financial intelligence engine
    const financeState = useFinanceStore.getState();
    const result = processFinancialQuery(prompt, financeState);
    return {
      text: result.textResponse,
      structuredCard: result.card,
      intent: result.intentId,
    };
  },
};

/**
 * Report Service Contract
 */
export const apiReportService: ReportServiceContract = {
  async generateReport(period: string): Promise<GeneratedReport> {
    const transactions = await apiFinanceService.getTransactions();

    const incomeMinor = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amountMinor, 0);

    const expenseMinor = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amountMinor, 0);

    const netSavingsMinor = incomeMinor - expenseMinor;
    const savingsRatePercent = incomeMinor > 0 ? Math.round((netSavingsMinor / incomeMinor) * 100) : 0;

    return {
      id: `rep_${Date.now()}`,
      title: `Financial Performance Report (${period})`,
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        incomeMinor,
        expensesMinor: expenseMinor,
        savingsRatePercent,
      },
    };
  },

  exportTransactionsCSV(transactions: Transaction[]): string {
    const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount (INR)', 'Status', 'Notes'];
    const rows = transactions.map((t) => {
      const safeNotes = (t.notes || '').replace(/[\r\n]+/g, ' ');
      // Formula injection defense
      const sanitizedMerchant = /^[=+\-@\t\r]/.test(t.merchant) ? `'${t.merchant}` : t.merchant;
      const formattedAmount = (t.amountMinor / 100).toFixed(2);
      return [
        t.date,
        `"${sanitizedMerchant}"`,
        `"${t.category}"`,
        t.type,
        formattedAmount,
        t.status,
        `"${safeNotes}"`,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  },
};
