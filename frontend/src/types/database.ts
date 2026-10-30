export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AccountType = 'savings' | 'current' | 'credit' | 'cash' | 'investment';
export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'reconciled';
export type BillStatus = 'pending' | 'due' | 'overdue' | 'paid';
export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type HoldingAssetType = 'equity' | 'etf' | 'mutual_fund' | 'bond' | 'crypto';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          currency: string;
          persona: string;
          financial_literacy: string;
          dashboard_complexity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          persona?: string;
          financial_literacy?: string;
          dashboard_complexity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          persona?: string;
          financial_literacy?: string;
          dashboard_complexity?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          number_format: string;
          month_start_day: number;
          budget_warning_threshold: number;
          notification_rules: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          number_format?: string;
          month_start_day?: number;
          budget_warning_threshold?: number;
          notification_rules?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: string;
          number_format?: string;
          month_start_day?: number;
          budget_warning_threshold?: number;
          notification_rules?: Json;
          updated_at?: string;
        };
      };
      financial_accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_type: AccountType;
          institution_name: string;
          account_number_mask: string | null;
          opening_balance_minor: number;
          currency: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          account_type: AccountType;
          institution_name: string;
          account_number_mask?: string | null;
          opening_balance_minor?: number;
          currency?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_type?: AccountType;
          institution_name?: string;
          account_number_mask?: string | null;
          opening_balance_minor?: number;
          currency?: string;
          is_archived?: boolean;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          budget_minor: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          color?: string;
          budget_minor?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          budget_minor?: number | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          target_account_id: string | null;
          amount_minor: number;
          type: TransactionType;
          category: string;
          merchant: string;
          date: string;
          status: TransactionStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          target_account_id?: string | null;
          amount_minor: number;
          type: TransactionType;
          category: string;
          merchant: string;
          date: string;
          status?: TransactionStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          target_account_id?: string | null;
          amount_minor?: number;
          type?: TransactionType;
          category?: string;
          merchant?: string;
          date?: string;
          status?: TransactionStatus;
          notes?: string | null;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          allocated_minor: number;
          period: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          allocated_minor: number;
          period?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          allocated_minor?: number;
          period?: string;
          updated_at?: string;
        };
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_minor: number;
          current_minor: number;
          target_date: string;
          category: string;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_minor: number;
          current_minor?: number;
          target_date: string;
          category?: string;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_minor?: number;
          current_minor?: number;
          target_date?: string;
          category?: string;
          is_completed?: boolean;
          updated_at?: string;
        };
      };
      goal_contributions: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          amount_minor: number;
          date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          amount_minor: number;
          date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          amount_minor?: number;
          date?: string;
          notes?: string | null;
        };
      };
      banking_bills: {
        Row: {
          id: string;
          user_id: string;
          biller_name: string;
          category: string;
          amount_minor: number;
          due_date: string;
          account_id: string | null;
          status: BillStatus;
          auto_pay: boolean;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          biller_name: string;
          category?: string;
          amount_minor: number;
          due_date: string;
          account_id?: string | null;
          status?: BillStatus;
          auto_pay?: boolean;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          biller_name?: string;
          category?: string;
          amount_minor?: number;
          due_date?: string;
          account_id?: string | null;
          status?: BillStatus;
          auto_pay?: boolean;
          paid_at?: string | null;
        };
      };
      investment_holdings: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          name: string;
          exchange: string;
          asset_type: HoldingAssetType;
          quantity: number;
          avg_buy_price_minor: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker: string;
          name: string;
          exchange?: string;
          asset_type?: HoldingAssetType;
          quantity: number;
          avg_buy_price_minor: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ticker?: string;
          name?: string;
          exchange?: string;
          asset_type?: HoldingAssetType;
          quantity?: number;
          avg_buy_price_minor?: number;
          updated_at?: string;
        };
      };
      watchlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_default?: boolean;
        };
      };
      watchlist_items: {
        Row: {
          id: string;
          watchlist_id: string;
          user_id: string;
          ticker: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          watchlist_id: string;
          user_id: string;
          ticker: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          watchlist_id?: string;
          user_id?: string;
          ticker?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          category: string;
          is_read: boolean;
          action_route: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          category?: string;
          is_read?: boolean;
          action_route?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          category?: string;
          is_read?: boolean;
          action_route?: string | null;
        };
      };
      recurring_rules: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          merchant: string;
          category: string;
          amount_minor: number;
          frequency: RecurringFrequency;
          next_date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          merchant: string;
          category: string;
          amount_minor: number;
          frequency: RecurringFrequency;
          next_date: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          merchant?: string;
          category?: string;
          amount_minor?: number;
          frequency?: RecurringFrequency;
          next_date?: string;
          status?: string;
        };
      };
      banking_beneficiaries: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_number_mask: string;
          bank_name: string;
          ifsc: string | null;
          is_favorite: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          account_number_mask: string;
          bank_name: string;
          ifsc?: string | null;
          is_favorite?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_number_mask?: string;
          bank_name?: string;
          ifsc?: string | null;
          is_favorite?: boolean;
        };
      };
    };
    Functions: {
      execute_transfer: {
        Args: {
          p_from_account_id: string;
          p_to_account_id: string;
          p_amount_minor: number;
          p_notes?: string;
        };
        Returns: Json;
      };
      pay_bill: {
        Args: {
          p_bill_id: string;
          p_account_id: string;
        };
        Returns: Json;
      };
    };
  };
}

