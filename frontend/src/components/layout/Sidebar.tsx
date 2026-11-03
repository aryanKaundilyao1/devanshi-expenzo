import React, { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  Users,
  CreditCard,
  BookOpen,
} from 'lucide-react';
import { WorkspaceSwitcher } from '@/features/family/components/WorkspaceSwitcher';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  subItems?: { title: string; path: string }[];
}

const OVERVIEW_ITEMS: NavItem[] = [
  { title: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  {
    title: 'Expenses',
    path: '/app/expenses',
    icon: Wallet,
    subItems: [
      { title: 'Overview', path: '/app/expenses' },
      { title: 'Transactions', path: '/app/transactions' },
      { title: 'Categories', path: '/app/categories' },
      { title: 'Budgets', path: '/app/budgets' },
      { title: 'Recurring', path: '/app/recurring' },
    ],
  },
  {
    title: 'Banking',
    path: '/app/banking',
    icon: Building2,
    subItems: [
      { title: 'Overview', path: '/app/banking' },
      { title: 'Accounts', path: '/app/banking/accounts' },
      { title: 'Transfer', path: '/app/banking/transfer' },
      { title: 'Transactions', path: '/app/banking/transactions' },
      { title: 'Statements', path: '/app/banking/statements' },
      { title: 'Bills', path: '/app/banking/bills' },
      { title: 'Cards', path: '/app/banking/cards' },
      { title: 'Services', path: '/app/banking/services' },
    ],
  },
  {
    title: 'Investments',
    path: '/app/investments',
    icon: TrendingUp,
    subItems: [
      { title: 'Portfolio', path: '/app/investments' },
      { title: 'Holdings', path: '/app/investments/holdings' },
      { title: 'Discover', path: '/app/investments/discover' },
      { title: 'Watchlists', path: '/app/investments/watchlists' },
      { title: 'Analytics', path: '/app/investments/analytics' },
    ],
  },
  {
    title: 'Family',
    path: '/app/family',
    icon: Users,
    subItems: [
      { title: 'Overview', path: '/app/family' },
      { title: 'Members & Seats', path: '/app/family/members' },
      { title: 'Shared Expenses', path: '/app/family/shared-expenses' },
      { title: 'Analytics', path: '/app/family/analytics' },
      { title: 'Plans & Billing', path: '/app/family/plans' },
    ],
  },
];

const INTELLIGENCE_ITEMS: NavItem[] = [
  { title: 'Transaction Intelligence', path: '/app/transaction-intelligence', icon: CreditCard },
  { title: 'Financial Optimization', path: '/app/financial-optimization', icon: TrendingUp },
  { title: 'AI Assistant', path: '/app/ai-assistant', icon: Bot },
  { title: 'AI Insights', path: '/app/ai-insights', icon: Sparkles },
  { title: 'Financial Planner', path: '/app/financial-planner', icon: Target },
];

const MORE_ITEMS: NavItem[] = [
  { title: 'Research Analytics', path: '/app/research-analytics', icon: BookOpen },
  { title: 'Reports', path: '/app/reports', icon: FileText },
  { title: 'Financial Learning', path: '/app/learning', icon: GraduationCap },
  { title: 'Notifications', path: '/app/notifications', icon: Bell },
  { title: 'Settings', path: '/app/settings/profile', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();

  // Track expanded state for nested menus
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Expenses: location.pathname.startsWith('/app/expenses') || location.pathname.startsWith('/app/transactions') || location.pathname.startsWith('/app/categories') || location.pathname.startsWith('/app/budgets') || location.pathname.startsWith('/app/recurring'),
    Banking: location.pathname.startsWith('/app/banking'),
    Investments: location.pathname.startsWith('/app/investments'),
    Family: location.pathname.startsWith('/app/family'),
  });

  const toggleSubmenu = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      {!sidebarCollapsed && (
        <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
          {title}
        </h4>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const hasSub = item.subItems && item.subItems.length > 0;
        const isGroupActive = location.pathname.startsWith(item.path);
        const isExpanded = expandedSections[item.title];

        if (sidebarCollapsed) {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.title}
              className={({ isActive }) =>
                cn(
                  'flex h-10 w-10 mx-auto items-center justify-center rounded-xl transition-all',
                  isActive || isGroupActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                )
              }
            >
              <Icon className="h-5 w-5" />
            </NavLink>
          );
        }

        return (
          <div key={item.title} className="space-y-1">
            <div className="flex items-center">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-1 items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/20'
                      : isGroupActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                }
              >
                <Icon className={cn('h-4 w-4 shrink-0', isGroupActive && !location.pathname.endsWith(item.path) && 'text-emerald-500')} />
                <span className="truncate">{item.title}</span>
              </NavLink>

              {hasSub && (
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.title)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ml-1"
                >
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>

            {hasSub && isExpanded && (
              <div className="ml-7 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-1 py-1">
                {item.subItems!.map((sub) => (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    end={sub.path === item.path}
                    className={({ isActive }) =>
                      cn(
                        'block px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      )
                    }
                  >
                    {sub.title}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B1220] transition-all duration-300 z-30 shrink-0 select-none h-screen sticky top-0',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80">
        {!sidebarCollapsed && (
          <NavLink to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-sm">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                EXPENZO
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
                PROTOTYPE
              </span>
            </div>
          </NavLink>
        )}

        {sidebarCollapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-sm">
            E
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Workspace Switcher (Personal vs Family) */}
      <div className="px-3 pt-3">
        <WorkspaceSwitcher collapsed={sidebarCollapsed} />
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {renderNavGroup('Overview', OVERVIEW_ITEMS)}
        {renderNavGroup('Intelligence', INTELLIGENCE_ITEMS)}
        {renderNavGroup('More', MORE_ITEMS)}
      </div>

      {/* Demo Mode Notice */}
      {!sidebarCollapsed && (
        <div className="p-3 m-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111C30]/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Fictional Demo Data</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Clock fixed to 15 Oct 2026. Zero real bank connectivity.
          </p>
        </div>
      )}
    </aside>
  );
}

