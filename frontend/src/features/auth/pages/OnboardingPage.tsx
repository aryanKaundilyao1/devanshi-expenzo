import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore, FinancialExperienceLevel, DashboardComplexity, DemoDataMode } from '@/store/useAuthStore';
import { UserPersona } from '@/types/finance';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Users,
  TrendingUp,
  HeartHandshake,
  Wallet,
  Building2,
  Target,
  Compass,
  Check,
  ShieldCheck,
  Sliders,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

const FINANCIAL_GOALS_LIST = [
  'Track expenses',
  'Build savings',
  'Control budgets',
  'Monitor investments',
  'Organize bank accounts',
  'Learn personal finance',
  'Plan major purchases',
];

const PERSONA_OPTIONS: {
  id: UserPersona;
  title: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    id: 'professional',
    title: 'Working Professional',
    icon: Briefcase,
    description: 'Salary tracking, monthly category budgets, and recurring commitment reminders.',
  },
  {
    id: 'student',
    title: 'Student',
    icon: GraduationCap,
    description: 'Daily allowance tracking, campus food & transit expenses, and savings targets.',
  },
  {
    id: 'family',
    title: 'Family',
    icon: Users,
    description: 'Household budgets, shared groceries & utilities, and milestone vacation funds.',
  },
  {
    id: 'investor',
    title: 'Investor',
    icon: TrendingUp,
    description: 'Multi-asset valuation, stock discovery on NSE, and portfolio risk diversification.',
  },
  {
    id: 'senior',
    title: 'Older Adult',
    icon: HeartHandshake,
    description: 'High-contrast readable balances, simplified transaction history, and bill reminders.',
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { preferences, user, updateOnboardingPreferences, completeOnboarding } = useAuthStore();

  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Local state initialized from store
  const [experience, setExperience] = useState<FinancialExperienceLevel>(preferences.experienceLevel || 'intermediate');
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>(preferences.persona || 'professional');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(preferences.goals || ['Track expenses', 'Build savings']);
  const [complexity, setComplexity] = useState<DashboardComplexity>(preferences.dashboardComplexity || 'standard');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(preferences.theme || 'dark');
  const [dataMode, setDataMode] = useState<DemoDataMode>(preferences.demoDataMode || 'seeded-demo');

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    // Save selections as we proceed
    updateOnboardingPreferences({
      experienceLevel: experience,
      persona: selectedPersona,
      goals: selectedGoals,
      dashboardComplexity: complexity,
      theme: themeMode,
      demoDataMode: dataMode,
    });

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    updateOnboardingPreferences({
      experienceLevel: experience,
      persona: selectedPersona,
      goals: selectedGoals,
      dashboardComplexity: complexity,
      theme: themeMode,
      demoDataMode: dataMode,
    });
    completeOnboarding();
    navigate('/app/dashboard');
  };

  const stepProgress = Math.round((step / totalSteps) * 100);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-in fade-in-50">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="uppercase tracking-wider">
            Step {step} of {totalSteps}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stepProgress}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Welcome */}
      {step === 1 && (
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome to EXPENZO, {user?.name || 'Explorer'}!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Your unified personal finance platform. In just a few quick steps, we will configure your personalized dashboard and intelligence modules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { title: 'Granular Expenses', desc: 'Track spending & category budgets', icon: Wallet },
              { title: 'Unified Banking', desc: 'Manage deposits and cash in one place', icon: Building2 },
              { title: 'Stock Portfolios', desc: 'Monitor valuations & asset allocation', icon: TrendingUp },
              { title: 'Offline AI Assistant', desc: 'Receive instant, explainable insights', icon: Sparkles },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{f.title}</h5>
                    <p className="text-[11px] text-slate-500">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={handleNext} className="w-full" size="lg">
            Let&apos;s Get Started
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Card>
      )}

      {/* STEP 2: Financial Experience */}
      {step === 2 && (
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Choose Your Financial Experience Level
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              This helps EXPENZO tailor explanations, glossary tooltips, and analytical depth to your comfort level.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'beginner' as const,
                title: 'Beginner',
                desc: 'Simple cash tracking, friendly explanations of financial terms, and guidance on budgets.',
              },
              {
                id: 'intermediate' as const,
                title: 'Intermediate (Recommended)',
                desc: 'Standard fintech metrics, category budget threshold alerts, and cash-flow forecasting.',
              },
              {
                id: 'advanced' as const,
                title: 'Advanced',
                desc: 'Comprehensive multi-asset analytics, sector diversification scoring, and detailed P&L ratios.',
              },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setExperience(opt.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                  experience === opt.id
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{opt.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                </div>
                {experience === opt.id && (
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Financial Persona */}
      {step === 3 && (
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Select Your Financial Persona
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select the profile that best reflects your current financial focus and life stage.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
            {PERSONA_OPTIONS.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPersona === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-slate-300'
                  }`}
                >
                  <div className="h-9 w-9 rounded-xl bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-600 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</span>
                      {isSelected && <Badge variant="success" className="text-[10px]">Selected</Badge>}
                    </div>
                    <p className="text-[11px] text-slate-500">{p.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Financial Goals */}
      {step === 4 && (
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              What Are Your Primary Financial Goals?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select all that apply. This configures prioritized shortcuts and AI diagnostic focus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FINANCIAL_GOALS_LIST.map((goal) => {
              const isSelected = selectedGoals.includes(goal);
              return (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>{goal}</span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: Dashboard Personalization */}
      {step === 5 && (
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Personalize Your Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Configure your visual appearance and interface density.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Complexity */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-slate-400 block">
                Dashboard Complexity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['simple', 'standard', 'advanced'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setComplexity(c)}
                    className={`p-2.5 rounded-xl border font-bold capitalize transition-all cursor-pointer text-center ${
                      complexity === c
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-slate-400 block">
                Color Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark' as const, label: 'Dark Slate', icon: Moon },
                  { id: 'light' as const, label: 'Clean Light', icon: Sun },
                  { id: 'system' as const, label: 'System', icon: Laptop },
                ].map((t) => {
                  const ThemeIcon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setThemeMode(t.id)}
                      className={`p-2.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        themeMode === t.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <ThemeIcon className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency & Language (Disclosed) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Currency</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">INR (₹ Indian Rupee)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Interface Language</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">English (India)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 6: Financial Setup (Seeded vs Empty Data) */}
      {step === 6 && (
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Choose Your Initial Financial Setup
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select how you would like to initialize your workspace demo data.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setDataMode('seeded-demo')}
              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                dataMode === 'seeded-demo'
                  ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Start with Pre-Loaded Demonstration Data
                  </h4>
                  <Badge variant="success">Recommended</Badge>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Includes 3 deposit accounts (HDFC, SBI, Cash), 8 October 2026 transactions, active category budgets, and stock holdings (TCS & INFY).
                </p>
              </div>
              {dataMode === 'seeded-demo' && (
                <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </button>

            <button
              onClick={() => setDataMode('empty-demo')}
              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                dataMode === 'empty-demo'
                  ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Start with Clean Slate Workspace
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Start with empty transaction records and holdings to test manual entries and clean empty states from scratch.
                </p>
              </div>
              {dataMode === 'empty-demo' && (
                <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>You can reset to demo defaults or clear data at any time in Settings.</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button onClick={handleNext}>
              Review & Finish
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 7: Onboarding Complete */}
      {step === 7 && (
        <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              You&apos;re All Set, {user?.name || 'Explorer'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Your personalized EXPENZO workspace is ready. Your choices have been saved locally.
            </p>
          </div>

          {/* Configuration Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152238] border border-slate-200 dark:border-slate-800 text-left space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400">Selected Persona:</span>
              <strong className="text-slate-900 dark:text-white capitalize">{selectedPersona}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400">Experience Level:</span>
              <strong className="text-slate-900 dark:text-white capitalize">{experience}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400">Data Setup Mode:</span>
              <strong className="text-slate-900 dark:text-white capitalize">
                {dataMode === 'seeded-demo' ? 'Pre-Loaded Demonstration' : 'Clean Slate Workspace'}
              </strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Primary Focus:</span>
              <strong className="text-slate-900 dark:text-white truncate max-w-[200px]">
                {selectedGoals.slice(0, 2).join(', ')}...
              </strong>
            </div>
          </div>

          <Button onClick={handleFinish} className="w-full" size="lg">
            Open My Dashboard
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Card>
      )}
    </div>
  );
}

