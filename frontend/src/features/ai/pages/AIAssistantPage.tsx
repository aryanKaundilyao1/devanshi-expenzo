import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAIChatStore } from '@/features/ai/store/useAIChatStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { ChatMessageBubble } from '@/features/ai/components/ChatMessageBubble';
import {
  getGeminiApiKey,
  setGeminiApiKey,
  clearGeminiApiKey,
  isGeminiConfigured,
} from '@/features/ai/services/geminiService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Send,
  Plus,
  Trash2,
  Sparkles,
  Search,
  MessageSquare,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
  Settings,
  Key,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'How much did I spend this month?',
  'What was my biggest expense?',
  'Which category costs me the most?',
  'What is my available cash balance?',
  'What is my portfolio worth?',
  'Which stock is my largest holding?',
  'How much progress have I made on my goals?',
  'What is a SIP?',
];

export const AIAssistantPage: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  const {
    conversations,
    activeChatId,
    activePersona,
    isProcessing,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    clearAllConversations,
    setPersona,
  } = useAIChatStore();

  const { user } = useFinanceStore();

  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(getGeminiApiKey());
  const [geminiConnected, setGeminiConnected] = useState(isGeminiConfigured());
  const [keyToast, setKeyToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync active persona with user profile from finance store
  useEffect(() => {
    if (user?.persona && user.persona !== activePersona) {
      setPersona(user.persona);
    }
  }, [user?.persona, activePersona, setPersona]);

  // Keep Gemini connected status in sync
  useEffect(() => {
    setGeminiConnected(isGeminiConfigured());
  }, [isSettingsOpen]);

  // Sync URL chatId param with activeChatId
  useEffect(() => {
    if (chatId && chatId !== activeChatId) {
      selectConversation(chatId);
    } else if (!chatId && activeChatId) {
      navigate(`/app/ai-assistant/${activeChatId}`, { replace: true });
    }
  }, [chatId, activeChatId, selectConversation, navigate]);

  const activeConv = conversations.find((c) => c.id === activeChatId) || conversations[0];

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages, isProcessing]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handlePromptClick = async (prompt: string) => {
    setInput(prompt);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Left Chat History Panel */}
      <div
        className={`${
          isSidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/60 dark:bg-slate-950/40 shrink-0 overflow-hidden`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <button
            onClick={() => {
              const newId = createConversation();
              navigate(`/app/ai-assistant/${newId}`);
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>

          {/* Search Chats */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((c) => {
            const isActive = c.id === activeChatId;
            return (
              <div
                key={c.id}
                onClick={() => {
                  selectConversation(c.id);
                  navigate(`/app/ai-assistant/${c.id}`);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold border border-emerald-200/60 dark:border-emerald-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{c.title}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-md transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          )}
        </div>

        {/* Clear All Footer */}
        {conversations.length > 0 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                if (window.confirm('Clear all local conversation history for this profile?')) {
                  clearAllConversations();
                }
              }}
              className="w-full py-1.5 text-center text-[11px] font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              Clear Conversation History
            </button>
          </div>
        )}
      </div>

      {/* Main Conversation Center */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activeConv?.title || 'Financial Intelligence Assistant'}
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {geminiConnected
                    ? 'Google Gemini 1.5 Flash Active • Real-Time Financial Intelligence'
                    : 'Smart Financial Co-Pilot • Real-Time Context Engine'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setGeminiKeyInput(getGeminiApiKey());
                setIsSettingsOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                geminiConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              }`}
              title="Configure Free Google Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{geminiConnected ? 'Gemini Flash (Free AI Active)' : 'Connect Free Gemini AI'}</span>
              <Settings className="w-3 h-3 ml-0.5 opacity-60" />
            </button>

            <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hidden sm:inline-block">
              Profile: {user?.name || 'Authorized User'}
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeConv?.messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}

          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span>Querying financial ledger & calculating figures...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Strip */}
        <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(p)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Composer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask a question about your spending, bank accounts, budgets or investments..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing}
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="absolute right-2 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Press Enter to send</span>
            <span>
              {geminiConnected
                ? '⚡ Powered by Google Gemini 1.5 Flash (Free AI) with verified ledger grounding'
                : '⚡ Powered by EXPENZO Smart Financial Engine • Real-time database context'}
            </span>
          </div>
        </div>
      </div>

      {/* Gemini AI Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Google Gemini Free AI Model
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs pt-1">
              Connect Google Gemini 1.5 Flash for natural language financial analysis, budgeting advice, and insights.
            </DialogDescription>
          </DialogHeader>

          {keyToast && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Gemini API Key saved successfully! Live AI assistant active.</span>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>100% Free Forever Tier</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                Google Gemini 1.5 Flash provides 15 requests per minute and 1,500 requests per day for <strong>FREE</strong> without needing a credit card.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
              >
                <span>Get Free Gemini Key in Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gemini API Key
              </label>
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-slate-400">
                Key is stored securely in your browser's local storage and used directly for encrypted calls to Google Gemini.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {geminiConnected ? (
                <button
                  type="button"
                  onClick={() => {
                    clearGeminiApiKey();
                    setGeminiKeyInput('');
                    setGeminiConnected(false);
                    setIsSettingsOpen(false);
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Disconnect Key
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setGeminiApiKey(geminiKeyInput);
                    setGeminiConnected(isGeminiConfigured());
                    setKeyToast(true);
                    setTimeout(() => {
                      setKeyToast(false);
                      setIsSettingsOpen(false);
                    }, 800);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Save & Connect
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
