import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PiggyBank,
  ArrowLeft,
  Calculator,
  Save,
  Trash2,
  TrendingUp,
  Percent,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatRupees } from '@/domain/money/formatters';
import {
  calculateFdMaturity,
  calculateRdMaturity,
} from '@/features/banking/utils/bankingCalculations';

export function DepositsPage() {
  const { depositSimulations, addDepositSimulation, deleteDepositSimulation } = useFinanceStore();

  const [tab, setTab] = useState<'fd' | 'rd'>('fd');

  // FD Inputs
  const [fdPrincipal, setFdPrincipal] = useState('50000');
  const [fdRate, setFdRate] = useState('7.10');
  const [fdTenureMonths, setFdTenureMonths] = useState('12');

  // RD Inputs
  const [rdMonthly, setRdMonthly] = useState('5000');
  const [rdRate, setRdRate] = useState('6.80');
  const [rdTenureMonths, setRdTenureMonths] = useState('24');

  // Plan name for saving
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // FD calculations
  const fdResult = useMemo(() => {
    const p = (parseFloat(fdPrincipal) || 0) * 100;
    const r = parseFloat(fdRate) || 0;
    const m = parseInt(fdTenureMonths, 10) || 0;
    return calculateFdMaturity(p, r, m, 'quarterly');
  }, [fdPrincipal, fdRate, fdTenureMonths]);

  // RD calculations
  const rdResult = useMemo(() => {
    const mInstalment = (parseFloat(rdMonthly) || 0) * 100;
    const r = parseFloat(rdRate) || 0;
    const m = parseInt(rdTenureMonths, 10) || 0;
    return calculateRdMaturity(mInstalment, r, m);
  }, [rdMonthly, rdRate, rdTenureMonths]);

  const handleSavePlan = () => {
    if (tab === 'fd') {
      const p = Math.round((parseFloat(fdPrincipal) || 0) * 100);
      addDepositSimulation({
        type: 'fixed',
        depositName: `${fdTenureMonths}M Fixed Deposit @ ${fdRate}%`,
        principalMinor: p,
        tenureMonths: parseInt(fdTenureMonths, 10) || 12,
        interestRatePercent: parseFloat(fdRate) || 7.1,
        compoundingFrequency: 'quarterly',
        maturityAmountMinor: fdResult.maturityAmountMinor,
        interestEarnedMinor: fdResult.interestEarnedMinor,
      });
      setSaveSuccessMessage('Fixed Deposit simulation plan saved to demo workspace.');
    } else {
      const p = Math.round((parseFloat(rdMonthly) || 0) * 100);
      addDepositSimulation({
        type: 'recurring',
        depositName: `${rdTenureMonths}M Recurring Deposit @ ${rdRate}%`,
        principalMinor: p,
        tenureMonths: parseInt(rdTenureMonths, 10) || 24,
        interestRatePercent: parseFloat(rdRate) || 6.8,
        compoundingFrequency: 'quarterly',
        maturityAmountMinor: rdResult.maturityAmountMinor,
        interestEarnedMinor: rdResult.interestEarnedMinor,
      });
      setSaveSuccessMessage('Recurring Deposit simulation plan saved to demo workspace.');
    }
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/app/banking"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Banking
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Term Deposits (FD & RD)
            </h1>
            <Badge variant="outline" className="text-xs uppercase font-bold text-slate-500">
              EDUCATIONAL CALCULATOR
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate Fixed Deposit lump-sums and Recurring Deposit monthly growth with standard quarterly compounding.
          </p>
        </div>
      </div>

      {/* Educational Disclaimer Banner */}
      <Card className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong>Educational Projection Sandbox:</strong>
          <p>
            Calculations use standard Indian banking compound interest equations. No real bank accounts are opened or debited when exploring or saving deposit simulations.
          </p>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setTab('fd')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'fd'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PiggyBank className="h-4 w-4" />
          Fixed Deposit (Lump Sum)
        </button>
        <button
          onClick={() => setTab('rd')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            tab === 'rd'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Recurring Deposit (Monthly)
        </button>
      </div>

      {/* Calculator Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6 rounded-3xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              {tab === 'fd' ? 'Fixed Deposit Parameters' : 'Recurring Deposit Parameters'}
            </h3>

            {tab === 'fd' ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lump-Sum Principal (₹)
                  </label>
                  <Input
                    type="number"
                    min="1000"
                    step="1000"
                    value={fdPrincipal}
                    onChange={(e) => setFdPrincipal(e.target.value)}
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Annual Interest Rate (% p.a.)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="15"
                    step="0.05"
                    value={fdRate}
                    onChange={(e) => setFdRate(e.target.value)}
                    placeholder="7.10"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tenure (Months)
                  </label>
                  <select
                    value={fdTenureMonths}
                    onChange={(e) => setFdTenureMonths(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="6">6 Months (Short-Term)</option>
                    <option value="12">12 Months (1 Year Standard)</option>
                    <option value="24">24 Months (2 Years)</option>
                    <option value="36">36 Months (3 Years Tax-Saver)</option>
                    <option value="60">60 Months (5 Years Long-Term)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Instalment Deposit (₹)
                  </label>
                  <Input
                    type="number"
                    min="500"
                    step="500"
                    value={rdMonthly}
                    onChange={(e) => setRdMonthly(e.target.value)}
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Annual Interest Rate (% p.a.)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="15"
                    step="0.05"
                    value={rdRate}
                    onChange={(e) => setRdRate(e.target.value)}
                    placeholder="6.80"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tenure (Months)
                  </label>
                  <select
                    value={rdTenureMonths}
                    onChange={(e) => setRdTenureMonths(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="12">12 Months (1 Year)</option>
                    <option value="24">24 Months (2 Years)</option>
                    <option value="36">36 Months (3 Years)</option>
                    <option value="60">60 Months (5 Years)</option>
                  </select>
                </div>
              </div>
            )}

            <Button
              onClick={handleSavePlan}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save Demo Plan
            </Button>

            {saveSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Calculation Result Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Estimated Maturity Valuation
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {formatRupees(
                    tab === 'fd' ? fdResult.maturityAmountMinor : rdResult.maturityAmountMinor
                  )}
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 text-xs font-bold">
                Quarterly Compounded
              </Badge>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">
                  {tab === 'fd' ? 'Initial Principal Invested' : 'Total Cumulative Deposits'}
                </span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatRupees(
                    tab === 'fd'
                      ? (parseFloat(fdPrincipal) || 0) * 100
                      : rdResult.totalInvestedMinor
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Estimated Interest Earned</span>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatRupees(
                    tab === 'fd' ? fdResult.interestEarnedMinor : rdResult.interestEarnedMinor
                  )}
                </div>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Principal Allocation</span>
                <span>Interest Gain</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-slate-700 dark:bg-slate-400 transition-all"
                  style={{
                    width: `${Math.round(
                      ((tab === 'fd'
                        ? (parseFloat(fdPrincipal) || 0) * 100
                        : rdResult.totalInvestedMinor) /
                        (tab === 'fd' ? fdResult.maturityAmountMinor : rdResult.maturityAmountMinor || 1)) *
                        100
                    )}%`,
                  }}
                />
                <div className="h-full bg-emerald-500 flex-1 transition-all" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Saved Simulations Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Saved Demonstration Plans ({(depositSimulations || []).length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(depositSimulations || []).map((sim) => (
            <Card
              key={sim.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {sim.depositName}
                  </h4>
                  <p className="text-xs text-slate-500 capitalize">
                    {sim.type === 'fixed' ? 'Fixed Deposit' : 'Recurring Deposit'} • {sim.tenureMonths} Months
                  </p>
                </div>
                <button
                  onClick={() => deleteDepositSimulation(sim.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Remove Plan"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Maturity Value</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatRupees(sim.maturityAmountMinor)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Interest Gain</span>
                  <span className="font-bold text-emerald-600">
                    +{formatRupees(sim.interestEarnedMinor)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

