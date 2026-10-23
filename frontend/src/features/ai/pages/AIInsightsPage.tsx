import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { evaluateFinancialInsights } from '@/features/ai/insights/insightRules';
import {
  Sparkles,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertOctagon,
  Bot,
} from 'lucide-react';

export const AIInsightsPage: React.FC = () => {
  const financeState = useFinanceStore();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const evaluatedInsights = useMemo(() => {
    return evaluateFinancialInsights(financeState);
  }, [financeState]);

  const filteredInsights = useMemo(() => {
    return evaluatedInsights.filter((ins) => {
      const matchCat = categoryFilter === 'all' || ins.category === categoryFilter;
      const matchSev = severityFilter === 'all' || ins.severity === severityFilter;
      return matchCat && matchSev;
    });
  }, [evaluatedInsights, categoryFilter, severityFilter]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
            <AlertOctagon className="w-3 h-3" /> Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Positive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Info className="w-3 h-3" /> Observation
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              AI Financial Insights
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              {evaluatedInsights.length} active diagnoses
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Proactive intelligence feed detecting spending anomalies, budget utilization, and capital opportunities
          </p>
        </div>

        <Link
          to="/app/ai-assistant"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <Bot className="w-4 h-4" />
          Ask AI Assistant
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'spending', label: 'Spending' },
            { id: 'budget', label: 'Budget' },
            { id: 'cashflow', label: 'Cash Flow' },
            { id: 'savings', label: 'Savings' },
            { id: 'investment', label: 'Investment' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Severity:
          </span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="positive">Positive</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Insights Cards Feed */}
      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((ins) => (
            <div
              key={ins.id}
              className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {ins.category} • {ins.dateRange}
                  </span>
                  {getSeverityBadge(ins.severity)}
                </div>

                <Link
                  to={`/app/ai-insights/${ins.id}`}
                  className="text-base font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block"
                >
                  {ins.title}
                </Link>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {ins.description}
                </p>

                {/* Metric Badges */}
                {ins.metricFigures && ins.metricFigures.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    {ins.metricFigures.map((mf, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                        <span className="text-[10px] text-slate-400 block">{mf.label}</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                          {mf.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link
                  to={`/app/ai-insights/${ins.id}`}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  Diagnostic Breakdown <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {ins.suggestedAction && (
                  <Link
                    to={ins.suggestedAction.actionRoute}
                    className="font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    {ins.suggestedAction.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 shadow-xs">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Insights Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            No financial diagnostics match your current category and severity filters.
          </p>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setSeverityFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

