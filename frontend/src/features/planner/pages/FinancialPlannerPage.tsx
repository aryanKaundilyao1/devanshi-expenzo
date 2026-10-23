import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SavingsGoal } from '@/types/finance';
import { calculateMonthsRemaining, calculateRequiredMonthlyContribution } from '@/features/planner/utils/plannerCalculations';
import { formatINR } from '@/domain/money/formatters';
import { GoalModal } from '@/features/planner/components/GoalModal';
import { GoalContributionModal } from '@/features/planner/components/GoalContributionModal';
import { DeleteGoalDialog } from '@/features/planner/components/DeleteGoalDialog';
import {
  Target,
  Plus,
  Sparkles,
  Calculator,
  ArrowRight,
  TrendingUp,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  PlusCircle,
  Clock,
} from 'lucide-react';

export const FinancialPlannerPage: React.FC = () => {
  const { goals } = useFinanceStore();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);
  const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  // Aggregate stats
  const totalTargetMinor = goals.reduce((sum, g) => sum + g.targetAmountMinor, 0);
  const totalSavedMinor = goals.reduce((sum, g) => sum + g.currentAmountMinor, 0);
  const totalRemainingMinor = Math.max(0, totalTargetMinor - totalSavedMinor);
  const overallProgressPercent = totalTargetMinor > 0 ? (totalSavedMinor / totalTargetMinor) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Financial Planner & Goals
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              {goals.length} active {goals.length === 1 ? 'goal' : 'goals'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Target-based savings milestones with contribution schedules and scenario simulations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/financial-planner/simulator"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            What-If Simulator
          </Link>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Goal
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Goal Targets
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {formatINR(totalTargetMinor)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Sum of all milestones</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Accumulated
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatINR(totalSavedMinor)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Assigned savings</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Remaining Target
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {formatINR(totalRemainingMinor)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Still to fund</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Overall Completion
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {overallProgressPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 mt-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overallProgressPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
            const progress = (goal.currentAmountMinor / goal.targetAmountMinor) * 100;
            const remaining = Math.max(0, goal.targetAmountMinor - goal.currentAmountMinor);
            const reqMonthly = calculateRequiredMonthlyContribution(
              goal.targetAmountMinor,
              goal.currentAmountMinor,
              monthsRemaining
            );

            return (
              <div
                key={goal.id}
                className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {goal.category}
                      </span>
                      <Link
                        to={`/app/financial-planner/goals/${goal.id}`}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block mt-0.5"
                      >
                        {goal.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setGoalToEdit(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGoalToDelete(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Amounts */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {progress.toFixed(0)}%
                      </span>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Saved:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatINR(goal.currentAmountMinor)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Target:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatINR(goal.targetAmountMinor)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contribution & Timeline Snapshot */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Target Date:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {goal.targetDate} ({monthsRemaining} mo)
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-slate-400" /> Req. Monthly:
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatINR(reqMonthly)} / mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setGoalToContribute(goal)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Allocate Funds
                  </button>

                  <Link
                    to={`/app/financial-planner/goals/${goal.id}`}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Goal Details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs">
          <Target className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Savings Goals Configured
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Set up target-based savings milestones to calculate required monthly contributions and track progress.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Goal
            </button>
            <Link
              to="/app/financial-planner/simulator"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              What-If Simulator
            </Link>
          </div>
        </div>
      )}

      {/* Goal Create/Edit Modal */}
      <GoalModal
        isOpen={isGoalModalOpen || Boolean(goalToEdit)}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />

      {/* Goal Contribution Modal */}
      <GoalContributionModal
        isOpen={Boolean(goalToContribute)}
        onClose={() => setGoalToContribute(null)}
        goal={goalToContribute}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteGoalDialog
        isOpen={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        goal={goalToDelete}
      />
    </div>
  );
};

