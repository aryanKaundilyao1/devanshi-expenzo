import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Wallet,
  Building2,
  TrendingUp,
  Bot,
  Sparkles,
  Target,
  FileText,
  GraduationCap,
  Bell,
  Settings,
  X,
  ShieldCheck,
  MoreHorizontal,
  Users,
} from 'lucide-react';

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useUIStore();
  const location = useLocation();

  const closeDrawer = () => setMobileNavOpen(false);

  const navLinks = [
    { title: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { title: 'Expenses', path: '/app/expenses', icon: Wallet },
    { title: 'Transactions', path: '/app/transactions', icon: Wallet },
    { title: 'Budgets', path: '/app/budgets', icon: Target },
    { title: 'Banking', path: '/app/banking', icon: Building2 },
    { title: 'Investments', path: '/app/investments', icon: TrendingUp },
    { title: 'Family', path: '/app/family', icon: Users },
    { title: 'AI Assistant', path: '/app/ai-assistant', icon: Bot },
    { title: 'AI Insights', path: '/app/ai-insights', icon: Sparkles },
    { title: 'Financial Planner', path: '/app/financial-planner', icon: Target },
    { title: 'Reports', path: '/app/reports', icon: FileText },
    { title: 'Learning', path: '/app/learning', icon: GraduationCap },
    { title: 'Notifications', path: '/app/notifications', icon: Bell },
    { title: 'Settings', path: '/app/settings/profile', icon: Settings },
  ];

  const bottomShortcuts = [
    { title: 'Home', path: '/app/dashboard', icon: LayoutDashboard },
    { title: 'Expenses', path: '/app/expenses', icon: Wallet },
    { title: 'Banking', path: '/app/banking', icon: Building2 },
    { title: 'AI', path: '/app/ai-assistant', icon: Bot },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in-0"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={cn(
          'lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0B1220] border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-base">
              E
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              EXPENZO
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeDrawer}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Demonstration Mode</span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400">Fixed clock: Oct 15, 2026</p>
        </div>
      </div>

      {/* Mobile Bottom Shortcut Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md px-2">
        {bottomShortcuts.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}

        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <MoreHorizontal className="h-5 w-5 mb-1" />
          <span>More</span>
        </button>
      </div>
    </>
  );
}

