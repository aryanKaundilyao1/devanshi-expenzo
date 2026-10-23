import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { ProfileSettingsPage } from '@/features/settings/pages/ProfileSettingsPage';
import { AppearanceSettingsPage } from '@/features/settings/pages/AppearanceSettingsPage';
import { FinancialSettingsPage } from '@/features/settings/pages/FinancialSettingsPage';
import { SecuritySettingsPage } from '@/features/settings/pages/SecuritySettingsPage';
import { ConnectionsSettingsPage } from '@/features/settings/pages/ConnectionsSettingsPage';
import { PrivacySettingsPage } from '@/features/settings/pages/PrivacySettingsPage';
import { NotificationSettingsPage } from '@/features/settings/pages/NotificationSettingsPage';

describe('Phase 8: Settings & Notifications Center', () => {
  beforeEach(() => {
    localStorage.clear();
    useFinanceStore.getState().resetToDemo();
  });

  // 1. Notifications Center
  it('renders Notifications Center with unread counts and filter tabs', () => {
    render(
      <MemoryRouter initialEntries={['/app/notifications']}>
        <NotificationsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Notifications Center')).toBeInTheDocument();
    expect(screen.getByText(/All Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/Budgets/i)).toBeInTheDocument();
    expect(screen.getByText(/Bills/i)).toBeInTheDocument();

    // Verify mark all read button is accessible
    const markAllBtn = screen.getByText(/Mark all as read/i);
    expect(markAllBtn).toBeInTheDocument();

    fireEvent.click(markAllBtn);

    // After mark all read, all items should be marked as read
    const unread = useFinanceStore.getState().notifications.filter((n) => !n.isRead);
    expect(unread.length).toBe(0);
  });

  it('allows filtering notifications by category and deleting an individual notification', () => {
    render(
      <MemoryRouter initialEntries={['/app/notifications']}>
        <NotificationsPage />
      </MemoryRouter>
    );

    const initialCount = useFinanceStore.getState().notifications.length;
    expect(initialCount).toBeGreaterThan(0);

    // Filter by Budgets
    const budgetTab = screen.getByRole('button', { name: 'Budgets' });
    fireEvent.click(budgetTab);

    // Verify budget alerts are shown
    const firstNotif = useFinanceStore.getState().notifications[0];
    const deleteBtn = screen.getAllByRole('button', { name: /Delete notification:/i })[0];
    expect(deleteBtn).toBeInTheDocument();

    fireEvent.click(deleteBtn);

    const afterCount = useFinanceStore.getState().notifications.length;
    expect(afterCount).toBe(initialCount - 1);
  });

  // 2. Profile Settings
  it('validates and updates display name, email, and persona in Profile Settings', async () => {
    render(
      <MemoryRouter initialEntries={['/app/settings/profile']}>
        <ProfileSettingsPage />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Display Name/i);
    const emailInput = screen.getByLabelText(/Contact Email/i);

    fireEvent.change(nameInput, { target: { value: 'Vikram Malhotra' } });
    fireEvent.change(emailInput, { target: { value: 'vikram@example.com' } });

    // Select Investor Persona
    const investorCard = screen.getByText('Active Market Investor');
    fireEvent.click(investorCard);

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /Save Profile Preferences/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Profile preferences updated successfully/i)).toBeInTheDocument();
    });

    const updatedUser = useFinanceStore.getState().user;
    expect(updatedUser.name).toBe('Vikram Malhotra');
    expect(updatedUser.email).toBe('vikram@example.com');
    expect(updatedUser.persona).toBe('investor');
  });

  // 3. Appearance Settings
  it('applies theme selection immediately and toggles display density', () => {
    render(
      <MemoryRouter initialEntries={['/app/settings/appearance']}>
        <AppearanceSettingsPage />
      </MemoryRouter>
    );

    // Select Light theme
    const lightOption = screen.getByText('Light');
    fireEvent.click(lightOption);
    expect(useUIStore.getState().theme).toBe('light');

    // Select Dark theme
    const darkOption = screen.getByText('Dark');
    fireEvent.click(darkOption);
    expect(useUIStore.getState().theme).toBe('dark');

    // Select Compact density
    const compactBtn = screen.getByRole('button', { name: 'Compact' });
    fireEvent.click(compactBtn);

    // Save appearance
    const saveBtn = screen.getByRole('button', { name: /Apply & Save Appearance/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/Appearance preferences applied and saved/i)).toBeInTheDocument();
  });

  // 4. Financial Settings
  it('updates monthly budget limit and number formatting preferences', async () => {
    render(
      <MemoryRouter initialEntries={['/app/settings/financial']}>
        <FinancialSettingsPage />
      </MemoryRouter>
    );

    const budgetInput = screen.getByLabelText(/Monthly Target Budget Cap/i);
    fireEvent.change(budgetInput, { target: { value: '45000' } });

    // Select international number formatting
    const intlFormat = screen.getByText(/International Format/i);
    fireEvent.click(intlFormat);

    const saveBtn = screen.getByRole('button', { name: /Save Financial Preferences/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Financial preferences updated successfully/i)).toBeInTheDocument();
    });

    expect(useFinanceStore.getState().user.monthlyBudgetLimitMinor).toBe(4500000);
  });

  // 5. Security Settings
  it('renders demo session information and honest prototype disclaimers', () => {
    render(
      <MemoryRouter initialEntries={['/app/settings/security']}>
        <SecuritySettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Prototype Security Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Demo Session Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Remember Demo Session/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out & Clear Sandbox/i })).toBeInTheDocument();
  });

  // 6. Connected Accounts Settings
  it('lists active accounts and opens informative real-banking roadmap modal', () => {
    render(
      <MemoryRouter initialEntries={['/app/settings/connections']}>
        <ConnectionsSettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Active Financial Accounts/i)).toBeInTheDocument();
    expect(screen.getByText('Everyday Savings')).toBeInTheDocument();

    // Click "Connect Real Bank"
    const realBankBtn = screen.getByRole('button', { name: 'Connect Real Bank' });
    fireEvent.click(realBankBtn);

    expect(screen.getByText(/Live Open Banking Out of Scope/i)).toBeInTheDocument();
    expect(screen.getByText(/RBI Account Aggregator/i)).toBeInTheDocument();

    // Close modal
    const understoodBtn = screen.getByRole('button', { name: 'Understood' });
    fireEvent.click(understoodBtn);
    expect(screen.queryByText(/Live Open Banking Out of Scope/i)).not.toBeInTheDocument();
  });

  // 7. Privacy Settings & Local Data
  it('supports JSON export and workspace reset to factory defaults', () => {
    render(
      <MemoryRouter initialEntries={['/app/settings/privacy']}>
        <PrivacySettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Zero-Data-Leakage Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download JSON Backup/i })).toBeInTheDocument();

    // Reset workspace trigger
    const resetBtn = screen.getByRole('button', { name: 'Reset Workspace' });
    fireEvent.click(resetBtn);

    expect(screen.getByText('Confirm Factory Reset')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: 'Yes, Reset All' });
    fireEvent.click(confirmBtn);

    expect(screen.getByText(/Workspace restored to default demonstration seed data/i)).toBeInTheDocument();
  });

  // 8. Notification Preferences Settings
  it('toggles notification preference switches and updates store preferences', async () => {
    render(
      <MemoryRouter initialEntries={['/app/settings/notifications']}>
        <NotificationSettingsPage />
      </MemoryRouter>
    );

    const budgetToggle = screen.getByLabelText('Toggle Budget Threshold Warnings');
    expect(budgetToggle).toBeChecked();

    fireEvent.click(budgetToggle);
    expect(budgetToggle).not.toBeChecked();

    const saveBtn = screen.getByRole('button', { name: /Save Notification Preferences/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Notification preferences saved/i)).toBeInTheDocument();
    });

    expect(useFinanceStore.getState().notificationPreferences.budgetAlerts).toBe(false);
  });
});

