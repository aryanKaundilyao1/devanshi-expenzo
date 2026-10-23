import React, { useState } from 'react';
import { Coins, Calendar, Check, AlertCircle, Info, Lock } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { DEMO_AS_OF } from '@/services/fixtures/seedData';

export function FinancialSettingsPage() {
  const { user, updateUserProfile } = useFinanceStore();

  const [budgetLimitRupees, setBudgetLimitRupees] = useState<number>(
    user.monthlyBudgetLimitMinor ? user.monthlyBudgetLimitMinor / 100 : 30000
  );

  const [fiscalStartDay, setFiscalStartDay] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('expenzo-pref:fiscal-start-day') || '1';
    }
    return '1';
  });

  const [numberFormat, setNumberFormat] = useState<'indian' | 'international'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('expenzo-pref:num-format') as any) || 'indian';
    }
    return 'indian';
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (budgetLimitRupees <= 0) {
      alert('Monthly budget limit must be a positive number.');
      return;
    }

    // Update store
    updateUserProfile({
      monthlyBudgetLimitMinor: budgetLimitRupees * 100,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('expenzo-pref:fiscal-start-day', fiscalStartDay);
      localStorage.setItem('expenzo-pref:num-format', numberFormat);
    }

    setFeedback('Financial preferences updated successfully! Calculations synchronized.');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {feedback && (
        <div
          className="flex items-center gap-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 p-3.5 text-xs font-semibold"
          role="alert"
        >
          <Check className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Demo Reference Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-blue-800 dark:text-blue-300">
            Fictional Reference Clock: {DEMO_AS_OF}
          </p>
          <p className="leading-relaxed">
            EXPENZO operates with an intentional frozen demonstration date of October 15, 2026. All period calculations (7D, 30D, This Month, YTD) and bill due dates are evaluated relative to this baseline to ensure 100% reproducible demo numbers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Currency Rules */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600" />
              Standard Currency Setting
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Lock className="h-3 w-3 text-slate-400" />
              INR Locked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                INR (₹ — Indian Rupee)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Active base currency for all accounts, investments, and double-entry ledger calculations.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 opacity-60">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                USD ($) & EUR (€) (Future Roadmap)
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Multi-currency FX conversions are planned for Phase 14 live backend integration.
              </p>
            </div>
          </div>
        </div>

        {/* Budget & Number Formatting */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Budget Thresholds & Number Formatting
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budgetLimit" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Monthly Target Budget Cap (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  id="budgetLimit"
                  type="number"
                  min="1000"
                  step="500"
                  value={budgetLimitRupees}
                  onChange={(e) => setBudgetLimitRupees(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Controls the overall monthly spending threshold bar on the main dashboard.
              </p>
            </div>

            <div>
              <label htmlFor="fiscalStartDay" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Fiscal Month Start Day
              </label>
              <select
                id="fiscalStartDay"
                value={fiscalStartDay}
                onChange={(e) => setFiscalStartDay(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1">1st of Month (Calendar Default)</option>
                <option value="5">5th of Month (Standard Corporate Salary Cycle)</option>
                <option value="10">10th of Month (Mid-Month Rent/EMI Cycle)</option>
                <option value="25">25th of Month (Early Salary Cycle)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Determines the date range boundaries for monthly reports and budget rollups.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Number Formatting System
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setNumberFormat('indian')}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  numberFormat === 'indian'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Indian Format (Lakhs & Crores)
                  </span>
                  {numberFormat === 'indian' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹1,50,000.00
                </p>
              </div>

              <div
                onClick={() => setNumberFormat('international')}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  numberFormat === 'international'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    International Format (Millions)
                  </span>
                  {numberFormat === 'international' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹150,000.00
                </p>
              </div>
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
            Save Financial Preferences
          </button>
        </div>
      </form>
    </div>
  );
}

