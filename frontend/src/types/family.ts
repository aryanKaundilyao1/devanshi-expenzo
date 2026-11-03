/**
 * EXPENZO — Family Finance, Seat-Based Plans & Holdings Analytics Types
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

export type FamilyRole = 'owner' | 'admin' | 'member';
export type FamilyMemberStatus = 'active' | 'suspended';
export type FamilyInvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
export type FamilyPlanId = 'personal' | 'family' | 'family_plus';

export interface FamilyPlan {
  id: FamilyPlanId;
  name: string;
  maxActiveSeats: number;
  monthlyPriceInr: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: FamilyRole;
  status: FamilyMemberStatus;
  joinedAt: string;
  knownMonthlyIncomeMinor?: number; // In minor paise (when disclosed)
  allocatedBudgetMinor?: number;
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  inviterId: string;
  inviterName?: string;
  email: string;
  role: 'member' | 'admin';
  status: FamilyInvitationStatus;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface FamilyWorkspace {
  id: string;
  name: string;
  ownerId: string;
  planId: FamilyPlanId;
  currency: 'INR';
  createdAt: string;
  updatedAt: string;
  members: FamilyMember[];
  invitations: FamilyInvitation[];
}

export interface SharedExpenseAllocation {
  id: string;
  transactionId: string;
  familyId: string;
  memberUserId: string;
  allocatedAmountMinor: number; // In paise
  splitPercentage?: number;
  allocationMethod: 'equal' | 'percentage' | 'custom_exact' | 'sole_member';
  notes?: string;
  createdAt: string;
}

export interface HouseholdGoal {
  id: string;
  familyId: string;
  createdBy: string;
  title: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  targetDate: string; // YYYY-MM-DD
  category: 'emergency' | 'vacation' | 'home' | 'education' | 'vehicle' | 'retirement' | 'other';
  status: 'in_progress' | 'achieved' | 'paused';
  createdAt: string;
  updatedAt: string;
  contributions?: {
    memberUserId: string;
    memberName: string;
    amountMinor: number;
    date: string;
  }[];
}

export interface SeatUtilizationSummary {
  plan: FamilyPlan;
  maxSeats: number;
  activeMembersCount: number;
  pendingInvitationsCount: number;
  occupiedSeats: number; // activeMembersCount + pendingInvitationsCount
  availableSeats: number;
  utilizationPercentage: number;
  hasAvailableSeat: boolean;
}

export interface SeatOptimizationRecommendation {
  currentPlan: FamilyPlan;
  occupiedSeats: number;
  availableSeats: number;
  currentMonthlyCostInr: number;
  currentCostPerActiveSeatInr: number;
  recommendedPlan: FamilyPlan | null;
  recommendedMonthlyCostInr?: number;
  projectedMonthlySavingsInr?: number;
  reasoning: string;
  isSimulated: boolean;
}

export interface MemberFinancialMetric {
  memberUserId: string;
  memberName: string;
  email: string;
  role: FamilyRole;
  incomeMinor: number;
  totalDirectExpensesMinor: number;
  totalSharedExpensesMinor: number;
  totalAttributableExpensesMinor: number; // direct + shared
  netSavingsMinor: number; // income - attributable
  savingsRatePercent: number | null; // (netSavings / income) * 100 only if income > 0
  discretionarySpendingMinor: number;
  discretionaryRatioPercent: number | null; // discretionary / income * 100
  expenseContributionPercent: number; // attributable / familyTotalExpenses * 100
  categorySpending: Record<string, number>; // categoryName -> minor paise
}

export interface FamilyAggregateMetrics {
  period: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  periodLabel: string;
  totalFamilyIncomeMinor: number;
  totalFamilyExpensesMinor: number;
  periodNetSavingsMinor: number;
  totalSharedExpensesMinor: number;
  familySavingsRatePercent: number | null;
  budgetUtilizationPercent: number;
  memberMetrics: MemberFinancialMetric[];
  comparativeHighlights: {
    highestSaverAmount?: { memberName: string; amountMinor: number };
    highestSavingsRate?: { memberName: string; ratePercent: number };
    lowestDiscretionaryRatio?: { memberName: string; ratioPercent: number };
    largestBudgetOverrun?: { category: string; overrunMinor: number };
    highestExpenseShare?: { memberName: string; sharePercent: number };
  };
}

export interface PortfolioValuationSnapshot {
  id: string;
  userId: string;
  snapshotDate: string; // YYYY-MM-DD
  cashMinor: number;
  investmentsMinor: number;
  liabilitiesMinor: number;
  netWorthMinor: number; // (cash + investments) - liabilities
  dataProvenance: 'user_entry' | 'demo_seeded' | 'ibm_dataset';
  recordedAt: string;
}

export interface ExpenditureHoldingsSeriesPoint {
  date: string; // YYYY-MM
  monthLabel: string; // e.g. "Oct 2026"
  // Flows (Period Measures)
  incomeRupees: number;
  expenseRupees: number;
  netSavingsRupees: number;
  // Point-in-Time Balances (Snapshots)
  cashRupees: number;
  investmentsRupees: number;
  totalAssetsRupees: number;
  liabilitiesRupees: number;
  netWorthRupees: number;
  isValuationAvailable: boolean;
}

export interface IBMTransactionRecord {
  User: number | string;
  Card: number | string;
  Year: number;
  Month: number;
  Day: number;
  Time: string;
  Amount: string | number; // e.g. "$134.20"
  UseChip: string;
  MerchantName: string;
  MerchantCity: string;
  MerchantState: string;
  Zip?: string | number;
  MCC: number | string;
  Errors?: string;
  IsFraud?: string;
}

export interface DatasetBatchMetadata {
  id: string;
  batchName: string;
  sourceName: string;
  totalRecords: number;
  importedRecords: number;
  errorRecords: number;
  deduplicatedCount: number;
  status: 'processing' | 'completed' | 'failed';
  dateRange: { start: string; end: string };
  provenance: string;
  importedAt: string;
}

