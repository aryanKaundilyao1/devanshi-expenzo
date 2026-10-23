import { TransactionType } from '@/types/finance';

export interface ParsedCandidate {
  id: string;
  amount: string; // rupees
  type: TransactionType;
  category: string;
  merchant: string;
  date: string;
  notes?: string;
  isUncertain?: boolean;
  uncertaintyReason?: string;
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  // Food & Dining
  lunch: 'Food & Dining',
  dinner: 'Food & Dining',
  breakfast: 'Food & Dining',
  meal: 'Food & Dining',
  food: 'Food & Dining',
  dining: 'Food & Dining',
  coffee: 'Food & Dining',
  cafe: 'Food & Dining',
  starbucks: 'Food & Dining',
  restaurant: 'Food & Dining',
  burger: 'Food & Dining',
  pizza: 'Food & Dining',

  // Groceries
  grocery: 'Groceries',
  groceries: 'Groceries',
  supermarket: 'Groceries',
  vegetables: 'Groceries',
  fruits: 'Groceries',
  milk: 'Groceries',

  // Transport
  uber: 'Transport',
  ola: 'Transport',
  cab: 'Transport',
  taxi: 'Transport',
  transport: 'Transport',
  metro: 'Transport',
  bus: 'Transport',
  fuel: 'Transport',
  petrol: 'Transport',
  diesel: 'Transport',

  // Shopping
  shopping: 'Shopping',
  clothes: 'Shopping',
  shoes: 'Shopping',
  amazon: 'Shopping',
  myntra: 'Shopping',
  zara: 'Shopping',

  // Housing
  rent: 'Housing & Rent',
  apartment: 'Housing & Rent',
  flat: 'Housing & Rent',
  maintenance: 'Housing & Rent',

  // Utilities
  electricity: 'Utilities',
  power: 'Utilities',
  water: 'Utilities',
  wifi: 'Utilities',
  broadband: 'Utilities',
  airtel: 'Utilities',
  jio: 'Utilities',
  recharge: 'Utilities',

  // Healthcare
  gym: 'Healthcare',
  cult: 'Healthcare',
  doctor: 'Healthcare',
  hospital: 'Healthcare',
  medicine: 'Healthcare',
  medicines: 'Healthcare',
  pharmacy: 'Healthcare',

  // Education
  course: 'Education',
  book: 'Education',
  books: 'Education',
  tuition: 'Education',
  udemy: 'Education',
  college: 'Education',

  // Subscriptions & Entertainment
  movie: 'Entertainment',
  cinema: 'Entertainment',
  netflix: 'Subscriptions',
  spotify: 'Subscriptions',
  prime: 'Subscriptions',

  // Travel
  flight: 'Travel',
  hotel: 'Travel',
  train: 'Travel',
  irctc: 'Travel',
  trip: 'Travel',

  // Income categories
  salary: 'Salary',
  freelance: 'Freelance',
  consulting: 'Freelance',
  interest: 'Interest',
  dividend: 'Interest',
  gift: 'Gifts',
};

const INCOME_INDICATORS = ['received', 'credited', 'earned', 'got paid', 'salary', 'freelance payment'];

export function parseSmartEntry(text: string, referenceDate = '2026-10-15'): ParsedCandidate[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Split multi-clause text by ' and ', '&', or ';'
  const clauses = trimmed
    .split(/\s+and\s+|\s*&\s*|;/gi)
    .map((c) => c.trim())
    .filter(Boolean);

  const candidates: ParsedCandidate[] = [];

  clauses.forEach((clause, index) => {
    // 1. Determine date
    let date = referenceDate;
    if (/\byesterday\b/i.test(clause)) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - 1);
      date = d.toISOString().split('T')[0];
    }

    // 2. Determine type (Income vs Expense)
    const isIncome = INCOME_INDICATORS.some((ind) => new RegExp(`\\b${ind}\\b`, 'i').test(clause));
    const type: TransactionType = isIncome ? 'income' : 'expense';

    // 3. Extract amount: e.g. ₹450, 450, 450.50, ₹ 1,200, 12000
    const amountMatch = clause.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i);
    const amountStr = amountMatch ? amountMatch[1].replace(/,/g, '') : '';

    // 4. Extract Category from keyword dictionary
    let matchedCategory = type === 'income' ? 'Salary' : 'Other';
    let matchedKeyword: string | null = null;

    for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
      const kwRegex = new RegExp(`\\b${kw}\\b`, 'i');
      if (kwRegex.test(clause)) {
        matchedCategory = cat;
        matchedKeyword = kw;
        break;
      }
    }

    // 5. Extract merchant / description
    let merchant = '';
    // Look for patterns like "on <merchant>", "for <merchant>", "from <merchant>", "at <merchant>"
    const prepositionMatch = clause.match(/(?:on|for|at|from|to)\s+([a-zA-Z0-9\s.'&-]+?)(?:\s+(?:today|yesterday|via|from|to)|\s*$)/i);
    if (prepositionMatch && prepositionMatch[1]) {
      merchant = prepositionMatch[1].replace(/today|yesterday/gi, '').trim();
    } else if (matchedKeyword) {
      merchant = matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1);
    } else {
      // Fallback: strip numbers and common trigger words
      const cleaned = clause
        .replace(/(?:spent|paid|received|bought|got|today|yesterday|₹|rs\.?|inr|\d+(?:,\d+)*(?:\.\d+)?)/gi, '')
        .trim();
      merchant = cleaned || (type === 'income' ? 'Direct Credit' : 'Expense');
    }

    // Capitalize merchant
    merchant = merchant.replace(/\b\w/g, (c) => c.toUpperCase()).trim();

    // Uncertainty check
    const isUncertain = !amountStr || matchedCategory === 'Other';
    let uncertaintyReason: string | undefined;
    if (!amountStr) {
      uncertaintyReason = 'Amount could not be detected automatically';
    } else if (matchedCategory === 'Other') {
      uncertaintyReason = 'Category guessed as generic; please review';
    }

    candidates.push({
      id: `smart_${Date.now()}_${index}`,
      amount: amountStr,
      type,
      category: matchedCategory,
      merchant: merchant || (type === 'income' ? 'Income' : 'General Purchase'),
      date,
      notes: `Smart entry parsed from: "${clause}"`,
      isUncertain,
      uncertaintyReason,
    });
  });

  return candidates;
}

