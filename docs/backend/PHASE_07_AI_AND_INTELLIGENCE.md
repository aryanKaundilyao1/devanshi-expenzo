# EXPENZO Backend Implementation — Phase 7 PRD
## Real AI Assistant and Financial Intelligence

### 1. Objective
Implement a secure, authenticated Supabase Edge Function that computes verified financial aggregates on the server and interfaces with Google Gemini Flash API. When API keys are not provided, gracefully fall back to the existing offline deterministic rule engine with explicit disclaimers.

### 2. Affected Existing Files
- `frontend/src/features/ai/pages/AIAssistantPage.tsx`
- `frontend/src/features/ai/store/useAIChatStore.ts`

### 3. New Files to Create
- `supabase/functions/ai-assistant/index.ts` (Edge Function handling chat requests)
- `frontend/src/services/apiAIService.ts` (Frontend adapter calling Edge Function)

### 4. Database Changes
- `ai_chat_sessions`: Chat session history per user.
- `ai_chat_messages`: Multi-turn message history with structured intent payloads.

### 5. Security & Grounding Invariants
- The LLM **never receives raw database access or arbitrary SQL execution powers**.
- All numeric figures (balances, monthly spending, highest categories) are pre-calculated by trusted backend queries and injected as read-only context.
- Zero secret API keys (Gemini API keys) exposed to the frontend browser.

### 6. Acceptance Criteria
- Edge Function verifies user JWT before fetching financial context.
- AI answers accurately reflect stored database transactions.
- Offline fallback operates deterministically if `GEMINI_API_KEY` is omitted.

