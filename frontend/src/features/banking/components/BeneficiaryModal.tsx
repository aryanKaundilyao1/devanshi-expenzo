import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BankingBeneficiary } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';

interface BeneficiaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaryToEdit?: BankingBeneficiary | null;
  onSuccess?: () => void;
}

const BANK_OPTIONS = [
  'HDFC Bank',
  'State Bank of India',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Other Bank',
];

export function BeneficiaryModal({
  open,
  onOpenChange,
  beneficiaryToEdit,
  onSuccess,
}: BeneficiaryModalProps) {
  const { addBeneficiary, updateBeneficiary } = useFinanceStore();

  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (beneficiaryToEdit) {
      setName(beneficiaryToEdit.name);
      setBankName(beneficiaryToEdit.bankName);
      setAccountNumberMasked(beneficiaryToEdit.accountNumberMasked);
      setNickname(beneficiaryToEdit.nickname || '');
      setNotes(beneficiaryToEdit.notes || '');
    } else {
      setName('');
      setBankName('HDFC Bank');
      setAccountNumberMasked('•••• ' + Math.floor(1000 + Math.random() * 9000));
      setNickname('');
      setNotes('');
    }
    setError(null);
  }, [beneficiaryToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the beneficiary full name.');
      return;
    }

    if (beneficiaryToEdit) {
      updateBeneficiary({
        ...beneficiaryToEdit,
        name: name.trim(),
        bankName,
        accountNumberMasked: accountNumberMasked.trim() || '•••• 0000',
        nickname: nickname.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addBeneficiary({
        name: name.trim(),
        bankName,
        accountNumberMasked: accountNumberMasked.trim() || '•••• 0000',
        nickname: nickname.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-[#111C30] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              {beneficiaryToEdit ? 'Edit Demo Beneficiary' : 'Add Demo Beneficiary'}
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

          <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Demo Contact Catalog:</strong> Illustrative beneficiary record. External transfers are disabled in this prototype for banking safety.
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
                Beneficiary Full Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {BANK_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nickname (Optional)
                </label>
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Landlord, Wi-Fi"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Masked Account Reference
              </label>
              <Input
                value={accountNumberMasked}
                onChange={(e) => setAccountNumberMasked(e.target.value)}
                placeholder="•••• 9871"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment description or reference"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {beneficiaryToEdit ? 'Save Changes' : 'Add Beneficiary'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

