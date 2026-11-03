/**
 * EXPENZO — Seat-Based Family Plan Configuration
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import { FamilyPlan, FamilyPlanId } from '@/types/family';

export const FAMILY_PLANS: Record<FamilyPlanId, FamilyPlan> = {
  personal: {
    id: 'personal',
    name: 'Personal',
    maxActiveSeats: 1,
    monthlyPriceInr: 0,
    description: 'Single-user ledger for personal financial tracking and AI queries.',
    features: [
      '1 active personal seat',
      'Unlimited accounts & ledger entries',
      'Basic budget tracking & AI chat',
      'Personal portfolio valuation',
    ],
    isActive: true,
  },
  family: {
    id: 'family',
    name: 'Family',
    maxActiveSeats: 4,
    monthlyPriceInr: 499,
    description: 'Shared household workspace with member comparisons and seat optimization.',
    features: [
      'Up to 4 active member seats',
      'Pending invitation seat-reservation guarantee',
      'Shared expense splitting & allocations',
      'Cross-member spending comparison charts',
      'Household savings goals & milestones',
      'Automated seat optimization advisor',
    ],
    isActive: true,
  },
  family_plus: {
    id: 'family_plus',
    name: 'Family Plus',
    maxActiveSeats: 8,
    monthlyPriceInr: 999,
    description: 'Comprehensive financial planning for extended and multi-generational households.',
    features: [
      'Up to 8 active member seats',
      'All Family tier capabilities',
      'Multi-generational asset & holdings analytics',
      'Custom allocation weighting & split rules',
      'Priority AI financial scenario modeling',
      'Historical valuation snapshot exports',
    ],
    isActive: true,
  },
};

export const DEFAULT_FAMILY_PLAN_ID: FamilyPlanId = 'family';

export function getPlanConfig(planId: string): FamilyPlan {
  if (planId in FAMILY_PLANS) {
    return FAMILY_PLANS[planId as FamilyPlanId];
  }
  return FAMILY_PLANS.family;
}

export function getAllPlans(): FamilyPlan[] {
  return Object.values(FAMILY_PLANS);
}
