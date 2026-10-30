import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { NotificationPreferences } from '@/types/finance';

export interface UserPreferencesPayload {
  theme?: 'light' | 'dark' | 'system';
  numberFormat?: 'indian' | 'international';
  monthStartDay?: number;
  budgetWarningThreshold?: number;
  notificationRules?: NotificationPreferences;
}

export const apiSettingsService = {
  async fetchPreferences(): Promise<UserPreferencesPayload | null> {
    if (!isSupabaseConfigured) return null;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (error) {
      console.warn('[apiSettingsService] fetchPreferences error:', error);
      return null;
    }

    const row = data as any;
    return {
      theme: row.theme,
      numberFormat: row.number_format,
      monthStartDay: row.month_start_day,
      budgetWarningThreshold: row.budget_warning_threshold,
      notificationRules: row.notification_rules,
    };
  },

  async updatePreferences(prefs: UserPreferencesPayload): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('User not authenticated');

    const updateData: any = {};
    if (prefs.theme) updateData.theme = prefs.theme;
    if (prefs.numberFormat) updateData.number_format = prefs.numberFormat;
    if (prefs.monthStartDay) updateData.month_start_day = prefs.monthStartDay;
    if (prefs.budgetWarningThreshold) updateData.budget_warning_threshold = prefs.budgetWarningThreshold;
    if (prefs.notificationRules) updateData.notification_rules = prefs.notificationRules;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('user_preferences')
      .update(updateData)
      .eq('user_id', userData.user.id);

    if (error) throw error;
    return true;
  },
};

