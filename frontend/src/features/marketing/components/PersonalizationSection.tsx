import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  GraduationCap,
  Briefcase,
  Users,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface PersonaData {
  id: string;
  label: string;
  icon: React.ElementType;
  title: string;
  description: string;
  priorities: string[];
  recommendedModules: string[];
}

const PERSONAS: PersonaData[] = [
  {
    id: 'student',
    label: 'Students',
    icon: GraduationCap,
    title: 'Daily Allowance & Student Budgeting',
    description:
      'Manage pocket money, campus dining, book allowances, and semester savings goals with beginner-friendly literacy explanations.',
    priorities: ['Daily spending caps', 'Shared roommate expenses', 'Gadget savings goals', 'Financial glossary'],
    recommendedModules: ['Expense Tracker', 'Budget Alerts', 'Learning Academy'],
  },
  {
    id: 'professional',
    label: 'Professionals',
    icon: Briefcase,
    title: 'Salary Sweeps & Wealth Building',
    description:
      'Automate monthly income reconciliation, manage recurring credit card bills, and optimize monthly savings rates for major life milestones.',
    priorities: ['Salary inflow tracking', 'Monthly rent & utility budgets', 'Emergency fund tracking', 'Tax & investment overview'],
    recommendedModules: ['Command Center', 'Banking Hub', 'AI Assistant', 'Planner'],
  },
  {
    id: 'family',
    label: 'Families',
    icon: Users,
    title: 'Household Budgets & Future Milestones',
    description:
      'Coordinate home grocery budgets, children education funds, recurring household subscriptions, and shared family goals in one clean view.',
    priorities: ['Multi-category household limits', 'Education goal tracking', 'Utility bill reminders', 'Annual spending audits'],
    recommendedModules: ['Budgets', 'Banking Accounts', 'Financial Reports'],
  },
  {
    id: 'investor',
    label: 'Investors',
    icon: TrendingUp,
    title: 'Multi-Asset Portfolio Intelligence',
    description:
      'Analyze equities, ETFs, and fixed income alongside liquid deposits with transparent asset allocation, P&L calculations, and risk metrics.',
    priorities: ['Real-time valuation', 'Sector diversification scoring', 'Cost-basis vs CMP tracking', 'Custom watchlists'],
    recommendedModules: ['Holdings Ledger', 'Stock Discovery', 'Portfolio Analytics'],
  },
  {
    id: 'senior',
    label: 'Older Adults',
    icon: HeartHandshake,
    title: 'Simplified Accounts & Readable Records',
    description:
      'High-contrast accessible interface, simplified pension and deposit account balances, readable typography, and zero confusing financial jargon.',
    priorities: ['Large high-contrast numbers', 'Transparent transaction history', 'Fixed deposit tracking', 'Zero complex jargon'],
    recommendedModules: ['Accounts Overview', 'Transactions', 'Bill Reminders'],
  },
];

export function PersonalizationSection() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaData>(PERSONAS[1]); // Default to Professional

  return (
    <section className="py-20 bg-slate-100/60 dark:bg-[#070D18] border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline">Tailored Financial Experience</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Adapts to Your Financial Life Stage
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Choose your profile below to preview how EXPENZO configures its dashboard and intelligence modules to your specific goals.
          </p>
        </div>

        {/* Persona Selectors */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersona.id === p.id;

            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/10'
                    : 'bg-white dark:bg-[#111C30] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Persona Preview Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1726] p-8 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Configuration for {selectedPersona.label}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {selectedPersona.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {selectedPersona.description}
            </p>

            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Key Workflow Priorities:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedPersona.priorities.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Link to="/auth/register">
                <Button size="sm">
                  Personalize Your Experience
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Prioritized App Modules
            </span>
            <div className="space-y-2">
              {selectedPersona.recommendedModules.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-[#0B1220] border border-slate-200/60 dark:border-slate-800 text-xs font-semibold flex items-center justify-between">
                  <span>{m}</span>
                  <Badge variant="success">Included</Badge>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              User declared preference during onboarding. Never inferred from stereotypes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

