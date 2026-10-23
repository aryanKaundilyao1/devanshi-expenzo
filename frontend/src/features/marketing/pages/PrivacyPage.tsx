import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3">
        <Badge variant="outline">Prototype Legal Notice</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: October 2026 • Effective for EXPENZO Demonstration Sandbox
        </p>
      </div>

      <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Demonstration Nature of this Platform
          </h2>
          <p>
            EXPENZO is an architectural software prototype developed for demonstration and technical evaluation purposes. The application operates entirely client-side using browser local storage (`localStorage`). No real-world financial records or personal identities are collected on remote servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Local Browser Storage & Data Retention
          </h2>
          <p>
            When you create transactions, edit budgets, or toggle theme preferences, these states are persisted solely within your local web browser under keys versioned as `expenzo-demo:v1`. Clearing your browser cache or triggering the &ldquo;Reset Demo Data&rdquo; button will permanently erase these records and restore the initial baseline seed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. No Bank Credential Collection
          </h2>
          <p>
            EXPENZO does not ask for, process, or store NetBanking credentials, UPI PINs, or credit card security codes. All bank accounts shown in the banking overview are simulated demonstration fixtures.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. Offline AI & Deterministic Calculations
          </h2>
          <p>
            The EXPENZO AI assistant and insight generator function completely within your local client device using deterministic financial rule sets. Your financial numbers are never streamed to third-party generative artificial intelligence APIs or external cloud training pipelines.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            5. Future Production Roadmap
          </h2>
          <p>
            Future production releases will utilize end-to-end encryption, regulated Account Aggregator consent frameworks, and isolated tenant databases subject to formal regulatory compliance audits.
          </p>
        </section>
      </Card>
    </div>
  );
}

