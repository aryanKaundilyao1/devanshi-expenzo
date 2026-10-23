import React, { useState, useRef } from 'react';
import {
  Lock,
  Download,
  Upload,
  RotateCcw,
  MessageSquare,
  GraduationCap,
  AlertTriangle,
  Check,
  CheckCircle2,
  FileJson,
} from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAIChatStore } from '@/features/ai/store/useAIChatStore';
import { useLearningStore } from '@/features/learning/store/useLearningStore';
import { useAuthStore } from '@/store/useAuthStore';

export function PrivacySettingsPage() {
  const financeStore = useFinanceStore();
  const { clearAllConversations, activePersona: chatPersona } = useAIChatStore();
  const { setPersona: resetLearningPersona, activePersona: learningPersona } = useLearningStore();
  const { user } = useAuthStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState<any | null>(null);

  // 1. Export workspace as JSON
  const handleExportJSON = () => {
    try {
      const state = useFinanceStore.getState();
      const exportPayload = {
        app: 'EXPENZO',
        version: 'v1',
        exportedAt: new Date().toISOString(),
        persona: state.user.persona,
        data: {
          user: state.user,
          accounts: state.accounts,
          transactions: state.transactions,
          categories: state.categories,
          budgets: state.budgets,
          goals: state.goals,
          holdings: state.holdings,
          watchlists: state.watchlists,
          bills: state.bills,
          recurringRules: state.recurringRules,
          beneficiaries: state.beneficiaries,
          cards: state.cards,
          depositSimulations: state.depositSimulations,
          loanSimulations: state.loanSimulations,
          notificationPreferences: state.notificationPreferences,
        },
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `expenzo-workspace-${state.user.persona}-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setFeedback({
        type: 'success',
        message: 'Demonstration workspace exported successfully as JSON file.',
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (e) {
      setFeedback({ type: 'error', message: 'Failed to export workspace JSON.' });
    }
  };

  // 2. Handle File Input for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || parsed.app !== 'EXPENZO' || parsed.version !== 'v1' || !parsed.data) {
          setFeedback({
            type: 'error',
            message: 'Incompatible file format. Please upload a valid EXPENZO v1 workspace export.',
          });
          return;
        }
        setImportPreview(parsed);
      } catch (err) {
        setFeedback({
          type: 'error',
          message: 'Malformed JSON file. Please verify file integrity and try again.',
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleApplyImport = () => {
    if (!importPreview) return;
    const res = financeStore.importWorkspaceData(importPreview.data);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Imported ${importPreview.data.accounts?.length || 0} accounts, ${
          importPreview.data.transactions?.length || 0
        } transactions, and ${importPreview.data.holdings?.length || 0} holdings successfully!`,
      });
      setImportPreview(null);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // 3. Reset Demo Workspace
  const handleConfirmReset = () => {
    financeStore.resetToDemo();
    setShowResetConfirm(false);
    setFeedback({
      type: 'success',
      message: 'Workspace restored to default demonstration seed data (October 15, 2026).',
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 4. Clear AI Chat History
  const handleClearChat = () => {
    if (window.confirm('Clear all conversation histories for the current persona?')) {
      clearAllConversations();
      setFeedback({
        type: 'success',
        message: 'AI Assistant conversation history cleared for this persona.',
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // 5. Clear Learning Progress
  const handleClearLearning = () => {
    if (window.confirm('Reset quiz scores and article bookmarks for this persona?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`expenzo-learning:v1:${user.persona}`);
      }
      resetLearningPersona(user.persona);
      setFeedback({
        type: 'success',
        message: 'Learning Hub progress and quiz scores reset.',
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
          }`}
          role="alert"
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Local Privacy Boundaries Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Lock className="h-4 w-4 text-emerald-600" />
          Zero-Data-Leakage Privacy Policy
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          EXPENZO is engineered with complete privacy isolation. None of your ledger transactions, account balances, or financial inquiries are sent to remote analytics servers or third-party tracking services. All state is held in your browser’s local storage and memory.
        </p>
      </div>

      {/* Export & Import Data Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileJson className="h-4 w-4 text-emerald-600" />
            Workspace Backup & Migration
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download your current demo records or restore a previously saved JSON snapshot.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Export Local Workspace
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Generates a clean JSON file of all accounts, transactions, holdings, and budgets.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download JSON Backup
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Import JSON Snapshot
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Load a compatible EXPENZO v1 workspace backup into your browser session.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Select File to Import
            </button>
          </div>
        </div>
      </div>

      {/* Import Preview Modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-6 shadow-2xl space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Upload className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm Workspace Import
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Found valid EXPENZO v1 backup for persona:{' '}
                <span className="font-semibold text-emerald-600 capitalize">
                  {importPreview.persona || 'user'}
                </span>
                .
              </p>

              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Accounts to load:</span>
                  <span className="font-semibold">{importPreview.data.accounts?.length || 0}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Transactions to load:</span>
                  <span className="font-semibold">{importPreview.data.transactions?.length || 0}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Holdings to load:</span>
                  <span className="font-semibold">{importPreview.data.holdings?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setImportPreview(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyImport}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Apply Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module-Specific Data Cleansing */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Individual Module Data Cleansing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                AI Assistant History
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Wipe chat questions and cards</p>
            </div>
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
                Learning Hub Progress
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Reset quizzes and bookmarks</p>
            </div>
            <button
              onClick={handleClearLearning}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Master Workspace Reset Card */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Reset Entire Demonstration Workspace
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
            Restores all accounts, transactions, budgets, stock holdings, and savings goals to factory default seed data (October 15, 2026).
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors whitespace-nowrap"
        >
          Reset Workspace
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] p-6 shadow-2xl space-y-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <RotateCcw className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm Factory Reset
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                This will wipe any custom transactions or stock holdings you have created and reset all balances back to the default seed state.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

