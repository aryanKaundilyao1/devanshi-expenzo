import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronRight,
  User,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, setMobileNavOpen } = useUIStore();
  const { user: financeUser, notifications, resetToDemo } = useFinanceStore();
  const { user: authUser, logout } = useAuthStore();
  const user = authUser || financeUser;
  const [cmdOpen, setCmdOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Generate breadcrumb items from URL
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const formatted = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { name: formatted, url };
  });

  const currentPageTitle = breadcrumbItems[breadcrumbItems.length - 1]?.name || 'Dashboard';

  const handleResetDemo = () => {
    if (window.confirm('Reset all demonstration data to factory defaults? Any custom transactions will be removed.')) {
      resetToDemo();
      alert('Demo data restored to October 15, 2026 default seed.');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B1220]/90 backdrop-blur-md px-4 sm:px-6">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            {breadcrumbItems.map((item, idx) => (
              <React.Fragment key={item.url}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                {idx === breadcrumbItems.length - 1 ? (
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </span>
                ) : (
                  <Link to={item.url} className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    {item.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>

          <h1 className="sm:hidden text-base font-bold text-slate-900 dark:text-white truncate">
            {currentPageTitle}
          </h1>
        </div>

        {/* Right: Search, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Search app...</span>
            <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate('/app/notifications')}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer focus:outline-none"
                aria-label="User profile menu"
              >
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">
                    {user.persona}
                  </span>
                </div>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[200px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-1.5 shadow-xl text-xs space-y-0.5 animate-in fade-in-50 zoom-in-95"
                sideOffset={8}
                align="end"
              >
                <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>

                <DropdownMenu.Item
                  onClick={() => navigate('/app/settings/profile')}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer outline-none"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>My Profile & Preferences</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={handleResetDemo}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer outline-none"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Demo Data</span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <DropdownMenu.Item
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer outline-none"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out (Demo Session)</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Global Command Dialog */}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}

