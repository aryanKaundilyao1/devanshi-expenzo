import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { FinancialAccount, Transaction } from '@/types/finance';

export const supabaseBankingService = {
  async fetchAccounts(): Promise<FinancialAccount[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      institution: row.institution_name,
      accountType: (row.account_type === 'current' ? 'checking' : row.account_type === 'cash' ? 'wallet' : row.account_type) as any,
      accountNumberMasked: row.account_number_mask || '••••',
      openingBalanceMinor: Number(row.opening_balance_minor),
      currency: row.currency || 'INR',
      isDemo: false,
      lastUpdated: row.updated_at,
      isArchived: row.is_archived,
    }));
  },

  async createAccount(acc: Omit<FinancialAccount, 'id' | 'lastUpdated'>): Promise<FinancialAccount> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('User not authenticated');

    const dbAccountType = acc.accountType === 'checking' ? 'current' : acc.accountType === 'wallet' ? 'cash' : acc.accountType;

    const { data, error } = await supabase
      .from('financial_accounts')
      .insert({
        user_id: userData.user.id,
        name: acc.name,
        account_type: dbAccountType,
        institution_name: acc.institution,
        account_number_mask: acc.accountNumberMasked,
        opening_balance_minor: Math.round(acc.openingBalanceMinor),
        currency: acc.currency || 'INR',
      } as any)
      .select('*')
      .single();

    if (error) throw error;
    const row = data as any;
    return {
      id: row.id,
      name: row.name,
      institution: row.institution_name,
      accountType: acc.accountType,
      accountNumberMasked: row.account_number_mask || '••••',
      openingBalanceMinor: Number(row.opening_balance_minor),
      currency: row.currency || 'INR',
      isDemo: false,
      lastUpdated: row.updated_at,
      isArchived: row.is_archived,
    };
  },

  async archiveAccount(accountId: string): Promise<boolean> {
    const { error } = await supabase
      .from('financial_accounts')
      .update({ is_archived: true } as any)
      .eq('id', accountId);

    if (error) throw error;
    return true;
  },
};

