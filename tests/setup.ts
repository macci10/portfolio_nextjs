import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/**
 * jsdom implements neither of these. Both are load-bearing in components under
 * test — ThemeToggle reads the reduced-motion preference before starting the
 * theme wipe, and the motion components branch on it — so without stubs the
 * failures are environment noise rather than real signal.
 */
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
