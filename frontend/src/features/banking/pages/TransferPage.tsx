import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatRupees } from '@/domain/money/formatters';
import { DemoTransferReceipt, Transaction } from '@/types/finance';
import { AccountModal } from '@/features/banking/components/AccountModal';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export function TransferPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accounts, getAccountBalance, recordTransfer, demoAsOf } = useFinanceStore();

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  // Initial source from URL query param if present
  const initialSource = searchParams.get('source') || activeAccounts[0]?.id || '';
  const initialDestination = activeAccounts.find((a) => a.id !== initialSource)?.id || '';

  const [sourceId, setSourceId] = useState(initialSource);
  const [destinationId, setDestinationId] = useState(initialDestination);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(demoAsOf || '2026-10-15');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Successful receipt
  const [completedReceipt, setCompletedReceipt] = useState<DemoTransferReceipt | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  // Add account modal if user has < 2 accounts
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  useEffect(() => {
    if (!sourceId && activeAccounts.length > 0) {
      setSourceId(activeAccounts[0].id);
    }
    if (!destinationId && activeAccounts.length > 1) {
      const other = activeAccounts.find((a) => a.id !== sourceId);
      if (other) setDestinationId(other.id);
    }
  }, [activeAccounts, sourceId, destinationId]);

  const sourceAccount = activeAccounts.find((a) => a.id === sourceId);
  const destinationAccount = activeAccounts.find((a) => a.id === destinationId);

  const sourceBalance = sourceAccount ? getAccountBalance(sourceAccount.id) : 0;
  const destinationBalance = destinationAccount ? getAccountBalance(destinationAccount.id) : 0;

  const transferAmountNum = parseFloat(amount) || 0;
  const transferAmountMinor = Math.round(transferAmountNum * 100);

  const hasSufficientFunds =
    sourceAccount?.accountType === 'credit' || sourceBalance >= transferAmountMinor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sourceAccount || !destinationAccount) {
      setError('Please select valid source and destination accounts.');
      return;
    }
    if (sourceAccount.id === destinationAccount.id) {
      setError('Source and destination accounts must be distinct.');
      return;
    }
    if (isNaN(transferAmountNum) || transferAmountNum <= 0) {
      setError('Transfer amount must be greater than zero.');
      return;
    }
    if (!hasSufficientFunds) {
      setError(`Insufficient eligible funds in ${sourceAccount.name}.`);
      return;
    }

    setIsSubmitting(true);

    const res = recordTransfer({
      sourceAccountId: sourceAccount.id,
      destinationAccountId: destinationAccount.id,
      amountMinor: transferAmountMinor,
      note: note.trim() || undefined,
      date,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Transfer failed to record.');
      return;
    }

    if (res.receipt && res.transaction) {
      setCompletedReceipt(res.receipt);
      setCompletedTx(res.transaction);
    }
  };

  const handleReset = () => {
    setCompletedReceipt(null);
    setCompletedTx(null);
    setAmount('');
    setNote('');
    setError(null);
  };

  // If user has fewer than 2 accounts
  if (activeAccounts.length < 2) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 animate-in fade-in-50">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
          <ArrowRightLeft className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Two Accounts Required for Internal Transfer
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Simulated internal transfers move funds between your owned accounts. You currently have {activeAccounts.length} eligible account. Add a second demo account to begin testing fund movements.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/app/banking')}>
            Back to Banking
          </Button>
          <Button onClick={() => setAccountModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Second Demo Account
          </Button>
        </div>

        <AccountModal open={accountModalOpen} onOpenChange={setAccountModalOpen} />
      </div>
    );
  }

  // If transfer has succeeded, render the interactive Transfer Receipt
  if (completedReceipt && completedTx) {
    return (
      <div className="max-w-xl mx-auto py-6 space-y-6 animate-in zoom-in-95 duration-200">
        <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C30] border-emerald-500/30 dark:border-emerald-500/30 shadow-2xl space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 text-[10px] font-bold">
              DEMO TRANSFER RECORDED
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatRupees(completedReceipt.amountMinor)}
            </h2>
            <p className="text-xs text-slate-500">
              Reference: <strong className="font-mono text-slate-700 dark:text-slate-300">{completedReceipt.referenceNumber}</strong>
            </p>
          </div>

          {/* Audit Breakdown Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152238] border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400">Debit Source:</span>
              <strong className="text-slate-900 dark:text-white">
                {sourceAccount?.name} ({sourceAccount?.institution})
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400">Source Balance After:</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold font-mono">
                {formatRupees(completedReceipt.sourceBalanceAfterMinor)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400">Credit Destination:</span>
              <strong className="text-slate-900 dark:text-white">
                {destinationAccount?.name} ({destinationAccount?.institution})
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400">Destination Balance After:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                {formatRupees(completedReceipt.destinationBalanceAfterMinor)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400">Effective Date:</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono">{completedReceipt.date}</span>
            </div>
            {completedReceipt.note && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Note:</span>
                <span className="text-slate-700 dark:text-slate-300">{completedReceipt.note}</span>
              </div>
            )}
          </div>

          {/* Simulation Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500 text-left">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Reconciliation Verified:</strong> Aggregated liquid cash and overall net worth remained exactly unchanged. Both account ledgers have been atomically updated.
            </span>
          </div>

          {/* Post-Transfer Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/app/transactions/${completedTx.id}`)}
              className="w-full sm:flex-1 text-xs"
            >
              View In Ledger
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full sm:flex-1 text-xs"
            >
              Make Another Transfer
            </Button>
            <Button
              onClick={() => navigate('/app/banking')}
              className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              Return to Banking
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Top Header */}
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
            Transfer Money
          </h1>
          <Badge variant="outline" className="text-xs uppercase font-bold text-slate-500">
            SIMULATION
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Instantly simulate moving funds between your connected demo deposit accounts.
        </p>
      </div>

      {/* Main Transfer Card */}
      <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                From Account *
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {activeAccounts.map((a) => (
                  <option key={a.id} value={a.id} disabled={a.id === destinationId}>
                    {a.name} ({a.institution})
                  </option>
                ))}
              </select>
              {sourceAccount && (
                <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                  Available: {formatRupees(sourceBalance)}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                To Account *
              </label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {activeAccounts.map((a) => (
                  <option key={a.id} value={a.id} disabled={a.id === sourceId}>
                    {a.name} ({a.institution})
                  </option>
                ))}
              </select>
              {destinationAccount && (
                <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                  Current: {formatRupees(destinationBalance)}
                </span>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Transfer Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8 text-base font-bold"
                required
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  +{formatRupees(amt * 100)}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Transfer Date *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Note (Optional)
              </label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Allocation to emergency reserve"
              />
            </div>
          </div>

          {/* Real-time Balance Preview Before Transfer */}
          {sourceAccount && destinationAccount && transferAmountNum > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152238] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Live Post-Transfer Balance Preview
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#111C30] border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-medium truncate">
                    {sourceAccount.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="line-through text-slate-400">{formatRupees(sourceBalance)}</span>
                    <span className="font-bold text-rose-600">
                      → {formatRupees(sourceBalance - transferAmountMinor)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#111C30] border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-medium truncate">
                    {destinationAccount.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="line-through text-slate-400">{formatRupees(destinationBalance)}</span>
                    <span className="font-bold text-emerald-600">
                      → {formatRupees(destinationBalance + transferAmountMinor)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Simulated Fund Movement:</strong> EXPENZO strictly executes local double-entry accounting. Consolidated cash balance is conserved. No bank login, OTP, or UPI PIN is requested.
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!hasSufficientFunds || isSubmitting || transferAmountNum <= 0}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Confirm Demo Transfer
          </Button>
        </form>
      </Card>
    </div>
  );
}

