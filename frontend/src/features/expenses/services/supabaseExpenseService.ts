import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Transaction } from '@/types/finance';

export const supabaseExpenseService = {
  async fetchTransactions(): Promise<Transaction[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      accountId: row.account_id,
      targetAccountId: row.target_account_id || undefined,
      amountMinor: Number(row.amount_minor),
      type: row.type,
      category: row.category,
      merchant: row.merchant,
      date: row.date,
      status: row.status,
      notes: row.notes || undefined,
    }));
  },

  async addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userData.user.id,
        account_id: tx.accountId,
        target_account_id: tx.targetAccountId || null,
        amount_minor: Math.round(tx.amountMinor),
        type: tx.type,
        category: tx.category,
        merchant: tx.merchant,
        date: tx.date,
        status: tx.status || 'completed',
        notes: tx.notes || null,
      } as any)
      .select('*')
      .single();

    if (error) throw error;
    const row = data as any;
    return {
      id: row.id,
      accountId: row.account_id,
      targetAccountId: row.target_account_id || undefined,
      amountMinor: Number(row.amount_minor),
      type: row.type,
      category: row.category,
      merchant: row.merchant,
      date: row.date,
      status: row.status,
      notes: row.notes || undefined,
    };
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

