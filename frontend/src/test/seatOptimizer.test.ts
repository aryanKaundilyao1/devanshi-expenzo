/**
 * EXPENZO — Seat Optimization & Plan System Unit Tests
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSeatUtilization,
  evaluateSeatOptimization,
} from '@/domain/calculations/seatOptimizer';
import { FAMILY_PLANS, getPlanConfig } from '@/features/family/config/plans';

describe('Seat Utilization & Optimization Engine', () => {
  describe('Plan Configuration', () => {
    it('defines Personal (1 seat), Family (4 seats), and Family Plus (8 seats)', () => {
      expect(FAMILY_PLANS.personal.maxActiveSeats).toBe(1);
      expect(FAMILY_PLANS.personal.monthlyPriceInr).toBe(0);

      expect(FAMILY_PLANS.family.maxActiveSeats).toBe(4);
      expect(FAMILY_PLANS.family.monthlyPriceInr).toBe(499);

      expect(FAMILY_PLANS.family_plus.maxActiveSeats).toBe(8);
      expect(FAMILY_PLANS.family_plus.monthlyPriceInr).toBe(999);
    });

    it('gracefully falls back to Family plan for unrecognized plan keys', () => {
      const fallback = getPlanConfig('enterprise_custom');
      expect(fallback.id).toBe('family');
      expect(fallback.maxActiveSeats).toBe(4);
    });
  });

  describe('calculateSeatUtilization (Pending Invites Reserve Seats)', () => {
    it('calculates available seats when active + pending is under max capacity', () => {
      const res = calculateSeatUtilization({
        planId: 'family', // 4 seats
        activeMembersCount: 2,
        pendingInvitationsCount: 1, // 1 pending invite reserves 3rd seat
      });

      expect(res.maxSeats).toBe(4);
      expect(res.activeMembersCount).toBe(2);
      expect(res.pendingInvitationsCount).toBe(1);
      expect(res.occupiedSeats).toBe(3);
      expect(res.availableSeats).toBe(1);
      expect(res.utilizationPercentage).toBe(75.0);
      expect(res.hasAvailableSeat).toBe(true);
    });

    it('identifies 100% capacity when pending invites fill remaining seats', () => {
      const res = calculateSeatUtilization({
        planId: 'family', // 4 seats
        activeMembersCount: 3,
        pendingInvitationsCount: 1, // 3 + 1 = 4 (Full!)
      });

      expect(res.occupiedSeats).toBe(4);
      expect(res.availableSeats).toBe(0);
      expect(res.utilizationPercentage).toBe(100.0);
      expect(res.hasAvailableSeat).toBe(false);
    });

    it('clamps available seats at zero if occupied exceeds max seats', () => {
      const res = calculateSeatUtilization({
        planId: 'personal', // 1 seat
        activeMembersCount: 1,
        pendingInvitationsCount: 1, // 2 occupied
      });

      expect(res.availableSeats).toBe(0);
      expect(res.hasAvailableSeat).toBe(false);
    });
  });

  describe('evaluateSeatOptimization (Academic Plan Recommender)', () => {
    it('recommends downgrading from Family Plus (8 seats) to Family (4 seats) when only 3 seats are occupied', () => {
      const rec = evaluateSeatOptimization({
        planId: 'family_plus', // 8 seats, ₹999/mo
        activeMembersCount: 2,
        pendingInvitationsCount: 1, // 3 total occupied
      });

      expect(rec.currentPlan.id).toBe('family_plus');
      expect(rec.recommendedPlan?.id).toBe('family');
      expect(rec.recommendedMonthlyCostInr).toBe(499);
      // Projected monthly savings = 999 - 499 = ₹500
      expect(rec.projectedMonthlySavingsInr).toBe(500);
      expect(rec.isSimulated).toBe(true);
      expect(rec.reasoning).toContain('save ₹500/month');
    });

    it('recommends upgrading to Family Plus when on Family plan and at 100% capacity', () => {
      const rec = evaluateSeatOptimization({
        planId: 'family', // 4 seats, ₹499/mo
        activeMembersCount: 3,
        pendingInvitationsCount: 1, // 4/4 seats full
      });

      expect(rec.currentPlan.id).toBe('family');
      expect(rec.availableSeats).toBe(0);
      expect(rec.recommendedPlan?.id).toBe('family_plus');
      expect(rec.reasoning).toContain('100% capacity');
      expect(rec.projectedMonthlySavingsInr).toBe(0);
    });

    it('returns null recommended plan when workspace is already on optimal tier', () => {
      const rec = evaluateSeatOptimization({
        planId: 'family', // 4 seats
        activeMembersCount: 2,
        pendingInvitationsCount: 0, // 2 occupied, 2 available
      });

      expect(rec.recommendedPlan).toBeNull();
      expect(rec.reasoning).toContain('optimal');
    });

    it('computes accurate cost per active member seat', () => {
      const rec = evaluateSeatOptimization({
        planId: 'family', // ₹499/mo
        activeMembersCount: 3,
        pendingInvitationsCount: 1,
      });

      // 499 / 3 = 166.33
      expect(rec.currentCostPerActiveSeatInr).toBe(166.33);
    });
  });
});

