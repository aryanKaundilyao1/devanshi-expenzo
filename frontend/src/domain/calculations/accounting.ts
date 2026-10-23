import { FinancialAccount, Transaction, InvestmentHolding, StockQuote } from '@/types/finance';

/**
 * Derives the current balance of a single financial account from its
 * opening balance + signed transaction movements.
 */
export function calculateAccountBalance(
  account: FinancialAccount,
  transactions: Transaction[]
): number {
  let balance = account.openingBalanceMinor;

  for (const tx of transactions) {
    if (tx.status === 'flagged') continue;

    if (tx.type === 'income' && tx.accountId === account.id) {
      balance += tx.amountMinor;
    } else if (tx.type === 'expense' && tx.accountId === account.id) {
      balance -= tx.amountMinor;
    } else if (tx.type === 'transfer') {
      if (tx.accountId === account.id) {
        // Outgoing transfer
        balance -= tx.amountMinor;
      } else if (tx.targetAccountId === account.id) {
        // Incoming transfer
        balance += tx.amountMinor;
      }
    }
  }

  return balance;
}

/**
 * Calculates total liquid cash across all non-credit accounts.
 */
export function calculateTotalLiquidCash(
  accounts: FinancialAccount[],
  transactions: Transaction[]
): number {
  return accounts
    .filter((acc) => acc.accountType !== 'credit')
    .reduce((sum, acc) => sum + calculateAccountBalance(acc, transactions), 0);
}

/**
 * Calculates total income in a given date range.
 * Note: Transfers are strictly excluded!
 */
export function calculatePeriodIncome(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): number {
  return transactions
    .filter(
      (tx) =>
        tx.type === 'income' &&
        tx.status === 'completed' &&
        tx.date >= startDate &&
        tx.date <= endDate
    )
    .reduce((sum, tx) => sum + tx.amountMinor, 0);
}

/**
 * Calculates total expenses in a given date range.
 * Note: Transfers are strictly excluded!
 */
export function calculatePeriodExpenses(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): number {
  return transactions
    .filter(
      (tx) =>
        tx.type === 'expense' &&
        tx.status === 'completed' &&
        tx.date >= startDate &&
        tx.date <= endDate
    )
    .reduce((sum, tx) => sum + tx.amountMinor, 0);
}

/**
 * Calculates total spent in a specific category during a period.
 */
export function calculateCategorySpent(
  category: string,
  transactions: Transaction[],
  startDate: string,
  endDate: string
): number {
  return transactions
    .filter(
      (tx) =>
        tx.type === 'expense' &&
        tx.category.toLowerCase() === category.toLowerCase() &&
        tx.status === 'completed' &&
        tx.date >= startDate &&
        tx.date <= endDate
    )
    .reduce((sum, tx) => sum + tx.amountMinor, 0);
}

/**
 * Calculates current market value of investment portfolio.
 */
export function calculatePortfolioValue(
  holdings: InvestmentHolding[],
  quotes: Record<string, StockQuote>
): number {
  return holdings.reduce((sum, h) => {
    const quote = quotes[h.ticker];
    const price = quote ? quote.currentPriceMinor : h.averageBuyPriceMinor;
    return sum + h.quantity * price;
  }, 0);
}

/**
 * Calculates total cost basis invested in the portfolio.
 */
export function calculateTotalInvested(holdings: InvestmentHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.quantity * h.averageBuyPriceMinor, 0);
}

/**
 * Calculates total net worth:
 * Liquid Cash + Investment Portfolio Value - Liabilities (Credit balances).
 * Note: Goals are not additive (they are savings allocations from cash).
 */
export function calculateNetWorth(
  accounts: FinancialAccount[],
  transactions: Transaction[],
  holdings: InvestmentHolding[],
  quotes: Record<string, StockQuote>
): number {
  const liquidCash = calculateTotalLiquidCash(accounts, transactions);
  const portfolio = calculatePortfolioValue(holdings, quotes);

  // Credit card used balance
  const creditLiabilities = accounts
    .filter((acc) => acc.accountType === 'credit')
    .reduce((sum, acc) => {
      const balance = calculateAccountBalance(acc, transactions);
      return balance < 0 ? sum + Math.abs(balance) : sum;
    }, 0);

  return liquidCash + portfolio - creditLiabilities;
}

