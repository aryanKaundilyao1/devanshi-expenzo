import { StructuredCardData } from '@/types/finance';

export interface IntentContext {
  userQuestion: string;
  normalizedQuestion: string;
  storeState: any; // Finance store snapshot
}

export interface IntentResult {
  intentId: string;
  intentCategory: 'expenses' | 'income' | 'banking' | 'budgets' | 'investments' | 'planner' | 'education' | 'fallback';
  textResponse: string;
  card?: StructuredCardData;
  suggestedFollowUps?: string[];
}

export interface IntentHandler {
  id: string;
  name: string;
  category: IntentResult['intentCategory'];
  keywords: string[];
  patterns: RegExp[];
  match: (ctx: IntentContext) => boolean;
  execute: (ctx: IntentContext) => IntentResult;
}

