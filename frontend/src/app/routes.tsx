import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';
import { UIPreviewPage } from '@/features/dev/UIPreviewPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';

// Phase 2 Marketing Pages
import { HomePage } from '@/features/marketing/pages/HomePage';
import { FeaturesPage } from '@/features/marketing/pages/FeaturesPage';
import { AIPage } from '@/features/marketing/pages/AIPage';
import { BankingInfoPage } from '@/features/marketing/pages/BankingInfoPage';
import { InvestmentsInfoPage } from '@/features/marketing/pages/InvestmentsInfoPage';
import { AboutPage } from '@/features/marketing/pages/AboutPage';
import { SecurityPage } from '@/features/marketing/pages/SecurityPage';
import { ContactPage } from '@/features/marketing/pages/ContactPage';
import { PrivacyPage } from '@/features/marketing/pages/PrivacyPage';
import { TermsPage } from '@/features/marketing/pages/TermsPage';

// Phase 3 Auth & Onboarding Pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { OnboardingPage } from '@/features/auth/pages/OnboardingPage';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Phase 4 Dashboard Page
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

// Phase 5 Expenses & Budgets Pages
import { ExpensesPage } from '@/features/expenses/pages/ExpensesPage';
import { TransactionsPage } from '@/features/expenses/pages/TransactionsPage';
import { TransactionDetailPage } from '@/features/expenses/pages/TransactionDetailPage';
import { CategoriesPage } from '@/features/expenses/pages/CategoriesPage';
import { BudgetsPage } from '@/features/expenses/pages/BudgetsPage';
import { RecurringPage } from '@/features/expenses/pages/RecurringPage';

// Phase 6 Banking Pages
import { BankingPage } from '@/features/banking/pages/BankingPage';
import { AccountsDirectoryPage } from '@/features/banking/pages/AccountsDirectoryPage';
import { AccountDetailPage } from '@/features/banking/pages/AccountDetailPage';
import { TransferPage } from '@/features/banking/pages/TransferPage';
import { BeneficiariesPage } from '@/features/banking/pages/BeneficiariesPage';
import { BankingTransactionsPage } from '@/features/banking/pages/BankingTransactionsPage';
import { StatementsPage } from '@/features/banking/pages/StatementsPage';
import { BillsPage } from '@/features/banking/pages/BillsPage';
import { CardsPage } from '@/features/banking/pages/CardsPage';
import { DepositsPage } from '@/features/banking/pages/DepositsPage';
import { LoansPage } from '@/features/banking/pages/LoansPage';
import { BankingServicesPage } from '@/features/banking/pages/BankingServicesPage';

// Phase 7A Investment Pages
import { InvestmentsPage } from '@/features/investments/pages/InvestmentsPage';
import { HoldingsPage } from '@/features/investments/pages/HoldingsPage';
import { StockDiscoverPage } from '@/features/investments/pages/StockDiscoverPage';
import { StockDetailPage } from '@/features/investments/pages/StockDetailPage';
import { WatchlistsPage } from '@/features/investments/pages/WatchlistsPage';
import { WatchlistDetailPage } from '@/features/investments/pages/WatchlistDetailPage';
import { PortfolioAnalyticsPage } from '@/features/investments/pages/PortfolioAnalyticsPage';

// Phase 7B AI Intelligence Pages
import { AIAssistantPage } from '@/features/ai/pages/AIAssistantPage';
import { AIInsightsPage } from '@/features/ai/pages/AIInsightsPage';
import { AIInsightDetailPage } from '@/features/ai/pages/AIInsightDetailPage';

// Phase 7C Financial Planner Pages
import { FinancialPlannerPage } from '@/features/planner/pages/FinancialPlannerPage';
import { GoalDetailPage } from '@/features/planner/pages/GoalDetailPage';
import { SimulatorPage } from '@/features/planner/pages/SimulatorPage';

// Phase 7D Financial Reports Pages
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { ReportDetailPage } from '@/features/reports/pages/ReportDetailPage';

// Phase 7E Financial Learning Academy Pages
import { LearningHubPage } from '@/features/learning/pages/LearningHubPage';
import { TopicArticlePage } from '@/features/learning/pages/TopicArticlePage';

// Phase 8 Notifications Center Page
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';

// Phase 8 Settings Layout & Pages
import { SettingsLayout } from '@/features/settings/layouts/SettingsLayout';
import { ProfileSettingsPage } from '@/features/settings/pages/ProfileSettingsPage';
import { AppearanceSettingsPage } from '@/features/settings/pages/AppearanceSettingsPage';
import { FinancialSettingsPage } from '@/features/settings/pages/FinancialSettingsPage';
import { SecuritySettingsPage } from '@/features/settings/pages/SecuritySettingsPage';
import { ConnectionsSettingsPage } from '@/features/settings/pages/ConnectionsSettingsPage';
import { PrivacySettingsPage } from '@/features/settings/pages/PrivacySettingsPage';
import { NotificationSettingsPage } from '@/features/settings/pages/NotificationSettingsPage';

export const router = createBrowserRouter([
  // 1. Public Marketing Website (Phase 2 Implemented)
  {
    path: '/',
    element: <MarketingLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'features',
        element: <FeaturesPage />,
      },
      {
        path: 'ai',
        element: <AIPage />,
      },
      {
        path: 'banking-info',
        element: <BankingInfoPage />,
      },
      {
        path: 'investments-info',
        element: <InvestmentsInfoPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'security',
        element: <SecurityPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
    ],
  },

  // 2. Authentication & Onboarding (Phase 3 Implemented)
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
    ],
  },
  {
    path: 'onboarding',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <OnboardingPage />,
      },
    ],
  },

  // 3. Authenticated App Shell & Financial Modules (Placeholders for Phase 4+)
  {
    path: 'app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },

      // Expenses Group (Phase 5 Implemented)
      {
        path: 'expenses',
        element: <ExpensesPage />,
      },
      {
        path: 'transactions',
        element: <TransactionsPage />,
      },
      {
        path: 'transactions/:id',
        element: <TransactionDetailPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'budgets',
        element: <BudgetsPage />,
      },
      {
        path: 'recurring',
        element: <RecurringPage />,
      },

      // Banking Group (Phase 6 Implemented)
      {
        path: 'banking',
        element: <BankingPage />,
      },
      {
        path: 'banking/accounts',
        element: <AccountsDirectoryPage />,
      },
      {
        path: 'banking/accounts/:id',
        element: <AccountDetailPage />,
      },
      {
        path: 'banking/transfer',
        element: <TransferPage />,
      },
      {
        path: 'banking/beneficiaries',
        element: <BeneficiariesPage />,
      },
      {
        path: 'banking/transactions',
        element: <BankingTransactionsPage />,
      },
      {
        path: 'banking/statements',
        element: <StatementsPage />,
      },
      {
        path: 'banking/bills',
        element: <BillsPage />,
      },
      {
        path: 'banking/cards',
        element: <CardsPage />,
      },
      {
        path: 'banking/deposits',
        element: <DepositsPage />,
      },
      {
        path: 'banking/loans',
        element: <LoansPage />,
      },
      {
        path: 'banking/services',
        element: <BankingServicesPage />,
      },

      // Investments Group (Phase 7A Implemented)
      {
        path: 'investments',
        element: <InvestmentsPage />,
      },
      {
        path: 'investments/holdings',
        element: <HoldingsPage />,
      },
      {
        path: 'investments/discover',
        element: <StockDiscoverPage />,
      },
      {
        path: 'investments/stocks/:symbol',
        element: <StockDetailPage />,
      },
      {
        path: 'investments/watchlists',
        element: <WatchlistsPage />,
      },
      {
        path: 'investments/watchlists/:id',
        element: <WatchlistDetailPage />,
      },
      {
        path: 'investments/analytics',
        element: <PortfolioAnalyticsPage />,
      },

      // Intelligence Group (Phase 7B Implemented)
      {
        path: 'ai-assistant',
        element: <AIAssistantPage />,
      },
      {
        path: 'ai-assistant/:chatId',
        element: <AIAssistantPage />,
      },
      {
        path: 'ai-insights',
        element: <AIInsightsPage />,
      },
      {
        path: 'ai-insights/:id',
        element: <AIInsightDetailPage />,
      },
      // Financial Planner Group (Phase 7C Implemented)
      {
        path: 'financial-planner',
        element: <FinancialPlannerPage />,
      },
      {
        path: 'financial-planner/goals/:id',
        element: <GoalDetailPage />,
      },
      {
        path: 'financial-planner/simulator',
        element: <SimulatorPage />,
      },

      // More Group
      // Reports Group (Phase 7D Implemented)
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'reports/:id',
        element: <ReportDetailPage />,
      },
      // Financial Learning Group (Phase 7E Implemented)
      {
        path: 'learning',
        element: <LearningHubPage />,
      },
      {
        path: 'learning/topics/:slug',
        element: <TopicArticlePage />,
      },
      // Notifications Center (Phase 8 Implemented)
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },

      // Settings Group (Phase 8 Implemented)
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <Navigate to="/app/settings/profile" replace /> },
          {
            path: 'profile',
            element: <ProfileSettingsPage />,
          },
          {
            path: 'appearance',
            element: <AppearanceSettingsPage />,
          },
          {
            path: 'financial',
            element: <FinancialSettingsPage />,
          },
          {
            path: 'security',
            element: <SecuritySettingsPage />,
          },
          {
            path: 'connections',
            element: <ConnectionsSettingsPage />,
          },
          {
            path: 'privacy',
            element: <PrivacySettingsPage />,
          },
          {
            path: 'notifications',
            element: <NotificationSettingsPage />,
          },
        ],
      },

      // Route Invariant Aliases & Compatibility Redirects (Work Package 8C)
      {
        path: 'planner',
        element: <Navigate to="/app/financial-planner" replace />,
      },
      {
        path: 'planner/goals/:id',
        element: <GoalDetailPage />,
      },
      {
        path: 'planner/simulator',
        element: <Navigate to="/app/financial-planner/simulator" replace />,
      },
      {
        path: 'learning/:slug',
        element: <TopicArticlePage />,
      },
    ],
  },

  // 4. Developer Tools
  {
    path: 'dev/ui-preview',
    element: (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 text-slate-900 dark:text-slate-100">
        <UIPreviewPage />
      </div>
    ),
  },

  // 5. 404 Catch-All
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
