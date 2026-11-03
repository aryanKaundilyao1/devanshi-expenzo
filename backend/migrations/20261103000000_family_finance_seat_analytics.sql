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
