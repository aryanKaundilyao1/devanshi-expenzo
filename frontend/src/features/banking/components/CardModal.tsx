import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CreditCard, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DemoCard } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';

interface CardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: DemoCard | null;
  onSuccess?: () => void;
}

export function CardModal({
  open,
  onOpenChange,
  card,
  onSuccess,
}: CardModalProps) {
  const { updateCardNickname } = useFinanceStore();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (card) {
      setNickname(card.cardNickname);
    }
    setError(null);
  }, [card, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError('Please provide a card nickname.');
      return;
    }

    if (card) {
      updateCardNickname(card.id, nickname.trim());
    }

    onOpenChange(false);
    onSuccess?.();
  };

  if (!card) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-[#111C30] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Edit Card Details
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

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Card Number:</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">{card.cardNumberMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cardholder:</span>
                <span className="text-slate-900 dark:text-white">{card.cardHolderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Card Type / Network:</span>
                <span className="text-slate-900 dark:text-white capitalize">{card.cardType} ({card.network})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={card.status === 'active' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {card.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Card Nickname *
              </label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Everyday Shopping Card"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Full card numbers, CVVs, and ATM PINs are never requested or stored anywhere in EXPENZO.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Nickname
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

