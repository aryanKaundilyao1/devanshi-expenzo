import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { router } from '@/app/routes';

describe('Phase 2 Public Marketing Website Tests', () => {
  it('renders Homepage with all key sections and headlines', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/'] });
    render(<RouterProvider router={testRouter} />);

    // Hero headline and eyebrow
    expect(screen.getByText('Your Intelligent Financial Companion')).toBeInTheDocument();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(/All Your Money/i);
    expect(h1).toHaveTextContent(/One Smarter Place/i);

    // Section 3: Dashboard Preview
    expect(screen.getByText('Experience the Unified Command Center')).toBeInTheDocument();

    // Section 4: Features
    expect(screen.getByText('Know Exactly Where Your Money Goes.')).toBeInTheDocument();

    // Section 5: AI Showcase
    expect(screen.getByText('Conversational Financial Assistance')).toBeInTheDocument();

    // Section 6: How It Works
    expect(screen.getByText('How EXPENZO Works')).toBeInTheDocument();

    // Section 7: Personalization
    expect(screen.getByText('Adapts to Your Financial Life Stage')).toBeInTheDocument();

    // Section 8: Security
    expect(screen.getByText('Security Built on Principles, Not Buzzwords')).toBeInTheDocument();

    // Section 9: Final CTA
    expect(screen.getByText('Take Control of Your Financial Future.')).toBeInTheDocument();
  });

  it('allows switching tabs and periods in the interactive dashboard preview', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/'] });
    render(<RouterProvider router={testRouter} />);

    // Period filter 7D
    const btn7D = screen.getByRole('button', { name: '7D' });
    fireEvent.click(btn7D);

    // Tab Expenses
    const expTab = screen.getByRole('button', { name: /^expenses$/i });
    fireEvent.click(expTab);
    expect(screen.getByText('Spending by Category (October 2026)')).toBeInTheDocument();

    // Tab Banking
    const bankTab = screen.getByRole('button', { name: /^banking$/i });
    fireEvent.click(bankTab);
    expect(screen.getAllByText('Everyday Savings').length).toBeGreaterThan(0);
  });

  it('renders Features page and allows tab switching', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/features'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Everything You Need to Understand Your Money.')).toBeInTheDocument();
    expect(screen.getByText('Precision Expense Management & Category Budgets')).toBeInTheDocument();

    // Click Banking Tab
    const bankBtn = screen.getByRole('button', { name: /Banking Overview/i });
    fireEvent.click(bankBtn);
    expect(screen.getByText('Unified Multi-Account Visibility Without Credential Sharing')).toBeInTheDocument();

    // Click Investments Tab
    const invBtn = screen.getByRole('button', { name: /Investments/i });
    fireEvent.click(invBtn);
    expect(screen.getByText('Portfolio Valuation, Asset Allocation & Stock Discovery')).toBeInTheDocument();
  });

  it('renders AI Intelligence page and calculates deterministic query answers', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/ai'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Financial Intelligence, Transparent & Verifiable.')).toBeInTheDocument();

    // Click portfolio question chip
    const portfolioQueryBtn = screen.getByRole('button', { name: 'How is my portfolio performing?' });
    fireEvent.click(portfolioQueryBtn);

    await waitFor(() => {
      expect(screen.getByText(/Your investment portfolio is valued at/i)).toBeInTheDocument();
    });
  });

  it('renders Banking Info page with functional demo account switcher', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/banking-info'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Multi-Account Banking, Uncluttered.')).toBeInTheDocument();
    expect(screen.getByText('Interactive Account Switcher')).toBeInTheDocument();

    // Switch to SBI Goals Savings
    const sbiCard = screen.getByRole('button', { name: /State Bank of India/i });
    fireEvent.click(sbiCard);

    expect(screen.getByText('Ledger Movements: Goals Savings')).toBeInTheDocument();
  });

  it('renders Investments Info page with holdings and risk disclaimer', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/investments-info'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Track Your Wealth with Institutional Precision.')).toBeInTheDocument();
    expect(screen.getByText('Statutory Investment Risk Disclaimer')).toBeInTheDocument();
    expect(screen.getAllByText('Tata Consultancy Services Ltd').length).toBeGreaterThan(0);
  });

  it('validates contact form with Zod and confirms local demo submission', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/contact'] });
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Get in Touch with the Team')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const messageInput = screen.getByPlaceholderText(/Share your thoughts/i);
    const submitBtn = screen.getByRole('button', { name: /Submit Verification Note/i });

    // Submit invalid empty form
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
    });

    // Enter valid inputs
    fireEvent.change(nameInput, { target: { value: 'Aryan Sharma' } });
    fireEvent.change(emailInput, { target: { value: 'aryan.sharma@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Testing the client-side validation suite on the contact page.' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Input Successfully Validated!')).toBeInTheDocument();
      expect(screen.getByText(/Notice: In accordance with our demo contract, no remote email was sent./i)).toBeInTheDocument();
    });
  });

  it('renders About, Security, Privacy and Terms legal notices', () => {
    const aboutRouter = createMemoryRouter(router.routes, { initialEntries: ['/about'] });
    const { unmount: unmountAbout } = render(<RouterProvider router={aboutRouter} />);
    expect(screen.getByText('Bringing Clarity to Personal Wealth.')).toBeInTheDocument();
    unmountAbout();

    const secRouter = createMemoryRouter(router.routes, { initialEntries: ['/security'] });
    const { unmount: unmountSec } = render(<RouterProvider router={secRouter} />);
    expect(screen.getByText('Security & Privacy Architecture')).toBeInTheDocument();
    unmountSec();

    const privRouter = createMemoryRouter(router.routes, { initialEntries: ['/privacy'] });
    const { unmount: unmountPriv } = render(<RouterProvider router={privRouter} />);
    expect(screen.getByText('1. Demonstration Nature of this Platform')).toBeInTheDocument();
    unmountPriv();

    const termsRouter = createMemoryRouter(router.routes, { initialEntries: ['/terms'] });
    render(<RouterProvider router={termsRouter} />);
    expect(screen.getByText('1. Prototype Scope and Permitted Usage')).toBeInTheDocument();
  });
});

