import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockAIService } from '@/services/mocks/mockFinanceService';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

const AI_QUESTIONS = [
  'How much did I spend this month?',
  'Where does most of my money go?',
  'What is my available cash balance?',
  'How is my portfolio performing?',
  'Can I reach my savings target for the laptop?',
];

export function AIPage() {
  const [activeQuestion, setActiveQuestion] = useState(AI_QUESTIONS[0]);
  const [response, setResponse] = useState<any>({
    text: 'You have spent a total of ₹18,800 so far in October 2026. Your top expense category is Housing & Rent (₹12,000).',
    structuredCard: {
      type: 'metric',
      label: 'Total October Spending',
      value: '₹18,800',
    },
  });
  const [loading, setLoading] = useState(false);

  const handleAsk = async (q: string) => {
    setActiveQuestion(q);
    setLoading(true);
    try {
      const res = await mockAIService.processPrompt(q);
      setTimeout(() => {
        setResponse(res);
        setLoading(false);
      }, 250);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* 1. AI Hero Introduction */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="success">Deterministic Offline Intelligence</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Financial Intelligence, Transparent & Verifiable.
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          EXPENZO replaces generative hallucinations with rigorous deterministic calculations. Ask financial questions and receive exact figures derived directly from your personal ledger.
        </p>
      </div>

      {/* 2. Interactive AI Playground */}
      <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interactive Financial Question Playground
            </h3>
          </div>
          <Badge variant="outline">Client-Side Rules Engine</Badge>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Select a sample query to test live calculation:
          </label>
          <div className="flex flex-wrap gap-2">
            {AI_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  activeQuestion === q
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0E1726] border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Bot className="h-4 w-4 text-emerald-500" />
            <span>EXPENZO Assistant Diagnosis:</span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Analyzing ledger records...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {response.text}
              </p>

              {response.structuredCard && (
                <div className="p-4 rounded-xl bg-white dark:bg-[#152238] border border-slate-200 dark:border-slate-700/80 max-w-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {response.structuredCard.label}
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {response.structuredCard.value}
                    </p>
                  </div>
                  <Badge variant="success">Verified Figure</Badge>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
            <span>Derived from Oct 2026 transactions fixture</span>
            <Link to="/app/ai-assistant" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Open App Assistant &rarr;
            </Link>
          </div>
        </div>
      </Card>

      {/* 3-7. Intelligence Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3 bg-white dark:bg-[#111C30]">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <PieChart className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Expense Anomaly Detection</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Flags unusual single-day spending spikes or category acceleration against 30-day baseline averages without declaring false alarms.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white dark:bg-[#111C30]">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Budget Recommendations</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Suggests realistic category ceiling adjustments based on your declared priorities and actual month-to-date velocity.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white dark:bg-[#111C30]">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Cash-Flow Forecasting</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Projects end-of-month liquid balances by matching recurring commitments (rent, utilities) against anticipated income intervals.
          </p>
        </Card>
      </div>

      {/* 8. AI Capabilities & Limitations Disclosure */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1726] p-8 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Architecture Integrity: Capabilities vs. Limitations
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="space-y-2">
            <h5 className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              What EXPENZO AI Does:
            </h5>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Parses queries deterministically against your local ledger</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Provides exact arithmetic calculations for net worth, spent, and returns</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Explains its assumptions and linking calculations transparently</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              What EXPENZO AI Does Not Do:
            </h5>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Does not transmit your financial transactions to third-party LLMs</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Does not invent false trading returns or guaranteed stock predictions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Does not offer licensed tax advice or fiduciary financial guarantees</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 9. CTA */}
      <div className="text-center pt-4">
        <Link to="/app/ai-assistant">
          <Button size="lg">
            Open AI Assistant Demo
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

