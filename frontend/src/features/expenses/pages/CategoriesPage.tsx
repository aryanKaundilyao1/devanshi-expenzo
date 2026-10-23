import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CategoryModal } from '../components/CategoryModal';
import { CategoryDeleteDialog } from '../components/CategoryDeleteDialog';
import { Category } from '@/types/finance';
import {
  Tag,
  Plus,
  ArrowRight,
  Edit2,
  Trash2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Zap,
  GraduationCap,
  HeartPulse,
  Film,
  CalendarDays,
  Plane,
  Briefcase,
  Laptop,
  Building2,
  Coins,
  Gift,
  CircleDollarSign,
  MoreHorizontal,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Zap,
  GraduationCap,
  HeartPulse,
  Film,
  CalendarDays,
  Plane,
  Briefcase,
  Laptop,
  Building2,
  Coins,
  Gift,
  CircleDollarSign,
  MoreHorizontal,
};

export function CategoriesPage() {
  const navigate = useNavigate();

  const categories = useFinanceStore((state) => state.categories);
  const transactions = useFinanceStore((state) => state.transactions);
  const budgets = useFinanceStore((state) => state.budgets);

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  // Compute total expenses for percentage calculation
  const totalExpenseMinor = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amountMinor, 0);
  }, [transactions]);

  // Compute total income for percentage calculation
  const totalIncomeMinor = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amountMinor, 0);
  }, [transactions]);

  // Calculate analytics per category
  const categoryAnalytics = useMemo(() => {
    const map = new Map<
      string,
      { totalMinor: number; count: number; budgetMinor?: number; percent: number }
    >();

    for (const cat of categories) {
      const catTxs = transactions.filter(
        (tx) => tx.category.toLowerCase() === cat.name.toLowerCase()
      );
      const totalMinor = catTxs.reduce((sum, tx) => sum + tx.amountMinor, 0);
      const count = catTxs.length;

      const bgt = budgets.find((b) => b.category.toLowerCase() === cat.name.toLowerCase());
      const baseTotal = cat.type === 'expense' ? totalExpenseMinor : totalIncomeMinor;
      const percent = baseTotal > 0 ? Math.round((totalMinor / baseTotal) * 1000) / 10 : 0;

      map.set(cat.id, {
        totalMinor,
        count,
        budgetMinor: bgt?.allocatedMinor,
        percent,
      });
    }

    return map;
  }, [categories, transactions, budgets, totalExpenseMinor, totalIncomeMinor]);

  const handleCreate = () => {
    setCategoryToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToEdit(cat);
    setModalOpen(true);
  };

  const handleDelete = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(cat);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Category Management
            </h1>
            <Badge variant="outline" className="text-xs">
              {categories.length} Categories
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define classification rules, icons, and budget targets across expense and income flows.
          </p>
        </div>

        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Category
        </Button>
      </div>

      {/* 2. Flow Type Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Expense Categories ({categories.filter((c) => c.type === 'expense').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'income'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ArrowDownRight className="h-3.5 w-3.5" />
            Income Categories ({categories.filter((c) => c.type === 'income').length})
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Click any category card to view filtered transactions
        </span>
      </div>

      {/* 3. Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const stats = categoryAnalytics.get(cat.id) || {
            totalMinor: 0,
            count: 0,
            percent: 0,
          };
          const IconComp = ICON_MAP[cat.icon] || Tag;

          return (
            <div
              key={cat.id}
              onClick={() => navigate(`/app/transactions?category=${encodeURIComponent(cat.name)}`)}
              className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xs transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {stats.count} transaction{stats.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleEdit(cat, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Edit category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(cat, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1525] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {cat.type === 'expense' ? 'Total Spent' : 'Total Earned'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    <CurrencyDisplay amountMinor={stats.totalMinor} />
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Share
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {stats.percent}%
                  </span>
                </div>
              </div>

              {/* Budget Badge if configured */}
              {stats.budgetMinor !== undefined && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Monthly Budget:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    <CurrencyDisplay amountMinor={stats.budgetMinor} />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categoryToEdit={categoryToEdit}
        defaultType={activeTab}
      />

      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={categoryToDelete}
      />
    </div>
  );
}

