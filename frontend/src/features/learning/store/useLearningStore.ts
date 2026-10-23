import { create } from 'zustand';

interface LearningState {
  activePersona: string;
  bookmarkedSlugs: string[];
  completedSlugs: string[];
  quizScores: Record<string, { score: number; total: number; passed: boolean; completedAt: string }>;

  // Actions
  toggleBookmark: (slug: string) => void;
  toggleComplete: (slug: string) => void;
  recordQuizScore: (slug: string, score: number, total: number) => void;
  resetQuizScore: (slug: string) => void;
  setPersona: (persona: string) => void;
}

const STORAGE_PREFIX = 'expenzo-learning:v1:';

function getStorageKey(persona: string) {
  return `${STORAGE_PREFIX}${persona}`;
}

function loadState(persona: string) {
  if (typeof window === 'undefined') {
    return { bookmarkedSlugs: [], completedSlugs: [], quizScores: {} };
  }
  try {
    const raw = localStorage.getItem(getStorageKey(persona));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        bookmarkedSlugs: parsed.bookmarkedSlugs || [],
        completedSlugs: parsed.completedSlugs || [],
        quizScores: parsed.quizScores || {},
      };
    }
  } catch (e) {
    console.warn('Could not load learning state', e);
  }
  return { bookmarkedSlugs: [], completedSlugs: [], quizScores: {} };
}

function persistState(persona: string, state: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      getStorageKey(persona),
      JSON.stringify({
        bookmarkedSlugs: state.bookmarkedSlugs,
        completedSlugs: state.completedSlugs,
        quizScores: state.quizScores,
      })
    );
  } catch (e) {
    console.warn('Could not persist learning state', e);
  }
}

export const useLearningStore = create<LearningState>((set, get) => {
  const initialPersona = 'professional';
  const initialData = loadState(initialPersona);

  return {
    activePersona: initialPersona,
    bookmarkedSlugs: initialData.bookmarkedSlugs,
    completedSlugs: initialData.completedSlugs,
    quizScores: initialData.quizScores,

    setPersona: (persona: string) => {
      const data = loadState(persona);
      set({
        activePersona: persona,
        bookmarkedSlugs: data.bookmarkedSlugs,
        completedSlugs: data.completedSlugs,
        quizScores: data.quizScores,
      });
    },

    toggleBookmark: (slug: string) => {
      const { bookmarkedSlugs, activePersona } = get();
      const exists = bookmarkedSlugs.includes(slug);
      const next = exists ? bookmarkedSlugs.filter((s) => s !== slug) : [...bookmarkedSlugs, slug];

      set({ bookmarkedSlugs: next });
      persistState(activePersona, { ...get(), bookmarkedSlugs: next });
    },

    toggleComplete: (slug: string) => {
      const { completedSlugs, activePersona } = get();
      const exists = completedSlugs.includes(slug);
      const next = exists ? completedSlugs.filter((s) => s !== slug) : [...completedSlugs, slug];

      set({ completedSlugs: next });
      persistState(activePersona, { ...get(), completedSlugs: next });
    },

    recordQuizScore: (slug: string, score: number, total: number) => {
      const { quizScores, activePersona, completedSlugs } = get();
      const passed = total > 0 && score / total >= 0.7;

      const nextScores = {
        ...quizScores,
        [slug]: {
          score,
          total,
          passed,
          completedAt: new Date().toISOString(),
        },
      };

      // Auto mark completed if passed
      const nextCompleted = passed && !completedSlugs.includes(slug)
        ? [...completedSlugs, slug]
        : completedSlugs;

      set({ quizScores: nextScores, completedSlugs: nextCompleted });
      persistState(activePersona, {
        ...get(),
        quizScores: nextScores,
        completedSlugs: nextCompleted,
      });
    },

    resetQuizScore: (slug: string) => {
      const { quizScores, activePersona } = get();
      const nextScores = { ...quizScores };
      delete nextScores[slug];

      set({ quizScores: nextScores });
      persistState(activePersona, { ...get(), quizScores: nextScores });
    },
  };
});

