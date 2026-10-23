import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Lock,
  Unlock,
  Edit2,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Flame,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { DemoCard } from '@/types/finance';
import { formatRupees } from '@/domain/money/formatters';
import { CardModal } from '@/features/banking/components/CardModal';

export function CardsPage() {
  const navigate = useNavigate();
  const { cards, accounts, toggleCardFreeze } = useFinanceStore();

  const [selectedCardToEdit, setSelectedCardToEdit] = useState<DemoCard | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRename = (card: DemoCard) => {
    setSelectedCardToEdit(card);
    setModalOpen(true);
  };

  const getAccountName = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? acc.name : 'Linked Account';
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
              Payment Cards
            </h1>
            <Badge variant="outline" className="text-xs uppercase font-bold text-slate-500">
              SIMULATED CONTROLS
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your virtual debit and credit cards, daily limits, and security locks.
          </p>
        </div>
      </div>

      {/* Safety & Protocol Banner */}
      <Card className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong>Card Safety & Simulation Protocol:</strong>
          <p>
            Card freezing and limits operate exclusively in local browser memory. EXPENZO will never collect CVVs, full 16-digit card numbers, or ATM PINs.
          </p>
        </div>
      </Card>

      {/* Cards Visual Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(cards || []).map((card) => {
          const isFrozen = card.status === 'frozen';
          const isCredit = card.cardType === 'credit';

          return (
            <div key={card.id} className="space-y-3">
              {/* Virtual Plastic Card Visualizer */}
              <div
                className={`relative h-56 rounded-3xl p-6 text-white shadow-xl transition-all overflow-hidden flex flex-col justify-between ${
                  isCredit
                    ? 'bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 border border-purple-500/20'
                    : 'bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/20'
                }`}
              >
                {/* Frozen Frost Overlay */}
                {isFrozen && (
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 animate-in fade-in-0">
                    <div className="h-12 w-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Lock className="h-6 w-6" />
                    </div>
                    <span className="font-extrabold text-xs uppercase tracking-widest text-rose-300">
                      Card Locked / Frozen
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Transactions temporarily blocked
                    </span>
                  </div>
                )}

                {/* Card Top: Chip & Network */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {card.cardNickname}
                    </span>
                    <div className="h-7 w-10 rounded-md bg-amber-400/80 border border-amber-300/40 shadow-inner" />
                  </div>
                  <span className="font-black italic text-lg tracking-wider text-slate-200">
                    {card.network}
                  </span>
                </div>

                {/* Card Middle: Masked Number */}
                <div className="py-2">
                  <div className="font-mono text-lg sm:text-xl tracking-widest font-bold text-slate-100">
                    {card.cardNumberMasked}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">
                    {isCredit ? 'Demonstration Credit Card' : 'Everyday Debit Card'}
                  </span>
                </div>

                {/* Card Bottom: Holder & Expiry */}
                <div className="flex items-end justify-between text-xs">
                  <div>
                    <span className="text-[9px] block uppercase text-slate-400 tracking-wider">
                      Cardholder
                    </span>
                    <span className="font-bold uppercase tracking-wide">
                      {card.cardHolderName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] block uppercase text-slate-400 tracking-wider">
                      Expires
                    </span>
                    <span className="font-mono font-bold">{card.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Card Meta & Control Panel */}
              <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Linked Account:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {getAccountName(card.accountId)}
                  </strong>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Daily Limit:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatRupees(card.dailyLimitMinor)}
                  </span>
                </div>

                {isCredit && card.creditLimitMinor && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Illustrative Credit Limit:</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {formatRupees(card.creditLimitMinor)}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button
                    size="sm"
                    variant={isFrozen ? 'primary' : 'outline'}
                    onClick={() => toggleCardFreeze(card.id)}
                    className={`flex-1 text-xs cursor-pointer ${
                      isFrozen
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isFrozen ? (
                      <>
                        <Unlock className="h-3.5 w-3.5 mr-1.5" />
                        Unfreeze Card
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 mr-1.5" />
                        Freeze Card
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRename(card)}
                    className="cursor-pointer"
                    title="Edit Nickname"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/app/banking/transactions?account=${card.accountId}`)}
                    className="cursor-pointer text-emerald-600"
                    title="View Transactions"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Card Modal */}
      <CardModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        card={selectedCardToEdit}
      />
    </div>
  );
}
