/**
 * EXPENZO Money & Currency Utilities
 * Uses integer paise minor units internally (1 Rupee = 100 paise)
 * Displays according to Indian grouping standards: ₹1,25,400 with proper minus signs: −₹500
 */

export function toRupees(minor: number): number {
  return minor / 100;
}

export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export interface FormatINROptions {
  showPaise?: boolean;
  showSign?: boolean;
  compact?: boolean;
}

/**
 * Formats integer paise into Indian Rupee format string.
 * Example: 5000000 -> "₹50,000"
 * Example: -50000 -> "−₹500"
 */
export function formatINR(minor: number, options: FormatINROptions = {}): string {
  const isNegative = minor < 0;
  const absMinor = Math.abs(minor);
  const rupees = absMinor / 100;

  // Determine whether to show decimal paise
  const hasPaise = absMinor % 100 !== 0;
  const showDecimals = options.showPaise ?? hasPaise;

  if (options.compact && rupees >= 10000000) {
    // Crores (>= 1 Cr)
    const cr = (rupees / 10000000).toFixed(2);
    const sign = isNegative ? '−' : (options.showSign && minor > 0 ? '+' : '');
    return `${sign}₹${cr} Cr`;
  }

  if (options.compact && rupees >= 100000) {
    // Lakhs (>= 1 L)
    const lk = (rupees / 100000).toFixed(2);
    const sign = isNegative ? '−' : (options.showSign && minor > 0 ? '+' : '');
    return `${sign}₹${lk} L`;
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const formattedNumber = formatter.format(rupees);

  if (isNegative) {
    return `−₹${formattedNumber}`; // Unicode minus U+2212
  }

  if (options.showSign && minor > 0) {
    return `+₹${formattedNumber}`;
  }

  return `₹${formattedNumber}`;
}

/**
 * Formats signed transaction amount with indicator
 */
export function formatSignedTransaction(minor: number, type: 'expense' | 'income' | 'transfer'): string {
  if (type === 'expense') {
    return `−${formatINR(minor)}`;
  }
  if (type === 'income') {
    return `+${formatINR(minor)}`;
  }
  return formatINR(minor);
}

