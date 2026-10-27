import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const {
  mockRedirect,
  mockFindUnique,
  mockCompare,
  mockCreateAdminSession,
  mockClearAdminSession,
  mockCheckLoginRateLimit,
} = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
  mockFindUnique: vi.fn(),
  mockCompare: vi.fn(),
  mockCreateAdminSession: vi.fn(),
  mockClearAdminSession: vi.fn(),
  mockCheckLoginRateLimit: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mockRedirect }));

vi.mock("@/lib/prisma", () => ({
  prisma: { adminUser: { findUnique: mockFindUnique } },
}));

vi.mock("bcryptjs", () => ({ default: { compare: mockCompare } }));

vi.mock("@/lib/auth/admin", () => ({
  createAdminSession: mockCreateAdminSession,
  clearAdminSession: mockClearAdminSession,
}));

vi.mock("@/lib/ratelimit", () => ({
  checkLoginRateLimit: mockCheckLoginRateLimit,
}));

import { signInAdmin, signOutAdmin } from "@/app/actions/admin-auth";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFormData(email: string, password: string): FormData {
  const fd = new FormData();
  fd.append("email", email);
  fd.append("password", password);
  return fd;
}

const VALID_ADMIN = {
  id: "admin-1",
  email: "admin@nexchair.com",
  password: "$2b$10$hashedpassword",
};

// ─── Rate limit exceeded ──────────────────────────────────────────────────────

describe("signInAdmin — rate limit exceeded", () => {
  beforeEach(() => {
    mockCheckLoginRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 45 });
  });

  it("returns success: false with retry seconds in message", async () => {
    const result = await signInAdmin(makeFormData("admin@nexchair.com", "pass"));
    expect(result?.success).toBe(false);
    expect(result?.message).toContain("45");
  });

  it("does NOT query the database", async () => {
    await signInAdmin(makeFormData("admin@nexchair.com", "pass"));
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("does NOT compare passwords", async () => {
    await signInAdmin(makeFormData("admin@nexchair.com", "pass"));
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it("does NOT create a session", async () => {
    await signInAdmin(makeFormData("admin@nexchair.com", "pass"));
    expect(mockCreateAdminSession).not.toHaveBeenCalled();
  });

  it("does NOT call redirect", async () => {
    await signInAdmin(makeFormData("admin@nexchair.com", "pass"));
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

// ─── Rate limit exceeded, no retryAfterSeconds ────────────────────────────────

describe("signInAdmin — rate limit exceeded, no retryAfterSeconds", () => {
  beforeEach(() => {
    mockCheckLoginRateLimit.mockResolvedValue({ allowed: false });
  });

  it("falls back to 60 seconds in the message", async () => {
    const result = await signInAdmin(makeFormData("admin@nexchair.com", "pass"));
    expect(result?.message).toContain("60");
  });
});

// ─── Rate limit passes, valid credentials ────────────────────────────────────

describe("signInAdmin — rate limit passes, valid credentials", () => {
  beforeEach(() => {
    mockCheckLoginRateLimit.mockResolvedValue({ allowed: true });
    mockFindUnique.mockResolvedValue(VALID_ADMIN);
    mockCompare.mockResolvedValue(true);
    mockCreateAdminSession.mockResolvedValue(undefined);
  });

  it("calls createAdminSession with the admin id and email", async () => {
    await signInAdmin(makeFormData("admin@nexchair.com", "correct-pass"));
    expect(mockCreateAdminSession).toHaveBeenCalledWith(VALID_ADMIN.id, VALID_ADMIN.email);
  });

  it("calls redirect to /admin", async () => {
    await signInAdmin(makeFormData("admin@nexchair.com", "correct-pass"));
    expect(mockRedirect).toHaveBeenCalledWith("/admin");
  });
});

// ─── Rate limit passes, missing fields ───────────────────────────────────────

describe("signInAdmin — rate limit passes, missing fields", () => {
  beforeEach(() => {
    mockCheckLoginRateLimit.mockResolvedValue({ allowed: true });
  });

  it("returns success: false when email is empty", async () => {
    const result = await signInAdmin(makeFormData("", "password"));
    expect(result?.success).toBe(false);
    expect(result?.message).toContain("required");
  });

  it("returns success: false when password is empty", async () => {
    const result = await signInAdmin(makeFormData("admin@nexchair.com", ""));
    expect(result?.success).toBe(false);
    expect(result?.message).toContain("required");
  });

  it("does not query the DB when fields are missing", async () => {
    await signInAdmin(makeFormData("", ""));
    expect(mockFindUnique).not.toHaveBeenCalled();
  });
});

// ─── Rate limit passes, user not found ───────────────────────────────────────

describe("signInAdmin — rate limit passes, user not found", () => {
  beforeEach(() => {
    mockCheckLoginRateLimit.mockResolvedValue({ allowed: true });
    mockFindUnique.mockResolvedValue(null);
  });

  it("returns 'Invalid email or password' when user not found", async () => {
    const result = await signInAdmin(makeFormData("nobody@example.com", "pass"));
    expect(result?.success).toBe(false);
    expect(result?.message).toMatch(/invalid email or password/i);
  });

  it("does NOT call bcrypt.compare when user is not found", async () => {
    await signInAdmin(makeFormData("nobody@example.com", "pass"));
    expect(mockCompare).not.toHaveBeenCalled();
  });
});

// ─── Rate limit passes, wrong password ───────────────────────────────────────

describe("signInAdmin — rate limit passes, wrong password", () => {
  beforeEach(() => {
    mockCheckLoginRateLimit.mockResolvedValue({ allowed: true });
    mockFindUnique.mockResolvedValue(VALID_ADMIN);
    mockCompare.mockResolvedValue(false);
  });

  it("returns 'Invalid email or password' when password is wrong", async () => {
    const result = await signInAdmin(makeFormData("admin@nexchair.com", "wrong"));
    expect(result?.success).toBe(false);
    expect(result?.message).toMatch(/invalid email or password/i);
  });

  it("does NOT create a session for wrong password", async () => {
    await signInAdmin(makeFormData("admin@nexchair.com", "wrong"));
    expect(mockCreateAdminSession).not.toHaveBeenCalled();
  });
});

// ─── signOutAdmin ─────────────────────────────────────────────────────────────

describe("signOutAdmin", () => {
  it("calls clearAdminSession and redirects to /admin/login", async () => {
    mockClearAdminSession.mockResolvedValue(undefined);
    await signOutAdmin();
    expect(mockClearAdminSession).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });
});
