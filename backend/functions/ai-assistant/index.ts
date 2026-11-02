// Supabase Edge Function: ai-assistant
// Authenticated server-side financial AI agent interfacing with Google Gemini Flash API.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestPayload {
  prompt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // 1. Authenticate user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt }: RequestPayload = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Query trusted database context for caller (Row Level Security protected)
    const [accountsRes, txRes, budgetRes] = await Promise.all([
      supabaseClient.from('financial_accounts').select('name, opening_balance_minor, account_type').eq('is_archived', false),
      supabaseClient.from('transactions').select('amount_minor, type, category, merchant, date').order('date', { ascending: false }).limit(50),
      supabaseClient.from('budgets').select('category, allocated_minor'),
    ]);

    const accounts = accountsRes.data || [];
    const transactions = txRes.data || [];
    const budgets = budgetRes.data || [];

    // Pre-calculate canonical totals on the server
    const totalExpensesMinor = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount_minor), 0);

    const totalIncomeMinor = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount_minor), 0);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    // 3. If GEMINI_API_KEY is present, call Gemini 2.5 Flash
    if (geminiApiKey) {
      const systemInstruction = `You are EXPENZO Financial AI Assistant. 
You provide grounded, intelligent financial guidance based STRICTLY on the user's authentic ledger data below. 
NEVER invent or hallucinate monetary figures. All amounts must match the verified data provided.
User Currency: INR (₹). (Divide minor paise by 100 to get Rupees).

VERIFIED USER FINANCIAL CONTEXT:
- Total Accounts: ${accounts.length}
- Verified Monthly Income: ₹${(totalIncomeMinor / 100).toFixed(2)}
- Verified Monthly Outflow: ₹${(totalExpensesMinor / 100).toFixed(2)}
- Active Budgets: ${budgets.map((b) => `${b.category}: ₹${b.allocated_minor / 100}`).join(', ')}
`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

      const aiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }],
            },
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const responseText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return new Response(
          JSON.stringify({
            intent: 'general_inquiry',
            text: responseText,
            source: 'gemini-1.5-flash',
            card: {
              type: 'financial_summary',
              title: 'Verified Financial Overview',
              metrics: [
                { label: 'Total Recorded Expenses', value: `₹${(totalExpensesMinor / 100).toLocaleString('en-IN')}` },
                { label: 'Total Recorded Income', value: `₹${(totalIncomeMinor / 100).toLocaleString('en-IN')}` },
              ],
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Graceful Fallback: Deterministic offline intelligence
    const lower = prompt.toLowerCase();
    let replyText = `Based on your database ledger, your total recorded expenses are ₹${(totalExpensesMinor / 100).toLocaleString('en-IN')} across ${transactions.length} transactions.`;
    if (lower.includes('income')) {
      replyText = `Your recorded income is ₹${(totalIncomeMinor / 100).toLocaleString('en-IN')}.`;
    } else if (lower.includes('budget')) {
      replyText = `You currently have ${budgets.length} active budgets configured in your database.`;
    }

    return new Response(
      JSON.stringify({
        intent: 'financial_summary',
        text: replyText,
        source: 'deterministic_rules_engine',
        card: {
          type: 'financial_summary',
          title: 'Verified Ledger Summary',
          metrics: [
            { label: 'Total Expenses', value: `₹${(totalExpensesMinor / 100).toLocaleString('en-IN')}` },
            { label: 'Total Income', value: `₹${(totalIncomeMinor / 100).toLocaleString('en-IN')}` },
          ],
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

