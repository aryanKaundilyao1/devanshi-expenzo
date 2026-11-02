import { StructuredCardData } from '@/types/finance';
import { formatINR } from '@/domain/money/formatters';

const STORAGE_KEY = 'expenzo_gemini_api_key';

/**
 * Retrieve the active Google Gemini API key from localStorage or Vite environment variables
 */
export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local && local.trim().length > 0) return local.trim();
  }

  const envKey =
    (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ||
    (import.meta.env.GEMINI_API_KEY as string | undefined) ||
    '';

  return envKey.trim();
}

/**
 * Store a user-provided Gemini API key in localStorage
 */
export function setGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (!key.trim()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  }
}

/**
 * Clear the user's stored Gemini API key
 */
export function clearGeminiApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Check whether a Gemini API key is configured
 */
export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

interface GeminiResponse {
  text: string;
  card?: StructuredCardData;
  intent?: string;
}

/**
 * Execute prompt against Google Gemini 1.5 Flash API with complete live financial context
 */
export async function callGeminiFlash(prompt: string, financeState: any): Promise<GeminiResponse> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Google Gemini API Key is not configured.');
  }

  const {
    user,
    accounts = [],
    transactions = [],
    budgets = [],
    savingsGoals = [],
    bills = [],
    holdings = [],
    stocks = [],
  } = financeState || {};

  // Compute live account metrics
  const activeAccounts = accounts.filter((a: any) => !a.isArchived);
  const accountSummaries = activeAccounts.map((a: any) => {
    let balance = a.openingBalanceMinor;
    for (const tx of transactions) {
      if (tx.status === 'flagged') continue;
      if (tx.accountId === a.id) {
        if (tx.type === 'expense' || tx.type === 'transfer') balance -= tx.amountMinor;
        if (tx.type === 'income') balance += tx.amountMinor;
      }
      if (tx.type === 'transfer' && tx.targetAccountId === a.id) {
        balance += tx.amountMinor;
      }
    }
    return `- ${a.name} (${a.institution}, ${a.accountType}): ${formatINR(balance)}`;
  });

  const totalLiquidCash = activeAccounts.reduce((sum: number, a: any) => {
    let balance = a.openingBalanceMinor;
    for (const tx of transactions) {
      if (tx.status === 'flagged') continue;
      if (tx.accountId === a.id) {
        if (tx.type === 'expense' || tx.type === 'transfer') balance -= tx.amountMinor;
        if (tx.type === 'income') balance += tx.amountMinor;
      }
      if (tx.type === 'transfer' && tx.targetAccountId === a.id) {
        balance += tx.amountMinor;
      }
    }
    return sum + balance;
  }, 0);

  // Compute recent transactions
  const recentTransactions = [...transactions]
    .sort((a: any, b: any) => b.date.localeCompare(a.date))
    .slice(0, 15)
    .map(
      (tx: any) =>
        `- ${tx.date} | ${tx.type.toUpperCase()} | ${formatINR(tx.amountMinor)} | ${tx.category} | ${tx.merchant}`
    );

  // Budgets summary
  const budgetSummaries = budgets.map((b: any) => {
    const spent = transactions
      .filter((t: any) => t.type === 'expense' && t.category === b.category)
      .reduce((sum: number, t: any) => sum + t.amountMinor, 0);
    return `- ${b.category}: Spent ${formatINR(spent)} of ${formatINR(b.allocatedMinor)} limit`;
  });

  // Goals summary
  const goalSummaries = savingsGoals.map(
    (g: any) =>
      `- ${g.name}: ${formatINR(g.currentMinor)} saved of ${formatINR(g.targetMinor)} target (Due: ${g.targetDate})`
  );

  // Holdings summary
  const holdingSummaries = holdings.map((h: any) => {
    const stock = stocks.find((s: any) => s.symbol === h.symbol);
    const price = stock ? stock.currentPriceMinor : h.buyPriceMinor;
    return `- ${h.symbol} (${h.quantity} shares): Current Value ${formatINR(h.quantity * price)}`;
  });

  const systemPrompt = `You are EXPENZO Financial AI Assistant, an elite, accurate, and empathetic personal finance intelligence co-pilot.
Your goal is to answer the user's financial inquiries, provide actionable budget advice, explain financial concepts (like SIP, 50-30-20 rule, emergency funds, tax saving under 80C/New Regime), and analyze their spending trends.

IMPORTANT RULES:
1. Always base answers on the user's authentic personal finance context provided below.
2. Never hallucinate or invent account balances or transaction numbers.
3. User Currency: Indian Rupees (INR, ₹). Format all numbers clearly in INR (e.g. ₹25,000).
4. Be polite, concise, structured, and practical. Use bullet points or bold text where helpful.
5. If the user asks for guidance or advice, provide clear next steps.

USER REAL-TIME FINANCIAL CONTEXT:
User Profile: ${user?.name || 'Authorized User'} (Persona: ${user?.persona || 'professional'})
Total Connected Bank Accounts: ${activeAccounts.length}
Total Liquid Cash in Accounts: ${formatINR(totalLiquidCash)}

Connected Accounts & Balances:
${accountSummaries.length > 0 ? accountSummaries.join('\n') : 'No bank accounts linked yet.'}

Recent Transactions:
${recentTransactions.length > 0 ? recentTransactions.join('\n') : 'No recorded transactions yet.'}

Active Budgets:
${budgetSummaries.length > 0 ? budgetSummaries.join('\n') : 'No budgets set.'}

Savings Goals:
${goalSummaries.length > 0 ? goalSummaries.join('\n') : 'No savings goals set.'}

Investment Holdings:
${holdingSummaries.length > 0 ? holdingSummaries.join('\n') : 'No active stock holdings.'}
`;

  // We try gemini-1.5-flash first (most popular free tier model in Google AI Studio)
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Gemini API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('Gemini API returned empty response candidates.');
      }

      // Check if we can build a nice structured card for spending/budgets
      let card: StructuredCardData | undefined;
      const lowerPrompt = prompt.toLowerCase();

      if (lowerPrompt.includes('spend') || lowerPrompt.includes('expense')) {
        const totalSpent = transactions
          .filter((t: any) => t.type === 'expense' && t.status === 'completed')
          .reduce((sum: number, t: any) => sum + t.amountMinor, 0);

        card = {
          type: 'financial_summary',
          title: 'Live Outflow Snapshot',
          subtitle: `Verified from ${transactions.length} canonical ledger entries`,
          metrics: [
            { label: 'Total Recorded Spent', value: formatINR(totalSpent) },
            { label: 'Available Cash', value: formatINR(totalLiquidCash) },
          ],
          actionLink: {
            label: 'View Detailed Transactions Ledger',
            href: '/app/transactions',
          },
        };
      } else if (lowerPrompt.includes('account') || lowerPrompt.includes('balance') || lowerPrompt.includes('cash')) {
        card = {
          type: 'financial_summary',
          title: 'Connected Bank Balances',
          subtitle: `${activeAccounts.length} Verified Accounts`,
          metrics: [
            { label: 'Total Liquid Balance', value: formatINR(totalLiquidCash) },
            { label: 'Active Accounts', value: activeAccounts.length.toString() },
          ],
          actionLink: {
            label: 'Manage Bank Accounts',
            href: '/app/banking',
          },
        };
      } else if (lowerPrompt.includes('budget')) {
        card = {
          type: 'financial_summary',
          title: 'Monthly Budget Health',
          subtitle: `${budgets.length} Monitored Categories`,
          metrics: [
            {
              label: 'Total Budgeted',
              value: formatINR(budgets.reduce((s: number, b: any) => s + b.allocatedMinor, 0)),
            },
            { label: 'Active Budgets', value: budgets.length.toString() },
          ],
          actionLink: {
            label: 'Manage Budgets & Thresholds',
            href: '/app/budgets',
          },
        };
      }

      return {
        text: generatedText.trim(),
        card,
        intent: `gemini_${model}`,
      };
    } catch (err) {
      lastError = err;
      // If quota or rate limited or model not found, try next model
      continue;
    }
  }

  throw lastError || new Error('Failed to reach Gemini API.');
}
