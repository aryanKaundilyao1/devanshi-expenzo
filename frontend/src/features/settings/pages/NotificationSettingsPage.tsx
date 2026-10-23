import React, { useState } from 'react';
import { Bell, Check, AlertTriangle, CalendarClock, Wallet, Target, TrendingUp, Shield } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { NotificationPreferences } from '@/types/finance';

export function NotificationSettingsPage() {
  const { notificationPreferences, updateNotificationPreferences } = useFinanceStore();

  const [prefs, setPrefs] = useState<NotificationPreferences>(notificationPreferences);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationPreferences(prefs);
    setFeedback('Notification preferences saved and alert evaluator synchronized.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const PREF_ITEMS: {
    key: keyof NotificationPreferences;
    title: string;
    desc: string;
    icon: React.ElementType;
  }[] = [
    {
      key: 'budgetAlerts',
      title: 'Budget Threshold Warnings',
      desc: 'Trigger an alert when spending in any category reaches 80% of its monthly limit.',
      icon: AlertTriangle,
    },
    {
      key: 'budgetExceededAlerts',
      title: 'Budget Overrun Alerts',
      desc: 'Immediate high-priority alert when a category surpasses 100% of its configured budget.',
      icon: AlertTriangle,
    },
    {
      key: 'billReminders',
      title: 'Upcoming Bill Due Reminders',
      desc: 'Proactive notification when scheduled utility, rent, or credit card bills are due within 7 days.',
      icon: CalendarClock,
    },
    {
      key: 'lowBalanceAlerts',
      title: 'Low Account Balance Alerts',
      desc: 'Alert when available liquid funds in any savings or checking account drop below ₹5,000.',
      icon: Wallet,
    },
    {
      key: 'goalMilestones',
      title: 'Savings Goal Milestones',
      desc: 'Celebratory milestone notification when you reach 50% and 100% of a target goal.',
      icon: Target,
    },
    {
      key: 'portfolioInsights',
      title: 'Portfolio Concentration Insights',
      desc: 'Advisory notice when stock holdings in a single economic sector exceed 40% of portfolio equity.',
      icon: TrendingUp,
    },
    {
      key: 'systemAnnouncements',
      title: 'System & Security Notices',
      desc: 'Informational notices regarding client-side sandbox operations and prototype capabilities.',
      icon: Shield,
    },
  ];

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

      {/* Header Info */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5">
        <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Proactive Financial Intelligence Alerts
          </p>
          <p className="leading-relaxed">
            Configure which rules generate notifications in your Notification Center. Notifications are derived deterministically from actual ledger mutations without external webhooks.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 divide-y divide-slate-100 dark:divide-slate-800/80">
          {PREF_ITEMS.map((item) => {
            const Icon = item.icon;
            const isChecked = prefs[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-start gap-3 pr-4">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(item.key)}
                    className="sr-only peer"
                    aria-label={`Toggle ${item.title}`}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Check className="h-4 w-4" />
            Save Notification Preferences
          </button>
        </div>
      </form>
    </div>
  );
}

