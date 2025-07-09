import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock onMount to work in test environment
vi.mock('svelte', async () => {
  const actual = await vi.importActual('svelte');
  return {
    ...actual,
    onMount: (fn: () => void) => {
      // Execute immediately in tests
      fn();
      return () => {};
    }
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock document.caretRangeFromPoint
Object.defineProperty(document, 'caretRangeFromPoint', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    startOffset: 0,
    endOffset: 0,
  })),
});