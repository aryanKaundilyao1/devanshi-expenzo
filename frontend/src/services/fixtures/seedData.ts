import {
  UserProfile,
  FinancialAccount,
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  StockQuote,
  InvestmentHolding,
  Watchlist,
  FinancialInsight,
  NotificationItem,
  NotificationPreferences,
  RecurringRule,
  BankingBeneficiary,
  BankingBill,
  DemoCard,
  DepositSimulation,
  LoanSimulation,
} from '@/types/finance';

export const DEMO_AS_OF = '2026-10-15';

export const INITIAL_USER: UserProfile = {
  id: 'usr_pro_01',
  name: 'Aryan Sharma',
  email: 'aryan.sharma@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  persona: 'professional',
  currency: 'INR',
  monthlyBudgetLimitMinor: 3000000, // ₹30,000
  createdAt: '2026-01-01T00:00:00Z',
};

export const INITIAL_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'acct_hdfc',
    name: 'Everyday Savings',
    institution: 'HDFC Bank',
    accountType: 'savings',
    accountNumberMasked: '•••• 4892',
    openingBalanceMinor: 2130000, // ₹21,300 (+ net delta ₹28,700 yields exact target ₹50,000)
    currency: 'INR',
    isDemo: true,
    lastUpdated: '2026-10-15T10:30:00Z',
  },
  {
    id: 'acct_sbi',
    name: 'Goals Savings',
    institution: 'State Bank of India',
    accountType: 'savings',
    accountNumberMasked: '•••• 8104',
    openingBalanceMinor: 2020000, // ₹20,200 (+ transfer ₹5,000 yields exact target ₹25,200)
    currency: 'INR',
    isDemo: true,
    lastUpdated: '2026-10-15T09:15:00Z',
  },
  {
    id: 'acct_cash',
    name: 'Cash Wallet',
    institution: 'Physical Cash',
    accountType: 'wallet',
    accountNumberMasked: 'Cash in Hand',
    openingBalanceMinor: 250000, // ₹2,500 (- transport ₹500 yields exact target ₹2,000)
    currency: 'INR',
    isDemo: true,
    lastUpdated: '2026-10-15T08:00:00Z',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Income
  { id: 'cat_salary', name: 'Salary', icon: 'Briefcase', color: '#16A34A', type: 'income' },
  { id: 'cat_freelance', name: 'Freelance', icon: 'Laptop', color: '#059669', type: 'income' },
  { id: 'cat_business', name: 'Business', icon: 'Building2', color: '#0D9488', type: 'income' },
  { id: 'cat_interest', name: 'Interest', icon: 'Coins', color: '#14B8A6', type: 'income' },
  { id: 'cat_gifts', name: 'Gifts', icon: 'Gift', color: '#10B981', type: 'income' },
  { id: 'cat_other_income', name: 'Other Income', icon: 'CircleDollarSign', color: '#34D399', type: 'income' },

  // Expenses
  { id: 'cat_food', name: 'Food & Dining', icon: 'Utensils', color: '#F59E0B', type: 'expense' },
  { id: 'cat_groceries', name: 'Groceries', icon: 'ShoppingBasket', color: '#84CC16', type: 'expense' },
  { id: 'cat_shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', type: 'expense' },
  { id: 'cat_transport', name: 'Transport', icon: 'Car', color: '#3B82F6', type: 'expense' },
  { id: 'cat_housing', name: 'Housing & Rent', icon: 'Home', color: '#EF4444', type: 'expense' },
  { id: 'cat_utilities', name: 'Utilities', icon: 'Zap', color: '#8B5CF6', type: 'expense' },
  { id: 'cat_education', name: 'Education', icon: 'GraduationCap', color: '#6366F1', type: 'expense' },
  { id: 'cat_healthcare', name: 'Healthcare', icon: 'HeartPulse', color: '#F43F5E', type: 'expense' },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'Film', color: '#A855F7', type: 'expense' },
  { id: 'cat_subscriptions', name: 'Subscriptions', icon: 'CalendarDays', color: '#D946EF', type: 'expense' },
  { id: 'cat_travel', name: 'Travel', icon: 'Plane', color: '#06B6D4', type: 'expense' },
  { id: 'cat_investments', name: 'Investments', icon: 'TrendingUp', color: '#10B981', type: 'expense' },
  { id: 'cat_transfer', name: 'Transfer', icon: 'ArrowRightLeft', color: '#64748B', type: 'expense' },
  { id: 'cat_other_expense', name: 'Other', icon: 'MoreHorizontal', color: '#94A3B8', type: 'expense' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_01',
    accountId: 'acct_hdfc',
    amountMinor: 5200000, // ₹52,000
    type: 'income',
    category: 'Salary',
    merchant: 'Acme Corp Technologies',
    date: '2026-10-01',
    status: 'completed',
    notes: 'October 2026 Monthly Salary Credit',
    isRecurring: true,
  },
  {
    id: 'tx_02',
    accountId: 'acct_hdfc',
    amountMinor: 1200000, // ₹12,000
    type: 'expense',
    category: 'Housing & Rent',
    merchant: 'Skyline Apartments Landlord',
    date: '2026-10-02',
    status: 'completed',
    notes: 'Monthly Apartment Rent',
    isRecurring: true,
  },
  {
    id: 'tx_03',
    accountId: 'acct_hdfc',
    amountMinor: 200000, // ₹2,000
    type: 'expense',
    category: 'Food & Dining',
    merchant: 'Nature Basket Supermarket',
    date: '2026-10-04',
    status: 'completed',
    notes: 'Weekly pantry & grocery restock',
  },
  {
    id: 'tx_04',
    accountId: 'acct_cash',
    amountMinor: 50000, // ₹500
    type: 'expense',
    category: 'Transport',
    merchant: 'Metro Smart Card Recharge',
    date: '2026-10-06',
    status: 'completed',
    notes: 'Monthly transit metro pass recharge',
  },
  {
    id: 'tx_05',
    accountId: 'acct_hdfc',
    amountMinor: 80000, // ₹800
    type: 'expense',
    category: 'Food & Dining',
    merchant: 'Olive Bistro & Cafe',
    date: '2026-10-08',
    status: 'completed',
    notes: 'Weekend dinner with colleagues',
  },
  {
    id: 'tx_06',
    accountId: 'acct_hdfc',
    targetAccountId: 'acct_sbi',
    amountMinor: 500000, // ₹5,000
    type: 'transfer',
    category: 'Transfer',
    merchant: 'Self Transfer to Goals Fund',
    date: '2026-10-10',
    status: 'completed',
    notes: 'Automated savings sweep for laptop goal',
  },
  {
    id: 'tx_07',
    accountId: 'acct_hdfc',
    amountMinor: 150000, // ₹1,500
    type: 'expense',
    category: 'Utilities',
    merchant: 'Tata Power Electricity Board',
    date: '2026-10-11',
    status: 'completed',
    notes: 'Electricity bill for September cycle',
  },
  {
    id: 'tx_08',
    accountId: 'acct_hdfc',
    amountMinor: 200000, // ₹2,000
    type: 'expense',
    category: 'Shopping',
    merchant: 'Zara Fashion Retail',
    date: '2026-10-12',
    status: 'completed',
    notes: 'Autumn formal apparel purchase',
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'bgt_food', category: 'Food & Dining', allocatedMinor: 600000, period: 'monthly', alertThresholdPercent: 80 },
  { id: 'bgt_shop', category: 'Shopping', allocatedMinor: 400000, period: 'monthly', alertThresholdPercent: 80 },
  { id: 'bgt_trans', category: 'Transport', allocatedMinor: 200000, period: 'monthly', alertThresholdPercent: 80 },
  { id: 'bgt_util', category: 'Utilities', allocatedMinor: 300000, period: 'monthly', alertThresholdPercent: 80 },
  { id: 'bgt_house', category: 'Housing & Rent', allocatedMinor: 1500000, period: 'monthly', alertThresholdPercent: 80 },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal_laptop',
    title: 'MacBook Pro Upgrade',
    targetAmountMinor: 6000000, // ₹60,000
    currentAmountMinor: 1200000, // ₹12,000
    targetDate: '2027-10-15',
    category: 'gadget',
    monthlyContributionTargetMinor: 400000, // ₹4,000/mo
  },
];

import { STOCK_CATALOG } from '@/features/investments/data/stockCatalog';

export const INITIAL_STOCK_QUOTES: Record<string, StockQuote> = STOCK_CATALOG;

export const INITIAL_HOLDINGS: InvestmentHolding[] = [
  {
    id: 'hld_tcs',
    ticker: 'TCS',
    companyName: 'Tata Consultancy Services Ltd',
    assetClass: 'equity',
    quantity: 10,
    averageBuyPriceMinor: 320000, // ₹3,200 (Invested ₹32,000, Current ₹35,000)
  },
  {
    id: 'hld_infy',
    ticker: 'INFY',
    companyName: 'Infosys Ltd',
    assetClass: 'equity',
    quantity: 5,
    averageBuyPriceMinor: 140000, // ₹1,400 (Invested ₹7,000, Current ₹7,500)
  },
];

export const INITIAL_WATCHLISTS: Watchlist[] = [
  {
    id: 'wl_default',
    name: 'Core Tech & Bluechips',
    tickers: ['TCS', 'INFY', 'HDFCBANK'],
  },
];

export const INITIAL_INSIGHTS: FinancialInsight[] = [
  {
    id: 'ins_01',
    title: 'High Savings Rate in October',
    description: 'You have saved 63.8% of your income so far this month, well above the 20% benchmark recommended for professionals.',
    category: 'savings',
    severity: 'positive',
    metricFigures: [
      { label: 'Income', value: '₹52,000' },
      { label: 'Expenses', value: '₹18,800' },
    ],
    suggestedAction: { label: 'Explore Goal Contribution', actionRoute: '/app/financial-planner' },
    generatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'ins_02',
    title: 'Housing Budget at 80% Threshold',
    description: 'Rent expense of ₹12,000 has reached 80% of your allocated ₹15,000 monthly housing budget.',
    category: 'budget',
    severity: 'warning',
    metricFigures: [
      { label: 'Budget', value: '₹15,000' },
      { label: 'Spent', value: '₹12,000' },
    ],
    suggestedAction: { label: 'Review Budget', actionRoute: '/app/budgets' },
    generatedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'ins_03',
    title: 'Portfolio Demonstrating Positive Alpha',
    description: 'Your stock portfolio has an unrealized gain of +₹3,500 (+8.97%) over invested capital.',
    category: 'investment',
    severity: 'positive',
    metricFigures: [
      { label: 'Invested', value: '₹39,000' },
      { label: 'Current Value', value: '₹42,500' },
    ],
    suggestedAction: { label: 'View Portfolio', actionRoute: '/app/investments' },
    generatedAt: '2026-10-15T08:00:00Z',
  },
];

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  budgetAlerts: true,
  budgetExceededAlerts: true,
  billReminders: true,
  lowBalanceAlerts: true,
  goalMilestones: true,
  portfolioInsights: true,
  systemAnnouncements: true,
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Salary Deposited',
    message: '₹52,000 credited to Everyday Savings (HDFC Bank) from Acme Corp.',
    type: 'system',
    isRead: false,
    createdAt: '2026-10-01T09:00:00Z',
    linkRoute: '/app/banking/accounts/acct_hdfc',
  },
  {
    id: 'notif_02',
    title: 'Budget Alert: Housing',
    message: 'Housing budget has reached 80% utilization for October.',
    type: 'budget',
    isRead: false,
    createdAt: '2026-10-02T10:15:00Z',
    linkRoute: '/app/budgets',
  },
  {
    id: 'notif_03',
    title: 'Monthly Savings Sweep Executed',
    message: '₹5,000 transferred from Everyday Savings to Goals Savings.',
    type: 'bill',
    isRead: true,
    createdAt: '2026-10-10T12:00:00Z',
    linkRoute: '/app/transactions',
  },
];

export const INITIAL_RECURRING_RULES: RecurringRule[] = [
  {
    id: 'rec_rent',
    name: 'Apartment Lease Rent',
    amountMinor: 1200000, // ₹12,000
    type: 'expense',
    category: 'Housing & Rent',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    startDate: '2026-05-01',
    nextExpectedDate: '2026-11-01',
    status: 'active',
    notes: 'Monthly apartment rent scheduled auto-debit',
  },
  {
    id: 'rec_salary',
    name: 'Acme Corp Monthly Remuneration',
    amountMinor: 5200000, // ₹52,000
    type: 'income',
    category: 'Salary',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextExpectedDate: '2026-11-01',
    status: 'active',
    notes: 'Primary payroll direct deposit',
  },
  {
    id: 'rec_broadband',
    name: 'Airtel Broadband & Wi-Fi',
    amountMinor: 100000, // ₹1,000
    type: 'expense',
    category: 'Utilities',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    startDate: '2026-04-18',
    nextExpectedDate: '2026-10-18',
    status: 'active',
    notes: 'Fiber 200 Mbps residential plan',
  },
  {
    id: 'rec_gym',
    name: 'Cult.fit Gym & Fitness Pass',
    amountMinor: 150000, // ₹1,500
    type: 'expense',
    category: 'Healthcare',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    startDate: '2026-06-22',
    nextExpectedDate: '2026-10-22',
    status: 'active',
    notes: 'Elite monthly membership',
  },
  {
    id: 'rec_media',
    name: 'Digital Entertainment Subscriptions',
    amountMinor: 80000, // ₹800
    type: 'expense',
    category: 'Subscriptions',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    startDate: '2026-02-28',
    nextExpectedDate: '2026-10-28',
    status: 'active',
    notes: 'Streaming and cloud bundle',
  },
];

// Phase 6: Banking Demo Fixtures
export const INITIAL_BENEFICIARIES: BankingBeneficiary[] = [
  {
    id: 'ben_internet',
    name: 'Airtel Broadband Provider',
    bankName: 'HDFC Bank',
    accountNumberMasked: '•••• 6521',
    nickname: 'Home Wi-Fi',
    notes: 'Residential optical fiber connection',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'ben_landlord',
    name: 'Anita Verma',
    bankName: 'ICICI Bank',
    accountNumberMasked: '•••• 3042',
    nickname: 'House Owner',
    notes: 'Apartment monthly lease account',
    createdAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 'ben_sister',
    name: 'Priya Sharma',
    bankName: 'Kotak Mahindra Bank',
    accountNumberMasked: '•••• 9102',
    nickname: 'Priya (Family)',
    notes: 'Direct family transfers',
    createdAt: '2026-02-01T15:30:00Z',
  },
  {
    id: 'ben_gym',
    name: 'Cult.fit Fitness LLP',
    bankName: 'Axis Bank',
    accountNumberMasked: '•••• 4429',
    nickname: 'Gym Subscription',
    notes: 'Monthly pass auto-reference',
    createdAt: '2026-03-05T09:00:00Z',
  },
];

export const INITIAL_BILLS: BankingBill[] = [
  {
    id: 'bill_rent',
    title: 'Apartment Lease Rent',
    billerName: 'Anita Verma',
    category: 'Rent',
    amountMinor: 1200000, // ₹12,000
    dueDate: '2026-11-01',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    reminderPreference: '3_days_before',
    status: 'upcoming',
    notes: 'November 2026 scheduled rental payment',
  },
  {
    id: 'bill_broadband',
    title: 'Airtel Fiber Broadband',
    billerName: 'Bharti Airtel Ltd',
    category: 'Internet',
    amountMinor: 100000, // ₹1,000
    dueDate: '2026-10-18',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    reminderPreference: '1_day_before',
    status: 'upcoming',
    notes: 'High-speed fiber 200 Mbps plan',
  },
  {
    id: 'bill_gym',
    title: 'Cult.fit Gym Membership',
    billerName: 'Cult.fit Healthcare',
    category: 'Subscriptions',
    amountMinor: 150000, // ₹1,500
    dueDate: '2026-10-22',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    reminderPreference: '3_days_before',
    status: 'upcoming',
    notes: 'Monthly gym and fitness pass',
  },
  {
    id: 'bill_bescom',
    title: 'BESCOM Electricity Bill',
    billerName: 'BESCOM Karnataka',
    category: 'Electricity',
    amountMinor: 185000, // ₹1,850
    dueDate: '2026-10-25',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    reminderPreference: '3_days_before',
    status: 'upcoming',
    notes: 'Domestic electrical energy utility bill',
  },
  {
    id: 'bill_mobile',
    title: 'Jio 5G Postpaid Recharge',
    billerName: 'Reliance Jio Infocomm',
    category: 'Mobile Recharge',
    amountMinor: 49900, // ₹499
    dueDate: '2026-10-29',
    accountId: 'acct_hdfc',
    frequency: 'monthly',
    reminderPreference: 'on_due_date',
    status: 'upcoming',
    notes: 'Family postpaid 5G primary connection',
  },
];

export const INITIAL_CARDS: DemoCard[] = [
  {
    id: 'card_hdfc_debit',
    accountId: 'acct_hdfc',
    cardHolderName: 'Aryan Sharma',
    cardNickname: 'HDFC Millennia Platinum',
    cardNumberMasked: '•••• •••• •••• 4892',
    cardType: 'debit',
    network: 'Visa',
    expiryDate: '08/29',
    status: 'active',
    dailyLimitMinor: 10000000, // ₹1,00,000
  },
  {
    id: 'card_sbi_debit',
    accountId: 'acct_sbi',
    cardHolderName: 'Aryan Sharma',
    cardNickname: 'SBI Global International',
    cardNumberMasked: '•••• •••• •••• 8104',
    cardType: 'debit',
    network: 'RuPay',
    expiryDate: '11/28',
    status: 'active',
    dailyLimitMinor: 5000000, // ₹50,000
  },
  {
    id: 'card_regalia_credit',
    accountId: 'acct_hdfc',
    cardHolderName: 'Aryan Sharma',
    cardNickname: 'HDFC Regalia Gold (Demo Showcase)',
    cardNumberMasked: '•••• •••• •••• 9211',
    cardType: 'credit',
    network: 'Mastercard',
    expiryDate: '03/30',
    status: 'active',
    dailyLimitMinor: 20000000, // ₹2,00,000
    creditLimitMinor: 30000000, // ₹3,00,000
    outstandingBalanceMinor: 1540000, // ₹15,400 (illustrative showcase)
  },
];

export const INITIAL_DEPOSIT_SIMULATIONS: DepositSimulation[] = [
  {
    id: 'dep_fd_1',
    type: 'fixed',
    depositName: '1-Year Tax-Saver Fixed Deposit',
    principalMinor: 5000000, // ₹50,000
    tenureMonths: 12,
    interestRatePercent: 7.1,
    compoundingFrequency: 'quarterly',
    maturityAmountMinor: 5364500, // ~₹53,645
    interestEarnedMinor: 364500, // ~₹3,645
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'dep_rd_1',
    type: 'recurring',
    depositName: '2-Year Systematic Recurring Deposit',
    principalMinor: 500000, // ₹5,000 monthly
    tenureMonths: 24,
    interestRatePercent: 6.8,
    compoundingFrequency: 'quarterly',
    maturityAmountMinor: 12879000, // ~₹1,28,790
    interestEarnedMinor: 879000, // ~₹8,790
    createdAt: '2026-08-15T10:00:00Z',
  },
];

export const INITIAL_LOAN_SIMULATIONS: LoanSimulation[] = [
  {
    id: 'loan_home_1',
    loanType: 'home',
    principalMinor: 350000000, // ₹35,00,000
    tenureMonths: 240, // 20 years
    interestRatePercent: 8.5,
    monthlyEmiMinor: 3037900, // ₹30,379
    totalInterestMinor: 379096000, // ₹37,90,960
    totalRepaymentMinor: 729096000, // ₹72,90,960
    createdAt: '2026-09-10T14:00:00Z',
  },
];


