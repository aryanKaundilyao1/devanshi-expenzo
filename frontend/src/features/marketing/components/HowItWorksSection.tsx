import React from 'react';
import { Card } from '@/components/ui/Card';
import { UserCheck, Sliders, LineChart, ShieldCheck } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Create Your Experience',
      icon: UserCheck,
      description:
        'Select your financial persona and preferences. Adapt dashboard complexity to fit your exact goals — from daily student budgeting to multi-asset wealth management.',
    },
    {
      step: '02',
      title: 'Track & Organize Finances',
      icon: Sliders,
      description:
        'Log expenses in plain English, track checking and savings balances, and organize stock holdings. Everything reconciles into one single canonical ledger without double counting.',
    },
    {
      step: '03',
      title: 'Understand Your Money',
      icon: LineChart,
      description:
        'Receive proactive diagnostic observations, cash-flow projections, and what-if milestone simulations — all computed locally on your device with complete privacy.',
    },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Simple, Transparent Architecture
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How EXPENZO Works
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          No mandatory bank synchronization or credential sharing. Get started immediately with full privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.step}
              className="p-8 relative border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] hover:border-emerald-500/50 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-200 dark:text-slate-800 tabular-nums">
                    {s.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {s.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Zero financial data leakage</span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

