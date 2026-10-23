export type UserPersona = 'student' | 'professional' | 'family' | 'investor' | 'senior';
export type SupportedCurrency = 'INR';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  persona: UserPersona;
  currency: SupportedCurrency;
  monthlyBudgetLimitMinor: number;
  createdAt: string;
}

export type AccountType = 'savings' | 'checking' | 'credit' | 'wallet';

export interface FinancialAccount {
  id: string;
  name: string;
  institution: string; // e.g. "HDFC Bank", "SBI", "Cash Wallet"
  accountType: AccountType;
  accountNumberMasked: string; // e.g. "•••• 4892"
  openingBalanceMinor: number; // in paise
  availableCreditMinor?: number; // for credit accounts
  currency: SupportedCurrency;
  isDemo: boolean;
  lastUpdated: string;
  isArchived?: boolean;
}

export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'flagged';

export interface Transaction {
  id: string;
  accountId: string;
  targetAccountId?: string; // only if type === 'transfer'
  amountMinor: number; // integer paise
  type: TransactionType;
  category: string; // e.g. "Dining", "Groceries", "Salary"
  merchant: string;
  date: string; // ISO 8601 YYYY-MM-DD
  status: TransactionStatus;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export interface Budget {
  id: string;
  category: string;
  allocatedMinor: number; // integer paise
  period: 'monthly' | 'weekly' | 'custom';
  alertThresholdPercent: number; // e.g. 80
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amountMinor: number;
  date: string;
  sourceAccountId?: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  targetDate: string; // YYYY-MM-DD
  category: 'emergency' | 'vacation' | 'gadget' | 'education' | 'vehicle' | 'retirement';
  monthlyContributionTargetMinor: number;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  isPrimary?: boolean;
  contributions?: GoalContribution[];
}

export interface StockQuote {
  ticker: string;
  companyName: string;
  exchange: 'NSE' | 'BSE';
  currentPriceMinor: number;
  dayChangeMinor: number;
  dayChangePercent: number;
  marketCap: string;
  peRatio?: number;
  week52HighMinor: number;
  week52LowMinor: number;
  sector: string;
  companyOverview?: string;
  historicalPrices: { date: string; priceMinor: number }[];
}

export interface InvestmentHolding {
  id: string;
  ticker: string;
  companyName: string;
  assetClass: 'equity' | 'mutual_fund' | 'etf' | 'gold' | 'bond';
  quantity: number;
  averageBuyPriceMinor: number; // in paise
  purchaseDate?: string;
  notes?: string;
}

export interface Watchlist {
  id: string;
  name: string;
  tickers: string[];
  description?: string;
  createdAt?: string;
}

export type InsightSeverity = 'info' | 'positive' | 'warning' | 'critical';
export type InsightCategory = 'spending' | 'budget' | 'savings' | 'cashflow' | 'investment';

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  severity: InsightSeverity;
  metricFigures?: { label: string; value: string }[];
  suggestedAction?: { label: string; actionRoute: string };
  generatedAt: string;
}

export interface NotificationPreferences {
  budgetAlerts: boolean;
  budgetExceededAlerts: boolean;
  billReminders: boolean;
  lowBalanceAlerts: boolean;
  goalMilestones: boolean;
  portfolioInsights: boolean;
  systemAnnouncements: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'budget' | 'bill' | 'investment' | 'security' | 'system' | 'goal' | 'balance' | 'expenses';
  isRead: boolean;
  createdAt: string;
  linkRoute?: string;
}

export interface UpcomingBill {
  id: string;
  title: string;
  amountMinor: number;
  dueDate: string; // YYYY-MM-DD
  accountName: string;
  category: string;
  status: 'upcoming' | 'due_today' | 'overdue' | 'paid';
  isAutoDebit: boolean;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurringStatus = 'active' | 'paused';

export interface RecurringRule {
  id: string;
  name: string;
  amountMinor: number; // paise
  type: TransactionType;
  category: string;
  accountId: string;
  frequency: RecurringFrequency;
  startDate: string; // YYYY-MM-DD
  nextExpectedDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status: RecurringStatus;
  notes?: string;
  lastRecordedDate?: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  summary: {
    incomeMinor: number;
    expensesMinor: number;
    savingsRatePercent: number;
  };
}

// -------------------------------------------------------------
// Phase 6: Banking & Accounts Types
// -------------------------------------------------------------

export interface BankingBeneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumberMasked: string; // e.g. "•••• 9871"
  nickname?: string;
  notes?: string;
  createdAt: string;
}

export type BillReminderPreference = 'none' | '1_day_before' | '3_days_before' | 'on_due_date';

export interface BankingBill {
  id: string;
  title: string;
  billerName: string;
  category: string; // e.g. 'Electricity' | 'Internet' | 'Rent' | 'Subscriptions' | 'Insurance' | 'Education' | 'Mobile Recharge' | 'Other'
  amountMinor: number; // in paise
  dueDate: string; // YYYY-MM-DD
  accountId: string; // linked deposit account
  frequency?: RecurringFrequency;
  reminderPreference?: BillReminderPreference;
  status: 'upcoming' | 'due_today' | 'overdue' | 'paid';
  isAutoDebit?: boolean;
  paymentTransactionId?: string;
  paidAt?: string;
  notes?: string;
}

export interface DemoCard {
  id: string;
  accountId: string;
  cardHolderName: string;
  cardNickname: string;
  cardNumberMasked: string; // e.g. "•••• •••• •••• 4892"
  cardType: 'debit' | 'credit';
  network: 'Visa' | 'Mastercard' | 'RuPay';
  expiryDate: string; // MM/YY
  status: 'active' | 'frozen';
  dailyLimitMinor: number;
  creditLimitMinor?: number;
  outstandingBalanceMinor?: number;
}

export interface DepositSimulation {
  id: string;
  type: 'fixed' | 'recurring';
  depositName: string;
  principalMinor: number; // FD: lump sum, RD: monthly instalment
  tenureMonths: number;
  interestRatePercent: number;
  compoundingFrequency: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';
  maturityAmountMinor: number;
  interestEarnedMinor: number;
  createdAt: string;
}

export interface LoanSimulation {
  id: string;
  loanType: 'home' | 'personal' | 'car' | 'education';
  principalMinor: number;
  tenureMonths: number;
  interestRatePercent: number;
  monthlyEmiMinor: number;
  totalInterestMinor: number;
  totalRepaymentMinor: number;
  createdAt: string;
}

export interface DemoTransferReceipt {
  id: string;
  referenceNumber: string; // e.g. "EXP-TRF-20261015-8831"
  sourceAccountId: string;
  destinationAccountId: string;
  amountMinor: number;
  date: string;
  note?: string;
  status: 'completed';
  sourceBalanceAfterMinor: number;
  destinationBalanceAfterMinor: number;
}

// -------------------------------------------------------------
// Phase 7: AI Assistant, Reports & Learning Types
// -------------------------------------------------------------

export type StructuredCardType =
  | 'financial_summary'
  | 'category_breakdown'
  | 'budget_status'
  | 'account_balances'
  | 'portfolio_summary'
  | 'goal_projection'
  | 'concept_explanation'
  | 'unsupported_query';

export interface StructuredCardData {
  type: StructuredCardType;
  title: string;
  subtitle?: string;
  metrics?: { label: string; value: string; hint?: string }[];
  breakdown?: { name: string; amountMinor: number; percent: number; color?: string }[];
  actionLink?: { label: string; href: string };
  educationalNote?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  card?: StructuredCardData;
  intent?: string;
}

export interface AIChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIChatMessage[];
}

export type ReportType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom'
  | 'income_vs_expense'
  | 'category_breakdown'
  | 'budget_performance'
  | 'cash_flow'
  | 'investment_overview'
  | 'goals_progress';

export interface ComprehensiveReportData {
  id: string;
  type: ReportType;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  netSavingsMinor: number;
  savingsRatePercent: number;
  totalLiquidCashMinor: number;
  portfolioValueMinor: number;
  netWorthMinor: number;
  topExpenseCategories: { category: string; amountMinor: number; percentage: number }[];
  accountBalances: { accountName: string; institution: string; balanceMinor: number }[];
  budgetSummaries: { category: string; allocatedMinor: number; spentMinor: number; percentUsed: number; status: 'ok' | 'warning' | 'exceeded' }[];
  transactionCount: number;
  topTransactions: Transaction[];
  insights: string[];
}

export interface LearningQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface LearningQuizQuestion {
  id: string;
  question: string;
  options: LearningQuizOption[];
}

export interface LearningTopic {
  slug: string;
  title: string;
  category: 'budgeting' | 'savings' | 'banking' | 'investing' | 'mindset' | 'security';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  readingTimeMinutes: number;
  summary: string;
  keyTakeaways: string[];
  contentSections: { heading: string; body: string; example?: string }[];
  glossary: { term: string; definition: string }[];
  quiz: LearningQuizQuestion[];
}

export interface UserLearningProgress {
  bookmarkedSlugs: string[];
  completedSlugs: string[];
  quizScores: Record<string, { score: number; total: number; passed: boolean; completedAt: string }>;
}


