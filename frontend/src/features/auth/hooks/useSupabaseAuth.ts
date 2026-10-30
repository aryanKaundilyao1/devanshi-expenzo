import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { UserProfile } from '@/types/finance';

export function useSupabaseAuth() {
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check active session on initial load
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('[useSupabaseAuth] getSession error:', error);
      }
      if (session?.user) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.full_name || email.split('@')[0];
        const profile: UserProfile = {
          id: session.user.id,
          name,
          email,
          persona: 'professional',
          currency: 'INR',
          monthlyBudgetLimitMinor: 3000000,
          createdAt: session.user.created_at,
        };

        useAuthStore.setState({
          isAuthenticated: true,
          user: profile,
        });
      }
      setLoading(false);
    });

    // Listen to real-time auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.full_name || email.split('@')[0];
        useAuthStore.setState({
          isAuthenticated: true,
          user: {
            id: session.user.id,
            name,
            email,
            persona: 'professional',
            currency: 'INR',
            monthlyBudgetLimitMinor: 3000000,
            createdAt: session.user.created_at,
          },
        });
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [logout]);

  return { loading, isAuthenticated, user };
}

