import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { router } from '@/app/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';

describe('EXPENZO Route and Layout Smoke Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: true, onboardingCompleted: true });
    useFinanceStore.getState().resetToDemo();
  });

  it('renders marketing homepage on /', () => {
    const memoryRouter = createMemoryRouter(router.routes, { initialEntries: ['/'] });
    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByText(/All Your Money. One Smarter Place./i)).toBeInTheDocument();
  });

  it('renders marketing features page on /features', () => {
    const memoryRouter = createMemoryRouter(router.routes, { initialEntries: ['/features'] });
    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByText(/Everything You Need to Understand Your Money/i)).toBeInTheDocument();
  });

  it('renders dashboard on /app/dashboard', () => {
    const memoryRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/dashboard'] });
    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByText(/Here's what's happening with your money/i)).toBeInTheDocument();
  });

  it('renders notifications center on /app/notifications', () => {
    const memoryRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/notifications'] });
    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByText('Notifications Center')).toBeInTheDocument();
  });

  it('renders all settings routes without placeholder pages', () => {
    const settingsPaths = [
      '/app/settings/profile',
      '/app/settings/appearance',
      '/app/settings/financial',
      '/app/settings/security',
      '/app/settings/connections',
      '/app/settings/privacy',
      '/app/settings/notifications',
    ];

    for (const path of settingsPaths) {
      const memoryRouter = createMemoryRouter(router.routes, { initialEntries: [path] });
      const { unmount } = render(<RouterProvider router={memoryRouter} />);
      expect(screen.getByText('Settings & Preferences')).toBeInTheDocument();
      // Ensure no PlaceholderPage text remains
      expect(screen.queryByText(/Phase 10 Settings & Polish/i)).not.toBeInTheDocument();
      unmount();
    }
  });

  it('supports canonical financial-planner and compatibility aliases on /app/planner', () => {
    const memoryRouter = createMemoryRouter(router.routes, { initialEntries: ['/app/planner'] });
    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByText(/Financial Planner & Goals/i)).toBeInTheDocument();
  });

  it('renders 404 NotFoundPage for unknown routes', () => {
    const memoryRouter = createMemoryRouter(router.routes, { initialEntries: ['/unknown-financial-route'] });
    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
  });
});
