import { create } from 'zustand';
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
  RecurringFrequency,
  RecurringStatus,
  BankingBeneficiary,
  BankingBill,
  DemoCard,
  DepositSimulation,
  LoanSimulation,
  DemoTransferReceipt,
} from '@/types/finance';
import {
  DEMO_AS_OF,
  INITIAL_USER,
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_STOCK_QUOTES,
  INITIAL_HOLDINGS,
  INITIAL_WATCHLISTS,
  INITIAL_INSIGHTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECURRING_RULES,
  INITIAL_BENEFICIARIES,
  INITIAL_BILLS,
  INITIAL_CARDS,
  INITIAL_DEPOSIT_SIMULATIONS,
  INITIAL_LOAN_SIMULATIONS,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@/services/fixtures/seedData';
import { evaluateDeterministicNotifications } from '@/features/notifications/utils/notificationGenerator';
import {
  calculateAccountBalance,
  calculateTotalLiquidCash,
  calculatePeriodIncome,
  calculatePeriodExpenses,
  calculateCategorySpent,
  calculatePortfolioValue,
  calculateTotalInvested,
  calculateNetWorth,
} from '@/domain/calculations/accounting';

const STORAGE_KEY = 'expenzo-demo:v1';

interface FinanceState {
  user: UserProfile;
  accounts: FinancialAccount[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: SavingsGoal[];
  recurringRules: RecurringRule[];
  beneficiaries: BankingBeneficiary[];
  bills: BankingBill[];
  cards: DemoCard[];
  depositSimulations: DepositSimulation[];
  loanSimulations: LoanSimulation[];
  transferReceipts: DemoTransferReceipt[];
  quotes: Record<string, StockQuote>;
  holdings: InvestmentHolding[];
  watchlists: Watchlist[];
  insights: FinancialInsight[];
  notifications: NotificationItem[];
  notificationPreferences: NotificationPreferences;
  dismissedNotificationIds: string[];
  demoAsOf: string;

  // Actions
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string, reassignToCategoryName?: string) => void;
  upsertBudget: (bgt: Budget) => void;
  deleteBudget: (id: string) => void;
  upsertGoal: (goal: SavingsGoal) => void;
  deleteGoal: (id: string) => void;
  recordGoalContribution: (goalId: string, amountMinor: number, sourceAccountId?: string, note?: string) => { success: boolean; error?: string };
  addRecurringRule: (rule: Omit<RecurringRule, 'id'>) => RecurringRule;
  updateRecurringRule: (rule: RecurringRule) => void;
  deleteRecurringRule: (id: string) => void;
  toggleRecurringRuleStatus: (id: string) => void;
  recordRecurringOccurrence: (id: string) => Transaction | null;
  addHolding: (holding: Omit<InvestmentHolding, 'id'>) => InvestmentHolding;
  updateHolding: (holding: InvestmentHolding) => void;
  deleteHolding: (id: string) => void;
  createWatchlist: (name: string, description?: string) => Watchlist;
  updateWatchlist: (id: string, name: string, description?: string) => void;
  deleteWatchlist: (id: string) => void;
  addTickerToWatchlist: (watchlistId: string, ticker: string) => boolean;
  removeTickerFromWatchlist: (watchlistId: string, ticker: string) => void;
  toggleWatchlistTicker: (watchlistId: string, ticker: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  syncDeterministicNotifications: () => void;
  importWorkspaceData: (data: any) => { success: boolean; message: string };
  resetToDemo: () => void;

  // Banking Actions (Phase 6)
  addAccount: (account: Omit<FinancialAccount, 'id' | 'lastUpdated'>) => FinancialAccount;
  updateAccount: (account: Partial<FinancialAccount> & { id: string }) => void;
  archiveAccount: (id: string) => { success: boolean; message?: string };
  recordTransfer: (data: {
    sourceAccountId: string;
    destinationAccountId: string;
    amountMinor: number;
    note?: string;
    date?: string;
  }) => { success: boolean; transaction?: Transaction; receipt?: DemoTransferReceipt; error?: string };
  addBeneficiary: (b: Omit<BankingBeneficiary, 'id' | 'createdAt'>) => BankingBeneficiary;
  updateBeneficiary: (b: BankingBeneficiary) => void;
  deleteBeneficiary: (id: string) => void;
  addBill: (b: Omit<BankingBill, 'id'>) => BankingBill;
  updateBill: (b: BankingBill) => void;
  deleteBill: (id: string) => void;
  payBill: (billId: string, accountId?: string) => { success: boolean; transaction?: Transaction; error?: string };
  toggleCardFreeze: (id: string) => void;
  updateCardNickname: (id: string, nickname: string) => void;
  addDepositSimulation: (sim: Omit<DepositSimulation, 'id' | 'createdAt'>) => DepositSimulation;
  deleteDepositSimulation: (id: string) => void;
  addLoanSimulation: (sim: Omit<LoanSimulation, 'id' | 'createdAt'>) => LoanSimulation;
  deleteLoanSimulation: (id: string) => void;

  // Selectors
  getAccountBalance: (accountId: string) => number;
  getTotalLiquidCash: () => number;
  getPeriodIncome: (start?: string, end?: string) => number;
  getPeriodExpenses: (start?: string, end?: string) => number;
  getCategorySpent: (category: string, start?: string, end?: string) => number;
  getPortfolioValue: () => number;
  getTotalInvested: () => number;
  getNetWorth: () => number;
}

function advanceDate(dateStr: string, frequency: RecurringFrequency): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (frequency === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (frequency === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (frequency === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  }
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function loadInitialState() {
  if (typeof window === 'undefined') {
    return {
      user: INITIAL_USER,
      accounts: INITIAL_ACCOUNTS,
      transactions: INITIAL_TRANSACTIONS,
      categories: INITIAL_CATEGORIES,
      budgets: INITIAL_BUDGETS,
      goals: INITIAL_GOALS,
      recurringRules: INITIAL_RECURRING_RULES,
      beneficiaries: INITIAL_BENEFICIARIES,
      bills: INITIAL_BILLS,
      cards: INITIAL_CARDS,
      depositSimulations: INITIAL_DEPOSIT_SIMULATIONS,
      loanSimulations: INITIAL_LOAN_SIMULATIONS,
      transferReceipts: [],
      quotes: INITIAL_STOCK_QUOTES,
      holdings: INITIAL_HOLDINGS,
      watchlists: INITIAL_WATCHLISTS,
      insights: INITIAL_INSIGHTS,
      notifications: INITIAL_NOTIFICATIONS,
      notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
      dismissedNotificationIds: [],
      demoAsOf: DEMO_AS_OF,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 'v1' && parsed.data) {
        return {
          ...parsed.data,
          recurringRules: parsed.data.recurringRules || INITIAL_RECURRING_RULES,
          beneficiaries: parsed.data.beneficiaries || INITIAL_BENEFICIARIES,
          bills: parsed.data.bills || INITIAL_BILLS,
          cards: parsed.data.cards || INITIAL_CARDS,
          depositSimulations: parsed.data.depositSimulations || INITIAL_DEPOSIT_SIMULATIONS,
          loanSimulations: parsed.data.loanSimulations || INITIAL_LOAN_SIMULATIONS,
          transferReceipts: parsed.data.transferReceipts || [],
          notificationPreferences: parsed.data.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES,
          dismissedNotificationIds: parsed.data.dismissedNotificationIds || [],
        };
      }
    }
  } catch (e) {
    console.warn('Could not read demo finance store from localStorage, using seeds.', e);
  }

  return {
    user: INITIAL_USER,
    accounts: INITIAL_ACCOUNTS,
    transactions: INITIAL_TRANSACTIONS,
    categories: INITIAL_CATEGORIES,
    budgets: INITIAL_BUDGETS,
    goals: INITIAL_GOALS,
    recurringRules: INITIAL_RECURRING_RULES,
    beneficiaries: INITIAL_BENEFICIARIES,
    bills: INITIAL_BILLS,
    cards: INITIAL_CARDS,
    depositSimulations: INITIAL_DEPOSIT_SIMULATIONS,
    loanSimulations: INITIAL_LOAN_SIMULATIONS,
    transferReceipts: [],
    quotes: INITIAL_STOCK_QUOTES,
    holdings: INITIAL_HOLDINGS,
    watchlists: INITIAL_WATCHLISTS,
    insights: INITIAL_INSIGHTS,
    notifications: INITIAL_NOTIFICATIONS,
    notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    dismissedNotificationIds: [],
    demoAsOf: DEMO_AS_OF,
  };
}

function persistState(state: any) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      version: 'v1',
      savedAt: new Date().toISOString(),
      data: {
        user: state.user,
        accounts: state.accounts,
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        goals: state.goals,
        recurringRules: state.recurringRules,
        beneficiaries: state.beneficiaries,
        bills: state.bills,
        cards: state.cards,
        depositSimulations: state.depositSimulations,
        loanSimulations: state.loanSimulations,
        transferReceipts: state.transferReceipts,
        quotes: state.quotes,
        holdings: state.holdings,
        watchlists: state.watchlists,
        insights: state.insights,
        notifications: state.notifications,
        notificationPreferences: state.notificationPreferences,
        dismissedNotificationIds: state.dismissedNotificationIds,
        demoAsOf: state.demoAsOf,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Could not persist demo finance store to localStorage.', e);
  }
}

export const useFinanceStore = create<FinanceState>((set, get) => {
  const initial = loadInitialState();

  return {
    ...initial,

    addTransaction: (txData) => {
      const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newTx: Transaction = { ...txData, id };
      set((state) => {
        const next = { ...state, transactions: [newTx, ...state.transactions] };
        persistState(next);
        return next;
      });
      return newTx;
    },

    updateTransaction: (updatedTx) => {
      set((state) => {
        const next = {
          ...state,
          transactions: state.transactions.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx)),
        };
        persistState(next);
        return next;
      });
    },

    deleteTransaction: (id) => {
      set((state) => {
        const next = {
          ...state,
          transactions: state.transactions.filter((tx) => tx.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    addCategory: (catData) => {
      const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newCat: Category = { ...catData, id };
      set((state) => {
        const next = { ...state, categories: [...state.categories, newCat] };
        persistState(next);
        return next;
      });
      return newCat;
    },

    updateCategory: (updatedCat) => {
      set((state) => {
        const oldCat = state.categories.find((c) => c.id === updatedCat.id);
        const nextCategories = state.categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
        let nextTransactions = state.transactions;
        let nextBudgets = state.budgets;
        if (oldCat && oldCat.name !== updatedCat.name) {
          nextTransactions = state.transactions.map((tx) =>
            tx.category === oldCat.name ? { ...tx, category: updatedCat.name } : tx
          );
          nextBudgets = state.budgets.map((b) =>
            b.category === oldCat.name ? { ...b, category: updatedCat.name } : b
          );
        }
        const next = {
          ...state,
          categories: nextCategories,
          transactions: nextTransactions,
          budgets: nextBudgets,
        };
        persistState(next);
        return next;
      });
    },

    deleteCategory: (id, reassignToCategoryName = 'Other') => {
      set((state) => {
        const catToDelete = state.categories.find((c) => c.id === id);
        if (!catToDelete) return state;

        const nextCategories = state.categories.filter((c) => c.id !== id);
        const nextTransactions = state.transactions.map((tx) =>
          tx.category === catToDelete.name ? { ...tx, category: reassignToCategoryName } : tx
        );
        const nextBudgets = state.budgets.filter((b) => b.category !== catToDelete.name);

        const next = {
          ...state,
          categories: nextCategories,
          transactions: nextTransactions,
          budgets: nextBudgets,
        };
        persistState(next);
        return next;
      });
    },

    upsertBudget: (budget) => {
      set((state) => {
        const exists = state.budgets.some((b) => b.id === budget.id);
        const budgets = exists
          ? state.budgets.map((b) => (b.id === budget.id ? budget : b))
          : [...state.budgets, budget];
        const next = { ...state, budgets };
        persistState(next);
        return next;
      });
    },

    deleteBudget: (id) => {
      set((state) => {
        const next = {
          ...state,
          budgets: state.budgets.filter((b) => b.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    upsertGoal: (goal) => {
      set((state) => {
        const exists = state.goals.some((g) => g.id === goal.id);
        const goals = exists
          ? state.goals.map((g) => (g.id === goal.id ? goal : g))
          : [...state.goals, goal];
        const next = { ...state, goals };
        persistState(next);
        return next;
      });
    },

    deleteGoal: (id) => {
      set((state) => {
        const next = {
          ...state,
          goals: state.goals.filter((g) => g.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    recordGoalContribution: (goalId, amountMinor, sourceAccountId, note) => {
      const { goals } = get();
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) {
        return { success: false, error: 'Savings goal not found.' };
      }
      if (amountMinor <= 0) {
        return { success: false, error: 'Contribution amount must be greater than zero.' };
      }

      const nextCurrentAmount = goal.currentAmountMinor + amountMinor;
      const contributionEntry = {
        id: `contrib_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        goalId,
        amountMinor,
        date: new Date().toISOString().split('T')[0],
        sourceAccountId,
        note: note || 'Plan allocation contribution',
      };

      const updatedGoal: SavingsGoal = {
        ...goal,
        currentAmountMinor: nextCurrentAmount,
        contributions: [contributionEntry, ...(goal.contributions || [])],
      };

      set((state) => {
        const nextGoals = state.goals.map((g) => (g.id === goalId ? updatedGoal : g));
        const next = { ...state, goals: nextGoals };
        persistState(next);
        return next;
      });

      return { success: true };
    },

    addRecurringRule: (ruleData) => {
      const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newRule: RecurringRule = { ...ruleData, id };
      set((state) => {
        const next = { ...state, recurringRules: [...state.recurringRules, newRule] };
        persistState(next);
        return next;
      });
      return newRule;
    },

    updateRecurringRule: (updatedRule) => {
      set((state) => {
        const next = {
          ...state,
          recurringRules: state.recurringRules.map((r) => (r.id === updatedRule.id ? updatedRule : r)),
        };
        persistState(next);
        return next;
      });
    },

    deleteRecurringRule: (id) => {
      set((state) => {
        const next = {
          ...state,
          recurringRules: state.recurringRules.filter((r) => r.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    toggleRecurringRuleStatus: (id) => {
      set((state) => {
        const next = {
          ...state,
          recurringRules: state.recurringRules.map((r) =>
            r.id === id
              ? { ...r, status: (r.status === 'active' ? 'paused' : 'active') as RecurringStatus }
              : r
          ),
        };
        persistState(next);
        return next;
      });
    },

    recordRecurringOccurrence: (id) => {
      const { recurringRules, addTransaction } = get();
      const rule = recurringRules.find((r) => r.id === id);
      if (!rule) return null;

      const tx = addTransaction({
        accountId: rule.accountId,
        amountMinor: rule.amountMinor,
        type: rule.type,
        category: rule.category,
        merchant: rule.name,
        date: rule.nextExpectedDate,
        status: 'completed',
        notes: `Recorded recurring occurrence for ${rule.name}`,
        isRecurring: true,
      });

      const nextDate = advanceDate(rule.nextExpectedDate, rule.frequency);

      set((state) => {
        const nextRules = state.recurringRules.map((r) =>
          r.id === id ? { ...r, lastRecordedDate: rule.nextExpectedDate, nextExpectedDate: nextDate } : r
        );
        const nextState = { ...state, recurringRules: nextRules };
        persistState(nextState);
        return nextState;
      });

      return tx;
    },

    addHolding: (holdingData) => {
      const id = `hld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newHolding: InvestmentHolding = { ...holdingData, id };
      set((state) => {
        const next = { ...state, holdings: [...state.holdings, newHolding] };
        persistState(next);
        return next;
      });
      return newHolding;
    },

    updateHolding: (holding) => {
      set((state) => {
        const next = {
          ...state,
          holdings: state.holdings.map((h) => (h.id === holding.id ? holding : h)),
        };
        persistState(next);
        return next;
      });
    },

    deleteHolding: (id) => {
      set((state) => {
        const next = {
          ...state,
          holdings: state.holdings.filter((h) => h.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    createWatchlist: (name, description) => {
      const id = `wl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newWatchlist: Watchlist = {
        id,
        name: name.trim(),
        tickers: [],
        description: description?.trim(),
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const next = { ...state, watchlists: [...state.watchlists, newWatchlist] };
        persistState(next);
        return next;
      });
      return newWatchlist;
    },

    updateWatchlist: (id, name, description) => {
      set((state) => {
        const next = {
          ...state,
          watchlists: state.watchlists.map((w) =>
            w.id === id
              ? {
                  ...w,
                  name: name.trim(),
                  description: description !== undefined ? description.trim() : w.description,
                }
              : w
          ),
        };
        persistState(next);
        return next;
      });
    },

    deleteWatchlist: (id) => {
      set((state) => {
        const next = {
          ...state,
          watchlists: state.watchlists.filter((w) => w.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    addTickerToWatchlist: (watchlistId, ticker) => {
      const { watchlists } = get();
      const target = watchlists.find((w) => w.id === watchlistId);
      if (!target) return false;
      const upperTicker = ticker.toUpperCase().trim();
      if (target.tickers.includes(upperTicker)) return false;

      set((state) => {
        const nextWatchlists = state.watchlists.map((w) =>
          w.id === watchlistId ? { ...w, tickers: [...w.tickers, upperTicker] } : w
        );
        const next = { ...state, watchlists: nextWatchlists };
        persistState(next);
        return next;
      });
      return true;
    },

    removeTickerFromWatchlist: (watchlistId, ticker) => {
      const upperTicker = ticker.toUpperCase().trim();
      set((state) => {
        const nextWatchlists = state.watchlists.map((w) =>
          w.id === watchlistId
            ? { ...w, tickers: w.tickers.filter((t) => t !== upperTicker) }
            : w
        );
        const next = { ...state, watchlists: nextWatchlists };
        persistState(next);
        return next;
      });
    },

    toggleWatchlistTicker: (watchlistId, ticker) => {
      const { watchlists } = get();
      const target = watchlists.find((w) => w.id === watchlistId);
      if (!target) return;
      const upperTicker = ticker.toUpperCase().trim();
      if (target.tickers.includes(upperTicker)) {
        get().removeTickerFromWatchlist(watchlistId, upperTicker);
      } else {
        get().addTickerToWatchlist(watchlistId, upperTicker);
      }
    },

    updateUserProfile: (profile) => {
      set((state) => {
        const nextUser = { ...state.user, ...profile };
        const next = { ...state, user: nextUser };
        persistState(next);
        return next;
      });
    },

    markNotificationRead: (id) => {
      set((state) => {
        const next = {
          ...state,
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        };
        persistState(next);
        return next;
      });
    },

    markAllNotificationsRead: () => {
      set((state) => {
        const next = {
          ...state,
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        };
        persistState(next);
        return next;
      });
    },

    deleteNotification: (id) => {
      set((state) => {
        const nextNotifications = state.notifications.filter((n) => n.id !== id);
        const nextDismissed = state.dismissedNotificationIds.includes(id)
          ? state.dismissedNotificationIds
          : [...state.dismissedNotificationIds, id];
        const next = {
          ...state,
          notifications: nextNotifications,
          dismissedNotificationIds: nextDismissed,
        };
        persistState(next);
        return next;
      });
    },

    clearAllNotifications: () => {
      set((state) => {
        const allIds = state.notifications.map((n) => n.id);
        const nextDismissed = Array.from(new Set([...state.dismissedNotificationIds, ...allIds]));
        const next = {
          ...state,
          notifications: [],
          dismissedNotificationIds: nextDismissed,
        };
        persistState(next);
        return next;
      });
    },

    updateNotificationPreferences: (prefs) => {
      set((state) => {
        const nextPrefs = { ...state.notificationPreferences, ...prefs };
        const next = { ...state, notificationPreferences: nextPrefs };
        persistState(next);
        return next;
      });
      get().syncDeterministicNotifications();
    },

    syncDeterministicNotifications: () => {
      const state = get();
      const refreshed = evaluateDeterministicNotifications({
        accounts: state.accounts,
        transactions: state.transactions,
        budgets: state.budgets,
        bills: state.bills,
        goals: state.goals,
        holdings: state.holdings,
        quotes: state.quotes,
        notificationPreferences: state.notificationPreferences,
        existingNotifications: state.notifications,
        dismissedNotificationIds: state.dismissedNotificationIds,
      });
      set({ notifications: refreshed });
      persistState({ ...get(), notifications: refreshed });
    },

    importWorkspaceData: (data) => {
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid data format. File must contain a valid JSON object.' };
      }
      if (!Array.isArray(data.accounts) || !Array.isArray(data.transactions)) {
        return { success: false, message: 'Malformed data: Missing required accounts or transactions arrays.' };
      }

      set((state) => {
        const next = {
          ...state,
          user: data.user ? { ...state.user, ...data.user } : state.user,
          accounts: data.accounts,
          transactions: data.transactions,
          categories: Array.isArray(data.categories) ? data.categories : state.categories,
          budgets: Array.isArray(data.budgets) ? data.budgets : state.budgets,
          goals: Array.isArray(data.goals) ? data.goals : state.goals,
          holdings: Array.isArray(data.holdings) ? data.holdings : state.holdings,
          watchlists: Array.isArray(data.watchlists) ? data.watchlists : state.watchlists,
          bills: Array.isArray(data.bills) ? data.bills : state.bills,
          recurringRules: Array.isArray(data.recurringRules) ? data.recurringRules : state.recurringRules,
          beneficiaries: Array.isArray(data.beneficiaries) ? data.beneficiaries : state.beneficiaries,
          cards: Array.isArray(data.cards) ? data.cards : state.cards,
          depositSimulations: Array.isArray(data.depositSimulations) ? data.depositSimulations : state.depositSimulations,
          loanSimulations: Array.isArray(data.loanSimulations) ? data.loanSimulations : state.loanSimulations,
        };
        persistState(next);
        return next;
      });
      get().syncDeterministicNotifications();
      return { success: true, message: 'Workspace imported successfully!' };
    },

    // ---------------------------------------------------------
    // Phase 6 Banking Actions
    // ---------------------------------------------------------
    addAccount: (accountData) => {
      const newAccount: FinancialAccount = {
        ...accountData,
        id: `acct_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        lastUpdated: new Date().toISOString(),
        isDemo: true,
      };
      set((state) => {
        const next = { ...state, accounts: [...state.accounts, newAccount] };
        persistState(next);
        return next;
      });
      return newAccount;
    },

    updateAccount: (accountData) => {
      set((state) => {
        const next = {
          ...state,
          accounts: state.accounts.map((a) =>
            a.id === accountData.id
              ? { ...a, ...accountData, lastUpdated: new Date().toISOString() }
              : a
          ),
        };
        persistState(next);
        return next;
      });
    },

    archiveAccount: (id) => {
      const { accounts, transactions } = get();
      const target = accounts.find((a) => a.id === id);
      if (!target) return { success: false, message: 'Account not found' };
      const balance = calculateAccountBalance(target, transactions);
      if (balance !== 0) {
        return {
          success: false,
          message: `Cannot archive account with non-zero balance (Current: ₹${(balance / 100).toLocaleString('en-IN')}). Please transfer remaining funds or settle outstanding balance before closing.`,
        };
      }
      set((state) => {
        const next = {
          ...state,
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, isArchived: true, lastUpdated: new Date().toISOString() } : a
          ),
        };
        persistState(next);
        return next;
      });
      return { success: true };
    },

    recordTransfer: (data) => {
      const { accounts, transactions } = get();
      const source = accounts.find((a) => a.id === data.sourceAccountId && !a.isArchived);
      const destination = accounts.find((a) => a.id === data.destinationAccountId && !a.isArchived);

      if (!source) {
        return { success: false, error: 'Source account not found or is archived.' };
      }
      if (!destination) {
        return { success: false, error: 'Destination account not found or is archived.' };
      }
      if (source.id === destination.id) {
        return { success: false, error: 'Source and destination accounts must be distinct.' };
      }
      if (data.amountMinor <= 0) {
        return { success: false, error: 'Transfer amount must be greater than zero.' };
      }
      const sourceBalance = calculateAccountBalance(source, transactions);
      if (source.accountType !== 'credit' && sourceBalance < data.amountMinor) {
        return {
          success: false,
          error: `Insufficient eligible funds in ${source.name}. Available balance: ₹${(sourceBalance / 100).toLocaleString('en-IN')}`,
        };
      }

      const txDate = data.date || DEMO_AS_OF;
      const newTx: Transaction = {
        id: `tx_trf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        accountId: source.id,
        targetAccountId: destination.id,
        amountMinor: data.amountMinor,
        type: 'transfer',
        category: 'Transfer',
        merchant: `Transfer to ${destination.name}`,
        date: txDate,
        status: 'completed',
        notes: data.note || `Internal simulated transfer to ${destination.name}`,
      };

      const receipt: DemoTransferReceipt = {
        id: `rcpt_${Date.now()}`,
        referenceNumber: `EXP-TRF-${txDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        sourceAccountId: source.id,
        destinationAccountId: destination.id,
        amountMinor: data.amountMinor,
        date: txDate,
        note: data.note,
        status: 'completed',
        sourceBalanceAfterMinor: sourceBalance - data.amountMinor,
        destinationBalanceAfterMinor: calculateAccountBalance(destination, transactions) + data.amountMinor,
      };

      set((state) => {
        const next = {
          ...state,
          transactions: [newTx, ...state.transactions],
          transferReceipts: [receipt, ...(state.transferReceipts || [])],
        };
        persistState(next);
        return next;
      });

      return { success: true, transaction: newTx, receipt };
    },

    addBeneficiary: (b) => {
      const newBeneficiary: BankingBeneficiary = {
        ...b,
        id: `ben_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const next = { ...state, beneficiaries: [...(state.beneficiaries || []), newBeneficiary] };
        persistState(next);
        return next;
      });
      return newBeneficiary;
    },

    updateBeneficiary: (b) => {
      set((state) => {
        const next = {
          ...state,
          beneficiaries: (state.beneficiaries || []).map((item) => (item.id === b.id ? b : item)),
        };
        persistState(next);
        return next;
      });
    },

    deleteBeneficiary: (id) => {
      set((state) => {
        const next = {
          ...state,
          beneficiaries: (state.beneficiaries || []).filter((item) => item.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    addBill: (billData) => {
      const newBill: BankingBill = {
        ...billData,
        id: `bill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      };
      set((state) => {
        const next = { ...state, bills: [...(state.bills || []), newBill] };
        persistState(next);
        return next;
      });
      return newBill;
    },

    updateBill: (bill) => {
      set((state) => {
        const next = {
          ...state,
          bills: (state.bills || []).map((b) => (b.id === bill.id ? bill : b)),
        };
        persistState(next);
        return next;
      });
    },

    deleteBill: (id) => {
      set((state) => {
        const next = {
          ...state,
          bills: (state.bills || []).filter((b) => b.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    payBill: (billId, accountId) => {
      const { bills, accounts, transactions } = get();
      const bill = (bills || []).find((b) => b.id === billId);
      if (!bill) return { success: false, error: 'Bill record not found.' };
      if (bill.status === 'paid') return { success: false, error: 'Bill has already been paid.' };

      const targetAccountId = accountId || bill.accountId;
      const account = accounts.find((a) => a.id === targetAccountId && !a.isArchived);
      if (!account) return { success: false, error: 'Designated payment account not found.' };

      const balance = calculateAccountBalance(account, transactions);
      if (account.accountType !== 'credit' && balance < bill.amountMinor) {
        return {
          success: false,
          error: `Insufficient funds in ${account.name} (Current: ₹${(balance / 100).toLocaleString('en-IN')})`,
        };
      }

      const newTx: Transaction = {
        id: `tx_bill_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        accountId: targetAccountId,
        amountMinor: bill.amountMinor,
        type: 'expense',
        category: bill.category || 'Utilities',
        merchant: bill.billerName || bill.title,
        date: DEMO_AS_OF,
        status: 'completed',
        notes: `Simulated bill payment for ${bill.title}`,
        isRecurring: !!bill.frequency,
      };

      set((state) => {
        const updatedBills = (state.bills || []).map((b) =>
          b.id === billId
            ? {
                ...b,
                status: 'paid' as const,
                paymentTransactionId: newTx.id,
                paidAt: DEMO_AS_OF,
              }
            : b
        );
        const next = {
          ...state,
          bills: updatedBills,
          transactions: [newTx, ...state.transactions],
        };
        persistState(next);
        return next;
      });

      return { success: true, transaction: newTx };
    },

    toggleCardFreeze: (id) => {
      set((state) => {
        const next = {
          ...state,
          cards: (state.cards || []).map((c) =>
            c.id === id ? { ...c, status: c.status === 'active' ? ('frozen' as const) : ('active' as const) } : c
          ),
        };
        persistState(next);
        return next;
      });
    },

    updateCardNickname: (id, nickname) => {
      set((state) => {
        const next = {
          ...state,
          cards: (state.cards || []).map((c) => (c.id === id ? { ...c, cardNickname: nickname } : c)),
        };
        persistState(next);
        return next;
      });
    },

    addDepositSimulation: (sim) => {
      const newSim: DepositSimulation = {
        ...sim,
        id: `dep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const next = { ...state, depositSimulations: [...(state.depositSimulations || []), newSim] };
        persistState(next);
        return next;
      });
      return newSim;
    },

    deleteDepositSimulation: (id) => {
      set((state) => {
        const next = {
          ...state,
          depositSimulations: (state.depositSimulations || []).filter((s) => s.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    addLoanSimulation: (sim) => {
      const newSim: LoanSimulation = {
        ...sim,
        id: `loan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const next = { ...state, loanSimulations: [...(state.loanSimulations || []), newSim] };
        persistState(next);
        return next;
      });
      return newSim;
    },

    deleteLoanSimulation: (id) => {
      set((state) => {
        const next = {
          ...state,
          loanSimulations: (state.loanSimulations || []).filter((s) => s.id !== id),
        };
        persistState(next);
        return next;
      });
    },

    resetToDemo: () => {
      const resetState = {
        user: INITIAL_USER,
        accounts: INITIAL_ACCOUNTS,
        transactions: INITIAL_TRANSACTIONS,
        categories: INITIAL_CATEGORIES,
        budgets: INITIAL_BUDGETS,
        goals: INITIAL_GOALS,
        recurringRules: INITIAL_RECURRING_RULES,
        beneficiaries: INITIAL_BENEFICIARIES,
        bills: INITIAL_BILLS,
        cards: INITIAL_CARDS,
        depositSimulations: INITIAL_DEPOSIT_SIMULATIONS,
        loanSimulations: INITIAL_LOAN_SIMULATIONS,
        transferReceipts: [],
        quotes: INITIAL_STOCK_QUOTES,
        holdings: INITIAL_HOLDINGS,
        watchlists: INITIAL_WATCHLISTS,
        insights: INITIAL_INSIGHTS,
        notifications: INITIAL_NOTIFICATIONS,
        notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
        dismissedNotificationIds: [],
        demoAsOf: DEMO_AS_OF,
      };
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set(resetState);
      persistState(resetState);
    },

    // Selectors
    getAccountBalance: (accountId) => {
      const { accounts, transactions } = get();
      const account = accounts.find((a) => a.id === accountId);
      if (!account) return 0;
      return calculateAccountBalance(account, transactions);
    },

    getTotalLiquidCash: () => {
      const { accounts, transactions } = get();
      return calculateTotalLiquidCash(accounts, transactions);
    },

    getPeriodIncome: (start = '2026-10-01', end = DEMO_AS_OF) => {
      const { transactions } = get();
      return calculatePeriodIncome(transactions, start, end);
    },

    getPeriodExpenses: (start = '2026-10-01', end = DEMO_AS_OF) => {
      const { transactions } = get();
      return calculatePeriodExpenses(transactions, start, end);
    },

    getCategorySpent: (category, start = '2026-10-01', end = DEMO_AS_OF) => {
      const { transactions } = get();
      return calculateCategorySpent(category, transactions, start, end);
    },

    getPortfolioValue: () => {
      const { holdings, quotes } = get();
      return calculatePortfolioValue(holdings, quotes);
    },

    getTotalInvested: () => {
      const { holdings } = get();
      return calculateTotalInvested(holdings);
    },

    getNetWorth: () => {
      const { accounts, transactions, holdings, quotes } = get();
      return calculateNetWorth(accounts, transactions, holdings, quotes);
    },
  };
});

