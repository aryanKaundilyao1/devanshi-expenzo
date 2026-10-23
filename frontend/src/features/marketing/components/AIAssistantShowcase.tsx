import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { mockAIService } from '@/services/mocks/mockFinanceService';
import { Sparkles, Bot, Send, ArrowRight, User } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'How much did I spend this month?',
  'Where does most of my money go?',
  'What is my available cash balance?',
  'How is my portfolio performing?',
  'How much should I save each month?',
];

export function AIAssistantShowcase() {
  const [activePrompt, setActivePrompt] = useState(SUGGESTED_PROMPTS[0]);
  const [response, setResponse] = useState<{
    text: string;
    structuredCard?: any;
    actionRoute?: string;
  }>({
    text: 'You have spent a total of ₹18,800 so far in October 2026. Your top expense category is Housing & Rent (₹12,000).',
    structuredCard: {
      type: 'metric',
      label: 'Total October Spending',
      value: '₹18,800',
    },
    actionRoute: '/app/expenses',
  });
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectPrompt = async (prompt: string) => {
    setActivePrompt(prompt);
    setIsTyping(true);

    try {
      const res = await mockAIService.processPrompt(prompt);
      setTimeout(() => {
        setResponse(res);
        setIsTyping(false);
      }, 300);
    } catch {
      setIsTyping(false);
    }
  };

  return (
    <section className="py-20 bg-slate-100/60 dark:bg-[#070D18] border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="success">Interactive AI Demo</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Conversational Financial Assistance
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Click any query below to test our deterministic client-side assistant. It analyzes your demo accounts and transactions instantly with zero external API calls.
          </p>
        </div>

        {/* Prompt Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSelectPrompt(prompt)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                activePrompt === prompt
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-[#111C30] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Simulator Shell */}
        <Card className="max-w-2xl mx-auto p-6 space-y-4 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1726]">
          {/* User Message */}
          <div className="flex items-start gap-3 justify-end">
            <div className="bg-emerald-600 text-white p-3.5 rounded-2xl rounded-tr-xs text-xs sm:text-sm font-medium shadow-xs max-w-md">
              {activePrompt}
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
          </div>

          {/* AI Response Message */}
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="bg-slate-100 dark:bg-[#152238] p-4 rounded-2xl rounded-tl-xs text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-3 border border-slate-200/60 dark:border-slate-800/80">
                {isTyping ? (
                  <div className="flex items-center gap-1.5 py-1 text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                ) : (
                  <>
                    <p className="leading-relaxed">{response.text}</p>

                    {response.structuredCard && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#101A2C] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {response.structuredCard.label}
                          </span>
                          <p className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                            {response.structuredCard.value}
                          </p>
                        </div>
                        <Badge variant="outline">Verified Demo</Badge>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Deterministic rules engine • Fixed clock 15 Oct 2026</span>
                <Link to="/app/ai-assistant" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                  Open full chat &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500">Want deeper portfolio & goal assistance?</span>
            <Link to="/app/ai-assistant">
              <Button size="sm">
                Try EXPENZO AI
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}

