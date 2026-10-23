import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Wallet,
  Building2,
  TrendingUp,
  Sparkles,
  Target,
  CheckCircle2,
  ArrowRight,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';

type TabKey = 'expenses' | 'banking' | 'investments' | 'ai' | 'planning';

interface TabContent {
  id: TabKey;
  hash: string;
  name: string;
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
  capabilities: string[];
  useCases: string[];
  ctaLabel: string;
  ctaRoute: string;
}

const TABS: TabContent[] = [
  {
    id: 'expenses',
    hash: '#expenses',
    name: 'Expense Tracking',
    icon: Wallet,
    eyebrow: 'Pillar 1 • Granular Ledger',
    title: 'Precision Expense Management & Category Budgets',
    description:
      'Log day-to-day spending with natural language parsing, establish category budget ceilings, and maintain an immutable audit trail of every rupee spent.',
    capabilities: [
      'Natural-language transaction entry: "Spent ₹500 on dinner with friends"',
      'Multi-tier budget utilization indicators (Normal, 80% Warning, 100% Exceeded)',
      'Custom categories with color codes and payment method tags (UPI, Card, Cash)',
      'Recurring bill reminders for utilities, subscriptions, and rent commitments',
    ],
    useCases: [
      'Auditing monthly groceries and dining expenses',
      'Preventing discretionary budget overruns with early warning alerts',
      'Exporting clean CSV statements for tax preparation',
    ],
    ctaLabel: 'Explore Expense Demo',
    ctaRoute: '/app/expenses',
  },
  {
    id: 'banking',
    hash: '#banking',
    name: 'Banking Overview',
    icon: Building2,
    eyebrow: 'Pillar 2 • Account Aggregation',
    title: 'Unified Multi-Account Visibility Without Credential Sharing',
    description:
      'Consolidate everyday savings, goal deposits, and physical cash into a unified balance overview with atomic transfers between accounts.',
    capabilities: [
      'Unified balance summation across multiple deposit institutions',
      'Atomic transfer simulation between owned accounts (no double counting as income/expense)',
      'Isolated account-level audit statements and transaction streams',
      'Planned roadmap for future read-only account aggregator connectivity',
    ],
    useCases: [
      'Moving savings from Everyday Checking to High-Yield Goal Accounts',
      'Auditing monthly cash outflows across disparate bank accounts',
      'Generating reconciled closing statements with opening balances',
    ],
    ctaLabel: 'Explore Banking Demo',
    ctaRoute: '/app/banking',
  },
  {
    id: 'investments',
    hash: '#investments',
    name: 'Investments',
    icon: TrendingUp,
    eyebrow: 'Pillar 3 • Wealth & Equities',
    title: 'Portfolio Valuation, Asset Allocation & Stock Discovery',
    description:
      'Monitor equities, ETFs, and mutual funds alongside liquid cash. Track average cost basis, real-time market valuations, and sector concentrations.',
    capabilities: [
      'Portfolio valuation tracking with cost basis and unrealized gain/loss %',
      'Asset class allocation visualization (Equity, Debt, Gold, Cash)',
      'Search Indian equities (NSE/BSE) with 52-week ranges and P/E multiples',
      'Customizable stock watchlists with real-time price alerts',
    ],
    useCases: [
      'Analyzing technology sector exposure across blue-chip stocks (TCS, INFY)',
      'Tracking net returns on long-term equity investments',
      'Evaluating portfolio risk and asset diversification',
    ],
    ctaLabel: 'Explore Investment Demo',
    ctaRoute: '/app/investments',
  },
  {
    id: 'ai',
    hash: '#ai',
    name: 'AI Intelligence',
    icon: Sparkles,
    eyebrow: 'Pillar 4 • Explainable Analytics',
    title: 'Deterministic Financial Diagnosis & Conversational Assistance',
    description:
      'Transform raw financial transactions into plain English intelligence. Get proactive alerts on spending surges and conversational answers to complex queries.',
    capabilities: [
      '100% deterministic, offline client-side intent classifier',
      'Structured financial responses with micro-charts and deep-links',
      'Proactive diagnostic observation cards for savings rates and budget thresholds',
      'Zero financial data transmitted to external LLM providers',
    ],
    useCases: [
      'Asking "Where did most of my money go this month?" in conversational text',
      'Receiving automated surplus notifications when income exceeds projections',
      'Diagnosing which category pushed monthly expenses over baseline',
    ],
    ctaLabel: 'Explore AI Assistant',
    ctaRoute: '/app/ai-assistant',
  },
  {
    id: 'planning',
    hash: '#planning',
    name: 'Financial Planning',
    icon: Target,
    eyebrow: 'Pillar 5 • Goals & Scenarios',
    title: 'Milestone Goal Tracking & What-If Financial Simulations',
    description:
      'Set target dates and funding goals for emergency funds, gadgets, or vacations. Simulate the effect of monthly contribution changes on your target completion date.',
    capabilities: [
      'Milestone savings goals with contribution progress rings',
      'Interactive "What-If" scenario simulator with real-time target adjustments',
      'Earmarked goal allocations tracked separately from operational cash',
      'Periodic financial health scorecards and savings rate tracking',
    ],
    useCases: [
      'Simulating: "What if I save ₹3,000 more each month toward my laptop?"',
      'Tracking dedicated emergency fund milestones',
      'Forecasting retirement or vehicle purchase timelines',
    ],
    ctaLabel: 'Explore Financial Planner',
    ctaRoute: '/app/financial-planner',
  },
];

export function FeaturesPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>('expenses');

  // Handle URL hash changes (e.g. #banking -> selects banking tab)
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const match = TABS.find((t) => t.hash === hash);
      if (match) {
        setActiveTab(match.id);
      }
    }
  }, [location.hash]);

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];
  const Icon = currentTab.icon;

  const handleTabClick = (tab: TabContent) => {
    setActiveTab(tab.id);
    window.history.replaceState(null, '', tab.hash);
  };

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="success">Platform Architecture</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything You Need to Understand Your Money.
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Explore the five foundational pillars of EXPENZO. Each module functions as an interconnected component of your financial command center.
        </p>
      </div>

      {/* Feature Tabs Selector */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 gap-2 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Showcase Box */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in-50 duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <Badge variant="outline">{currentTab.eyebrow}</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentTab.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentTab.description}
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Core Architectural Capabilities:
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {currentTab.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link to={currentTab.ctaRoute}>
                <Button>
                  {currentTab.ctaLabel}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 bg-slate-50 dark:bg-[#152238] border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 dark:text-slate-200">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span>Practical Use Cases</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                {currentTab.useCases.map((uc, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-white dark:bg-[#0E1726] border border-slate-200/60 dark:border-slate-800">
                    {uc}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-snug">
                Fully functional in local demo mode. No backend API or network dependency required to explore this feature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

