import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SavingsGoal, BankingBill } from '@/types/finance';

export const apiPlannerService = {
  async fetchGoals(): Promise<SavingsGoal[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.name || 'Savings Goal',
      targetAmountMinor: Number(row.target_minor),
      currentAmountMinor: Number(row.current_minor),
      targetDate: row.target_date,
      category: (row.category as any) || 'emergency',
      monthlyContributionTargetMinor: Math.round(Number(row.target_minor) / 12),
      isPrimary: false,
    }));
  },

  async upsertGoal(goal: SavingsGoal): Promise<SavingsGoal> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('User not authenticated');

    const payload = {
      id: goal.id && !goal.id.startsWith('goal_') ? goal.id : undefined,
      user_id: userData.user.id,
      name: goal.title,
      target_minor: Math.round(goal.targetAmountMinor),
      current_minor: Math.round(goal.currentAmountMinor),
      target_date: goal.targetDate,
      category: goal.category,
      is_completed: goal.currentAmountMinor >= goal.targetAmountMinor,
    };

    const { data, error } = await supabase
      .from('savings_goals')
      .upsert(payload as any)
      .select('*')
      .single();

    if (error) throw error;
    const row = data as any;
    return {
      ...goal,
      id: row.id,
      targetAmountMinor: Number(row.target_minor),
      currentAmountMinor: Number(row.current_minor),
    };
  },

  async recordGoalContribution(goalId: string, amountMinor: number, notes?: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('User not authenticated');

    const { error: contribError } = await supabase.from('goal_contributions').insert({
      goal_id: goalId,
      user_id: userData.user.id,
      amount_minor: Math.round(amountMinor),
      date: new Date().toISOString().split('T')[0],
      notes: notes || null,
    } as any);

    if (contribError) throw contribError;

    // Fetch current goal and increment
    const { data: goalData, error: fetchError } = await supabase
      .from('savings_goals')
      .select('current_minor, target_minor')
      .eq('id', goalId)
      .single();

    if (fetchError) throw fetchError;
    const current = Number(goalData.current_minor) + Math.round(amountMinor);
    const isCompleted = current >= Number(goalData.target_minor);

    const { error: updateError } = await supabase
      .from('savings_goals')
      .update({ current_minor: current, is_completed: isCompleted } as any)
      .eq('id', goalId);

    if (updateError) throw updateError;
    return true;
  },

  async fetchBills(): Promise<BankingBill[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('banking_bills')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.biller_name,
      billerName: row.biller_name,
      category: row.category,
      amountMinor: Number(row.amount_minor),
      dueDate: row.due_date,
      status: (row.status === 'due' ? 'due_today' : row.status === 'pending' ? 'upcoming' : row.status) as any,
      isAutoDebit: row.auto_pay,
      accountId: row.account_id || 'acct_hdfc_primary',
      paidAt: row.paid_at || undefined,
    }));
  },

  async payBill(billId: string, accountId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.rpc('pay_bill', {
      p_bill_id: billId,
      p_account_id: accountId,
    });
    if (error) throw error;
    return true;
  },
};
