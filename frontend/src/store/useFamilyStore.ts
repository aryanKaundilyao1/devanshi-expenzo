/**
 * EXPENZO — Family Financial Management & Workspace State Store
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import { create } from 'zustand';
import {
  FamilyWorkspace,
  FamilyMember,
  FamilyInvitation,
  SharedExpenseAllocation,
  HouseholdGoal,
  DatasetBatchMetadata,
  FamilyPlanId,
} from '@/types/family';
import { getPlanConfig } from '@/features/family/config/plans';
import {
  validateSharedExpenseAllocations,
} from '@/domain/calculations/familyAccounting';
import {
  calculateSeatUtilization,
} from '@/domain/calculations/seatOptimizer';
import {
  mapIBMRecordsToTransactions,
  SEEDED_IBM_TRANSACTION_RECORDS,
} from '@/features/family/services/datasetImporter';
import { useFinanceStore } from './useFinanceStore';

const FAMILY_STORAGE_KEY = 'expenzo-family-store:v1';

// Seeded Initial Household State
const SEED_FAMILY_ID = 'fam-singh-001';

const SEED_MEMBERS: FamilyMember[] = [
  {
    id: 'mem-devanshi-01',
    familyId: SEED_FAMILY_ID,
    userId: 'user-devanshi-01',
    name: 'Devanshi Singh',
    email: 'devanshi@expenzo.local',
    role: 'owner',
    status: 'active',
    joinedAt: '2026-08-01T09:00:00Z',
    knownMonthlyIncomeMinor: 12000000, // ₹1,20,000.00
    allocatedBudgetMinor: 5000000,      // ₹50,000.00
  },
  {
    id: 'mem-aarav-02',
    familyId: SEED_FAMILY_ID,
    userId: 'user-aarav-02',
    name: 'Aarav Singh',
    email: 'aarav@expenzo.local',
    role: 'member',
    status: 'active',
    joinedAt: '2026-08-15T11:30:00Z',
    knownMonthlyIncomeMinor: 4500000,  // ₹45,000.00
    allocatedBudgetMinor: 2500000,      // ₹25,000.00
  },
  {
    id: 'mem-priya-03',
    familyId: SEED_FAMILY_ID,
    userId: 'user-priya-03',
    name: 'Priya Singh',
    email: 'priya@expenzo.local',
    role: 'member',
    status: 'active',
    joinedAt: '2026-09-01T14:15:00Z',
    knownMonthlyIncomeMinor: 7500000,  // ₹75,000.00
    allocatedBudgetMinor: 3500000,      // ₹35,000.00
  },
];

const SEED_INVITATIONS: FamilyInvitation[] = [
  {
    id: 'inv-rohan-04',
    familyId: SEED_FAMILY_ID,
    inviterId: 'user-devanshi-01',
    inviterName: 'Devanshi Singh',
    email: 'rohan.singh@expenzo.local',
    role: 'member',
    status: 'pending', // Reserves the 4th seat!
    token: 'tok_rohan_invitation_2026',
    expiresAt: '2026-11-15T23:59:59Z',
    createdAt: '2026-10-25T10:00:00Z',
  },
];

const SEED_SHARED_ALLOCATIONS: SharedExpenseAllocation[] = [
  // Shared Apartment Rent (₹35,000.00 = 3500000 paise)
  {
    id: 'alloc-rent-1',
    transactionId: 'tx-shared-rent-01',
    familyId: SEED_FAMILY_ID,
    memberUserId: 'user-devanshi-01',
    allocatedAmountMinor: 1500000, // ₹15,000
    splitPercentage: 42.86,
    allocationMethod: 'custom_exact',
    notes: 'Primary earner share',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'alloc-rent-2',
    transactionId: 'tx-shared-rent-01',
    familyId: SEED_FAMILY_ID,
    memberUserId: 'user-priya-03',
    allocatedAmountMinor: 1200000, // ₹12,000
    splitPercentage: 34.28,
    allocationMethod: 'custom_exact',
    notes: 'Secondary room share',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'alloc-rent-3',
    transactionId: 'tx-shared-rent-01',
    familyId: SEED_FAMILY_ID,
    memberUserId: 'user-aarav-02',
    allocatedAmountMinor: 800000, // ₹8,000
    splitPercentage: 22.86,
    allocationMethod: 'custom_exact',
    notes: 'Junior member share',
    createdAt: '2026-10-01T08:00:00Z',
  },
  // Shared Groceries (₹12,000.00 = 1200000 paise)
  {
    id: 'alloc-groc-1',
    transactionId: 'tx-shared-groc-01',
    familyId: SEED_FAMILY_ID,
    memberUserId: 'user-devanshi-01',
    allocatedAmountMinor: 500000, // ₹5,000
    splitPercentage: 41.67,
    allocationMethod: 'custom_exact',
    notes: 'Weekly staples',
    createdAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'alloc-groc-2',
    transactionId: 'tx-shared-groc-01',
    familyId: SEED_FAMILY_ID,
    memberUserId: 'user-priya-03',
    allocatedAmountMinor: 400000, // ₹4,000
    splitPercentage: 33.33,
    allocationMethod: 'custom_exact',
    notes: 'Pantry items',
    createdAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'alloc-groc-3',
    transactionId: 'tx-shared-groc-01',
    familyId: SEED_FAMILY_ID,
    memberUserId: 'user-aarav-02',
    allocatedAmountMinor: 300000, // ₹3,000
    splitPercentage: 25.0,
    allocationMethod: 'custom_exact',
    notes: 'Snacks & beverages',
    createdAt: '2026-10-05T12:00:00Z',
  },
  // High-Speed Fiber Internet (₹1,499.00 = 149900 paise)
  {
    id: 'alloc-net-1',
    transactionId: 'tx-shared-net-01',
    familyId: SEED_FAMILY_ID,
    memberUserId: 'user-devanshi-01',
    allocatedAmountMinor: 50000, // ₹500
    splitPercentage: 33.36,
    allocationMethod: 'equal',
    notes: 'Work-from-home share',
    createdAt: '2026-10-10T15:00:00Z',
  },
  {
    id: 'alloc-net-2',
    transactionId: 'tx-shared-net-01',
    familyId: SEED_FAMILY_ID,
    memberUserId: 'user-priya-03',
    allocatedAmountMinor: 50000, // ₹500
    splitPercentage: 33.36,
    allocationMethod: 'equal',
    notes: 'Equal third',
    createdAt: '2026-10-10T15:00:00Z',
  },
  {
    id: 'alloc-net-3',
    transactionId: 'tx-shared-net-01',
    familyId: SEED_FAMILY_ID,
    memberUserId: 'user-aarav-02',
    allocatedAmountMinor: 49900, // ₹499
    splitPercentage: 33.28,
    allocationMethod: 'equal',
    notes: 'Equal third remainder',
    createdAt: '2026-10-10T15:00:00Z',
  },
];

const SEED_HOUSEHOLD_GOALS: HouseholdGoal[] = [
  {
    id: 'goal-vacation-2027',
    familyId: SEED_FAMILY_ID,
    createdBy: 'user-devanshi-01',
    title: 'Annual Family Vacation (Kashmir)',
    targetAmountMinor: 15000000, // ₹1,50,000
    currentAmountMinor: 9500000,  // ₹95,000 (63.3%)
    targetDate: '2027-04-15',
    category: 'vacation',
    status: 'in_progress',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-10-20T12:00:00Z',
    contributions: [
      { memberUserId: 'user-devanshi-01', memberName: 'Devanshi Singh', amountMinor: 5000000, date: '2026-08-20' },
      { memberUserId: 'user-priya-03', memberName: 'Priya Singh', amountMinor: 3000000, date: '2026-09-10' },
      { memberUserId: 'user-aarav-02', memberName: 'Aarav Singh', amountMinor: 1500000, date: '2026-10-15' },
    ],
  },
  {
    id: 'goal-emergency-fund',
    familyId: SEED_FAMILY_ID,
    createdBy: 'user-devanshi-01',
    title: 'Household Emergency Buffer',
    targetAmountMinor: 20000000, // ₹2,00,000
    currentAmountMinor: 14000000, // ₹1,40,000 (70%)
    targetDate: '2026-12-31',
    category: 'emergency',
    status: 'in_progress',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-10-18T14:00:00Z',
    contributions: [
      { memberUserId: 'user-devanshi-01', memberName: 'Devanshi Singh', amountMinor: 8000000, date: '2026-08-05' },
      { memberUserId: 'user-priya-03', memberName: 'Priya Singh', amountMinor: 4000000, date: '2026-09-02' },
      { memberUserId: 'user-aarav-02', memberName: 'Aarav Singh', amountMinor: 2000000, date: '2026-10-01' },
    ],
  },
];

const SEED_WORKSPACE: FamilyWorkspace = {
  id: SEED_FAMILY_ID,
  name: 'Singh Household Finance',
  ownerId: 'user-devanshi-01',
  planId: 'family', // 4 seats
  currency: 'INR',
  createdAt: '2026-08-01T09:00:00Z',
  updatedAt: '2026-10-25T10:00:00Z',
  members: SEED_MEMBERS,
  invitations: SEED_INVITATIONS,
};

interface FamilyState {
  activeWorkspaceMode: 'personal' | 'family';
  activeFamilyId: string | null;
  families: FamilyWorkspace[];
  sharedAllocations: SharedExpenseAllocation[];
  householdGoals: HouseholdGoal[];
  datasetBatches: DatasetBatchMetadata[];
  isDatasetDemoMode: boolean;

  // Actions
  switchWorkspaceMode: (mode: 'personal' | 'family', familyId?: string) => void;
  createFamilyWorkspace: (name: string, planId?: FamilyPlanId) => FamilyWorkspace;
  inviteMember: (
    familyId: string,
    email: string,
    role?: 'member' | 'admin'
  ) => { success: boolean; invitation?: FamilyInvitation; error?: string };
  revokeInvitation: (invitationId: string) => void;
  acceptInvitation: (invitationId: string) => { success: boolean; error?: string };
  removeMember: (familyId: string, memberUserId: string) => { success: boolean; error?: string };
  changePlan: (familyId: string, newPlanId: FamilyPlanId) => { success: boolean; error?: string };
  allocateSharedExpense: (
    transactionId: string,
    familyId: string,
    allocations: Omit<SharedExpenseAllocation, 'id' | 'createdAt' | 'transactionId' | 'familyId'>[]
  ) => { success: boolean; error?: string };
  addHouseholdGoal: (goal: Omit<HouseholdGoal, 'id' | 'createdAt' | 'updatedAt'>) => HouseholdGoal;
  contributeToHouseholdGoal: (
    goalId: string,
    memberUserId: string,
    memberName: string,
    amountMinor: number
  ) => void;
  importIBMDatasetDemo: () => { success: boolean; count: number; message: string };
  toggleDatasetDemoMode: (enable: boolean) => void;
  resetToInitialFamilyState: () => void;
}

function loadInitialFamilyState() {
  if (typeof window === 'undefined') {
    return {
      activeWorkspaceMode: 'personal' as const,
      activeFamilyId: SEED_FAMILY_ID,
      families: [SEED_WORKSPACE],
      sharedAllocations: SEED_SHARED_ALLOCATIONS,
      householdGoals: SEED_HOUSEHOLD_GOALS,
      datasetBatches: [],
      isDatasetDemoMode: false,
    };
  }

  try {
    const raw = localStorage.getItem(FAMILY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        activeWorkspaceMode: parsed.activeWorkspaceMode || 'personal',
        activeFamilyId: parsed.activeFamilyId || SEED_FAMILY_ID,
        families: parsed.families?.length ? parsed.families : [SEED_WORKSPACE],
        sharedAllocations: parsed.sharedAllocations || SEED_SHARED_ALLOCATIONS,
        householdGoals: parsed.householdGoals || SEED_HOUSEHOLD_GOALS,
        datasetBatches: parsed.datasetBatches || [],
        isDatasetDemoMode: Boolean(parsed.isDatasetDemoMode),
      };
    }
  } catch (e) {
    console.warn('Failed to parse stored family data, using defaults', e);
  }

  return {
    activeWorkspaceMode: 'personal' as const,
    activeFamilyId: SEED_FAMILY_ID,
    families: [SEED_WORKSPACE],
    sharedAllocations: SEED_SHARED_ALLOCATIONS,
    householdGoals: SEED_HOUSEHOLD_GOALS,
    datasetBatches: [],
    isDatasetDemoMode: false,
  };
}

export const useFamilyStore = create<FamilyState>((set, get) => {
  const initialState = loadInitialFamilyState();

  const persistState = (state: Partial<FamilyState>) => {
    try {
      const current = {
        activeWorkspaceMode: get().activeWorkspaceMode,
        activeFamilyId: get().activeFamilyId,
        families: get().families,
        sharedAllocations: get().sharedAllocations,
        householdGoals: get().householdGoals,
        datasetBatches: get().datasetBatches,
        isDatasetDemoMode: get().isDatasetDemoMode,
        ...state,
      };
      localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Error persisting family store to localStorage', e);
    }
  };

  return {
    ...initialState,

    switchWorkspaceMode: (mode, familyId) => {
      set((state) => {
        const nextFamilyId = familyId || state.activeFamilyId || state.families[0]?.id || null;
        const next = { activeWorkspaceMode: mode, activeFamilyId: nextFamilyId };
        persistState(next);
        return next;
      });
    },

    createFamilyWorkspace: (name, planId = 'family') => {
      const newFamily: FamilyWorkspace = {
        id: `fam-${Date.now()}`,
        name: name.trim(),
        ownerId: 'user-devanshi-01',
        planId,
        currency: 'INR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [
          {
            id: `mem-${Date.now()}`,
            familyId: `fam-${Date.now()}`,
            userId: 'user-devanshi-01',
            name: 'Devanshi Singh',
            email: 'devanshi@expenzo.local',
            role: 'owner',
            status: 'active',
            joinedAt: new Date().toISOString(),
            knownMonthlyIncomeMinor: 12000000,
            allocatedBudgetMinor: 5000000,
          },
        ],
        invitations: [],
      };

      set((state) => {
        const next = {
          families: [...state.families, newFamily],
          activeFamilyId: newFamily.id,
          activeWorkspaceMode: 'family' as const,
        };
        persistState(next);
        return next;
      });

      return newFamily;
    },

    inviteMember: (familyId, email, role = 'member') => {
      const cleanEmail = email.trim().toLowerCase();
      const state = get();
      const family = state.families.find((f) => f.id === familyId);
      if (!family) {
        return { success: false, error: 'Family workspace not found.' };
      }

      // Check seat capacity (Rule: Pending invitations reserve seats)
      const activeCount = family.members.filter((m) => m.status === 'active').length;
      const pendingCount = family.invitations.filter((i) => i.status === 'pending').length;
      const utilization = calculateSeatUtilization({
        planId: family.planId,
        activeMembersCount: activeCount,
        pendingInvitationsCount: pendingCount,
      });

      if (!utilization.hasAvailableSeat) {
        return {
          success: false,
          error: `Seat capacity reached (${utilization.occupiedSeats}/${utilization.maxSeats} occupied). Upgrade plan to invite more members.`,
        };
      }

      // Check if already an active member
      if (family.members.some((m) => m.email.toLowerCase() === cleanEmail && m.status === 'active')) {
        return { success: false, error: 'User is already an active member of this family.' };
      }

      // Check if already pending invitation
      if (family.invitations.some((i) => i.email.toLowerCase() === cleanEmail && i.status === 'pending')) {
        return { success: false, error: 'An active invitation is already pending for this email address.' };
      }

      const newInv: FamilyInvitation = {
        id: `inv-${Date.now()}`,
        familyId,
        inviterId: family.ownerId,
        inviterName: 'Devanshi Singh',
        email: cleanEmail,
        role,
        status: 'pending',
        token: `tok_${Math.random().toString(36).substring(2, 12)}`,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      const updatedFamily = {
        ...family,
        invitations: [...family.invitations, newInv],
      };

      set((s) => {
        const next = {
          families: s.families.map((f) => (f.id === familyId ? updatedFamily : f)),
        };
        persistState(next);
        return next;
      });

      return { success: true, invitation: newInv };
    },

    revokeInvitation: (invitationId) => {
      set((s) => {
        const updatedFamilies = s.families.map((f) => ({
          ...f,
          invitations: f.invitations.map((inv) =>
            inv.id === invitationId ? { ...inv, status: 'revoked' as const } : inv
          ),
        }));
        const next = { families: updatedFamilies };
        persistState(next);
        return next;
      });
    },

    acceptInvitation: (invitationId) => {
      const state = get();
      let targetFamily: FamilyWorkspace | undefined;
      let targetInv: FamilyInvitation | undefined;

      for (const f of state.families) {
        const inv = f.invitations.find((i) => i.id === invitationId && i.status === 'pending');
        if (inv) {
          targetFamily = f;
          targetInv = inv;
          break;
        }
      }

      if (!targetFamily || !targetInv) {
        return { success: false, error: 'Invalid or expired invitation.' };
      }

      const newMember: FamilyMember = {
        id: `mem-${Date.now()}`,
        familyId: targetFamily.id,
        userId: `user-${Date.now()}`,
        name: targetInv.email.split('@')[0].replace(/[._]/g, ' '),
        email: targetInv.email,
        role: targetInv.role,
        status: 'active',
        joinedAt: new Date().toISOString(),
        knownMonthlyIncomeMinor: 5000000,
        allocatedBudgetMinor: 2500000,
      };

      const updatedFamily: FamilyWorkspace = {
        ...targetFamily,
        members: [...targetFamily.members, newMember],
        invitations: targetFamily.invitations.map((i) =>
          i.id === invitationId ? { ...i, status: 'accepted' as const } : i
        ),
      };

      set((s) => {
        const next = {
          families: s.families.map((f) => (f.id === updatedFamily.id ? updatedFamily : f)),
        };
        persistState(next);
        return next;
      });

      return { success: true };
    },

    removeMember: (familyId, memberUserId) => {
      const state = get();
      const family = state.families.find((f) => f.id === familyId);
      if (!family) return { success: false, error: 'Family workspace not found.' };

      if (family.ownerId === memberUserId) {
        return { success: false, error: 'Workspace owner cannot be removed.' };
      }

      const updatedFamily = {
        ...family,
        members: family.members.filter((m) => m.userId !== memberUserId),
      };

      set((s) => {
        const next = {
          families: s.families.map((f) => (f.id === familyId ? updatedFamily : f)),
          sharedAllocations: s.sharedAllocations.filter((a) => a.memberUserId !== memberUserId),
        };
        persistState(next);
        return next;
      });

      return { success: true };
    },

    changePlan: (familyId, newPlanId) => {
      const state = get();
      const family = state.families.find((f) => f.id === familyId);
      if (!family) return { success: false, error: 'Family workspace not found.' };

      const targetPlan = getPlanConfig(newPlanId);
      const activeCount = family.members.filter((m) => m.status === 'active').length;
      const pendingCount = family.invitations.filter((i) => i.status === 'pending').length;
      const occupied = activeCount + pendingCount;

      if (occupied > targetPlan.maxActiveSeats) {
        return {
          success: false,
          error: `Cannot downgrade to ${targetPlan.name} (${targetPlan.maxActiveSeats} seats): Workspace currently occupies ${occupied} seats.`,
        };
      }

      const updatedFamily = {
        ...family,
        planId: newPlanId,
        updatedAt: new Date().toISOString(),
      };

      set((s) => {
        const next = {
          families: s.families.map((f) => (f.id === familyId ? updatedFamily : f)),
        };
        persistState(next);
        return next;
      });

      return { success: true };
    },

    allocateSharedExpense: (transactionId, familyId, allocations) => {
      // Find transaction in financeStore to verify exact sum
      const financeTxs = useFinanceStore.getState().transactions;
      const tx = financeTxs.find((t) => t.id === transactionId);

      if (!tx) {
        return { success: false, error: 'Transaction not found in ledger.' };
      }

      const check = validateSharedExpenseAllocations(tx.amountMinor, allocations);
      if (!check.isValid) {
        return {
          success: false,
          error: `Allocation sum (₹${(check.sumAllocatedMinor / 100).toFixed(2)}) must exactly match transaction amount (₹${(tx.amountMinor / 100).toFixed(2)}). Discrepancy: ₹${(check.differenceMinor / 100).toFixed(2)}.`,
        };
      }

      const newAllocations: SharedExpenseAllocation[] = allocations.map((a, idx) => ({
        ...a,
        id: `alloc-${transactionId}-${idx}-${Date.now()}`,
        transactionId,
        familyId,
        createdAt: new Date().toISOString(),
      }));

      // Update finance store transaction to be shared
      useFinanceStore.getState().updateTransaction({
        ...tx,
        isRecurring: tx.isRecurring, // preserve
        tags: [...(tx.tags || []).filter((t) => t !== 'shared-expense'), 'shared-expense'],
        notes: tx.notes ? `${tx.notes} [Shared with Family]` : '[Shared with Family]',
      });

      set((s) => {
        // Remove existing allocations for this tx if any, and append new
        const filtered = s.sharedAllocations.filter((a) => a.transactionId !== transactionId);
        const next = {
          sharedAllocations: [...filtered, ...newAllocations],
        };
        persistState(next);
        return next;
      });

      return { success: true };
    },

    addHouseholdGoal: (goalData) => {
      const newGoal: HouseholdGoal = {
        ...goalData,
        id: `hgoal-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        contributions: [],
      };

      set((s) => {
        const next = {
          householdGoals: [...s.householdGoals, newGoal],
        };
        persistState(next);
        return next;
      });

      return newGoal;
    },

    contributeToHouseholdGoal: (goalId, memberUserId, memberName, amountMinor) => {
      set((s) => {
        const updated = s.householdGoals.map((g) => {
          if (g.id !== goalId) return g;
          const current = g.currentAmountMinor + amountMinor;
          const status = current >= g.targetAmountMinor ? ('achieved' as const) : g.status;
          const contributions = [
            ...(g.contributions || []),
            {
              memberUserId,
              memberName,
              amountMinor,
              date: new Date().toISOString().split('T')[0],
            },
          ];
          return {
            ...g,
            currentAmountMinor: current,
            status,
            contributions,
            updatedAt: new Date().toISOString(),
          };
        });

        const next = { householdGoals: updated };
        persistState(next);
        return next;
      });
    },

    importIBMDatasetDemo: () => {
      const familyId = get().activeFamilyId || SEED_FAMILY_ID;
      const memberMap: Record<string, string> = {
        '0': 'user-devanshi-01',
        '1': 'user-aarav-02',
        '2': 'user-priya-03',
      };

      const result = mapIBMRecordsToTransactions(SEEDED_IBM_TRANSACTION_RECORDS, {
        familyId,
        memberIdMap: memberMap,
        markAsShared: false,
        batchName: 'IBM-Synthetic-CC-Demonstration-Batch',
      });

      if (!result.success) {
        return { success: false, count: 0, message: 'No valid records imported.' };
      }

      // Add transactions into financeStore
      result.transactions.forEach((tx) => {
        useFinanceStore.getState().addTransaction(tx);
      });

      set((s) => {
        const next = {
          datasetBatches: [...s.datasetBatches, result.batchMetadata],
          isDatasetDemoMode: true,
        };
        persistState(next);
        return next;
      });

      return {
        success: true,
        count: result.transactions.length,
        message: `Successfully ingested ${result.transactions.length} transactions from IBM Synthetic Credit Card dataset (${result.duplicateCount} duplicates filtered).`,
      };
    },

    toggleDatasetDemoMode: (enable) => {
      set((s) => {
        const next = { isDatasetDemoMode: enable };
        persistState(next);
        return next;
      });
    },

    resetToInitialFamilyState: () => {
      const reset = {
        activeWorkspaceMode: 'personal' as const,
        activeFamilyId: SEED_FAMILY_ID,
        families: [SEED_WORKSPACE],
        sharedAllocations: SEED_SHARED_ALLOCATIONS,
        householdGoals: SEED_HOUSEHOLD_GOALS,
        datasetBatches: [],
        isDatasetDemoMode: false,
      };
      localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(reset));
      set(reset);
    },
  };
});
