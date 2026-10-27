import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// "server-only" throws at import time unless mocked.
vi.mock("server-only", () => ({}));

// vi.mock factories are hoisted above variable declarations, so we must use
// vi.hoisted() to ensure mockSendMail is defined before the factory runs.
const { mockSendMail } = vi.hoisted(() => ({ mockSendMail: vi.fn() }));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({ sendMail: mockSendMail }),
  },
}));

import nodemailer from "nodemailer";
import { sendEnquiryEmails, isEmailConfigured } from "@/lib/email";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FULL_CONFIG = {
  SMTP_HOST: "smtp.hostinger.com",
  SMTP_PORT: "465",
  SMTP_SECURE: "true",
  SMTP_USER: "hello@nexchair.com",
  SMTP_PASSWORD: "s3cr3t",
  EMAIL_FROM: "NexChair <hello@nexchair.com>",
  ADMIN_EMAIL: "admin@nexchair.com",
};

const MINIMAL_ENQUIRY = {
  enquiryId: "cltest0000000000",
  type: "CONTACT",
  name: "Test User",
  email: "customer@example.com",
  phone: null,
  company: null,
  city: null,
  message: "Hello",
  items: [],
} as const;

const SMTP_KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "EMAIL_FROM",
  "ADMIN_EMAIL",
  "APP_URL",
];

function setEnv(overrides: Partial<Record<string, string>>) {
  SMTP_KEYS.forEach((k) => delete process.env[k]);
  Object.entries(overrides).forEach(([k, v]) => {
    if (v !== undefined) process.env[k] = v;
  });
}

function without(
  config: Record<string, string>,
  key: string,
): Record<string, string> {
  const copy = { ...config };
  delete copy[key];
  return copy;
}

// ─── isEmailConfigured ────────────────────────────────────────────────────────

describe("isEmailConfigured", () => {
  afterEach(() => setEnv({}));

  it("returns true when all required vars are set", () => {
    setEnv(FULL_CONFIG);
    expect(isEmailConfigured()).toBe(true);
  });

  it("returns false when SMTP_HOST is missing", () => {
    setEnv(without(FULL_CONFIG, "SMTP_HOST"));
    expect(isEmailConfigured()).toBe(false);
  });

  it("returns false when SMTP_USER is missing", () => {
    setEnv(without(FULL_CONFIG, "SMTP_USER"));
    expect(isEmailConfigured()).toBe(false);
  });

  it("returns false when SMTP_PASSWORD is missing", () => {
    setEnv(without(FULL_CONFIG, "SMTP_PASSWORD"));
    expect(isEmailConfigured()).toBe(false);
  });

  it("returns false when EMAIL_FROM is missing", () => {
    setEnv(without(FULL_CONFIG, "EMAIL_FROM"));
    expect(isEmailConfigured()).toBe(false);
  });

  it("returns false when ADMIN_EMAIL is missing", () => {
    setEnv(without(FULL_CONFIG, "ADMIN_EMAIL"));
    expect(isEmailConfigured()).toBe(false);
  });
});

// ─── sendEnquiryEmails — config missing ───────────────────────────────────────

describe("sendEnquiryEmails — config missing", () => {
  beforeEach(() => setEnv({}));
  afterEach(() => setEnv({}));

  it("returns without throwing when SMTP config is absent", async () => {
    await expect(sendEnquiryEmails(MINIMAL_ENQUIRY)).resolves.toBeUndefined();
  });

  it("does not call nodemailer when config is absent", async () => {
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("logs a warning (not an error) when config is absent", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("skipped"));
    warn.mockRestore();
  });
});

// ─── sendEnquiryEmails — transporter creation ─────────────────────────────────

describe("sendEnquiryEmails — transporter creation", () => {
  afterEach(() => setEnv({}));

  it("creates transporter with SSL when SMTP_PORT=465 and SMTP_SECURE=true", async () => {
    setEnv({ ...FULL_CONFIG, SMTP_PORT: "465", SMTP_SECURE: "true" });
    mockSendMail.mockResolvedValue({});
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: "smtp.hostinger.com", port: 465, secure: true }),
    );
  });

  it("creates transporter with STARTTLS when SMTP_PORT=587 and SMTP_SECURE=false", async () => {
    setEnv({ ...FULL_CONFIG, SMTP_PORT: "587", SMTP_SECURE: "false" });
    mockSendMail.mockResolvedValue({});
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587, secure: false }),
    );
  });

  it("defaults secure to true when SMTP_PORT=465 and SMTP_SECURE is unset", async () => {
    setEnv({ ...without(FULL_CONFIG, "SMTP_SECURE"), SMTP_PORT: "465" });
    mockSendMail.mockResolvedValue({});
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 465, secure: true }),
    );
  });

  it("defaults secure to false when SMTP_PORT=587 and SMTP_SECURE is unset", async () => {
    setEnv({ ...without(FULL_CONFIG, "SMTP_SECURE"), SMTP_PORT: "587" });
    mockSendMail.mockResolvedValue({});
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587, secure: false }),
    );
  });
});

// ─── sendEnquiryEmails — successful send ──────────────────────────────────────

describe("sendEnquiryEmails — successful send", () => {
  beforeEach(() => {
    setEnv(FULL_CONFIG);
    mockSendMail.mockResolvedValue({});
  });
  afterEach(() => setEnv({}));

  it("sends internal notification to ADMIN_EMAIL", async () => {
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    const calls = mockSendMail.mock.calls.map((c) => c[0]);
    const internal = calls.find((c) => c.to === FULL_CONFIG.ADMIN_EMAIL);
    expect(internal).toBeDefined();
    expect(internal.subject).toContain("NexChair");
    expect(internal.subject).toContain(MINIMAL_ENQUIRY.name);
  });

  it("sends customer acknowledgement when customer email is present", async () => {
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    const calls = mockSendMail.mock.calls.map((c) => c[0]);
    const customer = calls.find((c) => c.to === MINIMAL_ENQUIRY.email);
    expect(customer).toBeDefined();
    expect(customer.subject).toContain("received");
  });

  it("does not send customer email when enquiry has no email address", async () => {
    await sendEnquiryEmails({ ...MINIMAL_ENQUIRY, email: null });
    const calls = mockSendMail.mock.calls.map((c) => c[0]);
    expect(calls).toHaveLength(1);
    expect(calls[0].to).toBe(FULL_CONFIG.ADMIN_EMAIL);
  });

  it("sends from EMAIL_FROM address", async () => {
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    mockSendMail.mock.calls.forEach(([payload]) => {
      expect(payload.from).toBe(FULL_CONFIG.EMAIL_FROM);
    });
  });

  it("includes product items in internal notification HTML", async () => {
    const withItems = {
      ...MINIMAL_ENQUIRY,
      items: [
        { productName: "ErgoMax Pro", productCode: "NC-001", colour: "Black", quantity: 2 },
      ],
    };
    await sendEnquiryEmails(withItems);
    const internalHtml = mockSendMail.mock.calls[0][0].html as string;
    expect(internalHtml).toContain("ErgoMax Pro");
    expect(internalHtml).toContain("NC-001");
  });
});

// ─── sendEnquiryEmails — SMTP failure ────────────────────────────────────────

describe("sendEnquiryEmails — SMTP failure", () => {
  beforeEach(() => setEnv(FULL_CONFIG));
  afterEach(() => setEnv({}));

  it("does not throw when sendMail rejects", async () => {
    mockSendMail.mockRejectedValue(new Error("Connection refused"));
    await expect(sendEnquiryEmails(MINIMAL_ENQUIRY)).resolves.toBeUndefined();
  });

  it("logs the error when sendMail rejects", async () => {
    mockSendMail.mockRejectedValue(new Error("Connection refused"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await sendEnquiryEmails(MINIMAL_ENQUIRY);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("still resolves when only the customer email fails", async () => {
    mockSendMail
      .mockResolvedValueOnce({})                            // internal OK
      .mockRejectedValueOnce(new Error("Bounce"));          // customer fails
    await expect(sendEnquiryEmails(MINIMAL_ENQUIRY)).resolves.toBeUndefined();
  });

  it("still resolves when only the internal notification fails", async () => {
    mockSendMail
      .mockRejectedValueOnce(new Error("Auth failed"))      // internal fails
      .mockResolvedValueOnce({});                           // customer OK
    await expect(sendEnquiryEmails(MINIMAL_ENQUIRY)).resolves.toBeUndefined();
  });
});
