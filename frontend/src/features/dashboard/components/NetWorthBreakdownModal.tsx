import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Wallet, TrendingUp, ShieldAlert, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NetWorthBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liquidCashMinor: number;
  portfolioValueMinor: number;
  liabilitiesMinor?: number;
  netWorthMinor: number;
}

export function NetWorthBreakdownModal({
  open,
  onOpenChange,
  liquidCashMinor,
  portfolioValueMinor,
  liabilitiesMinor = 0,
  netWorthMinor,
}: NetWorthBreakdownModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold">Net Worth Accounting Breakdown</DialogTitle>
            </div>
            <Badge variant="outline">Canonical Formula</Badge>
          </div>
          <DialogDescription className="text-xs pt-1">
            Standard fintech balance sheet: Total Liquid Cash + Portfolio Valuation − Current Liabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Main Net Worth Highlight Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-center space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Estimated Net Worth</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              <CurrencyDisplay amountMinor={netWorthMinor} />
            </div>
            <p className="text-[11px] text-slate-500">All figures derived in real-time from your active demo ledger.</p>
          </div>

          {/* Asset Legs */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assets & Holdings</h4>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B1220]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Total Liquid Cash</p>
                  <p className="text-[11px] text-slate-400">Deposit accounts & cash wallet</p>
                </div>
              </div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                +<CurrencyDisplay amountMinor={liquidCashMinor} />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B1220]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Investment Portfolio</p>
                  <p className="text-[11px] text-slate-400">NSE demonstration equity valuations</p>
                </div>
              </div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                +<CurrencyDisplay amountMinor={portfolioValueMinor} />
              </div>
            </div>
          </div>

          {/* Liabilities Leg */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Liabilities</h4>
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B1220]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Credit Debt & Borrowing</p>
                  <p className="text-[11px] text-slate-400">Unsettled credit card balances</p>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-500">
                −<CurrencyDisplay amountMinor={liabilitiesMinor} />
              </div>
            </div>
          </div>

          {/* Financial Architecture Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <HelpCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Zero Double-Counting Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-900/80 dark:text-emerald-300">
              Savings goals are tracked as internal cash allocations inside your bank accounts and are not counted as extra additive assets.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false);
              navigate('/app/banking');
            }}
            className="gap-1.5"
          >
            <span>View All Accounts</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
