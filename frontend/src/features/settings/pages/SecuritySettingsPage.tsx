import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  LogOut,
  KeyRound,
  HardDrive,
  Info,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function SecuritySettingsPage() {
  const navigate = useNavigate();
  const { user, rememberSession, updateOnboardingPreferences, logout, resetSession } =
    useAuthStore();

  const [remember, setRemember] = useState(rememberSession);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Calculate local storage size
  const getStorageDetails = () => {
    if (typeof window === 'undefined') return { keys: 0, estimatedKb: '0' };
    try {
      let totalLength = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalLength += (localStorage[key]?.length || 0) + key.length;
        }
      }
      return {
        keys: Object.keys(localStorage).length,
        estimatedKb: (totalLength / 1024).toFixed(1),
      };
    } catch {
      return { keys: 0, estimatedKb: '0' };
    }
  };

  const storageDetails = getStorageDetails();

  const handleToggleRemember = (checked: boolean) => {
    setRemember(checked);
    updateOnboardingPreferences({} as any);
    useAuthStore.setState({ rememberSession: checked });
    setFeedback('Session persistence preference saved.');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  const handleSignOutAndClear = () => {
    if (
      window.confirm(
        'Are you sure you want to sign out and clear your demo session state from this browser?'
      )
    ) {
      resetSession();
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Prototype Honest Security Banner */}
      <div className="rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Prototype Security Notice: Client-Side Demonstration Sandbox</span>
        </div>
        <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
          EXPENZO is currently operating as a verified frontend prototype. All accounts, transactions, investments, and passwords are strictly simulated and stored in your browser’s local storage. There is no remote authentication backend, real bank connection, or cloud credential storage.
        </p>
      </div>

      {feedback && (
        <div
          className="flex items-center gap-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 p-3.5 text-xs font-semibold"
          role="alert"
        >
          <Check className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Active Demo Session Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-emerald-600" />
          Active Demo Session Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">User Identity</span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
              {user.name}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">
              {user.persona} profile
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Session ID</span>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
              {user.id || 'usr_demo_active'}
            </p>
            <p className="text-[10px] text-slate-400">Client-scoped demo token</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Security Mode</span>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              Sandbox Isolated
            </p>
            <p className="text-[10px] text-slate-400">No external network calls</p>
          </div>
        </div>

        {/* Remember Session Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Remember Demo Session
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Keep your profile and personalized workspace active across browser tab closes.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => handleToggleRemember(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* Local Storage Device Usage */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-emerald-600" />
          Device Storage & Sandbox Boundaries
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Browser Local Storage Utilization
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Contains ledger records, stock holdings, watchlists, and persona preferences.
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              ~{storageDetails.estimatedKb} KB
            </span>
            <p className="text-[10px] text-slate-400">{storageDetails.keys} store keys</p>
          </div>
        </div>
      </div>

      {/* Production Security Architecture Preview */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Production Security Roadmap (Phase 12+)
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Out-of-Scope in Prototype
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              OAuth2 & FIDO2 / WebAuthn
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Biometric passkeys and hardware keys for hardware-backed cryptographic identity verification.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              AES-256 GCM Envelope Encryption
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Client-side envelope encryption with key-rotation for zero-knowledge transaction storage.
            </p>
          </div>
        </div>
      </div>

      {/* Sign Out Actions */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">
            Session Termination Actions
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Safely leave the demonstration environment or wipe temporary browser cookies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>

          <button
            type="button"
            onClick={handleSignOutAndClear}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors"
          >
            Sign Out & Clear Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}

