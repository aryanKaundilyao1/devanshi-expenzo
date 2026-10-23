import { create } from 'zustand';
import { UserPersona } from '@/types/finance';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  searchDialogOpen: boolean;
  activePersona: UserPersona;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setSearchDialogOpen: (open: boolean) => void;
  setActivePersona: (persona: UserPersona) => void;
}

const UI_STORAGE_KEY = 'expenzo-ui-prefs:v1';

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(`${UI_STORAGE_KEY}:theme`) as ThemeMode;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
  } catch {}
  return 'dark'; // Dark theme default for fintech aesthetic
}

function getStoredSidebar(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(`${UI_STORAGE_KEY}:sidebar`);
    return stored === 'true';
  } catch {}
  return false;
}

export const useUIStore = create<UIState>((set) => ({
  theme: getStoredTheme(),
  sidebarCollapsed: getStoredSidebar(),
  mobileNavOpen: false,
  searchDialogOpen: false,
  activePersona: 'professional',

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${UI_STORAGE_KEY}:theme`, theme);
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const next: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${UI_STORAGE_KEY}:theme`, next);
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { theme: next };
    });
  },

  toggleSidebar: () => {
    set((state) => {
      const next = !state.sidebarCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${UI_STORAGE_KEY}:sidebar`, String(next));
      }
      return { sidebarCollapsed: next };
    });
  },

  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${UI_STORAGE_KEY}:sidebar`, String(collapsed));
    }
    set({ sidebarCollapsed: collapsed });
  },

  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setSearchDialogOpen: (open) => set({ searchDialogOpen: open }),
  setActivePersona: (persona) => set({ activePersona: persona }),
}));

