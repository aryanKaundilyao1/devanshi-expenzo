import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { TransactionModal } from '@/features/dashboard/components/TransactionModal';
import { processFinancialQuery } from '@/features/ai/intents/intentRegistry';
import {
  getGeminiApiKey,
  setGeminiApiKey,
  clearGeminiApiKey,
  isGeminiConfigured,
} from '@/features/ai/services/geminiService';

describe('Fix 1 & 2 Verification: Bank Account Selection & Free Gemini AI', () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
    clearGeminiApiKey();
  });

  describe('Fix 2: Bank Account Selection & Inline Creation in TransactionModal', () => {
    it('renders empty state warning and "+ Add Bank Account" trigger when user has no accounts', () => {
      // Simulate empty accounts in store (e.g. newly registered user)
      useFinanceStore.setState({ accounts: [] });

      render(
        <TransactionModal
          open={true}
          onOpenChange={() => {}}
          accounts={[]}
          categories={useFinanceStore.getState().categories}
        />
      );

      // Should show warning banner
      expect(screen.getByText(/No Bank Accounts Linked/i)).toBeInTheDocument();
      // Should show button to add bank account
      expect(screen.getAllByText(/\+ Add Bank Account/i).length).toBeGreaterThan(0);
    });

    it('renders connected accounts and option to add another bank account in select dropdown', () => {
      const demoAccounts = useFinanceStore.getState().accounts;
      expect(demoAccounts.length).toBeGreaterThan(0);

      render(
        <TransactionModal
          open={true}
          onOpenChange={() => {}}
          accounts={demoAccounts}
          categories={useFinanceStore.getState().categories}
        />
      );

      // Verify source account label and Add Bank Account button
      expect(screen.getByText(/\+ Add Bank Account/i)).toBeInTheDocument();

      // Verify the select options contain existing accounts and the "+ Add New Bank Account..." option
      const options = screen.getAllByRole('option');
      const hasNewAccountOption = options.some((opt) =>
        opt.textContent?.includes('+ Add New Bank Account...')
      );
      expect(hasNewAccountOption).toBe(true);
    });

    it('opens AccountModal when clicking "+ Add Bank Account" and adds a new bank account', async () => {
      render(
        <TransactionModal
          open={true}
          onOpenChange={() => {}}
          accounts={useFinanceStore.getState().accounts}
          categories={useFinanceStore.getState().categories}
        />
      );

      // Click "+ Add Bank Account"
      const addButtons = screen.getAllByText(/\+ Add Bank Account/i);
      fireEvent.click(addButtons[0]);

      // Verify the AccountModal opened
      await waitFor(() => {
        expect(screen.getByText(/Add Bank or Cash Account/i)).toBeInTheDocument();
      });

      // Fill in new bank details
      const nicknameInput = screen.getByPlaceholderText(/e\.g\. Salary Account/i);
      fireEvent.change(nicknameInput, { target: { value: 'ICICI Wealth Savings' } });

      const openingBalInputs = screen.getAllByPlaceholderText('0.00');
      fireEvent.change(openingBalInputs[openingBalInputs.length - 1], { target: { value: '25000' } });

      const submitBtn = screen.getByRole('button', { name: /Create Bank Account/i });
      fireEvent.click(submitBtn);

      // Check that store has the newly added account
      await waitFor(() => {
        const updatedAccounts = useFinanceStore.getState().accounts;
        const created = updatedAccounts.find((a) => a.name === 'ICICI Wealth Savings');
        expect(created).toBeDefined();
        expect(created?.openingBalanceMinor).toBe(2500000);
      });
    });
  });

  describe('Fix 1: Free Gemini AI & Comprehensive Financial Engine', () => {
    it('manages Gemini API key lifecycle (set, get, check, clear)', () => {
      expect(isGeminiConfigured()).toBe(false);

      setGeminiApiKey('AIzaSy_test_key_12345');
      expect(getGeminiApiKey()).toBe('AIzaSy_test_key_12345');
      expect(isGeminiConfigured()).toBe(true);

      clearGeminiApiKey();
      expect(getGeminiApiKey()).toBe('');
      expect(isGeminiConfigured()).toBe(false);
    });

    it('answers greeting & assistance queries intelligently with accounts and liquid cash', () => {
      const state = useFinanceStore.getState();
      const res = processFinancialQuery('Hello', state);

      expect(res.intentCategory).toBe('education');
      expect(res.textResponse).toContain('EXPENZO Financial Intelligence Co-pilot');
      expect(res.textResponse).toContain('Spending Analysis');
      expect(res.card?.title).toContain('EXPENZO Financial Co-Pilot');
    });

    it('breaks down all bank accounts and balances upon inquiry', () => {
      const state = useFinanceStore.getState();
      const res = processFinancialQuery('Show all my bank accounts', state);

      expect(res.intentCategory).toBe('banking');
      expect(res.textResponse).toContain('connected depository accounts');
      expect(res.textResponse).toContain('Everyday Savings');
    });

    it('analyzes monthly budget limits, spent amounts, and utilization', () => {
      const state = useFinanceStore.getState();
      const res = processFinancialQuery('What is my budget status?', state);

      expect(res.intentCategory).toBe('budgets');
      expect(res.textResponse).toContain('Housing & Rent');
      expect(res.card?.title).toContain('Budget');
    });

    it('explains the 50/30/20 rule customized to the user monthly income', () => {
      const state = useFinanceStore.getState();
      const res = processFinancialQuery('Explain the 50/30/20 rule', state);

      expect(res.intentCategory).toBe('education');
      expect(res.textResponse).toContain('50/30/20 Rule');
      expect(res.textResponse).toContain('50% Needs');
      expect(res.textResponse).toContain('30% Wants');
      expect(res.textResponse).toContain('20% Savings');
      expect(res.card?.breakdown?.length).toBe(3);
    });

    it('provides clear guidance on Section 80C and Old vs New Tax Regime', () => {
      const state = useFinanceStore.getState();
      const res = processFinancialQuery('How to save tax under 80C?', state);

      expect(res.intentCategory).toBe('education');
      expect(res.textResponse).toContain('Section 80C');
      expect(res.textResponse).toContain('New Tax Regime');
      expect(res.textResponse).toContain('Old Tax Regime');
    });

    it('computes emergency fund size based on real monthly outflow', () => {
      const state = useFinanceStore.getState();
      const res = processFinancialQuery('How much emergency fund do I need?', state);

      expect(res.intentCategory).toBe('education');
      expect(res.textResponse).toContain('Emergency Fund');
      expect(res.textResponse).toContain('3 to 6 months');
      expect(res.card?.metrics?.find((m) => m.label === 'Health Status')).toBeDefined();
    });

    it('evaluates arbitrary general financial questions instead of failing', () => {
      const state = useFinanceStore.getState();
      const res = processFinancialQuery('Can you evaluate my overall financial health?', state);

      expect(res.intentCategory).toBe('education');
      expect(res.textResponse).toContain('financial posture');
      expect(res.card?.metrics?.length).toBeGreaterThan(0);
    });
  });
});
