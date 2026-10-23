import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { TransactionAmount } from '@/components/finance/TransactionAmount';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Clock,
  ArrowRightLeft,
  Lock,
  FileText,
  CreditCard,
} from 'lucide-react';

export function BankingInfoPage() {
  const store = useFinanceStore();
  const [selectedAccountId, setSelectedAccountId] = useState('acct_hdfc');

  const selectedAccount = store.accounts.find((a) => a.id === selectedAccountId) || store.accounts[0];
  const balance = store.getAccountBalance(selectedAccount.id);

  const accountTransactions = store.transactions.filter(
    (tx) => tx.accountId === selectedAccount.id || tx.targetAccountId === selectedAccount.id
  );

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* 1. Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="info">Institutional Account Management</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Multi-Account Banking, Uncluttered.
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Unify your savings, checking, and cash balances across multiple financial institutions without sharing passwords, PINs, or compromising security.
        </p>
      </div>

      {/* 2-3. Interactive Demo Account Switcher */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Interactive Account Switcher
          </h3>
          <p className="text-xs text-slate-500">
            Click an account below to inspect its balance and associated ledger movements:
          </p>
        </div>

        {/* Account Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {store.accounts.map((acc) => {
            const isSelected = acc.id === selectedAccountId;
            const currentBal = store.getAccountBalance(acc.id);

            return (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`p-5 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    {acc.institution}
                  </span>
                  {isSelected && <Badge variant="success">Active View</Badge>}
                </div>
                <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                  <CurrencyDisplay minor={currentBal} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {acc.name} • {acc.accountNumberMasked}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Account Deep Dive Preview */}
        <Card className="max-w-4xl mx-auto p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Ledger Movements: {selectedAccount.name}
              </h4>
              <p className="text-xs text-slate-400">
                Opening Balance: <CurrencyDisplay minor={selectedAccount.openingBalanceMinor} />
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Current Available</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                <CurrencyDisplay minor={balance} />
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Transactions on this Account
            </h5>
            {accountTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No transactions recorded for this account in demo fixtures.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {accountTransactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{tx.merchant}</p>
                      <p className="text-[11px] text-slate-400">{tx.category} • {tx.date}</p>
                    </div>
                    <TransactionAmount minor={tx.amountMinor} type={tx.type} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 4-6. Banking Roadmap & Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3 bg-white dark:bg-[#111C30]">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Atomic Internal Transfers</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Move funds between checking and goal accounts in a single atomic database operation with zero transfer double-counting.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white dark:bg-[#111C30]">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Recurring Payment Commitments</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Track utility bills, rent dues, and credit card cycles with automated upcoming liability projections.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white dark:bg-[#111C30]">
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Reconciled Statement Export</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Generate formal opening-to-closing financial reports with stamped demo status and verifiable accounting math.
          </p>
        </Card>
      </div>

      {/* 7. Privacy & Authorized Integration Disclaimer */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1726] space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Lock className="h-4 w-4 text-emerald-500" />
          <span>Honest Technology Disclosure: No Real Financial Operations</span>
        </div>
        <p className="leading-relaxed">
          Actual fund transfers and live banking connections require regulated account aggregator frameworks (such as RBI-licensed NBFC-AA in India). In this prototype, all balances, institutions, and transfers are simulated for demonstration purposes. We never store or ask for banking credentials.
        </p>
      </div>

      {/* 8. CTA */}
      <div className="text-center pt-2">
        <Link to="/app/banking">
          <Button size="lg">
            Explore Banking Demo
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

