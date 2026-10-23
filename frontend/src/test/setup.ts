import '@testing-library/jest-dom';

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

