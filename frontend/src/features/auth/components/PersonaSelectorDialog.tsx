import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import { UserPersona } from '@/types/finance';
import {
  GraduationCap,
  Briefcase,
  Users,
  TrendingUp,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface PersonaSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextRoute?: string;
}

const PERSONA_OPTIONS: {
  persona: UserPersona;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  emphasis: string;
  defaultBudget: string;
}[] = [
  {
    persona: 'professional',
    title: 'Working Professional',
    badge: 'Recommended Default',
    icon: Briefcase,
    description: 'Automated salary reconciliation, monthly category budgets, and recurring commitment reminders.',
    emphasis: 'Salary sweeps • Rent & Utilities • Goal sweep to SBI',
    defaultBudget: '₹30,000 / month',
  },
  {
    persona: 'student',
    title: 'Student',
    badge: 'Beginner Friendly',
    icon: GraduationCap,
    description: 'Daily allowance tracking, campus food & transit expenses, and beginner financial literacy.',
    emphasis: 'Pocket allowance • Dining out • Transit pass',
    defaultBudget: '₹10,000 / month',
  },
  {
    persona: 'family',
    title: 'Family',
    badge: 'Household Finance',
    icon: Users,
    description: 'Comprehensive household budgets, shared utility management, and vacation milestone savings.',
    emphasis: 'Groceries • School fees • Household bills',
    defaultBudget: '₹55,000 / month',
  },
  {
    persona: 'investor',
    title: 'Active Investor',
    badge: 'Portfolio Focus',
    icon: TrendingUp,
    description: 'Multi-asset valuation, stock discovery across NSE equities, and portfolio diversification analytics.',
    emphasis: 'Stock watchlists • P&L tracking • Sector allocation',
    defaultBudget: '₹40,000 / month',
  },
  {
    persona: 'senior',
    title: 'Older Adult',
    badge: 'Accessible Simplicity',
    icon: HeartHandshake,
    description: 'High-contrast readable balances, transparent transaction history, and zero confusing financial jargon.',
    emphasis: 'Large numbers • Fixed deposit interest • Bill reminders',
    defaultBudget: '₹25,000 / month',
  },
];

export function PersonaSelectorDialog({
  open,
  onOpenChange,
  nextRoute = '/app/dashboard',
}: PersonaSelectorDialogProps) {
  const navigate = useNavigate();
  const loginWithDemo = useAuthStore((state) => state.loginWithDemo);

  const handleSelectPersona = (persona: UserPersona) => {
    loginWithDemo(persona);
    onOpenChange(false);
    navigate(nextRoute);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                E
              </div>
              <DialogTitle>Select Your Demo Persona</DialogTitle>
            </div>
            <Badge variant="success">Interactive Sandbox</Badge>
          </div>
          <DialogDescription className="text-xs pt-1">
            Choose a profile below to launch an instant demonstration session with pre-configured financial fixtures.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 py-2 pr-1">
          {PERSONA_OPTIONS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.persona}
                onClick={() => handleSelectPersona(item.persona)}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all cursor-pointer group flex items-start gap-4"
              >
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {item.badge}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span>Target: <strong>{item.defaultBudget}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{item.emphasis}</span>
                  </div>
                </div>

                <div className="self-center pl-2 text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Zero real bank credentials collected</span>
          </div>
          <span>Clock as of 15 Oct 2026</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

