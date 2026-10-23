import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { router } from '@/app/routes';
import { useAuthStore, DEFAULT_ONBOARDING_PREFS } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { INITIAL_USER } from '@/services/fixtures/seedData';

describe('Phase 3 Authentication, Demo Session & Onboarding Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      isAuthenticated: false,
      user: INITIAL_USER,
      onboardingCompleted: false,
      preferences: DEFAULT_ONBOARDING_PREFS,
    });
    useFinanceStore.getState().resetToDemo();
  });

  it('renders login page with disclosures and autofills demo credentials', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/auth/login'] });
    render(<RouterProvider router={testRouter} />);

    // Check heading & banner
    expect(screen.getByRole('heading', { name: /Welcome to EXPENZO/i })).toBeInTheDocument();
    expect(screen.getByText(/Interactive Prototype Gateway/i)).toBeInTheDocument();

    // Fill credentials button
    const autofillBtn = screen.getByRole('button', { name: /Autofill demo/i });
    fireEvent.click(autofillBtn);

    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/••••••••••••/i) as HTMLInputElement;

    expect(emailInput.value).toBe('aryan.sharma@example.com');
    expect(passwordInput.value).toBe('demo-password-123');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Sign In to Demo Session/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe('aryan.sharma@example.com');
    });
  });

  it('allows launching persona modal and quick-switching to Student profile', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/auth/login'] });
    render(<RouterProvider router={testRouter} />);

    // Open persona switcher
    const openPersonaBtn = screen.getByRole('button', { name: /Select Persona & Enter App/i });
    fireEvent.click(openPersonaBtn);

    // Modal appears
    expect(screen.getByRole('heading', { name: /Select Your Demo Persona/i })).toBeInTheDocument();

    // Verify personas are listed
    expect(screen.getByText('Working Professional')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Family')).toBeInTheDocument();
    expect(screen.getByText('Active Investor')).toBeInTheDocument();
    expect(screen.getByText('Older Adult')).toBeInTheDocument();

    // Click Student persona button
    const studentCard = screen.getByText('Student').closest('button');
    expect(studentCard).not.toBeNull();
    fireEvent.click(studentCard!);

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.persona).toBe('student');
      expect(state.user?.name).toBe('Aarav Patel');
    });
  });

  it('validates registration form, tracks password strength, and creates profile', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/auth/register'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: /Create Your Free Account/i })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByPlaceholderText(/At least 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Re-enter password/i);
    const termsCheckbox = screen.getByRole('checkbox');

    // Type strong password
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
    fireEvent.change(confirmInput, { target: { value: 'SecurePass123!' } });
    fireEvent.click(termsCheckbox);

    // Strength meter shows label
    expect(screen.getByText(/Strength:/i)).toBeInTheDocument();

    // Submit registration
    const submitBtn = screen.getByRole('button', { name: /Create Profile & Start Onboarding/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.name).toBe('Test User');
      expect(state.user?.email).toBe('test@example.com');
      expect(state.onboardingCompleted).toBe(false);
    });
  });

  it('renders forgot-password with prototype disclosure and simulated dispatch', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/auth/forgot-password'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByRole('heading', { name: /Recover Your Password/i })).toBeInTheDocument();
    expect(screen.getByText(/Simulated password reset flow for demonstration environments/i)).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Registered Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'recovery@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /Send Simulated Recovery Link/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Request Validated Locally/i })).toBeInTheDocument();
      expect(screen.getByText(/recovery@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Prototype Environment Notice:/i)).toBeInTheDocument();
    });
  });

  it('renders reset-password and verify-email mock flows', async () => {
    // Reset password
    const resetRouter = createMemoryRouter(router.routes, { initialEntries: ['/auth/reset-password'] });
    const { unmount } = render(<RouterProvider router={resetRouter} />);
    expect(screen.getByRole('heading', { name: /Reset Your Password/i })).toBeInTheDocument();
    expect(screen.getByText(/Prototype Environment Boundary/i)).toBeInTheDocument();
    unmount();

    // Verify email
    const verifyRouter = createMemoryRouter(router.routes, { initialEntries: ['/auth/verify-email'] });
    render(<RouterProvider router={verifyRouter} />);
    expect(screen.getByRole('heading', { name: /Email Verification Status/i })).toBeInTheDocument();
    expect(screen.getByText(/Simulated Verification Active/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users attempting to access /app/dashboard to /auth/login', () => {
    useAuthStore.setState({ isAuthenticated: false, user: INITIAL_USER });
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    // Should redirect to login
    expect(screen.getByRole('heading', { name: /Welcome to EXPENZO/i })).toBeInTheDocument();
  });

  it('redirects authenticated users without onboarding completion to /onboarding', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'user-test',
        name: 'Unonboarded User',
        email: 'user@test.local',
        persona: 'professional',
        currency: 'INR',
        monthlyBudgetLimitMinor: 3000000,
        createdAt: '2026-10-15',
      },
      onboardingCompleted: false,
    });

    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={testRouter} />);

    // Should redirect to onboarding
    expect(screen.getByText(/Step 1 of 7/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Welcome to EXPENZO/i })).toBeInTheDocument();
  });

  it('allows completing 7-step onboarding wizard and configuring preferences', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'user-test',
        name: 'Test Onboarder',
        email: 'onboard@test.local',
        persona: 'professional',
        currency: 'INR',
        monthlyBudgetLimitMinor: 3000000,
        createdAt: '2026-10-15',
      },
      onboardingCompleted: false,
    });

    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/onboarding'] });
    render(<RouterProvider router={testRouter} />);

    // Step 1: Welcome
    expect(screen.getByText(/Step 1 of 7/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Let's Get Started/i }));

    // Step 2: Experience Level
    expect(screen.getByText(/Step 2 of 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose Your Financial Experience Level/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Advanced'));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 3: Persona
    expect(screen.getByText(/Step 3 of 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Your Financial Persona/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Investor'));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 4: Goals
    expect(screen.getByText(/Step 4 of 7/i)).toBeInTheDocument();
    expect(screen.getByText(/What Are Your Primary Financial Goals\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Monitor investments/i));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 5: Dashboard Complexity & Theme
    expect(screen.getByText(/Step 5 of 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Personalize Your Workspace/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('advanced'));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 6: Demo Data Mode (Seeded vs Empty)
    expect(screen.getByText(/Step 6 of 7/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose Your Initial Financial Setup/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Start with Pre-Loaded Demonstration Data/i));
    fireEvent.click(screen.getByRole('button', { name: /Review & Finish/i }));

    // Step 7: Completion & Summary
    expect(screen.getByText(/Step 7 of 7/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /You're All Set/i })).toBeInTheDocument();
    expect(screen.getByText('investor')).toBeInTheDocument();

    // Click Launch
    fireEvent.click(screen.getByRole('button', { name: /Open My Dashboard/i }));

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.onboardingCompleted).toBe(true);
      expect(state.preferences.persona).toBe('investor');
      expect(state.preferences.experienceLevel).toBe('advanced');
      expect(state.preferences.dashboardComplexity).toBe('advanced');
    });
  });

  it('supports empty workspace setup mode in onboarding', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: 'user-clean',
        name: 'Clean Slate',
        email: 'clean@test.local',
        persona: 'student',
        currency: 'INR',
        monthlyBudgetLimitMinor: 1000000,
        createdAt: '2026-10-15',
      },
      onboardingCompleted: false,
    });

    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/onboarding'] });
    render(<RouterProvider router={testRouter} />);

    // Fast-forward to step 6 (Data Mode)
    // Step 1
    fireEvent.click(screen.getByRole('button', { name: /Let's Get Started/i }));
    // Step 2
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    // Step 3
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    // Step 4
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    // Step 5
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 6: Select Clean Slate Workspace
    expect(screen.getByText(/Choose Your Initial Financial Setup/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Start with Clean Slate Workspace/i));
    fireEvent.click(screen.getByRole('button', { name: /Review & Finish/i }));

    // Step 7: Launch
    fireEvent.click(screen.getByRole('button', { name: /Open My Dashboard/i }));

    await waitFor(() => {
      const authState = useAuthStore.getState();
      expect(authState.onboardingCompleted).toBe(true);
      expect(authState.preferences.demoDataMode).toBe('empty-demo');

      const financeState = useFinanceStore.getState();
      expect(financeState.transactions.length).toBe(0);
      expect(financeState.holdings.length).toBe(0);
    });
  });
});
