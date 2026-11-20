import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

// Hoist mock handles before the vi.mock factory is evaluated.
const { mockSign, mockImportPKCS8 } = vi.hoisted(() => ({
  mockSign: vi.fn().mockResolvedValue("mock.jwt.token"),
  mockImportPKCS8: vi.fn().mockResolvedValue("mock-private-key"),
}));

vi.mock("jose", () => ({
  // Must use regular `function` so vitest accepts it as a constructable class.
  SignJWT: vi.fn().mockImplementation(function () {
    return {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setIssuer: vi.fn().mockReturnThis(),
      setSubject: vi.fn().mockReturnThis(),
      setAudience: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: mockSign,
    };
  }),
  importPKCS8: mockImportPKCS8,
}));

import {
  appendEnquiryToSheet,
  buildSheetRow,
  isSheetsConfigured,
} from "@/lib/sheets";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FULL_CONFIG = {
  GOOGLE_SHEETS_SPREADSHEET_ID: "spreadsheet-id",
  GOOGLE_SHEETS_SHEET_NAME: "Website Enquiries",
  GOOGLE_SERVICE_ACCOUNT_EMAIL: "sa@project.iam.gserviceaccount.com",
  GOOGLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nMOCK\\n-----END PRIVATE KEY-----",
};

const SHEETS_KEYS = Object.keys(FULL_CONFIG) as (keyof typeof FULL_CONFIG)[];

function setEnv(overrides: Partial<Record<string, string>>) {
  SHEETS_KEYS.forEach((k) => delete process.env[k]);
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

const CONTACT_ENQUIRY = {
  enquiryId: "cltest0000000000",
  type: "CONTACT",
  name: "Test Customer",
  email: "customer@example.com",
  phone: "+91 98765 43210",
  whatsapp: null,
  company: "ACME Ltd",
  message:
    "Model of interest: Ergonomic task\nNumber of seats: 6–20\nAdditional info: Near the window please",
  createdAt: new Date("2024-01-15T05:00:00.000Z"), // 10:30 IST
  items: [],
} as const;

const ORDER_ENQUIRY = {
  enquiryId: "cltest1111111111",
  type: "ORDER",
  name: "Order Customer",
  email: null,
  phone: "+91 11111 22222",
  whatsapp: null,
  company: null,
  message: "Please deliver before Friday",
  createdAt: new Date("2024-01-15T05:00:00.000Z"),
  items: [
    { productName: "ErgoMax Pro", productCode: "NC-001", colour: "Black", quantity: 2 },
    { productName: "TaskPro Chair", productCode: "NC-002", colour: null, quantity: 1 },
  ],
} as const;

// Token exchange OK + duplicate-check empty + append OK
function mockFetchSuccess() {
  return vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "mock-token" }),
      text: async () => "",
    } as unknown as Response)
    // duplicate check — no existing IDs
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ values: [] }),
      text: async () => "",
    } as unknown as Response)
    // append OK
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
      text: async () => "",
    } as unknown as Response);
}

// ─── isSheetsConfigured ───────────────────────────────────────────────────────

describe("isSheetsConfigured", () => {
  afterEach(() => setEnv({}));

  it("returns true when all vars are set", () => {
    setEnv(FULL_CONFIG);
    expect(isSheetsConfigured()).toBe(true);
  });

  it("returns false when GOOGLE_SHEETS_SPREADSHEET_ID is missing", () => {
    setEnv(without(FULL_CONFIG, "GOOGLE_SHEETS_SPREADSHEET_ID"));
    expect(isSheetsConfigured()).toBe(false);
  });

  it("returns false when GOOGLE_SHEETS_SHEET_NAME is missing", () => {
    setEnv(without(FULL_CONFIG, "GOOGLE_SHEETS_SHEET_NAME"));
    expect(isSheetsConfigured()).toBe(false);
  });

  it("returns false when GOOGLE_SERVICE_ACCOUNT_EMAIL is missing", () => {
    setEnv(without(FULL_CONFIG, "GOOGLE_SERVICE_ACCOUNT_EMAIL"));
    expect(isSheetsConfigured()).toBe(false);
  });

  it("returns false when GOOGLE_PRIVATE_KEY is missing", () => {
    setEnv(without(FULL_CONFIG, "GOOGLE_PRIVATE_KEY"));
    expect(isSheetsConfigured()).toBe(false);
  });
});

// ─── buildSheetRow ─────────────────────────────────────────────────────────────

describe("buildSheetRow — CONTACT type", () => {
  it("maps all 11 columns", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row).toHaveLength(11);
  });

  it("puts enquiryId in column 2 (index 1)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[1]).toBe(CONTACT_ENQUIRY.enquiryId);
  });

  it("puts type in column 3 (index 2)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[2]).toBe("CONTACT");
  });

  it("puts name in column 4 (index 3)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[3]).toBe("Test Customer");
  });

  it("puts company in column 5 (index 4)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[4]).toBe("ACME Ltd");
  });

  it("puts phone in column 6 (index 5)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[5]).toBe("+91 98765 43210");
  });

  it("puts email in column 7 (index 6)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[6]).toBe("customer@example.com");
  });

  it("parses Model of interest into column 8 (index 7)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[7]).toBe("Ergonomic task");
  });

  it("parses Number of seats into column 9 (index 8)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[8]).toBe("6–20");
  });

  it("parses Additional info into column 10 (index 9)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[9]).toBe("Near the window please");
  });

  it("sets Lead Source to Website in column 11 (index 10)", () => {
    const row = buildSheetRow(CONTACT_ENQUIRY);
    expect(row[10]).toBe("Website");
  });

  it("falls back to whatsapp when phone is null", () => {
    const row = buildSheetRow({ ...CONTACT_ENQUIRY, phone: null, whatsapp: "+91 55555 66666" });
    expect(row[5]).toBe("+91 55555 66666");
  });

  it("leaves optional fields blank when absent", () => {
    const row = buildSheetRow({
      ...CONTACT_ENQUIRY,
      company: null,
      email: null,
      message: null,
    });
    expect(row[4]).toBe("");  // company
    expect(row[6]).toBe("");  // email
    expect(row[7]).toBe("");  // model of interest
    expect(row[8]).toBe("");  // number of seats
    expect(row[9]).toBe("");  // additional requirements
  });
});

describe("buildSheetRow — ORDER type", () => {
  it("maps all 11 columns", () => {
    const row = buildSheetRow(ORDER_ENQUIRY);
    expect(row).toHaveLength(11);
  });

  it("joins product names into column 8 (Model of Interest)", () => {
    const row = buildSheetRow(ORDER_ENQUIRY);
    expect(row[7]).toContain("ErgoMax Pro");
    expect(row[7]).toContain("TaskPro Chair");
  });

  it("puts total quantity in column 9 (Number of Seats)", () => {
    const row = buildSheetRow(ORDER_ENQUIRY);
    expect(row[8]).toBe("3"); // 2 + 1
  });

  it("includes product breakdown in column 10 (Additional Requirements)", () => {
    const row = buildSheetRow(ORDER_ENQUIRY);
    expect(row[9]).toContain("ErgoMax Pro");
    expect(row[9]).toContain("NC-001");
    expect(row[9]).toContain("Black");
    expect(row[9]).toContain("× 2");
    expect(row[9]).toContain("TaskPro Chair");
    expect(row[9]).toContain("× 1");
  });

  it("includes order notes in column 10", () => {
    const row = buildSheetRow(ORDER_ENQUIRY);
    expect(row[9]).toContain("Please deliver before Friday");
  });
});

// ─── appendEnquiryToSheet — config missing ────────────────────────────────────

describe("appendEnquiryToSheet — config missing", () => {
  beforeEach(() => setEnv({}));
  afterEach(() => setEnv({}));

  it("returns without throwing when config is absent", async () => {
    await expect(
      appendEnquiryToSheet(CONTACT_ENQUIRY),
    ).resolves.toBeUndefined();
  });

  it("logs a warning when config is absent", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await appendEnquiryToSheet(CONTACT_ENQUIRY);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("not configured"));
    warn.mockRestore();
  });

  it("does not call fetch when config is absent", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    await appendEnquiryToSheet(CONTACT_ENQUIRY);
    expect(mockFetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

// ─── appendEnquiryToSheet — auth failure ─────────────────────────────────────

describe("appendEnquiryToSheet — auth failure", () => {
  beforeEach(() => setEnv(FULL_CONFIG));
  afterEach(() => { setEnv({}); vi.unstubAllGlobals(); });

  it("does not throw when token exchange fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "invalid_grant",
    }));
    await expect(
      appendEnquiryToSheet(CONTACT_ENQUIRY),
    ).resolves.toBeUndefined();
  });

  it("logs an error when token exchange fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "invalid_grant",
    }));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await appendEnquiryToSheet(CONTACT_ENQUIRY);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

// ─── appendEnquiryToSheet — duplicate prevention ─────────────────────────────

describe("appendEnquiryToSheet — duplicate prevention", () => {
  beforeEach(() => setEnv(FULL_CONFIG));
  afterEach(() => { setEnv({}); vi.unstubAllGlobals(); });

  it("skips append when Lead ID is already in the sheet", async () => {
    const mockFetch = vi.fn()
      // token exchange
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "tok" }),
        text: async () => "",
      })
      // duplicate check — returns the same enquiryId
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: [["Lead ID"], [CONTACT_ENQUIRY.enquiryId]] }),
        text: async () => "",
      });

    vi.stubGlobal("fetch", mockFetch);
    await appendEnquiryToSheet(CONTACT_ENQUIRY);

    // append (3rd fetch call) must NOT happen
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("logs a warning when duplicate is detected", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "tok" }),
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: [[CONTACT_ENQUIRY.enquiryId]] }),
        text: async () => "",
      }));

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await appendEnquiryToSheet(CONTACT_ENQUIRY);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("duplicate"));
    warn.mockRestore();
  });

  it("proceeds with append when enquiry ID is not in the sheet", async () => {
    const mockFetch = mockFetchSuccess();
    vi.stubGlobal("fetch", mockFetch);
    await appendEnquiryToSheet(CONTACT_ENQUIRY);
    // All 3 fetch calls should have been made: token + duplicate-check + append
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});

// ─── appendEnquiryToSheet — successful append ────────────────────────────────

describe("appendEnquiryToSheet — successful append", () => {
  beforeEach(() => setEnv(FULL_CONFIG));
  afterEach(() => { setEnv({}); vi.unstubAllGlobals(); });

  it("calls the Sheets append endpoint with Bearer token", async () => {
    const mockFetch = mockFetchSuccess();
    vi.stubGlobal("fetch", mockFetch);
    await appendEnquiryToSheet(CONTACT_ENQUIRY);

    const appendCall = mockFetch.mock.calls[2];
    const [url, opts] = appendCall as [string, RequestInit];
    expect(url).toContain("spreadsheets");
    expect(url).toContain("append");
    expect((opts.headers as Record<string, string>)["Authorization"]).toBe(
      "Bearer mock-token",
    );
  });

  it("sends the enquiry row in the request body", async () => {
    const mockFetch = mockFetchSuccess();
    vi.stubGlobal("fetch", mockFetch);
    await appendEnquiryToSheet(CONTACT_ENQUIRY);

    const appendCall = mockFetch.mock.calls[2];
    const body = JSON.parse(appendCall[1].body as string) as { values: string[][] };
    expect(body.values).toHaveLength(1);
    expect(body.values[0][1]).toBe(CONTACT_ENQUIRY.enquiryId); // Lead ID in col 2
    expect(body.values[0][3]).toBe(CONTACT_ENQUIRY.name);       // Name in col 4
  });

  it("does not throw on success", async () => {
    vi.stubGlobal("fetch", mockFetchSuccess());
    await expect(
      appendEnquiryToSheet(CONTACT_ENQUIRY),
    ).resolves.toBeUndefined();
  });
});

// ─── appendEnquiryToSheet — Sheets API failure ───────────────────────────────

describe("appendEnquiryToSheet — Sheets API failure", () => {
  beforeEach(() => setEnv(FULL_CONFIG));
  afterEach(() => { setEnv({}); vi.unstubAllGlobals(); });

  it("does not throw when the append request fails", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "tok" }),
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: [] }),
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "PERMISSION_DENIED",
      }));

    await expect(
      appendEnquiryToSheet(CONTACT_ENQUIRY),
    ).resolves.toBeUndefined();
  });

  it("logs an error when the append request fails", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "tok" }),
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: [] }),
        text: async () => "",
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "PERMISSION_DENIED",
      }));

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await appendEnquiryToSheet(CONTACT_ENQUIRY);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("does not expose PRIVATE KEY in error logs", async () => {
    // Simulate a PEM-related error message
    mockSign.mockRejectedValueOnce(new Error("PRIVATE KEY parsing failed"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    setEnv(FULL_CONFIG);
    await appendEnquiryToSheet(CONTACT_ENQUIRY);
    const logged = spy.mock.calls.flat().join(" ");
    expect(logged).not.toMatch(/PRIVATE\s*KEY/i);
    spy.mockRestore();
    mockSign.mockResolvedValue("mock.jwt.token");
  });
});
