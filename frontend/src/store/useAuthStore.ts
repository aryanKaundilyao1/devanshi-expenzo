import { create } from 'zustand';
import { UserPersona, UserProfile } from '@/types/finance';
import { INITIAL_USER } from '@/services/fixtures/seedData';
import { useUIStore } from './useUIStore';
import { useFinanceStore } from './useFinanceStore';

export type FinancialExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type DashboardComplexity = 'simple' | 'standard' | 'advanced';
export type DemoDataMode = 'seeded-demo' | 'empty-demo';

export interface OnboardingPreferences {
  experienceLevel: FinancialExperienceLevel;
  persona: UserPersona;
  goals: string[];
  dashboardComplexity: DashboardComplexity;
  theme: 'light' | 'dark' | 'system';
  currency: 'INR';
  language: 'English';
  demoDataMode: DemoDataMode;
}

interface AuthState {
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  user: UserProfile;
  preferences: OnboardingPreferences;
  rememberSession: boolean;

  // Actions
  loginWithDemo: (persona: UserPersona, name?: string) => string;
  loginSimulated: (email: string) => { success: boolean; message: string };
  registerLocalProfile: (name: string, email: string) => void;
  updateOnboardingPreferences: (prefs: Partial<OnboardingPreferences>) => void;
  completeOnboarding: () => void;
  logout: () => void;
  resetSession: () => void;
}

const AUTH_STORAGE_KEY = 'expenzo-auth-session:v1';

export const DEFAULT_ONBOARDING_PREFS: OnboardingPreferences = {
  experienceLevel: 'intermediate',
  persona: 'professional',
  goals: ['Track expenses', 'Control budgets', 'Monitor investments'],
  dashboardComplexity: 'standard',
  theme: 'dark',
  currency: 'INR',
  language: 'English',
  demoDataMode: 'seeded-demo',
};

const PERSONA_PROFILES: Record<UserPersona, { name: string; budgetMinor: number }> = {
  student: { name: 'Aarav Patel', budgetMinor: 1000000 }, // ₹10,000
  professional: { name: 'Aryan Sharma', budgetMinor: 3000000 }, // ₹30,000
  family: { name: 'The Sharma Family', budgetMinor: 5500000 }, // ₹55,000
  investor: { name: 'Priya Mehta', budgetMinor: 4000000 }, // ₹40,000
  senior: { name: 'Ramesh Verma', budgetMinor: 2500000 }, // ₹25,000
};

function loadStoredAuth(): Partial<AuthState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 'v1' && parsed.data) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn('Could not read auth session from storage', e);
  }
  return null;
}

function persistAuth(state: Partial<AuthState>) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      version: 'v1',
      savedAt: new Date().toISOString(),
      data: {
        isAuthenticated: state.isAuthenticated,
        onboardingCompleted: state.onboardingCompleted,
        user: state.user,
        preferences: state.preferences,
        rememberSession: state.rememberSession,
      },
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Could not persist auth session to storage', e);
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const stored = loadStoredAuth();

  const initialAuthState: AuthState = {
    isAuthenticated: stored?.isAuthenticated ?? false,
    onboardingCompleted: stored?.onboardingCompleted ?? false,
    user: stored?.user ?? INITIAL_USER,
    preferences: stored?.preferences ?? DEFAULT_ONBOARDING_PREFS,
    rememberSession: stored?.rememberSession ?? true,

    loginWithDemo: (persona: UserPersona, customName?: string) => {
      const personaInfo = PERSONA_PROFILES[persona];
      const name = customName || personaInfo.name;

      const updatedUser: UserProfile = {
        ...get().user,
        id: `usr_${persona}_demo`,
        name,
        persona,
        monthlyBudgetLimitMinor: personaInfo.budgetMinor,
      };

      const updatedPrefs: OnboardingPreferences = {
        ...get().preferences,
        persona,
      };

      // Synchronize UI store & Finance store
      useUIStore.getState().setActivePersona(persona);

      const next = {
        isAuthenticated: true,
        // If it's a quick demo session, consider onboarding completed so user immediately enters dashboard
        onboardingCompleted: true,
        user: updatedUser,
        preferences: updatedPrefs,
      };

      set(next);
      persistAuth({ ...get(), ...next });

      return '/app/dashboard';
    },

    loginSimulated: (email: string) => {
      // In prototype mode, log in as currently selected profile or professional
      const user = get().user;
      const next = {
        isAuthenticated: true,
        user: { ...user, email },
        onboardingCompleted: get().onboardingCompleted,
      };
      set(next);
      persistAuth({ ...get(), ...next });

      const target = get().onboardingCompleted ? '/app/dashboard' : '/onboarding';
      return { success: true, message: 'Simulated login successful' };
    },

    registerLocalProfile: (name: string, email: string) => {
      const newUser: UserProfile = {
        id: `usr_local_${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        persona: 'professional',
        currency: 'INR',
        monthlyBudgetLimitMinor: 3000000,
        createdAt: new Date().toISOString(),
      };

      const next = {
        isAuthenticated: true,
        onboardingCompleted: false, // New registration must complete onboarding!
        user: newUser,
        preferences: {
          ...get().preferences,
          persona: 'professional' as UserPersona,
        },
      };

      set(next);
      persistAuth({ ...get(), ...next });
    },

    updateOnboardingPreferences: (prefs) => {
      const nextPrefs = { ...get().preferences, ...prefs };
      const next = { preferences: nextPrefs };
      set(next);
      persistAuth({ ...get(), ...next });
    },

    completeOnboarding: () => {
      const { preferences, user } = get();

      // Sync persona & theme to UI store
      useUIStore.getState().setActivePersona(preferences.persona);
      useUIStore.getState().setTheme(preferences.theme);

      // Handle demo data mode
      if (preferences.demoDataMode === 'empty-demo') {
        // Clear transactions and holdings for empty workspace
        useFinanceStore.setState({
          transactions: [],
          holdings: [],
        });
      }

      // Update user with selected persona
      const personaInfo = PERSONA_PROFILES[preferences.persona];
      const updatedUser: UserProfile = {
        ...user,
        persona: preferences.persona,
        monthlyBudgetLimitMinor: personaInfo.budgetMinor,
      };

      const next = {
        isAuthenticated: true,
        onboardingCompleted: true,
        user: updatedUser,
      };

      set(next);
      persistAuth({ ...get(), ...next });
    },

    logout: () => {
      const next = {
        isAuthenticated: false,
        onboardingCompleted: false,
      };
      set(next);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    },

    resetSession: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      set({
        isAuthenticated: false,
        onboardingCompleted: false,
        user: INITIAL_USER,
        preferences: DEFAULT_ONBOARDING_PREFS,
        rememberSession: true,
      });
    },
  };

  return initialAuthState;
});

