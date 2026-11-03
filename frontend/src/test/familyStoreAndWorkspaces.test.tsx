import { describe, it, expect, beforeEach } from 'vitest';
import { useFamilyStore } from '../store/useFamilyStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { getPlanConfig } from '../features/family/config/plans';
import { SEEDED_IBM_TRANSACTION_RECORDS } from '../features/family/services/datasetImporter';

describe('Family Store, Workspace Isolation & Seat Management', () => {
  beforeEach(() => {
    // Reset to deterministic seed state
    useFamilyStore.getState().resetToInitialFamilyState();
  });

  it('initializes with personal workspace mode and default seed family', () => {
    const state = useFamilyStore.getState();
    expect(state.activeWorkspaceMode).toBe('personal');
    expect(state.activeFamilyId).toBe('fam-singh-001');
    expect(state.families.length).toBe(1);

    const family = state.families[0];
    expect(family.name).toBe('Singh Household Finance');
    expect(family.planId).toBe('family'); // 4 seats
    expect(family.members.length).toBe(3); // Devanshi, Aarav, Priya
    expect(family.invitations.filter((i) => i.status === 'pending').length).toBe(1); // Rohan (pending)
  });

  it('switches between personal and family workspace modes', () => {
    const store = useFamilyStore.getState();

    store.switchWorkspaceMode('family', 'fam-singh-001');
    expect(useFamilyStore.getState().activeWorkspaceMode).toBe('family');
    expect(useFamilyStore.getState().activeFamilyId).toBe('fam-singh-001');

    store.switchWorkspaceMode('personal');
    expect(useFamilyStore.getState().activeWorkspaceMode).toBe('personal');
  });

  it('enforces seat limit: blocks inviting beyond plan capacity (active + pending)', () => {
    const store = useFamilyStore.getState();
    const family = store.families[0];
    const plan = getPlanConfig(family.planId);
    expect(plan.maxActiveSeats).toBe(4);

    // Initial state: 3 active members + 1 pending invitation = 4 seats reserved (100% capacity)
    const result = store.inviteMember('fam-singh-001', 'extra.member@expenzo.local', 'member');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Seat capacity reached');
  });

  it('allows invitation after revoking a pending invitation frees a seat', () => {
    const store = useFamilyStore.getState();
    const pendingInv = store.families[0].invitations.find((i) => i.status === 'pending');
    expect(pendingInv).toBeDefined();

    // Revoke the pending invitation
    store.revokeInvitation(pendingInv!.id);

    // Now family has 3 active members + 0 pending invitations = 3/4 seats used
    const updatedFamily = useFamilyStore.getState().families[0];
    expect(updatedFamily.invitations.filter((i) => i.status === 'pending').length).toBe(0);

    // Inviting now should succeed
    const result = useFamilyStore.getState().inviteMember(
      'fam-singh-001',
      'new.joiner@expenzo.local',
      'member'
    );
    expect(result.success).toBe(true);
    expect(result.invitation?.email).toBe('new.joiner@expenzo.local');
  });

  it('upgrades plan from family (4 seats) to family_plus (8 seats)', () => {
    const store = useFamilyStore.getState();
    const changeResult = store.changePlan('fam-singh-001', 'family_plus');
    expect(changeResult.success).toBe(true);

    const updatedFamily = useFamilyStore.getState().families[0];
    expect(updatedFamily.planId).toBe('family_plus');

    // With 8 seats, inviting an additional member now succeeds without revoking
    const inviteResult = useFamilyStore.getState().inviteMember(
      'fam-singh-001',
      'fifth.member@expenzo.local',
      'member'
    );
    expect(inviteResult.success).toBe(true);
  });

  it('accepts an invitation, converting it to an active member and clearing pending status', () => {
    const store = useFamilyStore.getState();
    const pendingInv = store.families[0].invitations.find((i) => i.status === 'pending');
    expect(pendingInv).toBeDefined();

    const acceptResult = store.acceptInvitation(pendingInv!.id);
    expect(acceptResult.success).toBe(true);

    const family = useFamilyStore.getState().families[0];
    expect(family.invitations.filter((i) => i.status === 'pending').length).toBe(0);
    expect(family.members.length).toBe(4);
    expect(family.members.some((m) => m.email === pendingInv!.email)).toBe(true);
  });

  it('allocates shared expense with exact-sum verification', () => {
    const totalMinor = 500000; // ₹5,000.00

    // Ensure transaction exists in ledger and capture generated ID
    const newTx = useFinanceStore.getState().addTransaction({
      accountId: 'acc-hdfc-savings',
      amountMinor: totalMinor,
      type: 'expense',
      category: 'Groceries',
      merchant: 'Supermarket',
      date: '2026-10-15',
      status: 'completed',
    });
    const txnId = newTx.id;

    const store = useFamilyStore.getState();

    // Exact allocation: 3,000 + 2,000 = 5,000 (valid)
    const validAllocations = [
      {
        memberUserId: 'user-devanshi-01',
        allocatedAmountMinor: 300000,
        splitPercentage: 60,
        allocationMethod: 'custom_exact' as const,
        notes: '60% share',
      },
      {
        memberUserId: 'user-aarav-02',
        allocatedAmountMinor: 200000,
        splitPercentage: 40,
        allocationMethod: 'custom_exact' as const,
        notes: '40% share',
      },
    ];

    const result = store.allocateSharedExpense(txnId, 'fam-singh-001', validAllocations);
    expect(result.success).toBe(true);

    const storedAllocations = useFamilyStore.getState().sharedAllocations.filter(
      (a) => a.transactionId === txnId
    );
    expect(storedAllocations.length).toBe(2);
    const sum = storedAllocations.reduce((acc, a) => acc + a.allocatedAmountMinor, 0);
    expect(sum).toBe(totalMinor);
  });

  it('manages household goals and contributions', () => {
    const store = useFamilyStore.getState();
    const initialGoals = store.householdGoals.length;

    const newGoal = store.addHouseholdGoal({
      familyId: 'fam-singh-001',
      createdBy: 'user-devanshi-01',
      title: 'Home Solar Installation',
      targetAmountMinor: 30000000, // ₹3,00,000
      currentAmountMinor: 0,
      targetDate: '2027-12-31',
      category: 'home',
      status: 'in_progress',
      contributions: [],
    });

    expect(newGoal.id).toBeDefined();
    expect(useFamilyStore.getState().householdGoals.length).toBe(initialGoals + 1);

    // Make contribution
    store.contributeToHouseholdGoal(
      newGoal.id,
      'user-devanshi-01',
      'Devanshi Singh',
      5000000 // ₹50,000
    );

    const updated = useFamilyStore.getState().householdGoals.find((g) => g.id === newGoal.id);
    expect(updated?.currentAmountMinor).toBe(5000000);
    expect(updated?.contributions?.length).toBe(1);
    expect(updated?.contributions?.[0].amountMinor).toBe(5000000);
  });

  it('imports IBM synthetic dataset and isolates demonstration mode', () => {
    const store = useFamilyStore.getState();
    expect(store.isDatasetDemoMode).toBe(false);

    const importResult = store.importIBMDatasetDemo();
    expect(importResult.success).toBe(true);
    expect(importResult.count).toBe(SEEDED_IBM_TRANSACTION_RECORDS.length);
    expect(useFamilyStore.getState().isDatasetDemoMode).toBe(true);
    expect(useFamilyStore.getState().datasetBatches.length).toBe(1);

    // Toggling off demonstration mode
    store.toggleDatasetDemoMode(false);
    expect(useFamilyStore.getState().isDatasetDemoMode).toBe(false);
  });
});
