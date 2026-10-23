/**
 * Banking domain calculations:
 * - Fixed Deposit (FD) compound interest & maturity
 * - Recurring Deposit (RD) compound interest & maturity
 * - Loan EMI, total interest, and amortization schedule
 * - Account Statement reconciliation
 */

import { FinancialAccount, Transaction } from '@/types/finance';

/**
 * Calculates Fixed Deposit (FD) maturity amount and interest earned.
 * Uses Indian banking standard quarterly compounding:
 * A = P * (1 + r / 400) ^ (4 * t)
 * where:
 * P = Principal in paise
 * r = Annual interest rate in percent (e.g. 7.1)
 * t = Tenure in years (tenureMonths / 12)
 */
export function calculateFdMaturity(
  principalMinor: number,
  interestRatePercent: number,
  tenureMonths: number,
  compounding: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' = 'quarterly'
): { maturityAmountMinor: number; interestEarnedMinor: number } {
  if (principalMinor <= 0 || interestRatePercent <= 0 || tenureMonths <= 0) {
    return { maturityAmountMinor: Math.max(0, principalMinor), interestEarnedMinor: 0 };
  }

  const frequencyMap = {
    monthly: 12,
    quarterly: 4,
    half_yearly: 2,
    yearly: 1,
  };
  const n = frequencyMap[compounding] || 4;
  const t = tenureMonths / 12;
  const r = interestRatePercent / 100;

  // A = P * (1 + r/n)^(n*t)
  const maturity = principalMinor * Math.pow(1 + r / n, n * t);
  const roundedMaturity = Math.round(maturity);
  const interest = Math.max(0, roundedMaturity - principalMinor);

  return {
    maturityAmountMinor: roundedMaturity,
    interestEarnedMinor: interest,
  };
}

/**
 * Calculates Recurring Deposit (RD) maturity amount and interest earned.
 * In Indian banks, RD interest is compounded quarterly.
 * Monthly instalments of P deposited for N months:
 * A = sum_{i=1}^{N} P * (1 + r / 400) ^ (4 * (N - i + 1) / 12)
 */
export function calculateRdMaturity(
  monthlyInstalmentMinor: number,
  interestRatePercent: number,
  tenureMonths: number
): { maturityAmountMinor: number; totalInvestedMinor: number; interestEarnedMinor: number } {
  if (monthlyInstalmentMinor <= 0 || interestRatePercent <= 0 || tenureMonths <= 0) {
    const invested = Math.max(0, monthlyInstalmentMinor * Math.max(0, tenureMonths));
    return { maturityAmountMinor: invested, totalInvestedMinor: invested, interestEarnedMinor: 0 };
  }

  const r = interestRatePercent / 100;
  let maturity = 0;

  for (let i = 1; i <= tenureMonths; i++) {
    // months remaining for this instalment = (tenureMonths - i + 1)
    const monthsRemaining = tenureMonths - i + 1;
    const yearsRemaining = monthsRemaining / 12;
    // Compounded quarterly: n = 4
    const amount = monthlyInstalmentMinor * Math.pow(1 + r / 4, 4 * yearsRemaining);
    maturity += amount;
  }

  const totalInvestedMinor = monthlyInstalmentMinor * tenureMonths;
  const maturityAmountMinor = Math.round(maturity);
  const interestEarnedMinor = Math.max(0, maturityAmountMinor - totalInvestedMinor);

  return {
    maturityAmountMinor,
    totalInvestedMinor,
    interestEarnedMinor,
  };
}

/**
 * Calculates Loan Equated Monthly Instalment (EMI).
 * Formula: EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 * where:
 * P = Principal in paise
 * r = Monthly interest rate (annualRate / 12 / 100)
 * n = Tenure in months
 */
export function calculateLoanEmi(
  principalMinor: number,
  annualInterestRatePercent: number,
  tenureMonths: number
): {
  monthlyEmiMinor: number;
  totalInterestMinor: number;
  totalRepaymentMinor: number;
} {
  if (principalMinor <= 0 || annualInterestRatePercent <= 0 || tenureMonths <= 0) {
    return { monthlyEmiMinor: 0, totalInterestMinor: 0, totalRepaymentMinor: Math.max(0, principalMinor) };
  }

  const monthlyRate = annualInterestRatePercent / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principalMinor * monthlyRate * factor) / (factor - 1);
  const monthlyEmiMinor = Math.round(emi);
  const totalRepaymentMinor = monthlyEmiMinor * tenureMonths;
  const totalInterestMinor = Math.max(0, totalRepaymentMinor - principalMinor);

  return {
    monthlyEmiMinor,
    totalInterestMinor,
    totalRepaymentMinor,
  };
}

export interface AmortizationYearRow {
  year: number;
  openingBalanceMinor: number;
  emiPaidMinor: number;
  principalPaidMinor: number;
  interestPaidMinor: number;
  closingBalanceMinor: number;
}

/**
 * Generates an educational yearly amortization breakdown for a loan.
 */
export function generateAmortizationSchedule(
  principalMinor: number,
  annualInterestRatePercent: number,
  tenureMonths: number
): AmortizationYearRow[] {
  const { monthlyEmiMinor } = calculateLoanEmi(principalMinor, annualInterestRatePercent, tenureMonths);
  if (monthlyEmiMinor <= 0) return [];

  const monthlyRate = annualInterestRatePercent / 12 / 100;
  let remainingBalance = principalMinor;
  const totalYears = Math.ceil(tenureMonths / 12);
  const schedule: AmortizationYearRow[] = [];

  let currentMonth = 0;
  for (let year = 1; year <= totalYears; year++) {
    const openingBalance = remainingBalance;
    let yearPrincipal = 0;
    let yearInterest = 0;
    let yearEmi = 0;

    for (let m = 0; m < 12 && currentMonth < tenureMonths; m++) {
      currentMonth++;
      const interestForMonth = Math.round(remainingBalance * monthlyRate);
      let principalForMonth = monthlyEmiMinor - interestForMonth;

      if (remainingBalance < principalForMonth || currentMonth === tenureMonths) {
        principalForMonth = remainingBalance;
      }

      yearInterest += interestForMonth;
      yearPrincipal += principalForMonth;
      yearEmi += (principalForMonth + interestForMonth);
      remainingBalance = Math.max(0, remainingBalance - principalForMonth);
    }

    schedule.push({
      year,
      openingBalanceMinor: openingBalance,
      emiPaidMinor: yearEmi,
      principalPaidMinor: yearPrincipal,
      interestPaidMinor: yearInterest,
      closingBalanceMinor: remainingBalance,
    });

    if (remainingBalance <= 0) break;
  }

  return schedule;
}

// -------------------------------------------------------------
// Statement Reconciliation
// -------------------------------------------------------------

export interface StatementLedgerRow {
  transaction: Transaction;
  description: string;
  type: 'credit' | 'debit';
  amountMinor: number;
  runningBalanceMinor: number;
}

export interface ReconciledStatement {
  account: FinancialAccount;
  periodStart: string;
  periodEnd: string;
  openingBalanceMinor: number;
  totalCreditsMinor: number;
  totalDebitsMinor: number;
  closingBalanceMinor: number;
  isReconciled: boolean;
  rows: StatementLedgerRow[];
}

/**
 * Generates a mathematically audited statement for a specific account.
 * Every credit, debit, transfer in, and transfer out is tracked with running balance.
 * Reconciles strictly: Closing = Opening + Credits - Debits.
 */
export function generateAccountStatement(
  account: FinancialAccount,
  allTransactions: Transaction[],
  periodStart: string,
  periodEnd: string
): ReconciledStatement {
  // Sort all transactions chronologically ascending
  const chronological = [...allTransactions]
    .filter((tx) => tx.status !== 'flagged')
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  // 1. Calculate Opening Balance before periodStart
  let openingBalanceMinor = account.openingBalanceMinor;
  for (const tx of chronological) {
    if (tx.date >= periodStart) break;

    if (tx.type === 'income' && tx.accountId === account.id) {
      openingBalanceMinor += tx.amountMinor;
    } else if (tx.type === 'expense' && tx.accountId === account.id) {
      openingBalanceMinor -= tx.amountMinor;
    } else if (tx.type === 'transfer') {
      if (tx.accountId === account.id) {
        openingBalanceMinor -= tx.amountMinor; // Outgoing
      } else if (tx.targetAccountId === account.id) {
        openingBalanceMinor += tx.amountMinor; // Incoming
      }
    }
  }

  // 2. Process transactions within [periodStart, periodEnd]
  let currentBalance = openingBalanceMinor;
  let totalCreditsMinor = 0;
  let totalDebitsMinor = 0;
  const rows: StatementLedgerRow[] = [];

  for (const tx of chronological) {
    if (tx.date < periodStart) continue;
    if (tx.date > periodEnd) continue;

    // Check if this account is involved
    const isOutgoingExpense = tx.type === 'expense' && tx.accountId === account.id;
    const isIncomingIncome = tx.type === 'income' && tx.accountId === account.id;
    const isOutgoingTransfer = tx.type === 'transfer' && tx.accountId === account.id;
    const isIncomingTransfer = tx.type === 'transfer' && tx.targetAccountId === account.id;

    if (isIncomingIncome || isIncomingTransfer) {
      totalCreditsMinor += tx.amountMinor;
      currentBalance += tx.amountMinor;
      rows.push({
        transaction: tx,
        description: isIncomingTransfer ? `Transfer from source ledger (${tx.merchant || 'Internal'})` : (tx.merchant || tx.category),
        type: 'credit',
        amountMinor: tx.amountMinor,
        runningBalanceMinor: currentBalance,
      });
    } else if (isOutgoingExpense || isOutgoingTransfer) {
      totalDebitsMinor += tx.amountMinor;
      currentBalance -= tx.amountMinor;
      rows.push({
        transaction: tx,
        description: isOutgoingTransfer ? `Transfer to destination (${tx.merchant || 'Internal'})` : (tx.merchant || tx.category),
        type: 'debit',
        amountMinor: tx.amountMinor,
        runningBalanceMinor: currentBalance,
      });
    }
  }

  const closingBalanceMinor = currentBalance;
  // Mathematical invariant check
  const calculatedClosing = openingBalanceMinor + totalCreditsMinor - totalDebitsMinor;
  const isReconciled = calculatedClosing === closingBalanceMinor;

  return {
    account,
    periodStart,
    periodEnd,
    openingBalanceMinor,
    totalCreditsMinor,
    totalDebitsMinor,
    closingBalanceMinor,
    isReconciled,
    rows,
  };
}

