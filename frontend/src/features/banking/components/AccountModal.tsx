import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Building2, Wallet, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FinancialAccount, AccountType } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountToEdit?: FinancialAccount | null;
  onSuccess?: (account?: FinancialAccount) => void;
}

const INSTITUTION_OPTIONS = [
  'HDFC Bank',
  'State Bank of India',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Physical Cash Wallet',
  'Other Bank',
];

export function AccountModal({
  open,
  onOpenChange,
  accountToEdit,
  onSuccess,
}: AccountModalProps) {
  const { addAccount, updateAccount } = useFinanceStore();

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('HDFC Bank');
  const [customInstitution, setCustomInstitution] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('savings');
  const [openingBalance, setOpeningBalance] = useState('');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      if (INSTITUTION_OPTIONS.includes(accountToEdit.institution)) {
        setInstitution(accountToEdit.institution);
        setCustomInstitution('');
      } else {
        setInstitution('Other Bank');
        setCustomInstitution(accountToEdit.institution);
      }
      setAccountType(accountToEdit.accountType);
      setOpeningBalance((accountToEdit.openingBalanceMinor / 100).toString());
      setAccountNumberMasked(accountToEdit.accountNumberMasked);
    } else {
      setName('');
      setInstitution('HDFC Bank');
      setCustomInstitution('');
      setAccountType('savings');
      setOpeningBalance('');
      setAccountNumberMasked('•••• ' + Math.floor(1000 + Math.random() * 9000));
    }
    setError(null);
  }, [accountToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide an account nickname (e.g. Salary Account, Everyday Savings).');
      return;
    }

    const resolvedInstitution =
      institution === 'Other Bank' && customInstitution.trim()
        ? customInstitution.trim()
        : institution;

    const balanceNum = parseFloat(openingBalance);
    if (!accountToEdit && (isNaN(balanceNum) || balanceNum < 0)) {
      setError('Please provide a valid non-negative opening balance.');
      return;
    }

    let resultingAccount: FinancialAccount | undefined;

    if (accountToEdit) {
      updateAccount({
        id: accountToEdit.id,
        name: name.trim(),
        institution: resolvedInstitution,
        accountType,
        accountNumberMasked: accountNumberMasked.trim() || '•••• 0000',
      });
      resultingAccount = {
        ...accountToEdit,
        name: name.trim(),
        institution: resolvedInstitution,
        accountType,
        accountNumberMasked: accountNumberMasked.trim() || '•••• 0000',
      };
    } else {
      const openingBalanceMinor = Math.round(balanceNum * 100);
      resultingAccount = addAccount({
        name: name.trim(),
        institution: resolvedInstitution,
        accountType,
        accountNumberMasked: accountNumberMasked.trim() || '•••• 0000',
        openingBalanceMinor,
        currency: 'INR',
        isDemo: false,
      });
    }

    onOpenChange(false);
    onSuccess?.(resultingAccount);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-[#111C30] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              {accountToEdit ? 'Edit Bank Account' : 'Add Bank or Cash Account'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Financial Account:</strong> Synced securely to your personal Supabase cloud ledger. Balances and transaction history are isolated to your profile.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Nickname *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Salary Account, Everyday Savings, Cash Wallet"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank / Institution
                </label>
                <select
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {INSTITUTION_OPTIONS.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as AccountType)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="savings">Savings Account</option>
                  <option value="checking">Current / Checking</option>
                  <option value="wallet">Cash Wallet</option>
                  <option value="credit">Credit Card Account</option>
                </select>
              </div>
            </div>

            {institution === 'Other Bank' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Bank Name *
                </label>
                <Input
                  value={customInstitution}
                  onChange={(e) => setCustomInstitution(e.target.value)}
                  placeholder="e.g. Canara Bank, IndusInd Bank, Federal Bank"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!accountToEdit && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Opening Balance (₹ INR) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Identifier / Last 4 Digits
                </label>
                <Input
                  value={accountNumberMasked}
                  onChange={(e) => setAccountNumberMasked(e.target.value)}
                  placeholder="•••• 4892"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {accountToEdit ? 'Save Changes' : 'Create Bank Account'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

