import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Wallet,
  Plus,
  Search,
  Filter,
  ArrowRightLeft,
  ArrowLeft,
  Edit2,
  Archive,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { FinancialAccount, AccountType } from '@/types/finance';
import { formatRupees } from '@/domain/money/formatters';
import { AccountModal } from '@/features/banking/components/AccountModal';
import { ArchiveAccountDialog } from '@/features/banking/components/ArchiveAccountDialog';

export function AccountsDirectoryPage() {
  const navigate = useNavigate();
  const { accounts, getAccountBalance } = useFinanceStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | AccountType>('all');
  const [sortBy, setSortBy] = useState<'balance-desc' | 'balance-asc' | 'name-asc'>('balance-desc');

  // Modals state
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<FinancialAccount | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [accountToArchive, setAccountToArchive] = useState<FinancialAccount | null>(null);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      if (typeFilter !== 'all' && account.accountType !== typeFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = account.name.toLowerCase().includes(query);
        const matchInst = account.institution.toLowerCase().includes(query);
        const matchNumber = account.accountNumberMasked.toLowerCase().includes(query);
        if (!matchName && !matchInst && !matchNumber) return false;
      }
      return true;
    }).sort((a, b) => {
      const balA = getAccountBalance(a.id);
      const balB = getAccountBalance(b.id);
      if (sortBy === 'balance-desc') return balB - balA;
      if (sortBy === 'balance-asc') return balA - balB;
      return a.name.localeCompare(b.name);
    });
  }, [accounts, typeFilter, search, sortBy, getAccountBalance]);

  const handleEdit = (e: React.MouseEvent, account: FinancialAccount) => {
    e.stopPropagation();
    setAccountToEdit(account);
    setAccountModalOpen(true);
  };

  const handleArchive = (e: React.MouseEvent, account: FinancialAccount) => {
    e.stopPropagation();
    setAccountToArchive(account);
    setArchiveDialogOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/app/banking"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Banking Overview
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Accounts Directory
            </h1>
            <Badge variant="outline" className="text-xs">
              {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your connected deposit accounts, cash wallets, and credit cards.
          </p>
        </div>

        <Button
          onClick={() => {
            setAccountToEdit(null);
            setAccountModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Demo Account
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by nickname or bank..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Account Types</option>
              <option value="savings">Savings Accounts</option>
              <option value="checking">Current / Checking</option>
              <option value="wallet">Physical Cash Wallets</option>
              <option value="credit">Credit Accounts</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="balance-desc">Sort by Balance: High to Low</option>
              <option value="balance-asc">Sort by Balance: Low to High</option>
              <option value="name-asc">Sort by Name: A to Z</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((account) => {
          const balance = getAccountBalance(account.id);
          const isArchived = !!account.isArchived;

          return (
            <Card
              key={account.id}
              onClick={() => navigate(`/app/banking/accounts/${account.id}`)}
              className={`p-5 rounded-2xl bg-white dark:bg-[#111C30] border transition-all cursor-pointer space-y-4 hover:shadow-md ${
                isArchived
                  ? 'border-dashed border-slate-300 dark:border-slate-700 opacity-60'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
                    {account.accountType === 'wallet' ? (
                      <Wallet className="h-5 w-5" />
                    ) : account.accountType === 'credit' ? (
                      <CreditCard className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {account.name}
                    </h3>
                    <p className="text-xs text-slate-500">{account.institution}</p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase ${
                    isArchived
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                  }`}
                >
                  {isArchived ? 'Archived' : account.accountType}
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Ledger Balance
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {formatRupees(balance)}
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {account.accountNumberMasked}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/banking/transfer?source=${account.id}`);
                  }}
                  className="h-8 px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  disabled={isArchived}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                  Transfer
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleEdit(e, account)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Nickname / Metadata"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {!isArchived && (
                    <button
                      onClick={(e) => handleArchive(e, account)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Close / Archive Account"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <Card className="p-8 text-center rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No matching accounts found
          </p>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria or add a new demo account.
          </p>
        </Card>
      )}

      {/* Account Modal */}
      <AccountModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
        accountToEdit={accountToEdit}
      />

      {/* Archive Account Dialog */}
      <ArchiveAccountDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        account={accountToArchive}
      />
    </div>
  );
}

