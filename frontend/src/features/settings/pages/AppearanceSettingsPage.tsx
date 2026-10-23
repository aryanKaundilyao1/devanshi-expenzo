import React, { useState } from 'react';
import { Sun, Moon, Laptop, Check, Eye, Sliders } from 'lucide-react';
import { useUIStore, ThemeMode } from '@/store/useUIStore';

export function AppearanceSettingsPage() {
  const { theme, setTheme } = useUIStore();

  const [density, setDensity] = useState<'comfortable' | 'compact'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('expenzo-pref:density') as any) || 'comfortable';
    }
    return 'comfortable';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('expenzo-pref:reduced-motion') === 'true';
    }
    return false;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('expenzo-pref:high-contrast') === 'true';
    }
    return false;
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('expenzo-pref:density', density);
      localStorage.setItem('expenzo-pref:reduced-motion', String(reducedMotion));
      localStorage.setItem('expenzo-pref:high-contrast', String(highContrast));

      if (reducedMotion) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }

      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {savedFeedback && (
        <div
          className="flex items-center gap-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 p-3.5 text-xs font-semibold"
          role="alert"
        >
          <Check className="h-4 w-4" />
          <span>Appearance preferences applied and saved to your browser session.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Mode Selector */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Color Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select your preferred color scheme. System mode automatically matches your operating system setting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Light Theme */}
            <div
              onClick={() => handleSelectTheme('light')}
              className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                theme === 'light'
                  ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm border border-slate-200 mb-2">
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5">
                Light
                {theme === 'light' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Crisp light interface with high readability in daylight.
              </p>
            </div>

            {/* Dark Theme */}
            <div
              onClick={() => handleSelectTheme('dark')}
              className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                theme === 'dark'
                  ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1220] text-white shadow-sm border border-slate-800 mb-2">
                <Moon className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5">
                Dark
                {theme === 'dark' && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Fintech slate-950 dark aesthetic engineered for eye comfort.
              </p>
            </div>

            {/* System Theme */}
            <div
              onClick={() => handleSelectTheme('system')}
              className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                theme === 'system'
                  ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 mb-2">
                <Laptop className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5">
                System Sync
                {theme === 'system' && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Syncs dynamically with your OS light/dark schedule.
              </p>
            </div>
          </div>
        </div>

        {/* Display Density & Accessibility */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-600" />
            Display Density & Readability
          </h3>

          <div className="space-y-4">
            {/* Density radio */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Dashboard Spacing Density
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Adjust data row heights and table padding across the ledger and transaction feeds.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDensity('comfortable')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    density === 'comfortable'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => setDensity('compact')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    density === 'compact'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Reduced motion toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Reduced Motion
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Minimize card hover animations, slide-overs, and chart transitions.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* High contrast toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  Enhanced Text Contrast
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Increase border strength and font boldness across financial tables and labels.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Check className="h-4 w-4" />
            Apply & Save Appearance
          </button>
        </div>
      </form>
    </div>
  );
}

