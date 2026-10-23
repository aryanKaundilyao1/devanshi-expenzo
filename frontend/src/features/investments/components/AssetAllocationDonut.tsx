import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { AssetAllocationItem } from '@/features/investments/utils/investmentCalculations';
import { formatINR } from '@/domain/money/formatters';

interface AssetAllocationDonutProps {
  allocation: AssetAllocationItem[];
}

export const AssetAllocationDonut: React.FC<AssetAllocationDonutProps> = ({ allocation }) => {
  if (!allocation || allocation.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No Asset Allocation Data
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Add holdings to see equity, ETF, mutual fund, and gold distributions.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
          Asset Class Allocation
        </h3>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocation}
              dataKey="valueMinor"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
            >
              {allocation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as AssetAllocationItem;
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs border border-slate-700">
                      <div className="font-semibold text-slate-200">{data.label}</div>
                      <div className="font-bold text-sm text-emerald-400 mt-0.5">
                        {formatINR(data.valueMinor)}
                      </div>
                      <div className="text-slate-400 mt-0.5">{data.percent.toFixed(1)}% of portfolio</div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {allocation.map((item) => (
          <div key={item.assetClass} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-slate-600 dark:text-slate-300">
                {item.label}
              </span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-1">
              {item.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

