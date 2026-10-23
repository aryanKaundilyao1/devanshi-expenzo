import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Settings,
  Filter,
  AlertTriangle,
  CalendarClock,
  TrendingUp,
  Shield,
  Info,
  ExternalLink,
  Target,
  Wallet,
} from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { NotificationItem } from '@/types/finance';

type FilterType = 'all' | 'unread' | 'budget' | 'bill' | 'investment' | 'system';

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    syncDeterministicNotifications,
  } = useFinanceStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Trigger re-synchronization on mount to capture any fresh events
  React.useEffect(() => {
    syncDeterministicNotifications();
  }, [syncDeterministicNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'budget') return n.type === 'budget';
    if (filter === 'bill') return n.type === 'bill';
    if (filter === 'investment') return n.type === 'investment';
    if (filter === 'system') return n.type === 'system' || n.type === 'security';
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'budget':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'bill':
        return <CalendarClock className="h-5 w-5 text-indigo-500" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'security':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-purple-500" />;
      case 'balance':
        return <Wallet className="h-5 w-5 text-rose-500" />;
      case 'system':
      default:
        return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  const getTypeBadge = (type: NotificationItem['type']) => {
    switch (type) {
      case 'budget':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      case 'bill':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';
      case 'investment':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'security':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
      case 'goal':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300';
      case 'balance':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      case 'system':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const handleOpenNotification = (n: NotificationItem) => {
    if (!n.isRead) {
      markNotificationRead(n.id);
    }
    if (n.linkRoute) {
      navigate(n.linkRoute);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Notifications Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System alerts, budget overruns, bill due dates, and portfolio concentration warnings.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          )}

          <button
            onClick={() => navigate('/app/settings/notifications')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Alert Settings
          </button>

          {notifications.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        <Filter className="h-4 w-4 text-slate-400 mr-1 flex-shrink-0" />
        {(
          [
            { id: 'all', label: 'All Alerts' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'budget', label: 'Budgets' },
            { id: 'bill', label: 'Bills' },
            { id: 'investment', label: 'Investments' },
            { id: 'system', label: 'Security & System' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      {filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 mb-4">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            No notifications in this view
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            You're all caught up! New financial threshold warnings, upcoming bill notices, and portfolio insights will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`group flex items-start gap-4 rounded-xl border p-4 transition-all ${
                n.isRead
                  ? 'border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/40 opacity-80 hover:opacity-100'
                  : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm'
              }`}
            >
              {/* Type Icon */}
              <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                {getIcon(n.type)}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${getTypeBadge(
                      n.type
                    )}`}
                  >
                    {n.type}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {n.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {n.message}
                </p>

                {/* Inline Action Footer */}
                <div className="mt-3 flex items-center gap-3">
                  {n.linkRoute && (
                    <button
                      onClick={() => handleOpenNotification(n)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      View Details
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}

                  {!n.isRead ? (
                    <button
                      onClick={() => markNotificationRead(n.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      Mark as read
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Read</span>
                  )}

                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-auto transition-colors"
                    aria-label={`Delete notification: ${n.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-6 shadow-2xl space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Clear all notifications?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will remove all current alerts from your notification center. Dynamic alerts can be regenerated from your actual financial data.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllNotifications();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

