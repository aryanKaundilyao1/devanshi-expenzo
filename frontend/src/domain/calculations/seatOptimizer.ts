/**
 * EXPENZO — Seat Utilization & Optimization Engine
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 *
 * Rules:
 * - Pending invitations strictly reserve seats to prevent over-subscription.
 * - Occupied Seats = Active Members + Pending Invitations.
 * - Available Seats = max(0, Max Plan Seats - Occupied Seats).
 * - Seat Utilisation = (Occupied Seats / Max Plan Seats) * 100.
 * - Cost Per Active Seat = Monthly Plan Cost / max(1, Active Members).
 * - Recommender: Identifies the lowest-cost plan that satisfies Occupied Seats <= Max Plan Seats.
 * - All financial pricing and projected savings are explicitly designated as simulated demonstration values.
 */

import { FamilyPlan, SeatUtilizationSummary, SeatOptimizationRecommendation } from '@/types/family';
import { FAMILY_PLANS, getPlanConfig, getAllPlans } from '@/features/family/config/plans';

/**
 * Calculates current seat utilization metrics for a family workspace.
 */
export function calculateSeatUtilization(params: {
  planId: string;
  activeMembersCount: number;
  pendingInvitationsCount: number;
}): SeatUtilizationSummary {
  const plan = getPlanConfig(params.planId);
  const maxSeats = plan.maxActiveSeats;
  const occupiedSeats = params.activeMembersCount + params.pendingInvitationsCount;
  const availableSeats = Math.max(0, maxSeats - occupiedSeats);
  const utilizationPercentage = Number(((occupiedSeats / maxSeats) * 100).toFixed(1));
  const hasAvailableSeat = occupiedSeats < maxSeats;

  return {
    plan,
    maxSeats,
    activeMembersCount: params.activeMembersCount,
    pendingInvitationsCount: params.pendingInvitationsCount,
    occupiedSeats,
    availableSeats,
    utilizationPercentage,
    hasAvailableSeat,
  };
}

/**
 * Evaluates configured plans and produces an actionable, non-destructive optimization recommendation.
 */
export function evaluateSeatOptimization(params: {
  planId: string;
  activeMembersCount: number;
  pendingInvitationsCount: number;
}): SeatOptimizationRecommendation {
  const utilization = calculateSeatUtilization(params);
  const currentPlan = utilization.plan;
  const occupied = utilization.occupiedSeats;

  // Active seats for cost-per-seat metric (minimum 1 to avoid division by zero)
  const activeMembersForCalc = Math.max(1, params.activeMembersCount);
  const currentMonthlyCost = currentPlan.monthlyPriceInr;
  const currentCostPerActiveSeatInr = Number((currentMonthlyCost / activeMembersForCalc).toFixed(2));

  // Inspect all available configured plans sorted by ascending price
  const candidatePlans = getAllPlans().sort((a, b) => a.monthlyPriceInr - b.monthlyPriceInr);

  // Find the cheapest plan that can comfortably accommodate the current occupied seats
  const cheapestAdequatePlan = candidatePlans.find((p) => p.maxActiveSeats >= occupied) || currentPlan;

  // Check if a downgrade recommendation is applicable (saves money while fitting all members)
  if (cheapestAdequatePlan.id !== currentPlan.id && cheapestAdequatePlan.monthlyPriceInr < currentPlan.monthlyPriceInr) {
    const projectedSavings = currentPlan.monthlyPriceInr - cheapestAdequatePlan.monthlyPriceInr;
    return {
      currentPlan,
      occupiedSeats: occupied,
      availableSeats: utilization.availableSeats,
      currentMonthlyCostInr: currentMonthlyCost,
      currentCostPerActiveSeatInr,
      recommendedPlan: cheapestAdequatePlan,
      recommendedMonthlyCostInr: cheapestAdequatePlan.monthlyPriceInr,
      projectedMonthlySavingsInr: projectedSavings,
      reasoning: `Your household currently occupies ${occupied} seat${occupied === 1 ? '' : 's'} (${params.activeMembersCount} active, ${params.pendingInvitationsCount} pending). The '${cheapestAdequatePlan.name}' plan supports up to ${cheapestAdequatePlan.maxActiveSeats} seats and would save ₹${projectedSavings}/month (simulated) without impacting any active or invited members.`,
      isSimulated: true,
    };
  }

  // Check if at 100% capacity
  if (!utilization.hasAvailableSeat) {
    const upgradeCandidate = candidatePlans.find(
      (p) => p.maxActiveSeats > currentPlan.maxActiveSeats && p.monthlyPriceInr > currentPlan.monthlyPriceInr
    );
    if (upgradeCandidate) {
      return {
        currentPlan,
        occupiedSeats: occupied,
        availableSeats: 0,
        currentMonthlyCostInr: currentMonthlyCost,
        currentCostPerActiveSeatInr,
        recommendedPlan: upgradeCandidate,
        recommendedMonthlyCostInr: upgradeCandidate.monthlyPriceInr,
        projectedMonthlySavingsInr: 0,
        reasoning: `Your workspace has reached 100% capacity (${occupied}/${currentPlan.maxActiveSeats} seats occupied). To invite additional members, consider upgrading to the '${upgradeCandidate.name}' plan (up to ${upgradeCandidate.maxActiveSeats} seats).`,
        isSimulated: true,
      };
    }
  }

  // Already on the optimal tier
  return {
    currentPlan,
    occupiedSeats: occupied,
    availableSeats: utilization.availableSeats,
    currentMonthlyCostInr: currentMonthlyCost,
    currentCostPerActiveSeatInr,
    recommendedPlan: null,
    reasoning: `Your current '${currentPlan.name}' plan is optimal for your household (${occupied}/${currentPlan.maxActiveSeats} seats occupied, ${utilization.availableSeats} available). No tier changes recommended.`,
    isSimulated: true,
  };
}
