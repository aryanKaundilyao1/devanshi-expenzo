import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Search, Compass, Wallet, PieChart, Bot, Sparkles, BookOpen, Settings, Bell, ArrowRight } from 'lucide-react';

interface RouteItem {
  title: string;
  path: string;
  category: string;
  icon: React.ElementType;
}

const SEARCHABLE_ROUTES: RouteItem[] = [
  { title: 'Dashboard', path: '/app/dashboard', category: 'Overview', icon: Compass },
  { title: 'Expenses & Overview', path: '/app/expenses', category: 'Overview', icon: Wallet },
  { title: 'All Transactions', path: '/app/transactions', category: 'Expenses', icon: Wallet },
  { title: 'Categories', path: '/app/categories', category: 'Expenses', icon: Wallet },
  { title: 'Monthly Budgets', path: '/app/budgets', category: 'Expenses', icon: PieChart },
  { title: 'Recurring Bills', path: '/app/recurring', category: 'Expenses', icon: Wallet },
  { title: 'Banking Overview', path: '/app/banking', category: 'Banking', icon: Wallet },
  { title: 'Banking Statements', path: '/app/banking/statements', category: 'Banking', icon: Wallet },
  { title: 'Banking Services', path: '/app/banking/services', category: 'Banking', icon: Wallet },
  { title: 'Investments Portfolio', path: '/app/investments', category: 'Investments', icon: PieChart },
  { title: 'Holdings', path: '/app/investments/holdings', category: 'Investments', icon: PieChart },
  { title: 'Discover Stocks', path: '/app/investments/discover', category: 'Investments', icon: Compass },
  { title: 'Watchlists', path: '/app/investments/watchlists', category: 'Investments', icon: PieChart },
  { title: 'AI Assistant Chat', path: '/app/ai-assistant', category: 'Intelligence', icon: Bot },
  { title: 'AI Financial Insights', path: '/app/ai-insights', category: 'Intelligence', icon: Sparkles },
  { title: 'Financial Planner & Goals', path: '/app/financial-planner', category: 'Intelligence', icon: Compass },
  { title: 'Financial Reports', path: '/app/reports', category: 'More', icon: PieChart },
  { title: 'Financial Learning Hub', path: '/app/learning', category: 'More', icon: BookOpen },
  { title: 'Notifications Center', path: '/app/notifications', category: 'More', icon: Bell },
  { title: 'Settings & Profile', path: '/app/settings/profile', category: 'Settings', icon: Settings },
  { title: 'Settings — Appearance', path: '/app/settings/appearance', category: 'Settings', icon: Settings },
  { title: 'Settings — Security', path: '/app/settings/security', category: 'Settings', icon: Settings },
];

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const filtered = query.trim() === ''
    ? SEARCHABLE_ROUTES
    : SEARCHABLE_ROUTES.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (path: string) => {
    onOpenChange(false);
    setQuery('');
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-slate-200 dark:border-slate-800">
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all EXPENZO pages, features and shortcuts..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No pages match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-emerald-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

