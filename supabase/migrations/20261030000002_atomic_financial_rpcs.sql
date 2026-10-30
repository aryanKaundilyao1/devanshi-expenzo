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

