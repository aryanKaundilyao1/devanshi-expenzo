import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function TermsPage() {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3">
        <Badge variant="outline">Prototype Legal Notice</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: October 2026 • Effective for EXPENZO Demonstration Sandbox
        </p>
      </div>

      <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Prototype Scope and Permitted Usage
          </h2>
          <p>
            EXPENZO is provided as an interactive software prototype for evaluating personal financial management user experiences, unified ledger architectures, and explainable AI insights. It is strictly not intended for mission-critical accounting, tax filing, or live commercial banking transactions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Not Financial, Tax, or Investment Advice
          </h2>
          <p>
            All information, stock quotes, market valuations, and AI-generated insights presented on this platform are for educational and demonstrative purposes only. EXPENZO does not provide certified financial planning, tax guidance, or brokerage trading services. Users must consult accredited financial professionals before making real-world financial decisions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Disclaimer of Warranties
          </h2>
          <p>
            The software is delivered on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. EXPENZO makes no warranties regarding uninterrupted availability, market data timeliness, or completeness of simulated bank accounts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. User Autonomy & Reset Rights
          </h2>
          <p>
            Users have full autonomy over their local demonstration session. You may reset all data to default baseline fixtures at any time via the profile dropdown menu or settings panel.
          </p>
        </section>
      </Card>
    </div>
  );
}

