import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredCardData } from '@/types/finance';
import { formatINR } from '@/domain/money/formatters';
import { ArrowRight, Sparkles, BookOpen, AlertCircle, TrendingUp, Wallet, ShieldAlert } from 'lucide-react';

interface StructuredResponseViewProps {
  card: StructuredCardData;
}

export const StructuredResponseView: React.FC<StructuredResponseViewProps> = ({ card }) => {
  return (
    <div className="mt-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-4 text-xs shadow-xs space-y-3">
      {/* Card Header */}
      <div>
        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{card.title}</span>
        </div>
        {card.subtitle && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {card.subtitle}
          </p>
        )}
      </div>

      {/* Metrics Grid */}
      {card.metrics && card.metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          {card.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
            >
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                {m.label}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {m.value}
              </span>
              {m.hint && <span className="text-[10px] text-slate-400">{m.hint}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Breakdown Items */}
      {card.breakdown && card.breakdown.length > 0 && (
        <div className="space-y-2 pt-1">
          {card.breakdown.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {item.amountMinor > 0 ? formatINR(item.amountMinor) : ''}{' '}
                  {item.percent > 0 ? `(${item.percent.toFixed(0)}%)` : ''}
                </span>
              </div>
              {item.percent > 0 && (
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(item.percent, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Educational Note */}
      {card.educationalNote && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
            {card.educationalNote}
          </p>
        </div>
      )}

      {/* Action Navigation Link */}
      {card.actionLink && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex justify-end">
          <Link
            to={card.actionLink.href}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>{card.actionLink.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};

