import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  calculateFutureValueWithReturn,
  calculateMonthsToTarget,
  calculateRequiredMonthlyContribution,
} from '@/features/planner/utils/plannerCalculations';
import { formatINR } from '@/domain/money/formatters';
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  Sliders,
  DollarSign,
} from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const [targetRupees, setTargetRupees] = useState('100000');
  const [currentRupees, setCurrentRupees] = useState('15000');
  const [monthlyRupees, setMonthlyRupees] = useState('5000');
  const [horizonMonths, setHorizonMonths] = useState(18);
  const [annualReturnPercent, setAnnualReturnPercent] = useState(12);

  const targetMinor = Math.round((parseFloat(targetRupees) || 0) * 100);
  const currentMinor = Math.round((parseFloat(currentRupees) || 0) * 100);
  const monthlyMinor = Math.round((parseFloat(monthlyRupees) || 0) * 100);

  // Future Value with current selected rate
  const result = useMemo(() => {
    return calculateFutureValueWithReturn(
      currentMinor,
      monthlyMinor,
      horizonMonths,
      annualReturnPercent
    );
  }, [currentMinor, monthlyMinor, horizonMonths, annualReturnPercent]);

  // Months required to reach target
  const timeToTarget = useMemo(() => {
    return calculateMonthsToTarget(targetMinor, currentMinor, monthlyMinor, annualReturnPercent);
  }, [targetMinor, currentMinor, monthlyMinor, annualReturnPercent]);

  // Required monthly contribution to hit exact target by horizon
  const requiredMonthly = useMemo(() => {
    return calculateRequiredMonthlyContribution(targetMinor, currentMinor, horizonMonths);
  }, [targetMinor, currentMinor, horizonMonths]);

  // Comparative scenarios (0% vs 7% vs 12%)
  const scenarios = useMemo(() => {
    return [
      {
        label: 'Pure Cash / Bank Savings',
        rate: 0,
        desc: 'Zero market risk, no capital compounding',
        fv: calculateFutureValueWithReturn(currentMinor, monthlyMinor, horizonMonths, 0),
        time: calculateMonthsToTarget(targetMinor, currentMinor, monthlyMinor, 0),
      },
      {
        label: 'Fixed Deposit / Corporate Bonds',
        rate: 7,
        desc: 'Conservative fixed interest growth',
        fv: calculateFutureValueWithReturn(currentMinor, monthlyMinor, horizonMonths, 7),
        time: calculateMonthsToTarget(targetMinor, currentMinor, monthlyMinor, 7),
      },
      {
        label: 'Diversified Equity Mutual Funds (SIP)',
        rate: 12,
        desc: 'Long-term historical market average',
        fv: calculateFutureValueWithReturn(currentMinor, monthlyMinor, horizonMonths, 12),
        time: calculateMonthsToTarget(targetMinor, currentMinor, monthlyMinor, 12),
      },
    ];
  }, [currentMinor, monthlyMinor, horizonMonths, targetMinor]);

  const isTargetAchieved = result.futureValueMinor >= targetMinor;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/financial-planner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Financial Planner
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            What-If Scenario Simulator
          </h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Interactive milestone projections: simulate monthly savings changes, deadline extensions, and compound returns
        </p>
      </div>

      {/* Inputs & Primary Outcome Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white text-sm">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Simulation Parameters</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Milestone (₹)
            </label>
            <input
              type="number"
              min="1000"
              step="any"
              value={targetRupees}
              onChange={(e) => setTargetRupees(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Initial Savings Basis (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={currentRupees}
              onChange={(e) => setCurrentRupees(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Monthly Contribution (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={monthlyRupees}
              onChange={(e) => setMonthlyRupees(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Horizon: {horizonMonths} Months
              </label>
              <span className="text-slate-400">({(horizonMonths / 12).toFixed(1)} yrs)</span>
            </div>
            <input
              type="range"
              min="3"
              max="60"
              value={horizonMonths}
              onChange={(e) => setHorizonMonths(parseInt(e.target.value) || 3)}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Assumed Annual Return: {annualReturnPercent}%
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '0% (Cash)', val: 0 },
                { label: '7% (FD)', val: 7 },
                { label: '12% (SIP)', val: 12 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAnnualReturnPercent(opt.val)}
                  className={`py-1.5 rounded-lg font-semibold text-[11px] transition-colors ${
                    annualReturnPercent === opt.val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Projected Outcome Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Simulation Hero Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                  Projected Corpus at Month {horizonMonths}
                </span>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatINR(result.futureValueMinor)}
                </div>
                <span className={`text-xs font-semibold mt-1 inline-block ${
                  isTargetAchieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {isTargetAchieved
                    ? `Target achieved! Surplus: +${formatINR(result.futureValueMinor - targetMinor)}`
                    : `Shortfall: ${formatINR(targetMinor - result.futureValueMinor)} remaining`}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-right text-xs">
                <span className="text-slate-400 block">Time to Exact Target:</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {timeToTarget.months <= 600 ? `${timeToTarget.months} Months` : 'Unreachable'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Est. Date: {timeToTarget.achievableDate}
                </span>
              </div>
            </div>

            {/* Breakdown Pills */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Your Capital</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {formatINR(result.totalContributedMinor)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Compounded Gain</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  +{formatINR(result.interestEarnedMinor)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Req. for {horizonMonths}mo</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {formatINR(requiredMonthly)} / mo
                </span>
              </div>
            </div>
          </div>

          {/* Scenario Comparison Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Comparative Compounding Scenarios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              See the mathematical difference between cash accumulation and disciplined compounding instruments over {horizonMonths} months:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5 font-semibold">Instrument</th>
                    <th className="pb-2.5 font-semibold text-right">Assumed Return</th>
                    <th className="pb-2.5 font-semibold text-right">Ending Corpus</th>
                    <th className="pb-2.5 font-semibold text-right">Wealth Created</th>
                    <th className="pb-2.5 font-semibold text-right">Time to Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {scenarios.map((sc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{sc.label}</span>
                        <span className="text-[10px] text-slate-400 block">{sc.desc}</span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {sc.rate}% p.a.
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatINR(sc.fv.futureValueMinor)}
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatINR(sc.fv.interestEarnedMinor)}
                      </td>
                      <td className="py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                        {sc.time.months <= 600 ? `${sc.time.months} mo` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Disclosure Warning */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                Financial Disclosure & Assumptions Notice:
              </span>
              Calculations are deterministic illustrative models assuming regular monthly compounding and reinvestment. Actual stock market and mutual fund investments carry volatility, and returns are not guaranteed. Past performance is not indicative of future returns.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

