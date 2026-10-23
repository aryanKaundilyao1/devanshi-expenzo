import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardWidgetVisibility } from '../hooks/useDashboardData';
import { SlidersHorizontal, Check, RotateCcw } from 'lucide-react';

interface DashboardCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibility: DashboardWidgetVisibility;
  onToggleWidget: (key: keyof DashboardWidgetVisibility) => void;
  onResetWidgets: () => void;
}

const WIDGET_DEFINITIONS: {
  key: keyof DashboardWidgetVisibility;
  label: string;
  description: string;
}[] = [
  {
    key: 'showChart',
    label: 'Cash Flow Dynamics Chart',
    description: 'Visual trend of incoming salary versus outgoing expenses over time.',
  },
  {
    key: 'showCategoryBreakdown',
    label: 'Spending by Category Donut',
    description: 'Donut chart and ranked share list of your top expense categories.',
  },
  {
    key: 'showRecentTransactions',
    label: 'Recent Transactions Ledger',
    description: 'The latest six completed financial transactions.',
  },
  {
    key: 'showBudgets',
    label: 'Budget Utilization Overview',
    description: 'Category threshold progress bars with warning alerts.',
  },
  {
    key: 'showInvestments',
    label: 'Investment Portfolio Snapshot',
    description: 'NSE market valuation, unrealized returns, and top holdings.',
  },
  {
    key: 'showGoals',
    label: 'Savings Milestone Progress',
    description: 'Target progress on your primary financial savings goal.',
  },
  {
    key: 'showBills',
    label: 'Upcoming Bills & Commitments',
    description: 'Scheduled utilities, gym subscriptions, and SIP auto-debits.',
  },
  {
    key: 'showAIInsights',
    label: 'EXPENZO Intelligence Insights',
    description: 'Three deterministic, explainable financial observations.',
  },
];

export function DashboardCustomizeDialog({
  open,
  onOpenChange,
  visibility,
  onToggleWidget,
  onResetWidgets,
}: DashboardCustomizeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold">Customize Dashboard</DialogTitle>
            </div>
            <Badge variant="outline">Local Preferences</Badge>
          </div>
          <DialogDescription className="text-xs pt-1">
            Choose which modules are displayed on your financial command center.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto space-y-2 py-2 pr-1">
          {WIDGET_DEFINITIONS.map((w) => {
            const isVisible = visibility[w.key];
            return (
              <div
                key={w.key}
                onClick={() => onToggleWidget(w.key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isVisible
                    ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {w.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {w.description}
                  </p>
                </div>

                <div
                  className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                    isVisible
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isVisible && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetWidgets}
            className="text-xs text-slate-500 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </Button>

          <Button size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

