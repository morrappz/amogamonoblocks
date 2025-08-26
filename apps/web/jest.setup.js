import "@testing-library/jest-dom";

// Polyfills for Node.js environment
import { TextEncoder, TextDecoder } from "util";
import { Readable } from "stream";
// Removed 'text-encoding' polyfill. Node.js util provides TextEncoder/TextDecoder.
import "@testing-library/jest-dom";

// Polyfills for Node.js environment
import { TextEncoder, TextDecoder } from "util";
import { Readable } from "stream";

// Set global TextEncoder/TextDecoder using Node.js util
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for TransformStream
if (typeof global.TransformStream === "undefined") {
  global.TransformStream = class {
    constructor() {
      throw new Error("TransformStream is not available in this environment");
    }
  };
}

// Polyfill for ReadableStream
if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream = class {
    constructor() {
      throw new Error("ReadableStream is not available in this environment");
    }
  };
}

// Mock next/router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock next/navigation for App Router (Next.js 13+)
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Global test setup
global.fetch = jest.fn();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
// Remove or comment out any require/import for 'text-encoding'
// Instead, mock global TextEncoder and TextDecoder using Node.js util

import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ...existing code...
// Removed 'text-encoding' import/polyfill. Node.js util provides TextEncoder/TextDecoder.

// Polyfill for TransformStream
if (typeof global.TransformStream === "undefined") {
  global.TransformStream = class {
    constructor() {
      throw new Error("TransformStream is not available in this environment");
    }
  };
}

// Polyfill for ReadableStream
if (typeof global.ReadableStream === "undefined") {
  global.ReadableStream = class {
    constructor() {
      throw new Error("ReadableStream is not available in this environment");
    }
  };
}

// Mock next/router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock next/navigation for App Router (Next.js 13+)
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Global test setup
global.fetch = jest.fn();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
