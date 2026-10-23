import { create } from 'zustand';
import { AIChatConversation, AIChatMessage } from '@/types/finance';
import { processFinancialQuery } from '@/features/ai/intents/intentRegistry';
import { useFinanceStore } from '@/store/useFinanceStore';

interface AIChatState {
  conversations: AIChatConversation[];
  activeChatId: string | null;
  activePersona: string;
  isProcessing: boolean;

  // Actions
  createConversation: (initialTitle?: string) => string;
  selectConversation: (id: string) => void;
  sendMessage: (text: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  setPersona: (persona: string) => void;
}

const STORAGE_PREFIX = 'expenzo-ai-chat:v1:';

function getStorageKey(persona: string) {
  return `${STORAGE_PREFIX}${persona}`;
}

function loadConversations(persona: string): AIChatConversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(persona));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not load AI conversations from storage', e);
  }

  // Initial welcome conversation
  const defaultConv: AIChatConversation = {
    id: `conv_${Date.now()}_default`,
    title: 'Financial Overview',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg_welcome',
        sender: 'assistant',
        content:
          'Hello! I am your EXPENZO Financial Intelligence Assistant. You can ask me about your recorded expenses, monthly budgets, cash balances, investments, or financial concepts.',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return [defaultConv];
}

function persistConversations(persona: string, convs: AIChatConversation[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(persona), JSON.stringify(convs));
  } catch (e) {
    console.warn('Could not persist AI conversations', e);
  }
}

export const useAIChatStore = create<AIChatState>((set, get) => {
  const initialPersona = 'professional';
  const initialConversations = loadConversations(initialPersona);

  return {
    conversations: initialConversations,
    activeChatId: initialConversations[0]?.id || null,
    activePersona: initialPersona,
    isProcessing: false,

    setPersona: (persona: string) => {
      const convs = loadConversations(persona);
      set({
        activePersona: persona,
        conversations: convs,
        activeChatId: convs[0]?.id || null,
      });
    },

    createConversation: (initialTitle = 'New Financial Inquiry') => {
      const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newConv: AIChatConversation = {
        id,
        title: initialTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: `msg_${Date.now()}`,
            sender: 'assistant',
            content:
              'How can I help you analyze your personal finances today? Try asking about your spending, investments, or savings progress.',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      set((state) => {
        const next = [newConv, ...state.conversations];
        persistConversations(state.activePersona, next);
        return { conversations: next, activeChatId: id };
      });

      return id;
    },

    selectConversation: (id: string) => {
      set({ activeChatId: id });
    },

    sendMessage: async (text: string) => {
      const { activeChatId, conversations, activePersona } = get();
      if (!text.trim()) return;

      let chatId = activeChatId;
      let currentConvs = [...conversations];

      // If no active conversation, create one
      if (!chatId || !currentConvs.some((c) => c.id === chatId)) {
        chatId = get().createConversation(text.slice(0, 30));
        currentConvs = get().conversations;
      }

      const userMsg: AIChatMessage = {
        id: `msg_u_${Date.now()}`,
        sender: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      // Append user message immediately
      const updatedConvs = currentConvs.map((conv) => {
        if (conv.id === chatId) {
          const isFirstUserMsg = conv.messages.filter((m) => m.sender === 'user').length === 0;
          const shouldUpdateTitle = isFirstUserMsg && (!conv.title || conv.title === 'New Financial Inquiry');
          return {
            ...conv,
            title: shouldUpdateTitle ? text.trim().slice(0, 32) : conv.title,
            updatedAt: new Date().toISOString(),
            messages: [...conv.messages, userMsg],
          };
        }
        return conv;
      });

      set({ conversations: updatedConvs, isProcessing: true });
      persistConversations(activePersona, updatedConvs);

      // Process query client-side against canonical finance store state
      const financeState = useFinanceStore.getState();
      const result = processFinancialQuery(text, financeState);

      const assistantMsg: AIChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        content: result.textResponse,
        timestamp: new Date().toISOString(),
        card: result.card,
        intent: result.intentId,
      };

      const finalConvs = get().conversations.map((conv) => {
        if (conv.id === chatId) {
          return {
            ...conv,
            updatedAt: new Date().toISOString(),
            messages: [...conv.messages, assistantMsg],
          };
        }
        return conv;
      });

      set({ conversations: finalConvs, isProcessing: false });
      persistConversations(activePersona, finalConvs);
    },

    deleteConversation: (id: string) => {
      const { conversations, activePersona, activeChatId } = get();
      const next = conversations.filter((c) => c.id !== id);
      persistConversations(activePersona, next);

      let nextActive = activeChatId;
      if (activeChatId === id) {
        nextActive = next[0]?.id || null;
      }

      set({ conversations: next, activeChatId: nextActive });
    },

    clearAllConversations: () => {
      const { activePersona } = get();
      persistConversations(activePersona, []);
      set({ conversations: [], activeChatId: null });
    },
  };
});
