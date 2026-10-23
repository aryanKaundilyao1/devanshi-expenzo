import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FinancialInsight } from '@/types/finance';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

interface AIInsightsPreviewProps {
  insights: FinancialInsight[];
}

export function AIInsightsPreview({ insights }: AIInsightsPreviewProps) {
  const navigate = useNavigate();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 py-0">
            <AlertOctagon className="h-3 w-3" /> Critical Notice
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning" className="text-[10px] gap-1 px-1.5 py-0">
            <AlertTriangle className="h-3 w-3" /> Action Recommended
          </Badge>
        );
      case 'positive':
        return (
          <Badge variant="success" className="text-[10px] gap-1 px-1.5 py-0">
            <CheckCircle2 className="h-3 w-3" /> Financial Strength
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
            <Lightbulb className="h-3 w-3" /> Observation
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">EXPENZO Intelligence</h3>
            <Badge variant="outline" className="text-[10px]">Deterministic Rules</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Explainable insights derived strictly from your verified ledger numbers.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate('/app/ai-assistant?context=dashboard')}
          className="text-xs gap-1.5 self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/60"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Ask AI Assistant</span>
        </Button>
      </div>

      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {getSeverityBadge(ins.severity)}
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {ins.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ins.description}
                </p>

                {ins.metricFigures && ins.metricFigures.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                    {ins.metricFigures.map((mf, i) => (
                      <span key={i}>
                        {mf.label}: <strong className="text-slate-900 dark:text-slate-200">{mf.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {ins.suggestedAction && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => navigate(ins.suggestedAction!.actionRoute)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <span>{ins.suggestedAction.label}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 p-4">
          <Lightbulb className="h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Awaiting Further Ledger Activity</p>
          <p className="text-[11px] text-slate-400 max-w-xs">
            As you log more transactions, the intelligence engine automatically detects patterns and anomalies.
          </p>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/ai-insights')}
          className="w-full justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600"
        >
          <span>Explore All Financial Diagnostics & Trends</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

