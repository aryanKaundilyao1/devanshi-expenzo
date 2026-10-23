import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { evaluateFinancialInsights } from '@/features/ai/insights/insightRules';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Calculator,
  ArrowRight,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';

export const AIInsightDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const financeState = useFinanceStore();

  const allInsights = evaluateFinancialInsights(financeState);
  const insight = allInsights.find((i) => i.id === id);

  if (!insight) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs max-w-lg mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Diagnostic Record Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          The requested financial diagnosis could not be found or is no longer applicable after recent financial ledger mutations.
        </p>
        <Link
          to="/app/ai-insights"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Insights Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/ai-insights"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Insights Feed
        </Link>

        {insight.suggestedAction && (
          <Link
            to={insight.suggestedAction.actionRoute}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>{insight.suggestedAction.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Main Diagnosis Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {insight.category}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              Severity: {insight.severity}
            </span>
            <span className="text-xs text-slate-400 ml-auto font-mono">
              Rule ID: {insight.ruleId}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {insight.title}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {insight.description}
          </p>
        </div>

        {/* Source Figures / Metrics Grid */}
        {insight.metricFigures && insight.metricFigures.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {insight.metricFigures.map((mf, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  {mf.label}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                  {mf.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Audit Evidence & Calculation Formula */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mathematical Evidence & Ledger Basis</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                Evaluation Window:
              </span>
              <span className="text-slate-500 dark:text-slate-400">{insight.dateRange}</span>
            </div>

            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                Observed Evidence:
              </span>
              <span className="text-slate-600 dark:text-slate-300">{insight.evidence}</span>
            </div>

            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                Confidence Explanation:
              </span>
              <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight.confidenceExplanation}
              </span>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        {insight.suggestedAction && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Recommended Action
              </span>
              <span className="text-emerald-800 dark:text-emerald-300">
                Proceed to the appropriate module to manage or optimize this financial aspect.
              </span>
            </div>
            <Link
              to={insight.suggestedAction.actionRoute}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shrink-0 ml-4 shadow-xs"
            >
              {insight.suggestedAction.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

