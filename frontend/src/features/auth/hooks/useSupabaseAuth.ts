import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { UserProfile } from '@/types/finance';

export function useSupabaseAuth() {
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const loadUserProfileAndSync = async (sessionUser: any) => {
      const email = sessionUser.email || '';
      const fallbackName = sessionUser.user_metadata?.full_name || email.split('@')[0];

      let profileRow: any = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .maybeSingle();
        profileRow = data;
      } catch (err) {
        console.warn('[useSupabaseAuth] profile fetch error:', err);
      }

      const profile: UserProfile = {
        id: sessionUser.id,
        name: profileRow?.full_name || fallbackName,
        email,
        persona: (profileRow?.persona as any) || 'professional',
        currency: (profileRow?.currency as any) || 'INR',
        monthlyBudgetLimitMinor: 3000000,
        createdAt: profileRow?.created_at || sessionUser.created_at,
      };

      useAuthStore.setState({
        isAuthenticated: true,
        user: profile,
      });

      // Synchronize financial data for this user
      useFinanceStore.getState().syncWithBackend();
    };

    // Check active session on initial load
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('[useSupabaseAuth] getSession error:', error);
      }
      if (session?.user) {
        loadUserProfileAndSync(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen to real-time auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        loadUserProfileAndSync(session.user);
      } else if (event === 'SIGNED_OUT') {
        useFinanceStore.getState().clearWorkspace();
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [logout]);

  return { loading, isAuthenticated, user };
}

