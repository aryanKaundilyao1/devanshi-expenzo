/**
 * EXPENZO — Family Financial Management Dashboard (Overview)
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import React, { useState } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SeatProgressBar } from '../components/SeatProgressBar';
import { MemberCard } from '../components/MemberCard';
import { SharedExpenseModal } from '../components/SharedExpenseModal';
import { WorkspaceSwitcher } from '../components/WorkspaceSwitcher';
import { calculateFamilyMetrics } from '@/domain/calculations/familyAccounting';
import {
  Users,
  Wallet,
  TrendingUp,
  Receipt,
  Target,
  BarChart2,
  PlusCircle,
  Share2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function FamilyPage() {
  const {
    activeFamilyId,
    families,
    sharedAllocations,
    householdGoals,
    contributeToHouseholdGoal,
    removeMember,
  } = useFamilyStore();

  const { transactions } = useFinanceStore();

  const currentFamily = families.find((f) => f.id === activeFamilyId) || families[0];
  const members = currentFamily?.members || [];
  const invitations = currentFamily?.invitations || [];

  const [sharedExpenseModalOpen, setSharedExpenseModalOpen] = useState(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<string | null>(null);

  // Compute family financial metrics for the current month
  const metrics = calculateFamilyMetrics({
    members,
    transactions,
    sharedAllocations,
    periodLabel: 'October 2026',
    periodType: 'monthly',
  });

  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const pendingInvitationsCount = invitations.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50">
      {/* SECTION 1: Top Navigation & Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              Multi-User Family Finance
            </span>
            <span className="text-xs text-indigo-300">• {currentFamily?.planId.toUpperCase()} Tier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{currentFamily?.name}</h1>
          <p className="text-xs text-indigo-200/80">
            Coordinated household budgeting, shared expense allocations & member savings intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <WorkspaceSwitcher className="bg-white/10 dark:bg-white/10 text-white border-white/20 hover:bg-white/20" />
          <Button
            size="sm"
            onClick={() => setSharedExpenseModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 shadow-sm text-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Split Shared Expense</span>
          </Button>
          <Link to="/app/family/analytics">
            <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Family Analytics</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* SECTION 2: Seat Progress Bar */}
      <SeatProgressBar
        planId={currentFamily?.planId || 'family'}
        activeMembersCount={activeMembersCount}
        pendingInvitationsCount={pendingInvitationsCount}
        onOpenInviteModal={() => {}}
      />

      {/* SECTION 3: Aggregate Household KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Family Income */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Family Income</span>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(metrics.totalFamilyIncomeMinor / 100).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400">Combined disclosed earnings</p>
        </Card>

        {/* Total Family Expenses */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Family Expenses</span>
            <Receipt className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(metrics.totalFamilyExpensesMinor / 100).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400">Direct + Attributable shared</p>
        </Card>

        {/* Period Net Savings */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Period Net Savings</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹{(metrics.periodNetSavingsMinor / 100).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400">
            Savings Rate: {metrics.familySavingsRatePercent !== null ? `${metrics.familySavingsRatePercent}%` : 'N/A'}
          </p>
        </Card>

        {/* Total Shared Expenses */}
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Shared Expenses</span>
            <Share2 className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            ₹{(metrics.totalSharedExpensesMinor / 100).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400">Allocated across household</p>
        </Card>
      </div>

      {/* SECTION 4: Member Profiles & Individual Spending Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Household Members ({members.length})
            </h3>
            <p className="text-xs text-slate-500">
              Individual financial histories remain private by default; shared expenses are explicitly allocated.
            </p>
          </div>
          <Link to="/app/family/members">
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-indigo-600 hover:text-indigo-700">
              <span>Manage Seats</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isCurrentUserOwner={true}
              currentUserId="user-devanshi-01"
              onRemoveMember={(id) => removeMember(currentFamily.id, id)}
            />
          ))}
        </div>
      </div>

      {/* SECTION 5: Member Financial Comparison Table */}
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Member Spending & Net Savings Breakdown ({metrics.periodLabel})
            </h3>
            <p className="text-xs text-slate-500">
              Calculated using integer-paise precision: Net Savings = Income − (Direct Expenses + Attributable Shared).
            </p>
          </div>
          <Link to="/app/family/analytics">
            <Button size="sm" variant="outline" className="text-xs gap-1">
              <span>View Full Analytics</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Member</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3 text-right">Income</th>
                <th className="py-2.5 px-3 text-right">Direct Expenses</th>
                <th className="py-2.5 px-3 text-right">Shared Share</th>
                <th className="py-2.5 px-3 text-right">Total Attributable</th>
                <th className="py-2.5 px-3 text-right">Net Savings</th>
                <th className="py-2.5 px-3 text-right">Savings Rate</th>
                <th className="py-2.5 px-3 text-right">Household Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {metrics.memberMetrics.map((m) => (
                <tr key={m.memberUserId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {m.memberName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="capitalize px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-medium">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium tabular-nums text-slate-700 dark:text-slate-300">
                    ₹{(m.incomeMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-medium tabular-nums text-slate-700 dark:text-slate-300">
                    ₹{(m.totalDirectExpensesMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-medium tabular-nums text-amber-600 dark:text-amber-400">
                    ₹{(m.totalSharedExpensesMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-900 dark:text-white">
                    ₹{(m.totalAttributableExpensesMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    ₹{(m.netSavingsMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold tabular-nums">
                    {m.savingsRatePercent !== null ? `${m.savingsRatePercent}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                    {m.expenseContributionPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SECTION 6: Household Shared Goals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Household Savings Goals
            </h3>
            <p className="text-xs text-slate-500">
              Collaborative financial milestones funded mutually by family members.
            </p>
          </div>
          <Link to="/app/financial-planner">
            <Button size="sm" variant="outline" className="text-xs gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Goal</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {householdGoals.map((goal) => {
            const progress = Math.min(100, (goal.currentAmountMinor / goal.targetAmountMinor) * 100);
            return (
              <Card key={goal.id} className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{goal.title}</h4>
                      <p className="text-[11px] text-slate-400">Target Date: {goal.targetDate}</p>
                    </div>
                  </div>
                  <Badge variant={goal.status === 'achieved' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold">
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">
                      Accumulated: ₹{(goal.currentAmountMinor / 100).toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-900 dark:text-slate-100">
                      Target: ₹{(goal.targetAmountMinor / 100).toLocaleString('en-IN')} ({progress.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Member Contributions Breakdown */}
                {goal.contributions && goal.contributions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Member Contributions
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {goal.contributions.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium"
                        >
                          {c.memberName}: ₹{(c.amountMinor / 100).toLocaleString('en-IN')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Shared Expense Modal */}
      <SharedExpenseModal
        open={sharedExpenseModalOpen}
        onOpenChange={setSharedExpenseModalOpen}
      />
    </div>
  );
}

