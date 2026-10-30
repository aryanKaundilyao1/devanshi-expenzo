import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { supabase } from '@/lib/supabase';

// Mock Supabase auth network calls in test environment to prevent ENOTFOUND network errors
if (supabase?.auth) {
  vi.spyOn(supabase.auth, 'signUp').mockImplementation(async ({ email, password, options }: any) => {
    return {
      data: {
        user: {
          id: 'test-user-id',
          email: email,
          created_at: new Date().toISOString(),
          user_metadata: options?.data || {},
        } as any,
        session: null,
      },
      error: null,
    };
  });

  vi.spyOn(supabase.auth, 'signInWithPassword').mockImplementation(async ({ email }: any) => {
    return {
      data: {
        user: {
          id: 'test-user-id',
          email: email,
          created_at: new Date().toISOString(),
          user_metadata: {},
        } as any,
        session: {} as any,
      },
      error: null,
    } as any;
  });

  vi.spyOn(supabase.auth, 'signOut').mockImplementation(async () => {
    return { error: null };
  });

  // Mock Supabase PostgREST table queries in test environment
  vi.spyOn(supabase, 'from').mockImplementation(() => {
    const builder: any = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      upsert: () => builder,
      eq: () => builder,
      order: () => builder,
      limit: () => builder,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
    };
    return builder;
  });
}

// Patch Request to safely handle JSDOM AbortSignal incompatibility with Node undici in React Router v7
if (typeof globalThis.Request !== 'undefined') {
  const OriginalRequest = globalThis.Request;
  globalThis.Request = class PatchedRequest extends OriginalRequest {
    constructor(input: any, init?: any) {
      if (init && init.signal) {
        try {
          super(input, init);
          return;
        } catch {
          const { signal: _, ...rest } = init;
          super(input, rest);
          return;
        }
      }
      super(input, init);
    }
  };
  window.Request = globalThis.Request;
}

// JSDOM mock for window.scrollTo and window.matchMedia
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver = ResizeObserverMock;
(window as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver = ResizeObserverMock;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

