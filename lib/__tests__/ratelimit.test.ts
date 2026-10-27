import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

// vi.mock factories are hoisted above variable declarations — use vi.hoisted()
// to define shared mock state before the factories run.
const { mockHeaderGet, mockLimit } = vi.hoisted(() => ({
  mockHeaderGet: vi.fn(),
  mockLimit: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({ get: mockHeaderGet }),
}));

vi.mock("@upstash/redis", () => ({
  // Redis.fromEnv() is a static factory method — not a constructor call.
  Redis: { fromEnv: vi.fn().mockReturnValue({}) },
}));

vi.mock("@upstash/ratelimit", () => {
  // Ratelimit.slidingWindow is a static method — add it to the mock class.
  function MockRatelimit() {
    return { limit: mockLimit };
  }
  MockRatelimit.slidingWindow = vi.fn().mockReturnValue({});
  return { Ratelimit: MockRatelimit };
});

import {
  isRatelimitConfigured,
  getClientIp,
  checkLoginRateLimit,
  checkEnquiryRateLimit,
} from "@/lib/ratelimit";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UPSTASH_KEYS = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];

function setUpstashEnv(
  overrides: Partial<Record<"UPSTASH_REDIS_REST_URL" | "UPSTASH_REDIS_REST_TOKEN", string>>,
) {
  UPSTASH_KEYS.forEach((k) => delete process.env[k]);
  for (const [k, v] of Object.entries(overrides)) {
    process.env[k] = v;
  }
}

const FULL_UPSTASH = {
  UPSTASH_REDIS_REST_URL: "https://test.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "test-token",
};

// A future reset timestamp ~60 s from now (milliseconds, as Upstash returns).
const futureResetMs = () => Date.now() + 60_000;

// ─── isRatelimitConfigured ────────────────────────────────────────────────────

describe("isRatelimitConfigured", () => {
  afterEach(() => setUpstashEnv({}));

  it("returns true when both vars are set", () => {
    setUpstashEnv(FULL_UPSTASH);
    expect(isRatelimitConfigured()).toBe(true);
  });

  it("returns false when UPSTASH_REDIS_REST_URL is missing", () => {
    setUpstashEnv({ UPSTASH_REDIS_REST_TOKEN: FULL_UPSTASH.UPSTASH_REDIS_REST_TOKEN });
    expect(isRatelimitConfigured()).toBe(false);
  });

  it("returns false when UPSTASH_REDIS_REST_TOKEN is missing", () => {
    setUpstashEnv({ UPSTASH_REDIS_REST_URL: FULL_UPSTASH.UPSTASH_REDIS_REST_URL });
    expect(isRatelimitConfigured()).toBe(false);
  });

  it("returns false when neither var is set", () => {
    setUpstashEnv({});
    expect(isRatelimitConfigured()).toBe(false);
  });
});

// ─── getClientIp ─────────────────────────────────────────────────────────────

describe("getClientIp", () => {
  afterEach(() => mockHeaderGet.mockReset());

  it("returns x-real-ip when present", async () => {
    mockHeaderGet.mockImplementation((name: string) =>
      name === "x-real-ip" ? "10.0.0.1" : null,
    );
    expect(await getClientIp()).toBe("10.0.0.1");
  });

  it("returns first x-forwarded-for segment when x-real-ip is absent", async () => {
    mockHeaderGet.mockImplementation((name: string) =>
      name === "x-forwarded-for" ? "203.0.113.5, 10.0.0.1" : null,
    );
    expect(await getClientIp()).toBe("203.0.113.5");
  });

  it("handles a single x-forwarded-for value", async () => {
    mockHeaderGet.mockImplementation((name: string) =>
      name === "x-forwarded-for" ? "203.0.113.5" : null,
    );
    expect(await getClientIp()).toBe("203.0.113.5");
  });

  it("trims whitespace from x-forwarded-for segment", async () => {
    mockHeaderGet.mockImplementation((name: string) =>
      name === "x-forwarded-for" ? "  198.51.100.1 , 10.0.0.2" : null,
    );
    expect(await getClientIp()).toBe("198.51.100.1");
  });

  it("returns 'unknown' when neither header is present", async () => {
    mockHeaderGet.mockReturnValue(null);
    expect(await getClientIp()).toBe("unknown");
  });

  it("prefers x-real-ip over x-forwarded-for when both are present", async () => {
    mockHeaderGet.mockImplementation((name: string) => {
      if (name === "x-real-ip") return "1.2.3.4";
      if (name === "x-forwarded-for") return "9.9.9.9";
      return null;
    });
    expect(await getClientIp()).toBe("1.2.3.4");
  });
});

// ─── checkLoginRateLimit — no config, development ────────────────────────────

describe("checkLoginRateLimit — no config, development", () => {
  beforeEach(() => {
    setUpstashEnv({});
    mockHeaderGet.mockReturnValue(null); // IP = "unknown"
  });
  afterEach(() => setUpstashEnv({}));

  it("returns { allowed: true } when NODE_ENV is not production", async () => {
    // NODE_ENV defaults to 'test' in Vitest — that's !== 'production'.
    const result = await checkLoginRateLimit("test@example.com");
    expect(result.allowed).toBe(true);
  });

  it("emits console.warn with 'development fallback' when credentials missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await checkLoginRateLimit("test@example.com");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("development fallback"));
    warn.mockRestore();
  });

  it("does NOT call mockLimit when credentials are missing", async () => {
    await checkLoginRateLimit("test@example.com");
    expect(mockLimit).not.toHaveBeenCalled();
  });
});

// ─── checkLoginRateLimit — no config, production ─────────────────────────────

describe("checkLoginRateLimit — no config, production", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    setUpstashEnv({});
    (process.env as Record<string, string>).NODE_ENV = "production";
    mockHeaderGet.mockReturnValue(null);
  });
  afterEach(() => {
    setUpstashEnv({});
    (process.env as Record<string, string>).NODE_ENV = originalNodeEnv ?? "test";
  });

  it("returns { allowed: false } when NODE_ENV is production and credentials missing", async () => {
    const result = await checkLoginRateLimit("test@example.com");
    expect(result.allowed).toBe(false);
  });

  it("emits console.error with 'CRITICAL' when credentials missing in production", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await checkLoginRateLimit("test@example.com");
    expect(error).toHaveBeenCalledWith(expect.stringContaining("CRITICAL"));
    error.mockRestore();
  });
});

// ─── checkLoginRateLimit — Upstash responds ──────────────────────────────────

describe("checkLoginRateLimit — Upstash responds", () => {
  beforeEach(() => {
    setUpstashEnv(FULL_UPSTASH);
    mockHeaderGet.mockImplementation((name: string) =>
      name === "x-real-ip" ? "10.0.0.1" : null,
    );
  });
  afterEach(() => setUpstashEnv({}));

  it("returns { allowed: true } when Upstash reports success", async () => {
    mockLimit.mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: futureResetMs() });
    const result = await checkLoginRateLimit("admin@example.com");
    expect(result.allowed).toBe(true);
    expect(result.retryAfterSeconds).toBeUndefined();
  });

  it("returns { allowed: false } when Upstash reports limit exceeded", async () => {
    mockLimit.mockResolvedValue({ success: false, limit: 5, remaining: 0, reset: futureResetMs() });
    const result = await checkLoginRateLimit("admin@example.com");
    expect(result.allowed).toBe(false);
  });

  it("includes a positive retryAfterSeconds when blocked", async () => {
    const resetAt = Date.now() + 45_000;
    mockLimit.mockResolvedValue({ success: false, limit: 5, remaining: 0, reset: resetAt });
    const result = await checkLoginRateLimit("admin@example.com");
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(45);
  });

  it("passes an identifier prefixed with 'login:' to Upstash", async () => {
    mockLimit.mockResolvedValue({ success: true, limit: 5, remaining: 3, reset: futureResetMs() });
    await checkLoginRateLimit("Admin@Example.com");
    const [identifier] = mockLimit.mock.calls[0];
    expect(identifier).toMatch(/^login:/);
    // email is lowercased in the identifier
    expect(identifier).toContain("admin@example.com");
  });

  it("includes the client IP in the identifier", async () => {
    mockLimit.mockResolvedValue({ success: true, limit: 5, remaining: 3, reset: futureResetMs() });
    await checkLoginRateLimit("user@example.com");
    const [identifier] = mockLimit.mock.calls[0];
    expect(identifier).toContain("10.0.0.1");
  });
});

// ─── checkLoginRateLimit — Upstash throws ────────────────────────────────────

describe("checkLoginRateLimit — Upstash throws", () => {
  beforeEach(() => {
    setUpstashEnv(FULL_UPSTASH);
    mockHeaderGet.mockReturnValue(null);
  });
  afterEach(() => setUpstashEnv({}));

  it("returns { allowed: true } (fail-open) when Upstash throws", async () => {
    mockLimit.mockRejectedValue(new Error("Connection refused"));
    const result = await checkLoginRateLimit("user@example.com");
    expect(result.allowed).toBe(true);
  });

  it("does not throw to the caller when Upstash throws", async () => {
    mockLimit.mockRejectedValue(new Error("Timeout"));
    await expect(checkLoginRateLimit("user@example.com")).resolves.toBeDefined();
  });

  it("logs the error when Upstash throws", async () => {
    mockLimit.mockRejectedValue(new Error("Timeout"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await checkLoginRateLimit("user@example.com");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

// ─── checkEnquiryRateLimit — no config, development ──────────────────────────

describe("checkEnquiryRateLimit — no config, development", () => {
  beforeEach(() => {
    setUpstashEnv({});
    mockHeaderGet.mockReturnValue(null);
  });
  afterEach(() => setUpstashEnv({}));

  it("returns { allowed: true } when NODE_ENV is not production", async () => {
    const result = await checkEnquiryRateLimit();
    expect(result.allowed).toBe(true);
  });

  it("emits console.warn with 'development fallback' when credentials missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await checkEnquiryRateLimit();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("development fallback"));
    warn.mockRestore();
  });
});

// ─── checkEnquiryRateLimit — no config, production ───────────────────────────

describe("checkEnquiryRateLimit — no config, production", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    setUpstashEnv({});
    (process.env as Record<string, string>).NODE_ENV = "production";
    mockHeaderGet.mockReturnValue(null);
  });
  afterEach(() => {
    setUpstashEnv({});
    (process.env as Record<string, string>).NODE_ENV = originalNodeEnv ?? "test";
  });

  it("returns { allowed: false } in production with no credentials", async () => {
    const result = await checkEnquiryRateLimit();
    expect(result.allowed).toBe(false);
  });

  it("emits console.error with 'CRITICAL' in production with no credentials", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await checkEnquiryRateLimit();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("CRITICAL"));
    spy.mockRestore();
  });
});

// ─── checkEnquiryRateLimit — Upstash responds ────────────────────────────────

describe("checkEnquiryRateLimit — Upstash responds", () => {
  beforeEach(() => {
    setUpstashEnv(FULL_UPSTASH);
    mockHeaderGet.mockImplementation((name: string) =>
      name === "x-real-ip" ? "10.0.0.2" : null,
    );
  });
  afterEach(() => setUpstashEnv({}));

  it("returns { allowed: true } when Upstash reports success", async () => {
    mockLimit.mockResolvedValue({ success: true, limit: 5, remaining: 3, reset: futureResetMs() });
    const result = await checkEnquiryRateLimit();
    expect(result.allowed).toBe(true);
  });

  it("returns { allowed: false } with retryAfterSeconds when blocked", async () => {
    const resetAt = Date.now() + 30_000;
    mockLimit.mockResolvedValue({ success: false, limit: 5, remaining: 0, reset: resetAt });
    const result = await checkEnquiryRateLimit();
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("passes an identifier prefixed with 'enquiry:' to Upstash", async () => {
    mockLimit.mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: futureResetMs() });
    await checkEnquiryRateLimit();
    const [identifier] = mockLimit.mock.calls[0];
    expect(identifier).toMatch(/^enquiry:/);
    expect(identifier).toContain("10.0.0.2");
  });
});

// ─── checkEnquiryRateLimit — Upstash throws ──────────────────────────────────

describe("checkEnquiryRateLimit — Upstash throws", () => {
  beforeEach(() => {
    setUpstashEnv(FULL_UPSTASH);
    mockHeaderGet.mockReturnValue(null);
  });
  afterEach(() => setUpstashEnv({}));

  it("returns { allowed: true } (fail-open) when Upstash throws", async () => {
    mockLimit.mockRejectedValue(new Error("Network error"));
    const result = await checkEnquiryRateLimit();
    expect(result.allowed).toBe(true);
  });

  it("does not throw to the caller when Upstash throws", async () => {
    mockLimit.mockRejectedValue(new Error("Network error"));
    await expect(checkEnquiryRateLimit()).resolves.toBeDefined();
  });

  it("logs the error when Upstash throws", async () => {
    mockLimit.mockRejectedValue(new Error("Network error"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await checkEnquiryRateLimit();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
