import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAIChatStore } from '@/features/ai/store/useAIChatStore';
import { useLearningStore } from '@/features/learning/store/useLearningStore';
import { processFinancialQuery } from '@/features/ai/intents/intentRegistry';
import {
  calculatePortfolioMetrics,
  calculateAssetAllocation,
} from '@/features/investments/utils/investmentCalculations';
import { generateFinancialReport, generateReportCSV } from '@/features/reports/utils/reportGenerator';
import {
  calculateMonthsRemaining,
  calculateRequiredMonthlyContribution,
} from '@/features/planner/utils/plannerCalculations';

describe('Phase 7 Cross-Module Financial Intelligence Integration (7F)', () => {
  beforeEach(() => {
    localStorage.clear();
    useFinanceStore.getState().resetToDemo();
    useAIChatStore.getState().clearAllConversations();
  });

  it('7F.1: Adding an expense reactively updates ledger, budgets, reports, and AI answers', () => {
    const store = useFinanceStore.getState();
    const initialExpenses = store.transactions.filter((t) => t.type === 'expense');
    const initialReport = generateFinancialReport(
      { type: 'monthly', startDate: '2026-10-01', endDate: '2026-10-15' },
      store
    );
    const initialExpenseMinor = initialReport.totalExpenseMinor;

    // Ask AI assistant for food spend before
    const aiBefore = processFinancialQuery('How much did I spend on food?', store);
    expect(aiBefore.intentCategory).toBe('expenses');
    expect(aiBefore.textResponse).toContain('₹2,800');

    // Add a new food expense (₹4,500 = 450,000 paise) within reporting date window
    store.addTransaction({
      accountId: 'acct_hdfc',
      amountMinor: 450000,
      type: 'expense',
      category: 'Food & Dining',
      merchant: 'Gourmet Organic Dinner',
      date: '2026-10-10',
      status: 'completed',
    });

    const updatedState = useFinanceStore.getState();
    const updatedExpenses = updatedState.transactions.filter((t) => t.type === 'expense');
    expect(updatedExpenses.length).toBe(initialExpenses.length + 1);

    // Verify report reflects the added expense exactly
    const updatedReport = generateFinancialReport(
      { type: 'monthly', startDate: '2026-10-01', endDate: '2026-10-15' },
      updatedState
    );
    expect(updatedReport.totalExpenseMinor).toBe(initialExpenseMinor + 450000);

    // Verify AI query immediately reflects the updated spend (₹2,800 + ₹4,500 = ₹7,300)
    const aiAfter = processFinancialQuery('How much did I spend on food?', updatedState);
    expect(aiAfter.intentCategory).toBe('expenses');
    expect(aiAfter.textResponse).toContain('₹7,300');
  });

  it('7F.2: Investment holding CRUD updates portfolio metrics, asset allocation, and AI answers', () => {
    const store = useFinanceStore.getState();
    const initialMetrics = calculatePortfolioMetrics(store.holdings, store.quotes);

    // AI queries portfolio
    const aiPortfolioBefore = processFinancialQuery('What is my portfolio value?', store);
    expect(aiPortfolioBefore.intentCategory).toBe('investments');
    expect(aiPortfolioBefore.textResponse).toContain('₹42,500');

    // Add 10 shares of RELIANCE (quote CMP is ₹2,980 = 298000 paise)
    store.addHolding({
      ticker: 'RELIANCE',
      companyName: 'Reliance Industries Ltd',
      assetClass: 'equity',
      quantity: 10,
      averageBuyPriceMinor: 280000, // ₹2,800
      purchaseDate: '2026-03-01',
      notes: 'Strategic energy holding',
    });

    const updatedState = useFinanceStore.getState();
    const relianceHolding = updatedState.holdings.find((h) => h.ticker === 'RELIANCE');
    expect(relianceHolding).toBeDefined();
    expect(relianceHolding?.quantity).toBe(10);

    // Recalculate metrics
    const updatedMetrics = calculatePortfolioMetrics(updatedState.holdings, updatedState.quotes);
    const quote = updatedState.quotes['RELIANCE'];
    const expectedAddition = 10 * quote.currentPriceMinor;
    expect(updatedMetrics.totalValueMinor).toBe(initialMetrics.totalValueMinor + expectedAddition);

    // Asset allocation reflects added equity
    const allocation = calculateAssetAllocation(updatedState.holdings, updatedState.quotes);
    const equityAlloc = allocation.find((a) => a.assetClass === 'equity');
    expect(equityAlloc).toBeDefined();
    expect(equityAlloc!.percent).toBeGreaterThan(0);

    // AI reflects updated portfolio value
    const aiPortfolioAfter = processFinancialQuery('What is my portfolio value?', updatedState);
    expect(aiPortfolioAfter.intentCategory).toBe('investments');
    expect(aiPortfolioAfter.textResponse).toContain(
      `₹${(updatedMetrics.totalValueMinor / 100).toLocaleString('en-IN')}`
    );
  });

  it('7F.3: Goal contribution preserves double-entry bank cash without synthetic double-counting', () => {
    const store = useFinanceStore.getState();
    const initialCash = store.getTotalLiquidCash();
    const goal = store.goals[0];
    expect(goal).toBeDefined();
    const initialAccumulated = goal.currentAmountMinor;

    // Record goal contribution (₹5,000 = 500,000 paise)
    const result = store.recordGoalContribution(goal.id, 500000);
    expect(result.success).toBe(true);

    const updatedState = useFinanceStore.getState();
    const updatedGoal = updatedState.goals.find((g) => g.id === goal.id);
    expect(updatedGoal?.currentAmountMinor).toBe(initialAccumulated + 500000);

    // Invariant: Goal contribution is a planning ledger milestone; it does NOT randomly drain cash accounts without a real transaction
    const finalCash = updatedState.getTotalLiquidCash();
    expect(finalCash).toBe(initialCash);

    // Planner recalculation reacts properly
    const months = calculateMonthsRemaining(updatedGoal!.targetDate);
    const monthlyNeeded = calculateRequiredMonthlyContribution(
      updatedGoal!.targetAmountMinor,
      updatedGoal!.currentAmountMinor,
      months
    );
    expect(monthlyNeeded).toBeLessThanOrEqual(
      calculateRequiredMonthlyContribution(goal.targetAmountMinor, initialAccumulated, months)
    );
  });

  it('7F.4: Internal transfers preserve aggregate liquid cash and net worth strictly', () => {
    const store = useFinanceStore.getState();
    const checking = store.accounts.find((a) => a.id === 'acct_hdfc')!;
    const savings = store.accounts.find((a) => a.id === 'acct_sbi')!;
    expect(checking).toBeDefined();
    expect(savings).toBeDefined();

    const initialCombinedCash = store.getAccountBalance('acct_hdfc') + store.getAccountBalance('acct_sbi');
    const initialNetWorth = store.getNetWorth();

    // Execute transfer of ₹5,000 (500,000 paise) from acct_hdfc to acct_sbi
    const transferRes = store.recordTransfer({
      sourceAccountId: 'acct_hdfc',
      destinationAccountId: 'acct_sbi',
      amountMinor: 500000,
      note: 'Monthly savings sweep',
      date: '2026-10-12',
    });
    expect(transferRes.success).toBe(true);

    const updatedState = useFinanceStore.getState();
    const updatedCheckingBalance = updatedState.getAccountBalance('acct_hdfc');
    const updatedSavingsBalance = updatedState.getAccountBalance('acct_sbi');

    expect(updatedCheckingBalance + updatedSavingsBalance).toBe(initialCombinedCash);

    // Net worth must be strictly preserved
    expect(updatedState.getNetWorth()).toBe(initialNetWorth);
  });

  it('7F.5: Persona isolation protects AI chat sessions and learning progress across profile switches', async () => {
    const chatStore = useAIChatStore.getState();
    const learningStore = useLearningStore.getState();

    // Session 1: Salaried Professional
    chatStore.setPersona('professional');
    chatStore.createConversation('Professional Tax Inquiry');
    await chatStore.sendMessage('How much did I spend this month?');

    learningStore.setPersona('professional');
    learningStore.toggleBookmark('emergency-funds-101');
    learningStore.recordQuizScore('emergency-funds-101', 3, 3);

    expect(useAIChatStore.getState().conversations.length).toBeGreaterThan(0);
    expect(useLearningStore.getState().bookmarkedSlugs).toContain('emergency-funds-101');

    // Switch to Student Persona
    chatStore.setPersona('student');
    learningStore.setPersona('student');

    // Fresh chat session for student persona (no message leakage)
    expect(useAIChatStore.getState().conversations.some((c) => c.title === 'Professional Tax Inquiry')).toBe(false);
    expect(useLearningStore.getState().bookmarkedSlugs).not.toContain('emergency-funds-101');

    // Add student conversation
    chatStore.createConversation('Student Budgeting Advice');
    expect(useAIChatStore.getState().conversations.some((c) => c.title === 'Student Budgeting Advice')).toBe(true);

    // Switch back to Professional Persona
    chatStore.setPersona('professional');
    learningStore.setPersona('professional');

    // Professional persona data should be restored seamlessly from persistence
    expect(useAIChatStore.getState().conversations.some((c) => c.title === 'Professional Tax Inquiry')).toBe(true);
    expect(useLearningStore.getState().bookmarkedSlugs).toContain('emergency-funds-101');
    expect(useLearningStore.getState().quizScores['emergency-funds-101']?.score).toBe(3);
  });

  it('7F.6: Financial reports generate cleanly and escape formula injection vectors in CSV export', () => {
    const store = useFinanceStore.getState();

    // Inject a potentially dangerous transaction title (formula injection attempt)
    store.addTransaction({
      accountId: 'acct_hdfc',
      amountMinor: 150000,
      type: 'expense',
      category: 'Software & Subscriptions',
      merchant: '=cmd|/c calc!A0',
      date: '2026-10-14',
      status: 'completed',
    });

    const updatedState = useFinanceStore.getState();
    const report = generateFinancialReport(
      { type: 'monthly', startDate: '2026-10-01', endDate: '2026-10-15' },
      updatedState
    );
    expect(report.totalExpenseMinor).toBeGreaterThan(0);

    const csv = generateReportCSV(report);
    expect(csv).toBeDefined();

    // Verify formula characters at beginning of cell are sanitized with single quote prefix
    expect(csv).toContain("\"'=cmd|/c calc!A0\"");
    // Ensure no raw unescaped `=cmd` at beginning of cell
    expect(csv).not.toMatch(/,"=cmd/);
  });
});
