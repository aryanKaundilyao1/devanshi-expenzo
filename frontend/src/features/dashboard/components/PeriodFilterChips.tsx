import React from 'react';
import { DashboardPeriod, DateRange } from '../utils/dashboardSelectors';
import { Calendar } from 'lucide-react';

interface PeriodFilterChipsProps {
  currentPeriod: DashboardPeriod;
  onSelectPeriod: (period: DashboardPeriod) => void;
  dateRange: DateRange;
}

const PERIODS: { id: DashboardPeriod; label: string }[] = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: '1y', label: '1Y' },
];

export function PeriodFilterChips({
  currentPeriod,
  onSelectPeriod,
  dateRange,
}: PeriodFilterChipsProps) {
  const formatDate = (iso: string) => {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 py-1">
      {/* Date Interval Label */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">{dateRange.label}:</span>
        <span>
          {formatDate(dateRange.startDate)} – {formatDate(dateRange.endDate)}
        </span>
      </div>

      {/* Segmented Period Chips */}
      <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto shadow-2xs">
        {PERIODS.map((p) => {
          const isActive = currentPeriod === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPeriod(p.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#111C30] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              aria-pressed={isActive}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

