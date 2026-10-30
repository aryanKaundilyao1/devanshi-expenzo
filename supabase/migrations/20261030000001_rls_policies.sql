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

