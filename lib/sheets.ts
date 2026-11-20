import "server-only";

import { SignJWT, importPKCS8 } from "jose";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EnquirySheetData = {
  enquiryId: string;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  message: string | null;
  createdAt: Date;
  items: ReadonlyArray<{
    productName: string;
    productCode: string;
    colour: string | null;
    quantity: number;
  }>;
};

// ─── Config check ─────────────────────────────────────────────────────────────

export function isSheetsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
    process.env.GOOGLE_SHEETS_SHEET_NAME &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIST(d: Date): string {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "long",
    timeStyle: "short",
  });
}

// Contact and Quote enquiries pack structured fields into the message column:
//   "Model of interest: X\nNumber of seats: Y\nAdditional info: Z"
function parseContactMessage(message: string | null): {
  modelOfInterest: string | null;
  numberOfSeats: string | null;
  additionalInfo: string | null;
} {
  if (!message)
    return { modelOfInterest: null, numberOfSeats: null, additionalInfo: null };

  const lines = message.split("\n");
  let modelOfInterest: string | null = null;
  let numberOfSeats: string | null = null;
  const extra: string[] = [];

  for (const line of lines) {
    const m = line.match(/^Model of interest:\s*(.+)$/);
    const s = line.match(/^Number of seats:\s*(.+)$/);
    const a = line.match(/^Additional info:\s*([\s\S]*)$/);

    if (m) {
      modelOfInterest = m[1].trim();
    } else if (s) {
      numberOfSeats = s[1].trim();
    } else if (a) {
      if (a[1].trim()) extra.push(a[1].trim());
    } else if (line.trim()) {
      extra.push(line);
    }
  }

  return {
    modelOfInterest,
    numberOfSeats,
    additionalInfo: extra.join("\n") || null,
  };
}

// ─── Row builder ──────────────────────────────────────────────────────────────

/**
 * Columns (A–K):
 *  1  Submission Date & Time
 *  2  Lead ID
 *  3  Enquiry Type
 *  4  Customer Name
 *  5  Company Name
 *  6  Phone / WhatsApp
 *  7  Email
 *  8  Model of Interest
 *  9  Number of Seats
 * 10  Additional Requirements
 * 11  Lead Source
 */
export function buildSheetRow(data: EnquirySheetData): string[] {
  const isOrder = data.type === "ORDER";

  // Prefer phone; fall back to whatsapp if only one was provided.
  const phone = data.phone ?? data.whatsapp ?? "";

  let modelOfInterest = "";
  let numberOfSeats = "";
  let additionalRequirements = "";

  if (isOrder) {
    // Derive from items array — no structured message field on order enquiries.
    modelOfInterest = data.items.map((i) => i.productName).join("; ");
    const totalQty = data.items.reduce((s, i) => s + i.quantity, 0);
    numberOfSeats = totalQty > 0 ? String(totalQty) : "";
    const lines = data.items.map(
      (i) =>
        `${i.productName} (${i.productCode})${i.colour ? ` – ${i.colour}` : ""} × ${i.quantity}`,
    );
    if (data.message) lines.push(data.message);
    additionalRequirements = lines.join("\n");
  } else {
    const parsed = parseContactMessage(data.message);
    modelOfInterest = parsed.modelOfInterest ?? "";
    numberOfSeats = parsed.numberOfSeats ?? "";
    additionalRequirements = parsed.additionalInfo ?? "";
  }

  return [
    formatIST(data.createdAt),  //  1. Submission Date & Time
    data.enquiryId,              //  2. Lead ID
    data.type,                   //  3. Enquiry Type
    data.name,                   //  4. Customer Name
    data.company ?? "",          //  5. Company Name
    phone,                       //  6. Phone / WhatsApp
    data.email ?? "",            //  7. Email
    modelOfInterest,             //  8. Model of Interest
    numberOfSeats,               //  9. Number of Seats
    additionalRequirements,      // 10. Additional Requirements
    "Website",                   // 11. Lead Source
  ];
}

// ─── Service-account auth ─────────────────────────────────────────────────────

async function getAccessToken(
  rawPrivateKey: string,
  clientEmail: string,
): Promise<string> {
  // Handles both real newlines (dotenv-parsed) and escaped \\n (Vercel env vars).
  const pem = rawPrivateKey.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(pem, "RS256");

  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/spreadsheets",
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed ${res.status}: ${body}`);
  }

  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Token exchange returned no access_token");
  return json.access_token;
}

// ─── Duplicate guard ──────────────────────────────────────────────────────────

// Fetch column B (Lead ID column) and check whether this enquiry was already
// synced. Fails open on any error so a lookup failure never blocks the append.
async function enquiryAlreadySynced(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  enquiryId: string,
): Promise<boolean> {
  const range = encodeURIComponent(`'${sheetName}'!B:B`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { values?: string[][] };
    return (data.values ?? []).flat().includes(enquiryId);
  } catch {
    return false;
  }
}

// ─── Append ───────────────────────────────────────────────────────────────────

async function appendRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  row: string[],
): Promise<void> {
  const range = encodeURIComponent(`'${sheetName}'!A:K`);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}` +
    `/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets append failed ${res.status}: ${body}`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Append one row to the configured Google Sheet after a successful enquiry
 * DB write. Never throws — failures are logged and the enquiry is preserved.
 *
 * Required env vars:
 *   GOOGLE_SHEETS_SPREADSHEET_ID  — spreadsheet ID from the URL
 *   GOOGLE_SHEETS_SHEET_NAME      — exact worksheet tab name
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  — service account email
 *   GOOGLE_PRIVATE_KEY            — RSA private key (\\n may be escaped)
 *
 * Limitation: in the basic implementation both email and Sheets run
 * concurrently before the server action returns. A queue-based approach
 * would fully decouple Sheets latency from the form response time.
 */
export async function appendEnquiryToSheet(
  data: EnquirySheetData,
): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName     = process.env.GOOGLE_SHEETS_SHEET_NAME;
  const clientEmail   = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey        = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId || !sheetName || !clientEmail || !rawKey) {
    console.warn(
      "[sheets] Skipped — GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_SHEET_NAME, " +
        "GOOGLE_SERVICE_ACCOUNT_EMAIL, or GOOGLE_PRIVATE_KEY not configured.",
    );
    return;
  }

  try {
    const token = await getAccessToken(rawKey, clientEmail);

    const duplicate = await enquiryAlreadySynced(
      token,
      spreadsheetId,
      sheetName,
      data.enquiryId,
    );
    if (duplicate) {
      console.warn(
        `[sheets] Skipped duplicate — enquiry ${data.enquiryId} already in sheet.`,
      );
      return;
    }

    const row = buildSheetRow(data);
    await appendRow(token, spreadsheetId, sheetName, row);
    console.log(
      `[sheets] Appended enquiry ${data.enquiryId} to "${sheetName}".`,
    );
  } catch (err) {
    const msg  = err instanceof Error ? err.message : String(err);
    // Never echo private-key content in logs.
    const safe = msg
      .replace(/-----BEGIN[\s\S]*?-----END[^\n]*-----/g, "[REDACTED]")
      .replace(/PRIVATE\s+KEY/gi, "[REDACTED]");
    console.error(
      `[sheets] Failed to append enquiry ${data.enquiryId}: ${safe}`,
    );
  }
}
