/**
 * EXPENZO — Seat-Based Family Plans & Capacity Page
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import React, { useState } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getAllPlans, getPlanConfig } from '../config/plans';
import { calculateSeatUtilization, evaluateSeatOptimization } from '@/domain/calculations/seatOptimizer';
import { FamilyPlanId } from '@/types/family';
import {
  Sparkles,
  Users,
  Check,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function FamilyPlansPage() {
  const { activeFamilyId, families, changePlan } = useFamilyStore();
  const currentFamily = families.find((f) => f.id === activeFamilyId) || families[0];

  const plans = getAllPlans();
  const activePlanId = currentFamily?.planId || 'family';

  const activeMembersCount = currentFamily?.members.filter((m) => m.status === 'active').length || 1;
  const pendingInvitationsCount = currentFamily?.invitations.filter((i) => i.status === 'pending').length || 0;
  const occupiedSeats = activeMembersCount + pendingInvitationsCount;

  const [feedbackMsg, setFeedbackMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Seat optimization recommendation
  const recommendation = evaluateSeatOptimization({
    planId: activePlanId,
    activeMembersCount,
    pendingInvitationsCount,
  });

  const handlePlanSelect = (newPlanId: FamilyPlanId) => {
    if (newPlanId === activePlanId) return;

    const res = changePlan(currentFamily.id, newPlanId);
    if (res.success) {
      setFeedbackMsg({
        success: true,
        message: `Plan changed to '${getPlanConfig(newPlanId).name}' (Simulated Academic Mode). Workspace quota updated.`,
      });
    } else {
      setFeedbackMsg({
        success: false,
        message: res.error || 'Failed to update plan.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/app/family"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Family Overview</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Seat-Based Plans & Capacity Management
          </h1>
          <p className="text-xs text-slate-500">
            Configurable demonstration plans managing multi-user household collaboration.
          </p>
        </div>

        <Badge variant="outline" className="border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1 font-semibold gap-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span>Academic Demonstration Mode</span>
        </Badge>
      </div>

      {/* Demonstration Disclaimer Callout */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Academic Pricing Simulation Notice</p>
          <p className="text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
            All plan tiers, monthly prices, and savings projections shown below are academic simulation configurations for the CSCR2600 PBL-1 project demonstration. No real billing or payment processing is activated. Seat limits are enforced at the application and database kernel levels.
          </p>
        </div>
      </div>

      {/* Seat Optimization Advisor Card */}
      {recommendation.recommendedPlan && (
        <Card className="p-5 border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Seat Optimization Recommendation
                </h4>
                <Badge className="bg-amber-500 text-white text-[10px]">
                  Potential Savings: ₹{recommendation.projectedMonthlySavingsInr}/mo
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {recommendation.reasoning}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => handlePlanSelect(recommendation.recommendedPlan!.id)}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-xs text-xs"
          >
            Switch to {recommendation.recommendedPlan.name}
          </Button>
        </Card>
      )}

      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedbackMsg.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
          }`}
        >
          {feedbackMsg.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedbackMsg.message}</span>
        </div>
      )}

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan) => {
          const isCurrent = plan.id === activePlanId;
          const canAccommodate = occupiedSeats <= plan.maxActiveSeats;
          const costPerActiveSeat = Math.round(plan.monthlyPriceInr / Math.max(1, activeMembersCount));

          return (
            <Card
              key={plan.id}
              className={`p-6 rounded-3xl transition-all relative flex flex-col justify-between ${
                isCurrent
                  ? 'border-2 border-indigo-600 shadow-xl bg-white dark:bg-[#111C30]'
                  : 'border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#111C30]/70 hover:border-slate-300'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    Current Active Plan
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{plan.name}</h3>
                  <p className="text-xs text-slate-500 min-h-[32px]">{plan.description}</p>
                </div>

                {/* Price Display */}
                <div className="pt-2 pb-1 border-y border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                      {plan.monthlyPriceInr === 0 ? 'Free' : `₹${plan.monthlyPriceInr}`}
                    </span>
                    {plan.monthlyPriceInr > 0 && (
                      <span className="text-xs text-slate-400 font-medium">/ month (simulated)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {plan.monthlyPriceInr === 0
                      ? 'Zero cost for personal use'
                      : `~₹${costPerActiveSeat}/month per current active seat`}
                  </p>
                </div>

                {/* Seat Capacity Badge */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span>Seat Capacity</span>
                    </span>
                    <span className="tabular-nums">Up to {plan.maxActiveSeats} Seats</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Pending invitations strictly hold seats to prevent quota overflow.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Included Features
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                {isCurrent ? (
                  <Button disabled className="w-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Active Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={!canAccommodate}
                    variant={canAccommodate ? 'primary' : 'outline'}
                    className={`w-full text-xs font-bold ${
                      canAccommodate
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {!canAccommodate
                      ? `Exceeds Capacity (${occupiedSeats}/${plan.maxActiveSeats})`
                      : plan.monthlyPriceInr > currentFamily.members.length * 100
                      ? `Upgrade to ${plan.name}`
                      : `Switch to ${plan.name}`}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
