import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  calculateMonthsRemaining,
  calculateRequiredMonthlyContribution,
  calculateFutureValueWithReturn,
  calculateMonthsToTarget,
} from '@/features/planner/utils/plannerCalculations';
import { FinancialPlannerPage } from '@/features/planner/pages/FinancialPlannerPage';
import { GoalDetailPage } from '@/features/planner/pages/GoalDetailPage';
import { SimulatorPage } from '@/features/planner/pages/SimulatorPage';

describe('Phase 7C: Financial Planner, Goals & What-If Simulator', () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
  });

  it('performs Goals CRUD and records contributions preserving ledger cash invariants', () => {
    const store = useFinanceStore.getState();
    const initialGoalsCount = store.goals.length;
    const initialLiquidCash = store.getTotalLiquidCash();

    // 1. Create Goal
    store.upsertGoal({
      id: 'goal_emergency_fund',
      title: '6-Month Emergency Buffer',
      targetAmountMinor: 10000000, // ₹1,00,000
      currentAmountMinor: 2000000, // ₹20,000
      targetDate: '2027-10-15',
      category: 'emergency',
      monthlyContributionTargetMinor: 666667,
    });

    const goalsAfterAdd = useFinanceStore.getState().goals;
    expect(goalsAfterAdd.length).toBe(initialGoalsCount + 1);

    // 2. Record Contribution
    const contribRes = store.recordGoalContribution('goal_emergency_fund', 500000, 'acct_hdfc', 'Bonus savings');
    expect(contribRes.success).toBe(true);

    const updatedGoal = useFinanceStore.getState().goals.find((g) => g.id === 'goal_emergency_fund');
    expect(updatedGoal?.currentAmountMinor).toBe(2500000); // 20k + 5k = 25k
    expect(updatedGoal?.contributions?.length).toBe(1);

    // CRITICAL FINTECH INVARIANT (PRD 7C.4): Goal contributions are mental allocations and do not subtract cash automatically
    const cashAfterContrib = useFinanceStore.getState().getTotalLiquidCash();
    expect(cashAfterContrib).toBe(initialLiquidCash);

    // 3. Delete Goal
    store.deleteGoal('goal_emergency_fund');
    const goalsAfterDelete = useFinanceStore.getState().goals;
    expect(goalsAfterDelete.length).toBe(initialGoalsCount);
    expect(goalsAfterDelete.some((g) => g.id === 'goal_emergency_fund')).toBe(false);
  });

  it('calculates months remaining and required monthly contribution mathematically', () => {
    // From 2026-10-15 to 2027-10-15 is exactly 12 months
    const months = calculateMonthsRemaining('2027-10-15', '2026-10-15');
    expect(months).toBe(12);

    // Target ₹60,000 (6,000,000 paise), Current ₹12,000 (1,200,000 paise) -> Remaining ₹48,000 (4,800,000 paise)
    // 4,800,000 / 12 = 400,000 paise = ₹4,000/month
    const reqMonthly = calculateRequiredMonthlyContribution(6000000, 1200000, months);
    expect(reqMonthly).toBe(400000);
  });

  it('computes future value compounding with deterministic accuracy', () => {
    // 0% annual return (pure cash)
    // Principal ₹10,000 (1,000,000 paise), Monthly ₹2,000 (200,000 paise) for 12 months
    // Total = 10k + (2k * 12) = 34k (3,400,000 paise)
    const fvCash = calculateFutureValueWithReturn(1000000, 200000, 12, 0);
    expect(fvCash.futureValueMinor).toBe(3400000);
    expect(fvCash.interestEarnedMinor).toBe(0);

    // 12% annual return (1% monthly compounding)
    const fvComp = calculateFutureValueWithReturn(1000000, 200000, 12, 12);
    expect(fvComp.futureValueMinor).toBeGreaterThan(3400000);
    expect(fvComp.interestEarnedMinor).toBeGreaterThan(0);
  });

  it('calculates months required to achieve target corpus', () => {
    // Target ₹50,000, Current ₹10,000, Monthly ₹4,000 @ 0% -> Needs 10 months
    const res = calculateMonthsToTarget(5000000, 1000000, 400000, 0);
    expect(res.months).toBe(10);
  });

  it('renders Financial Planner page with goals and action buttons', () => {
    render(
      <MemoryRouter>
        <FinancialPlannerPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Financial Planner & Goals/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Goal Targets/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Accumulated/i)).toBeInTheDocument();
    expect(screen.getByText('MacBook Pro Upgrade')).toBeInTheDocument();
    expect(screen.getByText(/What-If Simulator/i)).toBeInTheDocument();
  });

  it('renders Goal Detail page with progress and projection chart', () => {
    render(
      <MemoryRouter initialEntries={['/app/financial-planner/goals/goal_laptop']}>
        <Routes>
          <Route path="/app/financial-planner/goals/:id" element={<GoalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('MacBook Pro Upgrade')).toBeInTheDocument();
    expect(screen.getByText(/Target Milestone Accumulation Curve/i)).toBeInTheDocument();
    expect(screen.getByText(/Recorded Allocations & History/i)).toBeInTheDocument();
  });

  it('renders Simulator page with scenario comparisons', () => {
    render(
      <MemoryRouter>
        <SimulatorPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/What-If Scenario Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Comparative Compounding Scenarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Pure Cash \/ Bank Savings/i)).toBeInTheDocument();
    expect(screen.getByText(/Diversified Equity Mutual Funds \(SIP\)/i)).toBeInTheDocument();
  });
});

