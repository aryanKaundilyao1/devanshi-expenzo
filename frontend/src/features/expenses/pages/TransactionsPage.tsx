import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { exportTransactionsToCsv } from '../utils/transactionCsv';
import { TransactionModal } from '@/features/dashboard/components/TransactionModal';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { Transaction, TransactionType } from '@/types/finance';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';

export function TransactionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const transactions = useFinanceStore((state) => state.transactions);
  const accounts = useFinanceStore((state) => state.accounts);
  const categories = useFinanceStore((state) => state.categories);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  // Read URL query params
  const typeParam = searchParams.get('type') || 'all';
  const categoryParam = searchParams.get('category') || 'all';
  const accountParam = searchParams.get('account') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minAmountParam = searchParams.get('minAmount') || '';
  const maxAmountParam = searchParams.get('maxAmount') || '';

  // Local filter states synchronized with URL
  const [search, setSearch] = useState(searchParam);
  const [selectedType, setSelectedType] = useState<string>(typeParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedAccount, setSelectedAccount] = useState<string>(accountParam);
  const [sortBy, setSortBy] = useState<string>(sortParam);
  const [minAmount, setMinAmount] = useState<string>(minAmountParam);
  const [maxAmount, setMaxAmount] = useState<string>(maxAmountParam);

  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Sync state to URL params
  const updateUrlParams = (updates: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(updates)) {
      if (!val || val === 'all') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    }
    setSearchParams(nextParams, { replace: true });
    setPage(1);
  };

  // Keep state in sync if URL changes externally
  useEffect(() => {
    setSearch(searchParam);
    setSelectedType(typeParam);
    setSelectedCategory(categoryParam);
    setSelectedAccount(accountParam);
    setSortBy(sortParam);
    setMinAmount(minAmountParam);
    setMaxAmount(maxAmountParam);
  }, [searchParam, typeParam, categoryParam, accountParam, sortParam, minAmountParam, maxAmountParam]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams({ search: val });
  };

  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    updateUrlParams({ type: val });
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    updateUrlParams({ category: val });
  };

  const handleAccountChange = (val: string) => {
    setSelectedAccount(val);
    updateUrlParams({ account: val });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    updateUrlParams({ sort: val });
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSortBy('newest');
    setMinAmount('');
    setMaxAmount('');
    setSearchParams(new URLSearchParams(), { replace: true });
    setPage(1);
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search text
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchMerchant = tx.merchant.toLowerCase().includes(q);
        const matchCategory = tx.category.toLowerCase().includes(q);
        const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
        if (!matchMerchant && !matchCategory && !matchNotes) return false;
      }

      // 2. Type
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // 3. Category
      if (selectedCategory !== 'all' && tx.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 4. Account
      if (selectedAccount !== 'all' && tx.accountId !== selectedAccount) {
        return false;
      }

      // 5. Min Amount
      if (minAmount && !isNaN(Number(minAmount))) {
        const minMinor = Number(minAmount) * 100;
        if (tx.amountMinor < minMinor) return false;
      }

      // 6. Max Amount
      if (maxAmount && !isNaN(Number(maxAmount))) {
        const maxMinor = Number(maxAmount) * 100;
        if (tx.amountMinor > maxMinor) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return b.date.localeCompare(a.date);
      }
      if (sortBy === 'oldest') {
        return a.date.localeCompare(b.date);
      }
      if (sortBy === 'highest') {
        return b.amountMinor - a.amountMinor;
      }
      if (sortBy === 'lowest') {
        return a.amountMinor - b.amountMinor;
      }
      if (sortBy === 'merchant') {
        return a.merchant.localeCompare(b.merchant);
      }
      return 0;
    });
  }, [transactions, search, selectedType, selectedCategory, selectedAccount, minAmount, maxAmount, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, page, pageSize]);

  // Actions
  const handleEdit = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setTxToEdit(tx);
    setTxModalOpen(true);
  };

  const handleDelete = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setTxToDelete(tx);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setTxToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleExportCsv = () => {
    exportTransactionsToCsv(filteredTransactions, accounts);
  };

  const isFiltered =
    search.trim() !== '' ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedAccount !== 'all' ||
    minAmount !== '' ||
    maxAmount !== '' ||
    sortBy !== 'newest';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Transactions Ledger
            </h1>
            <Badge variant="outline" className="text-xs">
              {filteredTransactions.length} Record{filteredTransactions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Audit-grade double-entry ledger with real-time balance propagation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setTxToEdit(null);
              setTxModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* 2. Filter Controls Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search merchant, category, notes..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfer Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Min/Max Amount & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Amount (₹):</span>
              <input
                type="number"
                placeholder="Min"
                value={minAmount}
                onChange={(e) => {
                  setMinAmount(e.target.value);
                  updateUrlParams({ minAmount: e.target.value });
                }}
                className="w-20 h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525] text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => {
                  setMaxAmount(e.target.value);
                  updateUrlParams({ maxAmount: e.target.value });
                }}
                className="w-20 h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525] text-xs"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <ArrowUpDown className="h-3 w-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525] text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
                <option value="merchant">Merchant A–Z</option>
              </select>
            </div>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer font-medium"
            >
              <X className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Transactions Table Card */}
      <div className="rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {paginatedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payee / Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {paginatedTransactions.map((tx) => {
                  const account = accounts.find((a) => a.id === tx.accountId);
                  const targetAcc = tx.targetAccountId
                    ? accounts.find((a) => a.id === tx.targetAccountId)
                    : null;

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => navigate(`/app/transactions/${tx.id}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {tx.merchant}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs font-normal">
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {tx.category}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            tx.type === 'income'
                              ? 'success'
                              : tx.type === 'transfer'
                              ? 'info'
                              : 'secondary'
                          }
                          className="text-[9px] uppercase px-1.5 py-0"
                        >
                          {tx.type}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {account?.name || tx.accountId}
                        {targetAcc && (
                          <span className="text-[10px] text-slate-400 block">
                            → {targetAcc.name}
                          </span>
                        )}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-bold tabular-nums whitespace-nowrap ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : tx.type === 'transfer'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}
                        <CurrencyDisplay amountMinor={tx.amountMinor} />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => handleEdit(tx, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(tx, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              No matching transactions found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your query, selected categories, or clear filters to view all entries.
            </p>
            {isFiltered && (
              <Button size="sm" variant="outline" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {/* 4. Pagination Footer */}
        {filteredTransactions.length > pageSize && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredTransactions.length)} of{' '}
              {filteredTransactions.length}
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-semibold tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        open={txModalOpen}
        onOpenChange={setTxModalOpen}
        accounts={accounts}
        categories={categories}
        transactionToEdit={txToEdit}
      />

      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Transaction"
        description={`Are you sure you want to delete the transaction with "${txToDelete?.merchant}" for ₹${txToDelete ? (txToDelete.amountMinor / 100).toLocaleString('en-IN') : '0'}? This will reverse the account balance adjustment in your ledger.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

