import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { parseSmartEntry, ParsedCandidate } from '../utils/smartEntryParser';
import { FinancialAccount, Category } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Sparkles, AlertCircle, CheckCircle2, Trash2, Plus, ArrowRight } from 'lucide-react';

interface SmartEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: FinancialAccount[];
  categories: Category[];
  onSuccess?: () => void;
}

export function SmartEntryDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  onSuccess,
}: SmartEntryDialogProps) {
  const addTransaction = useFinanceStore((state) => state.addTransaction);

  const [promptText, setPromptText] = useState('');
  const [candidates, setCandidates] = useState<
    (ParsedCandidate & { accountId: string })[]
  >([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const defaultAccount = accounts[0]?.id || '';

  const handleParse = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!promptText.trim()) return;

    const parsed = parseSmartEntry(promptText);
    setCandidates(
      parsed.map((item) => ({
        ...item,
        accountId: defaultAccount,
      }))
    );
    setHasParsed(true);
  };

  const handleUpdateCandidate = (
    index: number,
    field: keyof ParsedCandidate | 'accountId',
    value: any
  ) => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddBlankCandidate = () => {
    setCandidates((prev) => [
      ...prev,
      {
        id: `manual_${Date.now()}`,
        amount: '',
        type: 'expense',
        category: 'Food & Dining',
        merchant: '',
        date: '2026-10-15',
        accountId: defaultAccount,
      },
    ]);
  };

  const handleConfirmAll = () => {
    const validCandidates = candidates.filter(
      (c) => Number(c.amount) > 0 && c.merchant.trim().length > 0
    );

    if (validCandidates.length === 0) return;

    for (const c of validCandidates) {
      const amountMinor = Math.round(Number(c.amount) * 100);
      addTransaction({
        accountId: c.accountId,
        amountMinor,
        type: c.type,
        category: c.category,
        merchant: c.merchant.trim(),
        date: c.date,
        status: 'completed',
        notes: c.notes || 'Smart Entry addition',
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCandidates([]);
      setPromptText('');
      setHasParsed(false);
      onSuccess?.();
      onOpenChange(false);
    }, 600);
  };

  const samplePrompts = [
    'Spent ₹450 on lunch and ₹200 on Uber today',
    'Spent ₹500 on groceries',
    'Received ₹12,000 freelance payment',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold">Natural-Language Smart Entry</DialogTitle>
            </div>
            <Badge variant="outline">Free Offline Parser</Badge>
          </div>
          <DialogDescription className="text-xs pt-1">
            Type spending phrases naturally. The parser extracts amounts, categories, and merchants with zero remote AI costs.
          </DialogDescription>
        </DialogHeader>

        {isSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-in fade-in-50">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>All confirmed transactions recorded to your canonical ledger!</span>
          </div>
        )}

        {/* Input Prompt Section */}
        <form onSubmit={handleParse} className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Enter Spending Sentence
            </label>
            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. Spent ₹450 on lunch and ₹200 on Uber today..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1525] p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400">Try:</span>
            {samplePrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPromptText(p);
                }}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors"
              >
                "{p}"
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" disabled={!promptText.trim()}>
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Parse & Preview
            </Button>
          </div>
        </form>

        {/* Parsed Candidates Preview */}
        {hasParsed && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Extracted Candidates ({candidates.length})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBlankCandidate}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Item
              </Button>
            </div>

            {candidates.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                No transactions detected from input. Try a clearer sentence like "Spent ₹350 on dinner".
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map((c, index) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525] space-y-3"
                  >
                    {c.isUncertain && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{c.uncertaintyReason}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase text-slate-500">Amount (₹)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={c.amount}
                          onChange={(e) => handleUpdateCandidate(index, 'amount', e.target.value)}
                          placeholder="0.00"
                          className="h-8 text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase text-slate-500">Merchant / Note</label>
                        <Input
                          type="text"
                          value={c.merchant}
                          onChange={(e) => handleUpdateCandidate(index, 'merchant', e.target.value)}
                          placeholder="Merchant"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase text-slate-500">Category</label>
                        <select
                          value={c.category}
                          onChange={(e) => handleUpdateCandidate(index, 'category', e.target.value)}
                          className="flex h-8 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-2 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase text-slate-500">Account</label>
                        <select
                          value={c.accountId}
                          onChange={(e) => handleUpdateCandidate(index, 'accountId', e.target.value)}
                          className="flex h-8 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-2 py-1 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Date: {c.date}</span>
                        <Badge variant={c.type === 'income' ? 'success' : 'outline'} className="text-[9px] px-1.5 py-0">
                          {c.type.toUpperCase()}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(index)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        title="Remove candidate"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCandidates([]);
                      setHasParsed(false);
                    }}
                  >
                    Discard
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConfirmAll}
                    disabled={candidates.length === 0 || candidates.some((c) => !c.amount || !c.merchant)}
                  >
                    Confirm & Add {candidates.length} Item{candidates.length > 1 ? 's' : ''}
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

