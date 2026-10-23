import React, { useState } from 'react';
import { User, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useAuthStore, FinancialExperienceLevel, DashboardComplexity } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useUIStore } from '@/store/useUIStore';
import { UserPersona } from '@/types/finance';

const PERSONAS: { id: UserPersona; name: string; role: string; desc: string }[] = [
  {
    id: 'student',
    name: 'Aarav Patel',
    role: 'College Student',
    desc: 'Focus on minimal living expenses, pocket-money budgets, and entry-level savings.',
  },
  {
    id: 'professional',
    name: 'Aryan Sharma',
    role: 'Salaried Tech Professional',
    desc: 'Regular corporate salary, active equity investments, monthly SIPs, and tax planning.',
  },
  {
    id: 'family',
    name: 'The Sharma Family',
    role: 'Family Budgeteer',
    desc: 'Multiple household accounts, grocery budgets, school fees, and long-term goal planning.',
  },
  {
    id: 'investor',
    name: 'Priya Mehta',
    role: 'Active Market Investor',
    desc: 'High net-worth allocation, multi-sector stock holdings, and performance analytics.',
  },
  {
    id: 'senior',
    name: 'Ramesh Verma',
    role: 'Retired Senior Citizen',
    desc: 'Fixed deposit interests, medical expenses, low-risk capital preservation, and annuity tracking.',
  },
];

export function ProfileSettingsPage() {
  const { user: authUser, preferences, updateOnboardingPreferences } = useAuthStore();
  const { user: financeUser, updateUserProfile } = useFinanceStore();
  const { setActivePersona } = useUIStore();

  const currentUser = authUser || financeUser;

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [persona, setPersona] = useState<UserPersona>(currentUser.persona);
  const [experienceLevel, setExperienceLevel] = useState<FinancialExperienceLevel>(
    preferences.experienceLevel || 'intermediate'
  );
  const [complexity, setComplexity] = useState<DashboardComplexity>(
    preferences.dashboardComplexity || 'standard'
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Display name cannot be empty.' });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    // Update Finance & Auth stores
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      persona,
    });

    updateOnboardingPreferences({
      persona,
      experienceLevel,
      dashboardComplexity: complexity,
    });

    setActivePersona(persona);

    setFeedback({
      type: 'success',
      message: 'Profile preferences updated successfully! Financial workspace synchronized.',
    });

    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRestoreDefaults = () => {
    const selected = PERSONAS.find((p) => p.id === persona) || PERSONAS[1];
    setName(selected.name);
    setEmail(`${selected.id}@expenzo.demo`);
    setExperienceLevel('intermediate');
    setComplexity('standard');
    setFeedback({
      type: 'success',
      message: `Reset profile values to the default archetype for ${selected.role}.`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Informational Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            Personalized Financial Persona
          </p>
          <p className="mt-0.5">
            Your persona customizes dashboard widgets, default spending categories, and AI assistant advice to match your life stage.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
          }`}
          role="alert"
        >
          {feedback.type === 'success' ? (
            <Check className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Details Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            Basic Profile Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="displayName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Aryan Sharma"
                required
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Email (Local Demo)
              </label>
              <input
                id="contactEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. aryan@example.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Persona Selector Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Active Financial Persona
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an archetype to automatically prioritize relevant financial views.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERSONAS.map((p) => {
              const isSelected = persona === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {p.role}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Experience & Complexity Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Experience & View Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="experienceLevel" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Financial Literacy Level
              </label>
              <select
                id="experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as FinancialExperienceLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="beginner">Beginner — Step-by-step guidance & definitions</option>
                <option value="intermediate">Intermediate — Balanced metrics & insights</option>
                <option value="advanced">Advanced — Deep financial ratios & full ledgers</option>
              </select>
            </div>

            <div>
              <label htmlFor="dashboardComplexity" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Dashboard Complexity
              </label>
              <select
                id="dashboardComplexity"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as DashboardComplexity)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="simple">Simple — Essential cash-flow and expenses only</option>
                <option value="standard">Standard — Full accounts, budgets, and investments</option>
                <option value="advanced">Advanced — Analytics charts, simulators, and breakdowns</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restore Persona Defaults
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Check className="h-4 w-4" />
            Save Profile Preferences
          </button>
        </div>
      </form>
    </div>
  );
}

