export interface GoalMetrics {
  totalTargetMinor: number;
  totalSavedMinor: number;
  totalRemainingMinor: number;
  overallProgressPercent: number;
  activeGoalsCount: number;
}

export function calculateMonthsRemaining(targetDateStr: string, fromDateStr: string = '2026-10-15'): number {
  const [ty, tm, td] = targetDateStr.split('-').map(Number);
  const [fy, fm, fd] = fromDateStr.split('-').map(Number);

  const months = (ty - fy) * 12 + (tm - fm);
  return Math.max(1, months);
}

export function calculateRequiredMonthlyContribution(
  targetAmountMinor: number,
  currentAmountMinor: number,
  monthsRemaining: number
): number {
  const remainingMinor = Math.max(0, targetAmountMinor - currentAmountMinor);
  if (monthsRemaining <= 0 || remainingMinor <= 0) return 0;
  return Math.ceil(remainingMinor / monthsRemaining);
}

/**
 * Deterministic Future Value Calculation with Compound Monthly Contributions
 * FV = P * (1 + r)^n + PMT * [ ((1 + r)^n - 1) / r ]
 */
export function calculateFutureValueWithReturn(
  principalMinor: number,
  monthlyContributionMinor: number,
  months: number,
  annualReturnPercent: number
): { futureValueMinor: number; totalContributedMinor: number; interestEarnedMinor: number } {
  const totalContributedMinor = principalMinor + monthlyContributionMinor * months;

  if (annualReturnPercent <= 0) {
    return {
      futureValueMinor: totalContributedMinor,
      totalContributedMinor,
      interestEarnedMinor: 0,
    };
  }

  const monthlyRate = annualReturnPercent / 100 / 12;
  const growthFactor = Math.pow(1 + monthlyRate, months);

  const fvPrincipal = principalMinor * growthFactor;
  const fvContributions =
    monthlyContributionMinor > 0
      ? monthlyContributionMinor * ((growthFactor - 1) / monthlyRate) * (1 + monthlyRate)
      : 0;

  const futureValueMinor = Math.round(fvPrincipal + fvContributions);
  const interestEarnedMinor = Math.max(0, futureValueMinor - totalContributedMinor);

  return {
    futureValueMinor,
    totalContributedMinor,
    interestEarnedMinor,
  };
}

/**
 * Solves for months required to reach target given monthly contribution
 */
export function calculateMonthsToTarget(
  targetAmountMinor: number,
  currentAmountMinor: number,
  monthlyContributionMinor: number,
  annualReturnPercent: number = 0
): { months: number; achievableDate: string } {
  const neededMinor = Math.max(0, targetAmountMinor - currentAmountMinor);
  if (neededMinor <= 0) {
    return { months: 0, achievableDate: '2026-10-15' };
  }
  if (monthlyContributionMinor <= 0) {
    return { months: 999, achievableDate: 'Never (zero contribution)' };
  }

  let months = 0;
  if (annualReturnPercent <= 0) {
    months = Math.ceil(neededMinor / monthlyContributionMinor);
  } else {
    // Step-by-step compound monthly simulation (max 600 months = 50 years)
    let balance = currentAmountMinor;
    const monthlyRate = annualReturnPercent / 100 / 12;
    while (balance < targetAmountMinor && months < 600) {
      balance = (balance + monthlyContributionMinor) * (1 + monthlyRate);
      months++;
    }
  }

  // Project date from 2026-10-15
  const projected = new Date(2026, 9, 15);
  projected.setMonth(projected.getMonth() + months);
  const y = projected.getFullYear();
  const m = String(projected.getMonth() + 1).padStart(2, '0');
  const d = String(projected.getDate()).padStart(2, '0');

  return {
    months,
    achievableDate: `${y}-${m}-${d}`,
  };
}

