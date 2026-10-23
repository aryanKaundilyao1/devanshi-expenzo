import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { calculateMonthsRemaining, calculateRequiredMonthlyContribution } from '@/features/planner/utils/plannerCalculations';
import { formatINR } from '@/domain/money/formatters';
import { GoalModal } from '@/features/planner/components/GoalModal';
import { GoalContributionModal } from '@/features/planner/components/GoalContributionModal';
import { DeleteGoalDialog } from '@/features/planner/components/DeleteGoalDialog';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ArrowLeft,
  Target,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  History,
  Calculator,
} from 'lucide-react';

export const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goals } = useFinanceStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const goal = goals.find((g) => g.id === id);

  if (!goal) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Savings Goal Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          The requested savings goal does not exist or may have been deleted.
        </p>
        <Link
          to="/app/financial-planner"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Planner
        </Link>
      </div>
    );
  }

  const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
  const progressPercent = (goal.currentAmountMinor / goal.targetAmountMinor) * 100;
  const remainingMinor = Math.max(0, goal.targetAmountMinor - goal.currentAmountMinor);
  const reqMonthly = calculateRequiredMonthlyContribution(
    goal.targetAmountMinor,
    goal.currentAmountMinor,
    monthsRemaining
  );

  // Projection Chart Data Points
  const projectionData = useMemo(() => {
    const points = [];
    const monthlyStep = reqMonthly;
    let accumulated = goal.currentAmountMinor;

    points.push({ month: 'Current (Oct)', amountMinor: accumulated });

    const totalSteps = Math.min(monthsRemaining, 12);
    for (let i = 1; i <= totalSteps; i++) {
      accumulated = Math.min(goal.targetAmountMinor, accumulated + monthlyStep);
      points.push({
        month: `+${i} mo`,
        amountMinor: accumulated,
      });
    }

    return points;
  }, [goal, monthsRemaining, reqMonthly]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/financial-planner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Planner
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Goal
          </button>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsContributeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Contribution
          </button>
        </div>
      </div>

      {/* Goal Header Hero */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {goal.category}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {goal.priority || 'Medium'} Priority
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1.5">
            {goal.title}
          </h1>

          {goal.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {goal.notes}
            </p>
          )}
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
            Accumulated So Far
          </span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatINR(goal.currentAmountMinor)}
          </div>
          <span className="text-xs text-slate-400 block mt-0.5">
            of {formatINR(goal.targetAmountMinor)} ({progressPercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Progress & Milestone Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Target Amount
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {formatINR(goal.targetAmountMinor)}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Remaining to Save
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {formatINR(remainingMinor)}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Target Deadline
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">
            {goal.targetDate}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{monthsRemaining} months left</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Recommended Pace
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {formatINR(reqMonthly)} / mo
          </span>
        </div>
      </div>

      {/* Projection Chart & Timeline */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Target Milestone Accumulation Curve
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Projected trajectory based on saving {formatINR(reqMonthly)} monthly until target date
            </p>
          </div>
          <Link
            to="/app/financial-planner/simulator"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <Calculator className="w-3.5 h-3.5" /> Simulate Different Scenarios
          </Link>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickFormatter={(val) => `₹${Math.round(val / 100)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs border border-slate-700">
                        <div className="text-slate-400 mb-0.5">{data.month}</div>
                        <div className="font-bold text-sm text-emerald-400">
                          {formatINR(data.amountMinor)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="amountMinor" stroke="#10B981" strokeWidth={2} fill="url(#goalGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contribution History Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recorded Allocations & History
            </h3>
          </div>
          <button
            onClick={() => setIsContributeModalOpen(true)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Add Contribution
          </button>
        </div>

        {goal.contributions && goal.contributions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold text-right">Amount</th>
                  <th className="pb-2.5 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {goal.contributions.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white">{entry.date}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatINR(entry.amountMinor)}
                    </td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">{entry.note || 'Plan contribution'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Initial baseline savings of {formatINR(goal.currentAmountMinor)} recorded. Use "Add Contribution" to log subsequent allocations.
          </div>
        )}
      </div>

      {/* Modals */}
      <GoalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        goalToEdit={goal}
      />

      <GoalContributionModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        goal={goal}
      />

      <DeleteGoalDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          navigate('/app/financial-planner');
        }}
        goal={goal}
      />
    </div>
  );
};

