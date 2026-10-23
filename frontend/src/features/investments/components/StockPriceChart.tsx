import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatINR } from '@/domain/money/formatters';

interface StockPriceChartProps {
  historicalPrices: { date: string; priceMinor: number }[];
  currentPriceMinor: number;
  ticker: string;
}

type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'ALL';

export const StockPriceChart: React.FC<StockPriceChartProps> = ({
  historicalPrices,
  currentPriceMinor,
  ticker,
}) => {
  const [range, setRange] = useState<TimeRange>('1M');

  // Filter prices according to range
  const filteredData = useMemo(() => {
    if (!historicalPrices || historicalPrices.length === 0) return [];

    const sorted = [...historicalPrices].sort((a, b) => a.date.localeCompare(b.date));
    const now = new Date(sorted[sorted.length - 1].date);

    let cutoffDate = new Date(now);
    if (range === '1W') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (range === '1M') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (range === '3M') {
      cutoffDate.setMonth(now.getMonth() - 3);
    } else if (range === '1Y') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    } else {
      return sorted;
    }

    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    return sorted.filter((p) => p.date >= cutoffStr);
  }, [historicalPrices, range]);

  const hasData = filteredData.length > 0;
  const isGain =
    hasData &&
    filteredData[filteredData.length - 1].priceMinor >= filteredData[0].priceMinor;

  const color = isGain ? '#10B981' : '#F43F5E';

  // Determine min and max for chart scale
  const minPrice = hasData
    ? Math.min(...filteredData.map((d) => d.priceMinor)) * 0.98
    : 0;
  const maxPrice = hasData
    ? Math.max(...filteredData.map((d) => d.priceMinor)) * 1.02
    : 100;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            Price Progression ({ticker})
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatINR(currentPriceMinor)}
            </span>
            <span className="text-xs text-slate-400">NSE Demo Snapshot</span>
          </div>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {(['1W', '1M', '3M', '1Y', 'ALL'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                range === r
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {hasData && filteredData.length >= 2 ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickFormatter={(val) => {
                  const parts = val.split('-');
                  return `${parts[2]}/${parts[1]}`;
                }}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickFormatter={(val) => `₹${Math.round(val / 100)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs border border-slate-700">
                        <div className="text-slate-400 mb-0.5">{data.date}</div>
                        <div className="font-bold text-sm text-emerald-400">
                          {formatINR(data.priceMinor)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="priceMinor"
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-${ticker})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/30">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Incomplete History for {range} Window
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Deterministic demo history does not have enough price points for this specific range. Switch to 1M or ALL for full historical trends.
          </p>
        </div>
      )}
    </div>
  );
};

