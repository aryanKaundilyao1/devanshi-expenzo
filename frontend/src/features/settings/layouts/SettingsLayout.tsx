import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  User,
  Palette,
  Coins,
  Shield,
  CreditCard,
  Lock,
  Bell,
} from 'lucide-react';

const SETTINGS_NAV = [
  { path: '/app/settings/profile', label: 'Profile & Persona', icon: User },
  { path: '/app/settings/appearance', label: 'Appearance & Theme', icon: Palette },
  { path: '/app/settings/financial', label: 'Financial Rules', icon: Coins },
  { path: '/app/settings/security', label: 'Security & Session', icon: Shield },
  { path: '/app/settings/connections', label: 'Connected Accounts', icon: CreditCard },
  { path: '/app/settings/privacy', label: 'Data & Privacy', icon: Lock },
  { path: '/app/settings/notifications', label: 'Notifications', icon: Bell },
];

export function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Settings & Preferences
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, display appearance, financial rules, privacy, and local workspace data.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        {SETTINGS_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Settings Content Outlet */}
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}

