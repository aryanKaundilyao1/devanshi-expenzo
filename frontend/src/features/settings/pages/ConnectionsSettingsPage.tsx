import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Building2,
  Wallet,
  Plus,
  ExternalLink,
  ShieldAlert,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { AccountModal } from '@/features/banking/components/AccountModal';
import { FinancialAccount } from '@/types/finance';

export function ConnectionsSettingsPage() {
  const navigate = useNavigate();
  const { accounts, getAccountBalance } = useFinanceStore();

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<FinancialAccount | null>(null);
  const [showRealBankNotice, setShowRealBankNotice] = useState(false);

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'wallet':
        return <Wallet className="h-5 w-5 text-amber-500" />;
      case 'credit':
        return <CreditCard className="h-5 w-5 text-indigo-500" />;
      case 'savings':
      case 'checking':
      default:
        return <Building2 className="h-5 w-5 text-emerald-500" />;
    }
  };

  const handleOpenEdit = (acc: FinancialAccount) => {
    setAccountToEdit(acc);
    setAccountModalOpen(true);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Informative Header Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5">
        <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Connected Demonstration Accounts
          </p>
          <p className="leading-relaxed">
            Manage your linked financial institutions, simulated savings accounts, and cash wallets. All accounts operate on local double-entry ledger bookkeeping.
          </p>
        </div>
      </div>

      {/* Account Management List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Active Financial Accounts ({activeAccounts.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulated balances and ledger account numbers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRealBankNotice(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Connect Real Bank
            </button>

            <button
              onClick={() => {
                setAccountToEdit(null);
                setAccountModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Demo Account
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {activeAccounts.map((acc) => {
            const balanceMinor = getAccountBalance(acc.id);
            return (
              <div
                key={acc.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                    {getAccountIcon(acc.accountType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {acc.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 capitalize">
                        {acc.accountType}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Demo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {acc.institution} • {acc.accountNumberMasked}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      ₹{(balanceMinor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-slate-400">Ledger Balance</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/app/banking/accounts/${acc.id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      aria-label={`View account ${acc.name}`}
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AccountModal */}
      <AccountModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
        accountToEdit={accountToEdit}
      />

      {/* Real Bank Account Notice Modal */}
      {showRealBankNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-6 shadow-2xl space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShieldAlert className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Live Open Banking Out of Scope
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                In compliance with fintech security standards, EXPENZO never asks for net banking credentials, OTPs, or passwords.
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Production Integration Architecture:
                </p>
                <p>• Licensed RBI Account Aggregator (AA) consent flows.</p>
                <p>• Encrypted read-only FIU data pulls without storing passwords.</p>
                <p>• In this prototype, you can add and manage unlimited simulated accounts.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRealBankNotice(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

