/// <reference types="vitest/globals" />

declare global {
  const global: typeof globalThis;
  
  interface Window {
    global: typeof globalThis;
  }
}

export {};