import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserPersona, UserProfile } from '@/types/finance';
import {
  PlusCircle,
  Sparkles,
  SlidersHorizontal,
  Calendar,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Users,
  TrendingUp,
  HeartHandshake,
} from 'lucide-react';

interface DashboardHeaderProps {
  user: UserProfile;
  asOfDate: string;
  onOpenAddTransaction: () => void;
  onOpenCustomize: () => void;
}

const PERSONA_ICONS: Record<UserPersona, React.ElementType> = {
  professional: Briefcase,
  student: GraduationCap,
  family: Users,
  investor: TrendingUp,
  senior: HeartHandshake,
};

const PERSONA_LABELS: Record<UserPersona, string> = {
  professional: 'Working Professional',
  student: 'Student',
  family: 'Family',
  investor: 'Active Investor',
  senior: 'Older Adult',
};

export function DashboardHeader({
  user,
  asOfDate,
  onOpenAddTransaction,
  onOpenCustomize,
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user.name ? user.name.split(' ')[0] : 'there';
  const PersonaIcon = PERSONA_ICONS[user.persona] || Briefcase;
  const personaLabel = PERSONA_LABELS[user.persona] || 'Professional';

  // Format demo as-of date
  const formattedDate = new Date(`${asOfDate}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Left: Greeting & Persona Context */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[11px] gap-1 px-2.5 py-0.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
            <PersonaIcon className="h-3 w-3" />
            <span>{personaLabel} Workspace</span>
          </Badge>

          <Badge variant="secondary" className="text-[11px] gap-1 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>As of {formattedDate} (Demo Clock)</span>
          </Badge>

          <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 pl-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Local Sandbox</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {getGreeting()}, {firstName}.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s what&apos;s happening with your money across all accounts and investments.
        </p>
      </div>

      {/* Right: Quick Command Actions */}
      <div className="flex items-center flex-wrap gap-2.5">
        <Button
          onClick={onOpenCustomize}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80"
          aria-label="Customize dashboard widgets"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Customize</span>
        </Button>

        <Button
          onClick={() => navigate('/app/ai-assistant?context=dashboard')}
          variant="secondary"
          size="sm"
          className="gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/60"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Ask AI</span>
        </Button>

        <Button
          onClick={onOpenAddTransaction}
          size="sm"
          className="gap-1.5 text-xs shadow-xs"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Transaction</span>
        </Button>
      </div>
    </div>
  );
}

