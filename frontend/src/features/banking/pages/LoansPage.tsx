import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Percent,
  ArrowLeft,
  Calculator,
  Save,
  Trash2,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Info,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatRupees } from '@/domain/money/formatters';
import {
  calculateLoanEmi,
  generateAmortizationSchedule,
} from '@/features/banking/utils/bankingCalculations';

const LOAN_PRESETS = [
  { id: 'home', label: 'Home Loan', defaultPrincipal: '3500000', defaultRate: '8.50', defaultYears: '20' },
  { id: 'car', label: 'Car Loan', defaultPrincipal: '800000', defaultRate: '9.20', defaultYears: '5' },
  { id: 'personal', label: 'Personal Loan', defaultPrincipal: '200000', defaultRate: '11.50', defaultYears: '3' },
  { id: 'education', label: 'Education Loan', defaultPrincipal: '1500000', defaultRate: '9.00', defaultYears: '7' },
];

export function LoansPage() {
  const { loanSimulations, addLoanSimulation, deleteLoanSimulation } = useFinanceStore();

  const [loanType, setLoanType] = useState<'home' | 'car' | 'personal' | 'education'>('home');
  const [principal, setPrincipal] = useState('3500000');
  const [rate, setRate] = useState('8.50');
  const [tenureYears, setTenureYears] = useState('20');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    const preset = LOAN_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setLoanType(preset.id as any);
      setPrincipal(preset.defaultPrincipal);
      setRate(preset.defaultRate);
      setTenureYears(preset.defaultYears);
    }
  };

  const tenureMonths = useMemo(() => {
    return (parseFloat(tenureYears) || 0) * 12;
  }, [tenureYears]);

  const emiResult = useMemo(() => {
    const p = (parseFloat(principal) || 0) * 100;
    const r = parseFloat(rate) || 0;
    return calculateLoanEmi(p, r, tenureMonths);
  }, [principal, rate, tenureMonths]);

  const amortizationSchedule = useMemo(() => {
    const p = (parseFloat(principal) || 0) * 100;
    const r = parseFloat(rate) || 0;
    return generateAmortizationSchedule(p, r, tenureMonths);
  }, [principal, rate, tenureMonths]);

  const handleSaveSimulation = () => {
    const p = Math.round((parseFloat(principal) || 0) * 100);
    addLoanSimulation({
      loanType,
      principalMinor: p,
      tenureMonths,
      interestRatePercent: parseFloat(rate) || 8.5,
      monthlyEmiMinor: emiResult.monthlyEmiMinor,
      totalInterestMinor: emiResult.totalInterestMinor,
      totalRepaymentMinor: emiResult.totalRepaymentMinor,
    });
    setSaveSuccessMessage('Loan EMI simulation saved to local demo state.');
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
              Loan & EMI Calculator
            </h1>
            <Badge variant="outline" className="text-xs uppercase font-bold text-slate-500">
              SIMULATED AMORTIZATION
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculate equated monthly instalments and visualize multi-year interest schedules.
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <Card className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <Info className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong>Educational Loan Simulator:</strong>
          <p>
            This tool is for personal financial planning and educational visualization only. EXPENZO is not a lending institution and does not broker or approve loans.
          </p>
        </div>
      </Card>

      {/* Preset Loan Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {LOAN_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              loanType === preset.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calculator Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 rounded-3xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400">
              Borrowing Parameters
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loan Principal (₹)
                </label>
                <Input
                  type="number"
                  min="10000"
                  step="50000"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="3500000"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Interest Rate (% p.a.)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="25"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="8.50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loan Duration (Years)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="35"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(e.target.value)}
                  placeholder="20"
                />
                <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                  Equivalent to {tenureMonths} monthly payments
                </span>
              </div>
            </div>

            <Button
              onClick={handleSaveSimulation}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              <Save className="h-4 w-4 mr-1.5" />
              Save Loan Simulation
            </Button>

            {saveSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}
          </Card>
        </div>

        {/* EMI Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Monthly Equated Instalment (EMI)
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {formatRupees(emiResult.monthlyEmiMinor)}
                  <span className="text-sm font-normal text-slate-400 ml-1">/ month</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono uppercase font-bold">
                {tenureYears} Years Tenure
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Total Interest Payable</span>
                <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {formatRupees(emiResult.totalInterestMinor)}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Total Amount Repaid</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatRupees(emiResult.totalRepaymentMinor)}
                </div>
              </div>
            </div>

            {/* Principal vs Interest Distribution Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Principal ({formatRupees((parseFloat(principal) || 0) * 100)})</span>
                <span>Interest ({formatRupees(emiResult.totalInterestMinor)})</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.round(
                      (((parseFloat(principal) || 0) * 100) / (emiResult.totalRepaymentMinor || 1)) * 100
                    )}%`,
                  }}
                />
                <div className="h-full bg-rose-500 flex-1 transition-all" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Yearly Amortization Schedule Table */}
      <Card className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Yearly Amortization Schedule
          </h3>
          <p className="text-xs text-slate-500">
            Educational breakdown of principal vs interest amortization over the loan life
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3 text-right">Opening Balance</th>
                <th className="py-2.5 px-3 text-right">Total EMI Paid</th>
                <th className="py-2.5 px-3 text-right">Principal Paid</th>
                <th className="py-2.5 px-3 text-right">Interest Paid</th>
                <th className="py-2.5 px-3 text-right">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {amortizationSchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    Year {row.year}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    {formatRupees(row.openingBalanceMinor)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 dark:text-white">
                    {formatRupees(row.emiPaidMinor)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-600">
                    {formatRupees(row.principalPaidMinor)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-rose-600">
                    {formatRupees(row.interestPaidMinor)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatRupees(row.closingBalanceMinor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Saved Loan Simulations */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Saved Loan Simulations ({(loanSimulations || []).length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(loanSimulations || []).map((sim) => (
            <Card
              key={sim.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                    {sim.loanType} Loan
                  </h4>
                  <p className="text-xs text-slate-500">
                    {formatRupees(sim.principalMinor)} @ {sim.interestRatePercent}% ({sim.tenureMonths / 12} Yrs)
                  </p>
                </div>
                <button
                  onClick={() => deleteLoanSimulation(sim.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Remove Simulation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Monthly EMI</span>
                  <span className="font-extrabold text-emerald-600">
                    {formatRupees(sim.monthlyEmiMinor)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total Interest</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {formatRupees(sim.totalInterestMinor)}
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

