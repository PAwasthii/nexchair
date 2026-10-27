import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const {
  mockEnquiryCreate,
  mockProductFindMany,
  mockSendEnquiryEmails,
  mockCheckEnquiryRateLimit,
} = vi.hoisted(() => ({
  mockEnquiryCreate: vi.fn(),
  mockProductFindMany: vi.fn(),
  mockSendEnquiryEmails: vi.fn(),
  mockCheckEnquiryRateLimit: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    enquiry: { create: mockEnquiryCreate },
    product: { findMany: mockProductFindMany },
  },
}));

vi.mock("@/lib/email", () => ({
  sendEnquiryEmails: mockSendEnquiryEmails,
}));

vi.mock("@/lib/ratelimit", () => ({
  checkEnquiryRateLimit: mockCheckEnquiryRateLimit,
}));

import { createEnquiry, type CreateEnquiryInput } from "@/app/actions/enquiries";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_CONTACT: CreateEnquiryInput = {
  type: "CONTACT",
  name: "Test User",
  email: "test@example.com",
  message: "Hello",
};

const VALID_ORDER: CreateEnquiryInput = {
  type: "ORDER",
  name: "Order User",
  phone: "+44 7700 900000",
  items: [{ productId: "prod-1", quantity: 2, colour: "Black" }],
};

// Minimal Enquiry row returned by prisma.enquiry.create.
// Must include items[] so the .map() in the action doesn't throw.
const MOCK_ENQUIRY = {
  id: "enq-abc123",
  type: "CONTACT",
  name: "Test User",
  email: "test@example.com",
  phone: null,
  company: null,
  city: null,
  message: "Hello",
  items: [],
};

// ─── Rate limit exceeded ──────────────────────────────────────────────────────

describe("createEnquiry — rate limit exceeded", () => {
  beforeEach(() => {
    mockCheckEnquiryRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 30 });
  });

  it("returns success: false with retry seconds in message", async () => {
    const result = await createEnquiry(VALID_CONTACT);
    expect(result.success).toBe(false);
    expect(result.message).toContain("30");
  });

  it("does NOT call prisma.enquiry.create", async () => {
    await createEnquiry(VALID_CONTACT);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });

  it("does NOT call sendEnquiryEmails", async () => {
    await createEnquiry(VALID_CONTACT);
    expect(mockSendEnquiryEmails).not.toHaveBeenCalled();
  });
});

// ─── Rate limit exceeded, no retryAfterSeconds ───────────────────────────────

describe("createEnquiry — rate limit exceeded, no retryAfterSeconds", () => {
  beforeEach(() => {
    mockCheckEnquiryRateLimit.mockResolvedValue({ allowed: false });
  });

  it("falls back to 60 seconds in the message", async () => {
    const result = await createEnquiry(VALID_CONTACT);
    expect(result.message).toContain("60");
  });
});

// ─── Rate limit passes, valid CONTACT input ───────────────────────────────────

describe("createEnquiry — rate limit passes, valid CONTACT input", () => {
  beforeEach(() => {
    mockCheckEnquiryRateLimit.mockResolvedValue({ allowed: true });
    mockEnquiryCreate.mockResolvedValue(MOCK_ENQUIRY);
    mockSendEnquiryEmails.mockResolvedValue(undefined);
  });

  it("returns success: true with an enquiryId", async () => {
    const result = await createEnquiry(VALID_CONTACT);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.enquiryId).toBe(MOCK_ENQUIRY.id);
    }
  });

  it("calls prisma.enquiry.create once", async () => {
    await createEnquiry(VALID_CONTACT);
    expect(mockEnquiryCreate).toHaveBeenCalledTimes(1);
  });

  it("calls sendEnquiryEmails with the created enquiry data", async () => {
    await createEnquiry(VALID_CONTACT);
    expect(mockSendEnquiryEmails).toHaveBeenCalledWith(
      expect.objectContaining({ enquiryId: MOCK_ENQUIRY.id }),
    );
  });
});

// ─── Rate limit passes, invalid input ────────────────────────────────────────

describe("createEnquiry — rate limit passes, invalid input", () => {
  beforeEach(() => {
    mockCheckEnquiryRateLimit.mockResolvedValue({ allowed: true });
  });

  it("returns success: false for an invalid enquiry type", async () => {
    const result = await createEnquiry({ ...VALID_CONTACT, type: "SPAM" as "CONTACT" });
    expect(result.success).toBe(false);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });

  it("returns success: false when name is missing", async () => {
    const result = await createEnquiry({ ...VALID_CONTACT, name: "" });
    expect(result.success).toBe(false);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });

  it("returns success: false when both email and phone are absent", async () => {
    const result = await createEnquiry({ type: "CONTACT", name: "No Contact" });
    expect(result.success).toBe(false);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });

  it("returns success: false for a malformed email address", async () => {
    const result = await createEnquiry({ ...VALID_CONTACT, email: "not-an-email" });
    expect(result.success).toBe(false);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });

  it("returns success: false for a malformed phone number", async () => {
    const result = await createEnquiry({
      type: "CONTACT",
      name: "Test",
      phone: "!!!bad!!!",
    });
    expect(result.success).toBe(false);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });

  it("returns success: false when message exceeds 2000 characters", async () => {
    const result = await createEnquiry({
      ...VALID_CONTACT,
      message: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });

  it("returns success: false when items array exceeds 50 entries", async () => {
    const items = Array.from({ length: 51 }, (_, i) => ({
      productId: `prod-${i}`,
      quantity: 1,
    }));
    const result = await createEnquiry({ ...VALID_CONTACT, items });
    expect(result.success).toBe(false);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });

  it("returns success: false when a quantity is less than 1", async () => {
    const result = await createEnquiry({
      ...VALID_CONTACT,
      items: [{ productId: "prod-1", quantity: 0 }],
    });
    expect(result.success).toBe(false);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });
});

// ─── Rate limit passes, product validation ────────────────────────────────────

describe("createEnquiry — rate limit passes, product validation", () => {
  beforeEach(() => {
    mockCheckEnquiryRateLimit.mockResolvedValue({ allowed: true });
  });

  it("returns success: false when a productId is not found or inactive", async () => {
    mockProductFindMany.mockResolvedValue([]); // no active products found
    const result = await createEnquiry(VALID_ORDER);
    expect(result.success).toBe(false);
    expect(mockEnquiryCreate).not.toHaveBeenCalled();
  });

  it("returns success: true when all productIds are valid and active", async () => {
    mockProductFindMany.mockResolvedValue([{ id: "prod-1" }]);
    mockEnquiryCreate.mockResolvedValue({
      ...MOCK_ENQUIRY,
      type: "ORDER",
      items: [
        {
          product: { name: "Chair A", code: "NC-001" },
          colour: "Black",
          quantity: 2,
        },
      ],
    });
    mockSendEnquiryEmails.mockResolvedValue(undefined);
    const result = await createEnquiry(VALID_ORDER);
    expect(result.success).toBe(true);
  });

  it("queries products before creating the enquiry", async () => {
    mockProductFindMany.mockResolvedValue([{ id: "prod-1" }]);
    mockEnquiryCreate.mockResolvedValue({ ...MOCK_ENQUIRY, items: [] });
    mockSendEnquiryEmails.mockResolvedValue(undefined);
    await createEnquiry(VALID_ORDER);
    // findMany must be called before create
    const findManyOrder = mockProductFindMany.mock.invocationCallOrder[0];
    const createOrder = mockEnquiryCreate.mock.invocationCallOrder[0];
    expect(findManyOrder).toBeLessThan(createOrder);
  });
});

// ─── Email delivery does not affect enquiry success ──────────────────────────

describe("createEnquiry — email delivery does not affect enquiry success", () => {
  // The real sendEnquiryEmails never throws (it catches all errors internally).
  // The enquiry is stored in the DB regardless of whether email delivery works.
  // Here we verify that the action returns success after the DB write even when
  // the email function resolves (the expected, non-throwing behavior).
  beforeEach(() => {
    mockCheckEnquiryRateLimit.mockResolvedValue({ allowed: true });
    mockEnquiryCreate.mockResolvedValue(MOCK_ENQUIRY);
    mockSendEnquiryEmails.mockResolvedValue(undefined);
  });

  it("returns success: true after DB write regardless of email result", async () => {
    const result = await createEnquiry(VALID_CONTACT);
    expect(result.success).toBe(true);
  });

  it("always calls sendEnquiryEmails after a successful DB write", async () => {
    await createEnquiry(VALID_CONTACT);
    expect(mockSendEnquiryEmails).toHaveBeenCalledTimes(1);
  });
});
