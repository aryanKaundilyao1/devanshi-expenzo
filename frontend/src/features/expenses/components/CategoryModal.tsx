import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Category } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  Tag,
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

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
  defaultType?: 'expense' | 'income';
  onSuccess?: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'Utensils', icon: Utensils },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Car', icon: Car },
  { name: 'Home', icon: Home },
  { name: 'Zap', icon: Zap },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'HeartPulse', icon: HeartPulse },
  { name: 'Film', icon: Film },
  { name: 'CalendarDays', icon: CalendarDays },
  { name: 'Plane', icon: Plane },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Laptop', icon: Laptop },
  { name: 'Building2', icon: Building2 },
  { name: 'Coins', icon: Coins },
  { name: 'Gift', icon: Gift },
  { name: 'CircleDollarSign', icon: CircleDollarSign },
  { name: 'MoreHorizontal', icon: MoreHorizontal },
];

const PRESET_COLORS = [
  '#F59E0B',
  '#84CC16',
  '#10B981',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#EC4899',
  '#F43F5E',
  '#EF4444',
  '#64748B',
];

export function CategoryModal({
  open,
  onOpenChange,
  categoryToEdit,
  defaultType = 'expense',
  onSuccess,
}: CategoryModalProps) {
  const addCategory = useFinanceStore((state) => state.addCategory);
  const updateCategory = useFinanceStore((state) => state.updateCategory);
  const existingCategories = useFinanceStore((state) => state.categories);

  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#10B981');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setType(categoryToEdit.type);
        setIcon(categoryToEdit.icon);
        setColor(categoryToEdit.color);
      } else {
        setName('');
        setType(defaultType);
        setIcon('Tag');
        setColor(defaultType === 'income' ? '#10B981' : '#F59E0B');
      }
      setError(null);
    }
  }, [open, categoryToEdit, defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Category name is required.');
      return;
    }

    // Check duplicate name within the same type
    const isDuplicate = existingCategories.some(
      (c) =>
        c.type === type &&
        c.name.toLowerCase() === trimmed.toLowerCase() &&
        c.id !== categoryToEdit?.id
    );

    if (isDuplicate) {
      setError(`A ${type} category named "${trimmed}" already exists.`);
      return;
    }

    if (categoryToEdit) {
      updateCategory({
        ...categoryToEdit,
        name: trimmed,
        type,
        icon,
        color,
      });
    } else {
      addCategory({
        name: trimmed,
        type,
        icon,
        color,
      });
    }

    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <Tag className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              {categoryToEdit ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs pt-1">
            Organize transactions and budgets with custom categories.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
          )}

          {/* Type Toggle */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Category Flow Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-white dark:bg-[#111C30] text-rose-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-white dark:bg-[#111C30] text-emerald-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Category Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Category Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Freelance Consulting, Gym & Wellness"
              required
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525]">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title={item.name}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1525]">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full cursor-pointer transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#111C30]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {categoryToEdit ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

