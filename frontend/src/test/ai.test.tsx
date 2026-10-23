import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAIChatStore } from '@/features/ai/store/useAIChatStore';
import { processFinancialQuery } from '@/features/ai/intents/intentRegistry';
import { evaluateFinancialInsights } from '@/features/ai/insights/insightRules';
import { AIAssistantPage } from '@/features/ai/pages/AIAssistantPage';
import { AIInsightsPage } from '@/features/ai/pages/AIInsightsPage';
import { AIInsightDetailPage } from '@/features/ai/pages/AIInsightDetailPage';

describe('Phase 7B: Free AI Assistant, Intent Engine & Intelligent Insights', () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
    useAIChatStore.getState().clearAllConversations();
  });

  it('classifies expense queries and returns accurate ledger sums', () => {
    const storeState = useFinanceStore.getState();

    // 1. Monthly expense total
    const resTotal = processFinancialQuery('How much did I spend this month?', storeState);
    expect(resTotal.intentCategory).toBe('expenses');
    expect(resTotal.textResponse).toContain('₹18,800');
    expect(resTotal.card?.metrics?.find((m) => m.label === 'Total Spent')?.value).toBe('₹18,800');

    // 2. Biggest expense
    const resBiggest = processFinancialQuery('What was my biggest expense?', storeState);
    expect(resBiggest.intentCategory).toBe('expenses');
    expect(resBiggest.textResponse).toContain('₹12,000');
    expect(resBiggest.textResponse).toContain('Skyline Apartments Landlord');

    // 3. Food category spending
    const resFood = processFinancialQuery('How much did I spend on food?', storeState);
    expect(resFood.intentCategory).toBe('expenses');
    expect(resFood.textResponse).toContain('₹2,800');
  });

  it('classifies income and banking queries accurately', () => {
    const storeState = useFinanceStore.getState();

    // 1. Total income
    const resIncome = processFinancialQuery('How much did I earn this month?', storeState);
    expect(resIncome.intentCategory).toBe('income');
    expect(resIncome.textResponse).toContain('₹52,000');

    // 2. Banking balance
    const resBank = processFinancialQuery('What is my available cash balance?', storeState);
    expect(resBank.intentCategory).toBe('banking');
    expect(resBank.textResponse).toContain('liquid cash');

    // 3. Upcoming bills
    const resBills = processFinancialQuery('What bills are coming up?', storeState);
    expect(resBills.intentCategory).toBe('banking');
    expect(resBills.card?.title).toContain('Upcoming Commitments');
  });

  it('classifies investment portfolio and diversification queries', () => {
    const storeState = useFinanceStore.getState();

    // 1. Portfolio worth
    const resPort = processFinancialQuery('What is my portfolio worth?', storeState);
    expect(resPort.intentCategory).toBe('investments');
    expect(resPort.textResponse).toContain('₹42,500');
    expect(resPort.textResponse).toContain('+₹3,500');

    // 2. Largest holding
    const resHolding = processFinancialQuery('Which stock is my largest holding?', storeState);
    expect(resHolding.intentCategory).toBe('investments');
    expect(resHolding.textResponse).toContain('TCS');
  });

  it('explains financial education concepts (SIP, ETF, Compounding)', () => {
    const storeState = useFinanceStore.getState();

    const resSip = processFinancialQuery('What is a SIP?', storeState);
    expect(resSip.intentCategory).toBe('education');
    expect(resSip.textResponse).toContain('Systematic Investment Plan');

    const resEtf = processFinancialQuery('What is an ETF?', storeState);
    expect(resEtf.intentCategory).toBe('education');
    expect(resEtf.textResponse).toContain('Exchange-Traded Fund');

    const resComp = processFinancialQuery('Explain compound interest', storeState);
    expect(resComp.intentCategory).toBe('education');
    expect(resComp.textResponse).toContain('Compound interest');
  });

  it('handles unsupported queries with an honest explanation and suggestions', () => {
    const storeState = useFinanceStore.getState();
    const resUnknown = processFinancialQuery('Will TCS stock double tomorrow?', storeState);

    expect(resUnknown.intentCategory).toBe('fallback');
    expect(resUnknown.textResponse).toContain('cannot predict tomorrow’s stock market swings');
    expect(resUnknown.suggestedFollowUps?.length).toBeGreaterThan(0);
  });

  it('persists AI conversations and isolates history between personas', async () => {
    const chatStore = useAIChatStore.getState();

    // Set persona A (professional)
    chatStore.setPersona('professional');
    const convId = chatStore.createConversation('Professional Tax Inquiry');
    await chatStore.sendMessage('How much did I spend this month?');

    const profConvs = useAIChatStore.getState().conversations;
    expect(profConvs.some((c) => c.title === 'Professional Tax Inquiry')).toBe(true);

    // Switch to persona B (student)
    chatStore.setPersona('student');
    const studentConvs = useAIChatStore.getState().conversations;
    // Student persona must not see Professional's conversation
    expect(studentConvs.some((c) => c.title === 'Professional Tax Inquiry')).toBe(false);

    // Switch back to professional
    chatStore.setPersona('professional');
    expect(useAIChatStore.getState().conversations.some((c) => c.title === 'Professional Tax Inquiry')).toBe(true);
  });

  it('evaluates all 12 financial insight rules from current ledger state', () => {
    const storeState = useFinanceStore.getState();
    const insights = evaluateFinancialInsights(storeState);

    expect(insights.length).toBeGreaterThanOrEqual(6);

    const ruleIds = insights.map((i) => i.ruleId);
    expect(ruleIds).toContain('RULE_01_HIGHEST_EXPENSE_CATEGORY');
    expect(ruleIds).toContain('RULE_02_LARGEST_TRANSACTION');
    expect(ruleIds).toContain('RULE_03_SPENDING_TREND');
    expect(ruleIds).toContain('RULE_07_UPCOMING_BILL_WARNING');
    expect(ruleIds).toContain('RULE_09_SAVINGS_GOAL_PROGRESS');
    expect(ruleIds).toContain('RULE_11_LARGEST_PORTFOLIO_HOLDING');

    // Verify all insights have required audit fields
    insights.forEach((ins) => {
      expect(ins.evidence).toBeDefined();
      expect(ins.confidenceExplanation).toBeDefined();
      expect(ins.dateRange).toBeDefined();
    });
  });

  it('renders AI Assistant page with composer and prompts', () => {
    render(
      <MemoryRouter>
        <AIAssistantPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Financial Intelligence Assistant/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask a question about your spending/i)).toBeInTheDocument();
    expect(screen.getByText('How much did I spend this month?')).toBeInTheDocument();
  });

  it('renders AI Insights feed page with category filtering', () => {
    render(
      <MemoryRouter>
        <AIInsightsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/AI Financial Insights/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Diagnostic Breakdown/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Spending' })).toBeInTheDocument();
  });

  it('renders AI Insight Detail page with audit formula breakdown', () => {
    render(
      <MemoryRouter initialEntries={['/app/ai-insights/ins_highest_expense']}>
        <Routes>
          <Route path="/app/ai-insights/:id" element={<AIInsightDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/High Outflow in/i)).toBeInTheDocument();
    expect(screen.getByText(/Mathematical Evidence & Ledger Basis/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence Explanation:/i)).toBeInTheDocument();
  });
});
