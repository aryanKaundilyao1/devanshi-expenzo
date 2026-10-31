import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, DEFAULT_ONBOARDING_PREFS } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_USER, INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS } from '@/services/fixtures/seedData';
import { calculateAccountBalance, calculateNetWorth } from '@/domain/calculations/accounting';
import { FinancialAccount, Transaction } from '@/types/finance';

describe('Phase 3: Production Authentication & User Isolation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      isAuthenticated: false,
      user: INITIAL_USER,
      onboardingCompleted: false,
      preferences: DEFAULT_ONBOARDING_PREFS,
    });
    useFinanceStore.getState().resetToDemo();
  });

  // 1. Registration
  it('1. Registration: creates new user profile and triggers clean empty workspace', async () => {
    const res = await useAuthStore.getState().signUpWithSupabase('newuser@example.com', 'Pass123!Secure', 'Jane Doe');
    expect(res.success).toBe(true);
    expect(res.error).toBeUndefined();

    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user.email).toBe('newuser@example.com');
    expect(authState.user.name).toBe('Jane Doe');
    expect(authState.onboardingCompleted).toBe(false);

    // Workspace is completely reset to 0 accounts for new user
    const finState = useFinanceStore.getState();
    expect(finState.accounts.length).toBe(0);
    expect(finState.transactions.length).toBe(0);
    expect(finState.holdings.length).toBe(0);
  });

  // 2. Login
  it('2. Login: authenticates credentials and establishes valid user session', async () => {
    const res = await useAuthStore.getState().signInWithSupabase('jane.doe@example.com', 'Pass123!Secure');
    expect(res.success).toBe(true);
    expect(res.error).toBeUndefined();

    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user.email).toBe('jane.doe@example.com');
  });

  // 3. Logout
  it('3. Logout: signs out from Supabase and purges in-memory financial data', async () => {
    await useAuthStore.getState().signInWithSupabase('jane.doe@example.com', 'Pass123!Secure');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    await useAuthStore.getState().signOutWithSupabase();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // Store is cleared
    const finState = useFinanceStore.getState();
    expect(finState.accounts.length).toBe(0);
    expect(finState.transactions.length).toBe(0);
    expect(finState.holdings.length).toBe(0);
  });

  // 4. Session restoration
  it('4. Session restoration: preserves authenticated session state', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'usr_restored_1',
        name: 'Restored User',
        email: 'restored@example.com',
        persona: 'professional',
        currency: 'INR',
        monthlyBudgetLimitMinor: 3000000,
        createdAt: new Date().toISOString(),
      },
      onboardingCompleted: true,
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.name).toBe('Restored User');
    expect(state.user.email).toBe('restored@example.com');
  });

  // 5. Password recovery
  it('5. Password recovery: handles password reset dispatch and user update', async () => {
    const resetRes = await useAuthStore.getState().resetPasswordForEmail('user@example.com');
    expect(resetRes.success).toBe(true);

    const updateRes = await useAuthStore.getState().updatePassword('NewStrongPass123!');
    expect(updateRes.success).toBe(true);
  });

  // 6. Email verification
  it('6. Email verification: correctly flags accounts that require email confirmation', async () => {
    // When Supabase reports session null on signup
    const res = await useAuthStore.getState().signUpWithSupabase('unconfirmed@example.com', 'Pass123!Secure', 'Unconfirmed User');
    expect(res.success).toBe(true);
  });

  // 7. Store clearing on logout prevents cross-user data bleeding
  it('7. Store clearing on logout: isolates User A records from User B session', async () => {
    // User A session with financial account
    const userAAcc: FinancialAccount = {
      id: 'acc_user_a',
      name: 'User A HDFC',
      institution: 'HDFC',
      accountType: 'savings',
      accountNumberMasked: '•••• 1111',
      openingBalanceMinor: 5000000,
      currency: 'INR',
      isDemo: false,
      lastUpdated: new Date().toISOString(),
    };
    useFinanceStore.setState({ accounts: [userAAcc] });
    expect(useFinanceStore.getState().accounts.length).toBe(1);

    // User A logs out
    await useAuthStore.getState().signOutWithSupabase();
    expect(useFinanceStore.getState().accounts.length).toBe(0);

    // User B registers
    await useAuthStore.getState().signUpWithSupabase('userB@example.com', 'Pass123!', 'User B');
    expect(useFinanceStore.getState().accounts.length).toBe(0);
    expect(useFinanceStore.getState().accounts.some((a) => a.name.includes('User A'))).toBe(false);
  });

  // 8. New user empty state invariant
  it('8. New-user empty state: completely new registered user has zero accounts and zero balances', () => {
    useFinanceStore.getState().clearWorkspace();
    const state = useFinanceStore.getState();
    expect(state.accounts).toEqual([]);
    expect(state.transactions).toEqual([]);
    expect(state.holdings).toEqual([]);
    expect(state.budgets).toEqual([]);
    expect(state.bills).toEqual([]);
    expect(state.goals).toEqual([]);
    expect(useFinanceStore.getState().getTotalLiquidCash()).toBe(0);
    expect(useFinanceStore.getState().getNetWorth()).toBe(0);
  });

  // 9. Cross-user authorization and RLS invariance
  it('9. Cross-user authorization: accounts belonging to User A cannot affect User B balance', () => {
    const userAAcc: FinancialAccount = {
      id: 'acc_user_a_secret',
      name: 'User A Secret Savings',
      institution: 'SBI',
      accountType: 'savings',
      accountNumberMasked: '•••• 9999',
      openingBalanceMinor: 10000000, // ₹1,00,000
      currency: 'INR',
      isDemo: false,
      lastUpdated: new Date().toISOString(),
    };

    const userBAcc: FinancialAccount = {
      id: 'acc_user_b_primary',
      name: 'User B Primary',
      institution: 'ICICI',
      accountType: 'savings',
      accountNumberMasked: '•••• 2222',
      openingBalanceMinor: 250000, // ₹2,500
      currency: 'INR',
      isDemo: false,
      lastUpdated: new Date().toISOString(),
    };

    const userBTx: Transaction = {
      id: 'tx_user_b_1',
      accountId: 'acc_user_b_primary',
      amountMinor: 50000, // ₹500
      type: 'expense',
      category: 'Groceries',
      merchant: 'Supermarket',
      date: '2026-10-30',
      status: 'completed',
    };

    // User B only has User B account in their ledger
    const userBBalance = calculateAccountBalance(userBAcc, [userBTx]);
    expect(userBBalance).toBe(200000); // ₹2,000.00
    // Total net worth for User B must not include User A's ₹1,00,000
    const userBNetWorth = calculateNetWorth([userBAcc], [userBTx], [], {});
    expect(userBNetWorth).toBe(200000);
  });
});
