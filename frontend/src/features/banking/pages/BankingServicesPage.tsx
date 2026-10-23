import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ArrowRightLeft,
  Receipt,
  FileText,
  CreditCard,
  PiggyBank,
  Percent,
  Users,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'accounts' | 'payments' | 'cards' | 'savings' | 'borrowing' | 'digital';
  route?: string;
  badge?: string;
  futureIntegrationInfo?: {
    headline: string;
    description: string;
    complianceNote: string;
  };
}

const SERVICES: ServiceItem[] = [
  // Accounts
  {
    id: 'srv_summary',
    title: 'Accounts Overview',
    description: 'Consolidated balances, liquidity summary, and banking cash-flow.',
    icon: Building2,
    category: 'accounts',
    route: '/app/banking',
    badge: 'Active',
  },
  {
    id: 'srv_directory',
    title: 'Accounts Directory',
    description: 'Manage, edit metadata, and safely archive eligible demo accounts.',
    icon: Building2,
    category: 'accounts',
    route: '/app/banking/accounts',
    badge: 'Active',
  },
  {
    id: 'srv_txns',
    title: 'Banking Transactions',
    description: 'Searchable ledger stream filtered by account and payment rail.',
    icon: FileText,
    category: 'accounts',
    route: '/app/banking/transactions',
    badge: 'Active',
  },
  {
    id: 'srv_statements',
    title: 'Audited Statements',
    description: 'Periodic statements with mathematical opening-to-closing reconciliation.',
    icon: FileText,
    category: 'accounts',
    route: '/app/banking/statements',
    badge: 'Active',
  },

  // Payments
  {
    id: 'srv_transfer',
    title: 'Internal Demo Transfers',
    description: 'Simulate atomic fund movements between owned deposit accounts.',
    icon: ArrowRightLeft,
    category: 'payments',
    route: '/app/banking/transfer',
    badge: 'Active',
  },
  {
    id: 'srv_bills',
    title: 'Bills & Payment Manager',
    description: 'Track due dates for electricity, rent, and internet with one-click payment logging.',
    icon: Receipt,
    category: 'payments',
    route: '/app/banking/bills',
    badge: 'Active',
  },
  {
    id: 'srv_beneficiaries',
    title: 'Beneficiary Contacts',
    description: 'Organize payees, landlords, and family contacts in a structured directory.',
    icon: Users,
    category: 'payments',
    route: '/app/banking/beneficiaries',
    badge: 'Active',
  },
  {
    id: 'srv_upi',
    title: 'UPI & Instant QR Payments',
    description: 'Account Aggregator & NPCI unified payments interface integration roadmap.',
    icon: ExternalLink,
    category: 'payments',
    badge: 'Roadmap',
    futureIntegrationInfo: {
      headline: 'Authorized NPCI / UPI Integration Roadmap',
      description: 'Production EXPENZO deployments will connect via RBI-regulated Account Aggregator (AA) and NPCI-certified PSP handles. In this prototype, live payment execution is intentionally disabled.',
      complianceNote: 'EXPENZO never collects UPI PINs or handles unencrypted payment secrets.',
    },
  },

  // Cards
  {
    id: 'srv_debit_cards',
    title: 'Debit Card Controls',
    description: 'Virtual card preview, daily spending limits, and instant security freezing.',
    icon: CreditCard,
    category: 'cards',
    route: '/app/banking/cards',
    badge: 'Active',
  },
  {
    id: 'srv_credit_cards',
    title: 'Credit Card Showcase',
    description: 'Track credit limits, billing statements, and outstanding liabilities.',
    icon: CreditCard,
    category: 'cards',
    route: '/app/banking/cards',
    badge: 'Active',
  },

  // Savings
  {
    id: 'srv_fd',
    title: 'Fixed Deposits (FD)',
    description: 'Compound interest calculator and maturity forecasting with quarterly compounding.',
    icon: PiggyBank,
    category: 'savings',
    route: '/app/banking/deposits',
    badge: 'Active',
  },
  {
    id: 'srv_rd',
    title: 'Recurring Deposits (RD)',
    description: 'Systematic monthly savings calculator with quarterly compounding projections.',
    icon: PiggyBank,
    category: 'savings',
    route: '/app/banking/deposits',
    badge: 'Active',
  },

  // Borrowing
  {
    id: 'srv_loans',
    title: 'Loan & EMI Calculator',
    description: 'Equated monthly instalment estimates, total interest, and amortization tables.',
    icon: Percent,
    category: 'borrowing',
    route: '/app/banking/loans',
    badge: 'Active',
  },
  {
    id: 'srv_credit_score',
    title: 'Credit Bureau Health Check',
    description: 'CIBIL / Experian credit score reporting and repayment impact modeling.',
    icon: Sparkles,
    category: 'borrowing',
    badge: 'Roadmap',
    futureIntegrationInfo: {
      headline: 'Authorized Credit Bureau Reporting',
      description: 'Future versions of EXPENZO will offer authorized soft-pull credit score checks via licensed CICs (Credit Information Companies) with zero impact on your credit rating.',
      complianceNote: 'Soft-pulls require explicit OTP consent per RBI master directions.',
    },
  },
];

export function BankingServicesPage() {
  const navigate = useNavigate();
  const [selectedRoadmapService, setSelectedRoadmapService] = useState<ServiceItem | null>(null);

  const handleServiceClick = (service: ServiceItem) => {
    if (service.route) {
      navigate(service.route);
    } else if (service.futureIntegrationInfo) {
      setSelectedRoadmapService(service);
    }
  };

  const categories = [
    { id: 'accounts', label: 'Accounts & Statements' },
    { id: 'payments', label: 'Payments & Transfers' },
    { id: 'cards', label: 'Cards & Security Controls' },
    { id: 'savings', label: 'Savings & Term Deposits' },
    { id: 'borrowing', label: 'Borrowing & Credit' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Top Header */}
      <div>
        <Link
          to="/app/banking"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-2"
        >
          <Building2 className="h-3.5 w-3.5" />
          Back to Banking Overview
        </Link>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Banking Services Directory
          </h1>
          <Badge variant="outline" className="text-xs">
            {SERVICES.length} Modules
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore all banking capabilities, calculators, and authorized digital service roadmap.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const items = SERVICES.filter((s) => s.category === cat.id);
          return (
            <div key={cat.id} className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {cat.label}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((service) => {
                  const Icon = service.icon;
                  const isRoadmap = service.badge === 'Roadmap';

                  return (
                    <Card
                      key={service.id}
                      onClick={() => handleServiceClick(service)}
                      className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 transition-colors">
                            <Icon className="h-5 w-5" />
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold uppercase ${
                              isRoadmap
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                            }`}
                          >
                            {service.badge}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {service.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-emerald-600">
                        <span>{isRoadmap ? 'View Roadmap' : 'Launch Service'}</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Roadmap Informational Dialog */}
      {selectedRoadmapService && selectedRoadmapService.futureIntegrationInfo && (
        <Dialog.Root
          open={!!selectedRoadmapService}
          onOpenChange={(open) => !open && setSelectedRoadmapService(null)}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-[#111C30] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <Dialog.Title className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {selectedRoadmapService.futureIntegrationInfo.headline}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedRoadmapService.futureIntegrationInfo.description}
              </p>

              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 space-y-1">
                <strong>Compliance & User Privacy:</strong>
                <p>{selectedRoadmapService.futureIntegrationInfo.complianceNote}</p>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setSelectedRoadmapService(null)} size="sm">
                  Got It
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}

