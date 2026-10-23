import React from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  calculatePortfolioMetrics,
  calculateAssetAllocation,
  calculateSectorAllocation,
  calculateHoldingsDetailed,
  calculateDiversificationRisk,
} from '@/features/investments/utils/investmentCalculations';
import { AssetAllocationDonut } from '@/features/investments/components/AssetAllocationDonut';
import { formatINR } from '@/domain/money/formatters';
import {
  ArrowLeft,
  PieChart,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

export const PortfolioAnalyticsPage: React.FC = () => {
  const { holdings, quotes } = useFinanceStore();

  const metrics = calculatePortfolioMetrics(holdings, quotes);
  const assetAllocation = calculateAssetAllocation(holdings, quotes);
  const sectorAllocation = calculateSectorAllocation(holdings, quotes);
  const detailedHoldings = calculateHoldingsDetailed(holdings, quotes);
  const riskAssessment = calculateDiversificationRisk(holdings, quotes);

  const isGain = metrics.unrealizedGainLossMinor >= 0;

  return (
    <div className="space-y-6">
      {/* Navigation Top */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/investments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </Link>
        <Link
          to="/app/investments/holdings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          View All Holdings <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Portfolio Analytics & Risk Intelligence
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quantitative breakdown of capital concentration, asset classes, and sector exposures
        </p>
      </div>

      {/* Key Financial Reconciliation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Current Valuation
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {formatINR(metrics.totalValueMinor)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Total market equity</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Capital Invested
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
            {formatINR(metrics.totalInvestedMinor)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Aggregate cost basis</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Unrealized Gain / Loss
          </span>
          <span className={`text-xl font-bold mt-1 block ${
            isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isGain ? '+' : ''}{formatINR(metrics.unrealizedGainLossMinor)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Net capital growth</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Unrealized ROI
          </span>
          <span className={`text-xl font-bold mt-1 flex items-center gap-1 ${
            isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isGain ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isGain ? '+' : ''}{metrics.unrealizedReturnPercent.toFixed(2)}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Return on investment</span>
        </div>
      </div>

      {/* Diversification Assessment Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Portfolio Diversification Assessment
          </h2>
          <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-bold ${riskAssessment.scoreBadgeClass}`}>
            {riskAssessment.scoreText}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {riskAssessment.observation}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-1">Top Holding Concentration:</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {riskAssessment.topHoldingTicker || 'None'} ({riskAssessment.topHoldingWeight.toFixed(1)}% of portfolio)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              FINTECH RULE: Financial advisors recommend capping single-stock exposure below 15–20% of net investable assets.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block mb-1">Top Sector Concentration:</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {riskAssessment.topSectorName || 'None'} ({riskAssessment.topSectorWeight.toFixed(1)}% of portfolio)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              SECTOR BALANCE: Spreading investments across at least 3 distinct sectors prevents cyclical downturn losses.
            </p>
          </div>
        </div>
      </div>

      {/* Allocation Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Class Donut Card */}
        <AssetAllocationDonut allocation={assetAllocation} />

        {/* Sector Exposure Bar Chart Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Sector Exposure Breakdown
          </h3>

          {sectorAllocation.length > 0 ? (
            <div className="space-y-4">
              {sectorAllocation.map((sec) => (
                <div key={sec.sector} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {sec.sector}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatINR(sec.valueMinor)} ({sec.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(sec.percent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No sector allocation data available.
            </div>
          )}
        </div>
      </div>

      {/* Top Positions Weight Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Holdings Capital Allocation Table
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Detailed relative weights of each individual tracked security
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Instrument</th>
                <th className="pb-3 font-semibold">Sector</th>
                <th className="pb-3 font-semibold text-right">Cost Basis</th>
                <th className="pb-3 font-semibold text-right">Market Valuation</th>
                <th className="pb-3 font-semibold text-right">Unrealized Gain</th>
                <th className="pb-3 font-semibold text-right">Portfolio Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {detailedHoldings.map((h) => {
                const isPos = h.unrealizedGainMinor >= 0;
                return (
                  <tr key={h.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      <Link to={`/app/investments/stocks/${h.ticker}`} className="hover:text-emerald-600">
                        {h.ticker}
                      </Link>
                      <span className="text-[11px] text-slate-400 block font-normal">{h.companyName}</span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{h.sector}</td>
                    <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                      {formatINR(h.investedValueMinor)}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatINR(h.currentValueMinor)}
                    </td>
                    <td className="py-3 text-right font-bold">
                      <span className={isPos ? 'text-emerald-600' : 'text-rose-600'}>
                        {isPos ? '+' : ''}{formatINR(h.unrealizedGainMinor)} ({h.returnPercent.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                      {h.portfolioWeightPercent.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

