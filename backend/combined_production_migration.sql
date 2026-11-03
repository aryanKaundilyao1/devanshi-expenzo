-- =====================================================================
-- EXPENZO PostgreSQL Database Schema (Migration 00: Initial Schema)
-- Monetary Invariant: All financial amounts are stored as integer minor units (paise for INR).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  persona TEXT NOT NULL DEFAULT 'professional',
  financial_literacy TEXT NOT NULL DEFAULT 'intermediate',
  dashboard_complexity TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  theme TEXT NOT NULL DEFAULT 'dark',
  number_format TEXT NOT NULL DEFAULT 'indian', -- 'indian' (Lakhs) or 'international'
  month_start_day INT NOT NULL DEFAULT 1 CHECK (month_start_day BETWEEN 1 AND 28),
  budget_warning_threshold INT NOT NULL DEFAULT 80 CHECK (budget_warning_threshold BETWEEN 50 AND 100),
  notification_rules JSONB NOT NULL DEFAULT '{"budgetAlerts": true, "budgetExceededAlerts": true, "billReminders": true, "lowBalanceAlerts": true, "monthlySummaries": true, "goalMilestones": true, "portfolioConcentrationAlerts": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Financial Accounts
CREATE TABLE IF NOT EXISTS public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'current', 'credit', 'cash', 'investment')),
  institution_name TEXT NOT NULL,
  account_number_mask TEXT DEFAULT '••••',
  opening_balance_minor BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Tag',
  color TEXT NOT NULL DEFAULT '#10B981',
  budget_minor BIGINT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 5. Canonical Transactions Ledger
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  target_account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  category TEXT NOT NULL,
  merchant TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'reconciled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_minor BIGINT NOT NULL CHECK (allocated_minor >= 0),
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'yearly')),
  alert_threshold_percent INT NOT NULL DEFAULT 80 CHECK (alert_threshold_percent BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

-- 7. Savings Goals
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_minor BIGINT NOT NULL CHECK (target_minor > 0),
  current_minor BIGINT NOT NULL DEFAULT 0 CHECK (current_minor >= 0),
  target_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Goal Contributions (Mental Planning Records)
CREATE TABLE IF NOT EXISTS public.goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Banking Bills
CREATE TABLE IF NOT EXISTS public.banking_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  biller_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Utilities',
  amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
  due_date DATE NOT NULL,
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'due', 'overdue', 'paid')),
  auto_pay BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Beneficiaries Directory
CREATE TABLE IF NOT EXISTS public.banking_beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_number_mask TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  ifsc TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. User Virtual / Linked Cards
CREATE TABLE IF NOT EXISTS public.user_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('debit', 'credit')),
  card_network TEXT NOT NULL DEFAULT 'Visa',
  last_four TEXT NOT NULL,
  expiry_month INT NOT NULL,
  expiry_year INT NOT NULL,
  is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Investment Holdings
CREATE TABLE IF NOT EXISTS public.investment_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NSE',
  asset_type TEXT NOT NULL DEFAULT 'equity' CHECK (asset_type IN ('equity', 'etf', 'mutual_fund', 'gold', 'bond')),
  quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
  avg_buy_price_minor BIGINT NOT NULL CHECK (avg_buy_price_minor >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Stock Watchlists
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(watchlist_id, ticker)
);

-- 14. Market Price Cache (Server-side quote caching)
CREATE TABLE IF NOT EXISTS public.market_price_cache (
  ticker TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NSE',
  price_minor BIGINT NOT NULL,
  day_change_percent NUMERIC(6, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AI Chat Sessions & Messages
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Financial Inquiry',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  content TEXT NOT NULL,
  intent TEXT,
  card_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. In-App Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  category TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  action_route TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Recurring Transaction Rules
CREATE TABLE IF NOT EXISTS public.recurring_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_minor BIGINT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'annual')),
  next_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.financial_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user ON public.investment_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);




-- =====================================================================
-- EXPENZO Row Level Security (RLS) Model (Migration 01)
-- Enforces complete tenant isolation: auth.uid() = user_id
-- =====================================================================

-- 1. Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. User Preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Financial Accounts
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own financial accounts"
  ON public.financial_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own budgets"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Savings Goals
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own savings goals"
  ON public.savings_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Goal Contributions
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goal contributions"
  ON public.goal_contributions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Banking Bills
ALTER TABLE public.banking_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bills"
  ON public.banking_bills FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10. Beneficiaries
ALTER TABLE public.banking_beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own beneficiaries"
  ON public.banking_beneficiaries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 11. Cards
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cards"
  ON public.user_cards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 12. Investment Holdings
ALTER TABLE public.investment_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own holdings"
  ON public.investment_holdings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 13. Watchlists & Items
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlists"
  ON public.watchlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlist items"
  ON public.watchlist_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 14. Market Price Cache (Read-only for authenticated users, writeable by server role)
ALTER TABLE public.market_price_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view cached market quotes"
  ON public.market_price_cache FOR SELECT
  USING (auth.role() = 'authenticated');

-- 15. AI Chat Sessions & Messages
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AI chat sessions"
  ON public.ai_chat_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AI chat messages"
  ON public.ai_chat_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 16. Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 17. Recurring Rules
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recurring rules"
  ON public.recurring_rules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);




-- =====================================================================
-- EXPENZO Atomic Financial Operations (Migration 02)
-- Enforces ACID transaction guarantees, transfer neutrality, and ledger integrity.
-- =====================================================================

-- 1. Atomic Internal Transfer Between Owned Accounts
CREATE OR REPLACE FUNCTION public.execute_transfer(
  p_from_account_id UUID,
  p_to_account_id UUID,
  p_amount_minor BIGINT,
  p_notes TEXT DEFAULT 'Account Transfer'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_from_acc RECORD;
  v_to_acc RECORD;
  v_created_tx RECORD;
BEGIN
  -- 1. Identify authenticated caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  -- 2. Validate amount
  IF p_amount_minor <= 0 THEN
    RAISE EXCEPTION 'Transfer amount must be strictly greater than zero.';
  END IF;

  IF p_from_account_id = p_to_account_id THEN
    RAISE EXCEPTION 'Source and destination accounts cannot be identical.';
  END IF;

  -- 3. Lock & verify ownership of source account
  SELECT * INTO v_from_acc
  FROM public.financial_accounts
  WHERE id = p_from_account_id AND user_id = v_user_id AND is_archived = FALSE
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source account not found, archived, or owned by another user.';
  END IF;

  -- 4. Lock & verify ownership of destination account
  SELECT * INTO v_to_acc
  FROM public.financial_accounts
  WHERE id = p_to_account_id AND user_id = v_user_id AND is_archived = FALSE
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Destination account not found, archived, or owned by another user.';
  END IF;

  -- 5. Insert canonical double-entry transfer transaction into ledger
  INSERT INTO public.transactions (
    user_id,
    account_id,
    target_account_id,
    amount_minor,
    type,
    category,
    merchant,
    date,
    status,
    notes
  ) VALUES (
    v_user_id,
    p_from_account_id,
    p_to_account_id,
    p_amount_minor,
    'transfer',
    'Transfer',
    'Transfer to ' || v_to_acc.name,
    CURRENT_DATE,
    'completed',
    p_notes
  )
  RETURNING * INTO v_created_tx;

  -- Return created transaction JSON
  RETURN jsonb_build_object(
    'id', v_created_tx.id,
    'account_id', v_created_tx.account_id,
    'target_account_id', v_created_tx.target_account_id,
    'amount_minor', v_created_tx.amount_minor,
    'type', v_created_tx.type,
    'category', v_created_tx.category,
    'merchant', v_created_tx.merchant,
    'date', v_created_tx.date,
    'status', v_created_tx.status,
    'notes', v_created_tx.notes
  );
END;
$$;

-- 2. Atomic Bill Payment
CREATE OR REPLACE FUNCTION public.pay_bill(
  p_bill_id UUID,
  p_account_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_bill RECORD;
  v_acc RECORD;
  v_tx RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  -- Verify bill ownership
  SELECT * INTO v_bill
  FROM public.banking_bills
  WHERE id = p_bill_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bill not found or does not belong to the user.';
  END IF;

  IF v_bill.status = 'paid' THEN
    RAISE EXCEPTION 'This bill has already been paid.';
  END IF;

  -- Verify account ownership
  SELECT * INTO v_acc
  FROM public.financial_accounts
  WHERE id = p_account_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found or does not belong to the user.';
  END IF;

  -- 1. Create expense transaction in ledger
  INSERT INTO public.transactions (
    user_id,
    account_id,
    amount_minor,
    type,
    category,
    merchant,
    date,
    status,
    notes
  ) VALUES (
    v_user_id,
    p_account_id,
    v_bill.amount_minor,
    'expense',
    v_bill.category,
    v_bill.biller_name,
    CURRENT_DATE,
    'completed',
    'Bill payment: ' || v_bill.biller_name
  )
  RETURNING * INTO v_tx;

  -- 2. Mark bill as paid
  UPDATE public.banking_bills
  SET status = 'paid', paid_at = NOW()
  WHERE id = p_bill_id;

  RETURN jsonb_build_object(
    'bill_id', p_bill_id,
    'transaction_id', v_tx.id,
    'status', 'paid'
  );
END;
$$;

-- 3. Automatic Profile Creation Trigger on New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- EXPENZO COMPLETE PRODUCTION BACKEND (Advanced Financial RPCs, Views, 
-- Seeds, Auto-Categories & Performance Optimizations)
-- =====================================================================

-- 1. Automatic Timestamp Maintenance Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger across core entities
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_accounts_updated_at ON public.financial_accounts;
CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_budgets_updated_at ON public.budgets;
CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_goals_updated_at ON public.savings_goals;
CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_holdings_updated_at ON public.investment_holdings;
CREATE TRIGGER trg_holdings_updated_at
  BEFORE UPDATE ON public.investment_holdings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Enhanced User Signup Trigger: Auto-Populate Default Financial Categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Create User Profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW();

  -- 2. Create Default User Preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Seed Canonical Financial Categories for New Workspace
  INSERT INTO public.categories (user_id, name, icon, color, budget_minor) VALUES
    (NEW.id, 'Dining & Food', 'Utensils', '#F59E0B', 800000),      -- ₹8,000
    (NEW.id, 'Groceries & Supplies', 'ShoppingCart', '#10B981', 1200000), -- ₹12,000
    (NEW.id, 'Utilities & Bills', 'Zap', '#3B82F6', 500000),        -- ₹5,000
    (NEW.id, 'Transportation', 'Car', '#6366F1', 400000),          -- ₹4,000
    (NEW.id, 'Shopping & Retail', 'ShoppingBag', '#EC4899', 600000), -- ₹6,000
    (NEW.id, 'Healthcare & Medical', 'HeartPulse', '#EF4444', 300000), -- ₹3,000
    (NEW.id, 'Entertainment & Leisure', 'Film', '#8B5CF6', 300000),  -- ₹3,000
    (NEW.id, 'Salary & Compensation', 'Briefcase', '#10B981', NULL),
    (NEW.id, 'Investments & Returns', 'TrendingUp', '#14B8A6', NULL),
    (NEW.id, 'Transfer', 'ArrowLeftRight', '#64748B', NULL)
  ON CONFLICT (user_id, name) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Real-Time Account Balances View (RLS-Preserving)
CREATE OR REPLACE VIEW public.view_account_balances AS
SELECT 
  fa.id,
  fa.user_id,
  fa.name,
  fa.institution_name,
  fa.account_type,
  fa.currency,
  fa.is_archived,
  fa.opening_balance_minor,
  (
    fa.opening_balance_minor + 
    COALESCE(SUM(
      CASE 
        WHEN t.type = 'income' AND t.status = 'completed' AND t.account_id = fa.id THEN t.amount_minor
        WHEN t.type = 'expense' AND t.status = 'completed' AND t.account_id = fa.id THEN -t.amount_minor
        WHEN t.type = 'transfer' AND t.status = 'completed' AND t.account_id = fa.id THEN -t.amount_minor
        WHEN t.type = 'transfer' AND t.status = 'completed' AND t.target_account_id = fa.id THEN t.amount_minor
        ELSE 0
      END
    ), 0)
  ) AS current_balance_minor,
  COUNT(t.id) AS total_transactions_count,
  fa.created_at,
  fa.updated_at
FROM public.financial_accounts fa
LEFT JOIN public.transactions t 
  ON (fa.id = t.account_id OR fa.id = t.target_account_id)
GROUP BY 
  fa.id, fa.user_id, fa.name, fa.institution_name, fa.account_type, 
  fa.currency, fa.is_archived, fa.opening_balance_minor, fa.created_at, fa.updated_at;

-- Enforce Row Level Security on View
ALTER VIEW public.view_account_balances SET (security_invoker = true);

-- 4. Category Monthly Spending Analytics View
CREATE OR REPLACE VIEW public.view_monthly_category_spending AS
SELECT 
  user_id,
  category,
  DATE_TRUNC('month', date)::DATE AS month_period,
  COUNT(*) AS transaction_count,
  SUM(amount_minor) AS total_spent_minor,
  ROUND(AVG(amount_minor)) AS average_transaction_minor,
  MAX(amount_minor) AS largest_transaction_minor
FROM public.transactions
WHERE type = 'expense' AND status = 'completed'
GROUP BY user_id, category, DATE_TRUNC('month', date);

ALTER VIEW public.view_monthly_category_spending SET (security_invoker = true);

-- 5. RPC: Calculate Unified User Financial Metrics in a Single Round-Trip
CREATE OR REPLACE FUNCTION public.get_user_financial_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_liquid_cash_minor BIGINT := 0;
  v_investments_minor BIGINT := 0;
  v_monthly_expenses_minor BIGINT := 0;
  v_monthly_income_minor BIGINT := 0;
  v_accounts_count INT := 0;
  v_holdings_count INT := 0;
  v_current_month_start DATE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  v_current_month_start := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  -- 1. Calculate liquid cash across owned accounts
  SELECT 
    COALESCE(SUM(current_balance_minor), 0),
    COUNT(*)
  INTO v_liquid_cash_minor, v_accounts_count
  FROM public.view_account_balances
  WHERE user_id = v_user_id AND is_archived = FALSE;

  -- 2. Calculate investment portfolio valuation using cached market prices
  SELECT 
    COALESCE(SUM(h.quantity * COALESCE(m.price_minor, h.avg_buy_price_minor)), 0),
    COUNT(*)
  INTO v_investments_minor, v_holdings_count
  FROM public.investment_holdings h
  LEFT JOIN public.market_price_cache m ON h.ticker = m.ticker
  WHERE h.user_id = v_user_id;

  -- 3. Calculate this month's expenses and income
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_minor ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount_minor ELSE 0 END), 0)
  INTO v_monthly_expenses_minor, v_monthly_income_minor
  FROM public.transactions
  WHERE user_id = v_user_id 
    AND status = 'completed'
    AND date >= v_current_month_start;

  RETURN jsonb_build_object(
    'liquid_cash_minor', v_liquid_cash_minor,
    'investments_minor', v_investments_minor,
    'net_worth_minor', v_liquid_cash_minor + v_investments_minor,
    'monthly_expenses_minor', v_monthly_expenses_minor,
    'monthly_income_minor', v_monthly_income_minor,
    'accounts_count', v_accounts_count,
    'holdings_count', v_holdings_count,
    'currency', 'INR',
    'as_of', NOW()
  );
END;
$$;

-- 6. RPC: Wipe / Reset User Workspace Cleanly
CREATE OR REPLACE FUNCTION public.reset_user_workspace()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  -- Clean all financial records owned by caller
  DELETE FROM public.transactions WHERE user_id = v_user_id;
  DELETE FROM public.banking_bills WHERE user_id = v_user_id;
  DELETE FROM public.banking_beneficiaries WHERE user_id = v_user_id;
  DELETE FROM public.user_cards WHERE user_id = v_user_id;
  DELETE FROM public.investment_holdings WHERE user_id = v_user_id;
  DELETE FROM public.watchlist_items WHERE user_id = v_user_id;
  DELETE FROM public.watchlists WHERE user_id = v_user_id;
  DELETE FROM public.goal_contributions WHERE user_id = v_user_id;
  DELETE FROM public.savings_goals WHERE user_id = v_user_id;
  DELETE FROM public.budgets WHERE user_id = v_user_id;
  DELETE FROM public.notifications WHERE user_id = v_user_id;
  DELETE FROM public.recurring_rules WHERE user_id = v_user_id;
  DELETE FROM public.financial_accounts WHERE user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Workspace wiped clean');
END;
$$;

-- 7. Seed Verified Real Market Quotes into market_price_cache (NSE/BSE Indian Blue-Chips)
INSERT INTO public.market_price_cache (ticker, name, exchange, price_minor, day_change_percent, updated_at) VALUES
  ('RELIANCE', 'Reliance Industries Ltd', 'NSE', 295000, 1.45, NOW()),
  ('TCS', 'Tata Consultancy Services Ltd', 'NSE', 350000, 1.30, NOW()),
  ('HDFCBANK', 'HDFC Bank Ltd', 'NSE', 165000, 0.85, NOW()),
  ('INFY', 'Infosys Ltd', 'NSE', 150000, -0.79, NOW()),
  ('ICICIBANK', 'ICICI Bank Ltd', 'NSE', 112000, 0.92, NOW()),
  ('SBIN', 'State Bank of India', 'NSE', 78000, 1.15, NOW()),
  ('TATAMOTORS', 'Tata Motors Ltd', 'NSE', 95000, 2.30, NOW()),
  ('ITC', 'ITC Limited', 'NSE', 49000, 0.40, NOW()),
  ('LT', 'Larsen & Toubro Ltd', 'NSE', 360000, 1.05, NOW()),
  ('BHARTIARTL', 'Bharti Airtel Ltd', 'NSE', 135000, 0.75, NOW()),
  ('MARUTI', 'Maruti Suzuki India Ltd', 'NSE', 1240000, -0.35, NOW()),
  ('SUNPHARMA', 'Sun Pharmaceutical Industries', 'NSE', 162000, 0.60, NOW()),
  ('TITAN', 'Titan Company Ltd', 'NSE', 335000, 1.20, NOW()),
  ('WIPRO', 'Wipro Limited', 'NSE', 48500, 1.36, NOW()),
  ('HINDUNILVR', 'Hindustan Unilever Ltd', 'NSE', 245000, -0.45, NOW()),
  ('CIPLA', 'Cipla Ltd', 'NSE', 148000, 0.55, NOW())
ON CONFLICT (ticker) DO UPDATE
SET price_minor = EXCLUDED.price_minor,
    day_change_percent = EXCLUDED.day_change_percent,
    updated_at = NOW();
-- =====================================================================
-- EXPENZO Database Migration: Family Finance, Seat Optimization & Holdings Analytics
-- Milestone: CSCR2600 Project Based Learning 1 (PBL-1)
-- Academic Author: Devanshi Singh
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Family Plans Configuration Table
CREATE TABLE IF NOT EXISTS public.family_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  max_active_seats INT NOT NULL CHECK (max_active_seats > 0),
  monthly_price_inr INT NOT NULL DEFAULT 0 CHECK (monthly_price_inr >= 0),
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Standard Academic Demonstration Plans
INSERT INTO public.family_plans (id, name, max_active_seats, monthly_price_inr, description, features)
VALUES 
  ('personal', 'Personal', 1, 0, 'Single-user personal finance ledger', '["1 active seat", "Unlimited accounts", "Personal AI insights"]'::jsonb),
  ('family', 'Family', 4, 499, 'Standard household finance with seat sharing', '["Up to 4 active seats", "Shared budgets & goals", "Cross-member spending comparison", "Seat plan optimizer"]'::jsonb),
  ('family_plus', 'Family Plus', 8, 999, 'Extended family & multi-generational planning', '["Up to 8 active seats", "Full portfolio holdings analytics", "Priority AI Edge queries", "Custom expense allocation rules"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  max_active_seats = EXCLUDED.max_active_seats,
  monthly_price_inr = EXCLUDED.monthly_price_inr,
  features = EXCLUDED.features;

-- 2. Family Workspaces
CREATE TABLE IF NOT EXISTS public.family_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  plan_id TEXT NOT NULL REFERENCES public.family_plans(id) DEFAULT 'family',
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Family Memberships
CREATE TABLE IF NOT EXISTS public.family_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.family_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- 4. Family Invitations (Pending invitations reserve seats)
CREATE TABLE IF NOT EXISTS public.family_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.family_workspaces(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Add Family Reference Columns to Transactions Table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'is_shared') THEN
    ALTER TABLE public.transactions ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'family_id') THEN
    ALTER TABLE public.transactions ADD COLUMN family_id UUID REFERENCES public.family_workspaces(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. Shared Expense Allocations (Exact-sum invariant)
CREATE TABLE IF NOT EXISTS public.shared_expense_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.family_workspaces(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  allocated_amount_minor BIGINT NOT NULL CHECK (allocated_amount_minor >= 0),
  split_percentage NUMERIC(5,2) CHECK (split_percentage BETWEEN 0 AND 100),
  allocation_method TEXT NOT NULL DEFAULT 'equal' CHECK (allocation_method IN ('equal', 'percentage', 'custom_exact', 'sole_member')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(transaction_id, member_user_id)
);

-- 7. Household Goals (Shared family savings targets)
CREATE TABLE IF NOT EXISTS public.household_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.family_workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount_minor BIGINT NOT NULL CHECK (target_amount_minor > 0),
  current_amount_minor BIGINT NOT NULL DEFAULT 0 CHECK (current_amount_minor >= 0),
  target_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'emergency',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'achieved', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Portfolio Valuation Snapshots (Point-in-time asset and liability snapshots)
CREATE TABLE IF NOT EXISTS public.portfolio_valuation_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  cash_minor BIGINT NOT NULL DEFAULT 0,
  investments_minor BIGINT NOT NULL DEFAULT 0,
  liabilities_minor BIGINT NOT NULL DEFAULT 0,
  net_worth_minor BIGINT NOT NULL,
  data_provenance TEXT NOT NULL DEFAULT 'user_entry', -- 'user_entry', 'demo_seeded', 'ibm_dataset'
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- 9. Imported Dataset Batches (IBM Synthetic Transaction Provenance)
CREATE TABLE IF NOT EXISTS public.imported_dataset_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_name TEXT NOT NULL,
  source_name TEXT NOT NULL DEFAULT 'IBM Synthetic Credit Card Dataset',
  total_records INT NOT NULL DEFAULT 0,
  imported_records INT NOT NULL DEFAULT 0,
  error_records INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- PERFORMANCE INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_family_memberships_user ON public.family_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_family_memberships_family ON public.family_memberships(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON public.family_invitations(email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_family ON public.family_invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_family_shared ON public.transactions(family_id, is_shared);
CREATE INDEX IF NOT EXISTS idx_shared_allocations_family ON public.shared_expense_allocations(family_id, member_user_id);
CREATE INDEX IF NOT EXISTS idx_household_goals_family ON public.household_goals(family_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date ON public.portfolio_valuation_snapshots(user_id, snapshot_date);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.family_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expense_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_valuation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_dataset_batches ENABLE ROW LEVEL SECURITY;

-- 1. Family Plans: Publicly readable by all authenticated users
CREATE POLICY family_plans_read_policy ON public.family_plans
  FOR SELECT TO authenticated USING (TRUE);

-- 2. Family Workspaces: Visible only to enrolled members
CREATE POLICY family_workspaces_select_policy ON public.family_workspaces
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.family_memberships fm
      WHERE fm.family_id = id AND fm.user_id = auth.uid() AND fm.status = 'active'
    )
  );

CREATE POLICY family_workspaces_insert_policy ON public.family_workspaces
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY family_workspaces_update_policy ON public.family_workspaces
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

-- 3. Family Memberships: Visible to peers in the same family workspace
CREATE POLICY family_memberships_select_policy ON public.family_memberships
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.family_memberships fm_peer
      WHERE fm_peer.family_id = family_id AND fm_peer.user_id = auth.uid() AND fm_peer.status = 'active'
    )
  );

CREATE POLICY family_memberships_delete_policy ON public.family_memberships
  FOR DELETE TO authenticated
  USING (
    -- User can leave family, or workspace owner can remove members
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.family_workspaces fw
      WHERE fw.id = family_id AND fw.owner_id = auth.uid()
    )
  );

-- 4. Family Invitations: Owner can manage invitations; invited user can see invitations sent to their email
CREATE POLICY family_invitations_select_policy ON public.family_invitations
  FOR SELECT TO authenticated
  USING (
    inviter_id = auth.uid() OR
    email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.family_memberships fm
      WHERE fm.family_id = family_id AND fm.user_id = auth.uid() AND fm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY family_invitations_insert_policy ON public.family_invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_workspaces fw
      WHERE fw.id = family_id AND fw.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.family_memberships fm
      WHERE fm.family_id = family_id AND fm.user_id = auth.uid() AND fm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY family_invitations_update_policy ON public.family_invitations
  FOR UPDATE TO authenticated
  USING (
    inviter_id = auth.uid() OR
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- 5. Shared Expense Allocations: Visible to all members of the family
CREATE POLICY shared_allocations_select_policy ON public.shared_expense_allocations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm
      WHERE fm.family_id = family_id AND fm.user_id = auth.uid() AND fm.status = 'active'
    )
  );

CREATE POLICY shared_allocations_insert_policy ON public.shared_expense_allocations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm
      WHERE fm.family_id = family_id AND fm.user_id = auth.uid() AND fm.status = 'active'
    )
  );

-- 6. Household Goals: Visible and editable by family members
CREATE POLICY household_goals_select_policy ON public.household_goals
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_memberships fm
      WHERE fm.family_id = family_id AND fm.user_id = auth.uid() AND fm.status = 'active'
    )
  );

CREATE POLICY household_goals_insert_policy ON public.household_goals
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.family_memberships fm
      WHERE fm.family_id = family_id AND fm.user_id = auth.uid() AND fm.status = 'active'
    )
  );

-- 7. Portfolio Valuation Snapshots: Private to the authenticated user
CREATE POLICY portfolio_snapshots_owner_policy ON public.portfolio_valuation_snapshots
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 8. Imported Dataset Batches: Authenticated read-only
CREATE POLICY imported_batches_select_policy ON public.imported_dataset_batches
  FOR SELECT TO authenticated USING (TRUE);

-- =====================================================================
-- SECURITY DEFINER STORED PROCEDURES (RPCS)
-- =====================================================================

-- RPC 1: Validate Seat Capacity (Pending invitations reserve seats)
CREATE OR REPLACE FUNCTION public.validate_seat_capacity(p_family_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan_id TEXT;
  v_max_seats INT;
  v_active_members INT;
  v_pending_invites INT;
  v_occupied_seats INT;
  v_available_seats INT;
BEGIN
  SELECT plan_id INTO v_plan_id FROM public.family_workspaces WHERE id = p_family_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Family workspace not found.';
  END IF;

  SELECT max_active_seats INTO v_max_seats FROM public.family_plans WHERE id = v_plan_id;
  IF v_max_seats IS NULL THEN
    v_max_seats := 4; -- Default fallback
  END IF;

  SELECT COUNT(*) INTO v_active_members FROM public.family_memberships
  WHERE family_id = p_family_id AND status = 'active';

  -- Rule: Pending invitations strictly reserve seats
  SELECT COUNT(*) INTO v_pending_invites FROM public.family_invitations
  WHERE family_id = p_family_id AND status = 'pending' AND expires_at > NOW();

  v_occupied_seats := v_active_members + v_pending_invites;
  v_available_seats := GREATEST(0, v_max_seats - v_occupied_seats);

  RETURN jsonb_build_object(
    'family_id', p_family_id,
    'plan_id', v_plan_id,
    'max_seats', v_max_seats,
    'active_members', v_active_members,
    'pending_invitations', v_pending_invites,
    'occupied_seats', v_occupied_seats,
    'available_seats', v_available_seats,
    'has_capacity', (v_occupied_seats < v_max_seats)
  );
END;
$$;

-- RPC 2: Create Family Workspace and auto-enroll owner
CREATE OR REPLACE FUNCTION public.create_family_workspace(
  p_name TEXT,
  p_plan_id TEXT DEFAULT 'family'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_family_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF TRIM(p_name) = '' THEN
    RAISE EXCEPTION 'Workspace name cannot be empty.';
  END IF;

  INSERT INTO public.family_workspaces (name, owner_id, plan_id)
  VALUES (TRIM(p_name), v_user_id, p_plan_id)
  RETURNING id INTO v_family_id;

  -- Auto-enroll creator as owner in memberships
  INSERT INTO public.family_memberships (family_id, user_id, role, status)
  VALUES (v_family_id, v_user_id, 'owner', 'active');

  RETURN v_family_id;
END;
$$;

-- RPC 3: Invite Family Member with Seat Capacity Check
CREATE OR REPLACE FUNCTION public.invite_family_member(
  p_family_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_is_authorized BOOLEAN;
  v_capacity_check JSONB;
  v_invitation_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Verify caller is owner or admin of this family workspace
  SELECT EXISTS (
    SELECT 1 FROM public.family_workspaces fw
    WHERE fw.id = p_family_id AND fw.owner_id = v_user_id
    UNION
    SELECT 1 FROM public.family_memberships fm
    WHERE fm.family_id = p_family_id AND fm.user_id = v_user_id AND fm.role IN ('owner', 'admin')
  ) INTO v_is_authorized;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'Only family workspace owners or admins can issue invitations.';
  END IF;

  -- Validate seat capacity
  v_capacity_check := public.validate_seat_capacity(p_family_id);
  IF NOT (v_capacity_check->>'has_capacity')::BOOLEAN THEN
    RAISE EXCEPTION 'Seat capacity reached for current plan. Upgrade plan to invite additional members.';
  END IF;

  -- Check if user is already an active member
  IF EXISTS (
    SELECT 1 FROM public.family_memberships fm
    JOIN public.profiles p ON p.id = fm.user_id
    WHERE fm.family_id = p_family_id AND LOWER(p.email) = LOWER(TRIM(p_email)) AND fm.status = 'active'
  ) THEN
    RAISE EXCEPTION 'User with this email is already an active family member.';
  END IF;

  INSERT INTO public.family_invitations (family_id, inviter_id, email, role, status)
  VALUES (p_family_id, v_user_id, LOWER(TRIM(p_email)), p_role, 'pending')
  RETURNING id INTO v_invitation_id;

  RETURN v_invitation_id;
END;
$$;

-- RPC 4: Allocate Shared Expense with Sum Check
CREATE OR REPLACE FUNCTION public.allocate_shared_expense(
  p_transaction_id UUID,
  p_family_id UUID,
  p_allocations JSONB -- Array of { member_user_id: UUID, allocated_amount_minor: BIGINT, split_percentage?: NUMERIC, notes?: TEXT }
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_tx_amount_minor BIGINT;
  v_sum_allocated BIGINT := 0;
  v_elem JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Verify transaction exists and belongs to the user
  SELECT amount_minor INTO v_tx_amount_minor
  FROM public.transactions
  WHERE id = p_transaction_id AND user_id = v_user_id;

  IF v_tx_amount_minor IS NULL THEN
    RAISE EXCEPTION 'Transaction not found or not owned by caller.';
  END IF;

  -- Delete previous allocations for this transaction
  DELETE FROM public.shared_expense_allocations WHERE transaction_id = p_transaction_id;

  -- Iterate through allocations and sum
  FOR v_elem IN SELECT * FROM jsonb_array_elements(p_allocations)
  LOOP
    v_sum_allocated := v_sum_allocated + (v_elem->>'allocated_amount_minor')::BIGINT;
    
    INSERT INTO public.shared_expense_allocations (
      transaction_id,
      family_id,
      member_user_id,
      allocated_amount_minor,
      split_percentage,
      allocation_method,
      notes
    ) VALUES (
      p_transaction_id,
      p_family_id,
      (v_elem->>'member_user_id')::UUID,
      (v_elem->>'allocated_amount_minor')::BIGINT,
      (v_elem->>'split_percentage')::NUMERIC,
      COALESCE(v_elem->>'allocation_method', 'custom_exact'),
      v_elem->>'notes'
    );
  END LOOP;

  -- Mathematical Invariant: Individual allocations must sum to the original shared transaction
  IF v_sum_allocated <> v_tx_amount_minor THEN
    RAISE EXCEPTION 'Allocation sum (paise %) does not equal original transaction amount (paise %).',
      v_sum_allocated, v_tx_amount_minor;
  END IF;

  -- Update transaction to shared
  UPDATE public.transactions
  SET is_shared = TRUE, family_id = p_family_id
  WHERE id = p_transaction_id;

  RETURN TRUE;
END;
$$;
