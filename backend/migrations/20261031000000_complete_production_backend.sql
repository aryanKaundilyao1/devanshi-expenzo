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
