import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  Heart,
} from 'lucide-react';

export function AboutPage() {
  const principles = [
    {
      title: 'Canonical Ledger Integrity',
      icon: Layers,
      description:
        'Financial technology must start with rock-solid accounting. Account balances must derive strictly from signed ledger movements, never manually adjusted cache fields or double-counted internal transfers.',
    },
    {
      title: 'Deterministic Explainability',
      icon: Eye,
      description:
        'No user should be told what to do by a black-box AI algorithm. Every financial observation, anomaly flag, and budget suggestion must disclose its exact arithmetic and underlying assumptions.',
    },
    {
      title: 'Privacy by Default',
      icon: Shield,
      description:
        'Users should never be forced to link bank credentials or submit private financial transactions to third-party advertising networks just to understand their basic monthly cash flow.',
    },
    {
      title: 'Inclusive, Not Stereotyped',
      icon: Heart,
      description:
        'Whether you are a student budgeting allowances, a family planning a home, or an investor tracking equities, the application adapts to your declared preferences rather than rigid demographic assumptions.',
    },
  ];

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="success">Mission & Philosophy</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bringing Clarity to Personal Wealth.
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          EXPENZO was created to solve financial fragmentation: the exhausting struggle between disparate banking apps, standalone spreadsheets, isolated brokerages, and opaque budgeting tools.
        </p>
      </div>

      {/* The Problem We Are Solving */}
      <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          The Problem: Disconnected Financial Lives
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Today, individuals must open 3–4 banking applications, a separate stock brokerage, and manual spreadsheets just to answer simple questions like: <em>&ldquo;How much cash do I actually have left this month?&rdquo;</em> or <em>&ldquo;Can I afford this upcoming milestone?&rdquo;</em>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Most traditional expense trackers demand tedious manual double-entry, while banking portals bury transaction histories in dense, non-searchable PDFs. EXPENZO brings these worlds together through a single, responsive command center.
        </p>
      </Card>

      {/* Core Principles */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Our Responsible Technology Principles
          </h3>
          <p className="text-xs text-slate-500">
            Four foundational commitments that guide every architectural decision we make:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <Card
                key={p.title}
                className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {p.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Prototype Status Disclosure */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Transparent Product Status
        </h5>
        <p className="leading-relaxed">
          EXPENZO is currently delivered as a client-side frontend prototype with centralized simulated financial fixtures. We are engineering this platform with production-level fintech standards from Day 1 to ensure that future backend integrations inherit rigorous accounting validation and zero-leak privacy controls.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center pt-2">
        <Link to="/auth/register">
          <Button size="lg">
            Join the EXPENZO Experience
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

