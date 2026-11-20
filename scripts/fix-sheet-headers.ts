/**
 * One-time script: stamps the correct 11-column header row (A1:K1) on the
 * "Website Enquiries" sheet. Run once after deploying the updated sheets.ts.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/fix-sheet-headers.ts
 *
 * Existing data rows are preserved — only row 1 is overwritten.
 */

import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });

import { SignJWT, importPKCS8 } from "jose";

// ─── Target headers (must match buildSheetRow column order in lib/sheets.ts) ──

const HEADERS = [
  "Submission Date & Time", // A  col 1
  "Lead ID",                // B  col 2  ← duplicate-check key
  "Enquiry Type",           // C  col 3
  "Customer Name",          // D  col 4
  "Company Name",           // E  col 5
  "Phone / WhatsApp",       // F  col 6
  "Email",                  // G  col 7
  "Model of Interest",      // H  col 8
  "Number of Seats",        // I  col 9
  "Additional Requirements",// J  col 10
  "Lead Source",            // K  col 11
];

// ─── Config ───────────────────────────────────────────────────────────────────

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAME     = process.env.GOOGLE_SHEETS_SHEET_NAME;
const CLIENT_EMAIL   = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const RAW_KEY        = process.env.GOOGLE_PRIVATE_KEY;

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getAccessToken(rawPrivateKey: string, clientEmail: string): Promise<string> {
  const pem = rawPrivateKey.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(pem, "RS256");

  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/spreadsheets",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  if (!SPREADSHEET_ID || !SHEET_NAME || !CLIENT_EMAIL || !RAW_KEY) {
    throw new Error(
      "Missing required env vars. Ensure .env.local contains:\n" +
        "  GOOGLE_SHEETS_SPREADSHEET_ID\n" +
        "  GOOGLE_SHEETS_SHEET_NAME\n" +
        "  GOOGLE_SERVICE_ACCOUNT_EMAIL\n" +
        "  GOOGLE_PRIVATE_KEY",
    );
  }

  console.log(`Authenticating as ${CLIENT_EMAIL}...`);
  const token = await getAccessToken(RAW_KEY, CLIENT_EMAIL);
  console.log("Authentication successful.");

  // Read current row 1 so we can show what is being replaced.
  const readRange = encodeURIComponent(`'${SHEET_NAME}'!A1:Z1`);
  const readRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${readRange}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (readRes.ok) {
    const readData = (await readRes.json()) as { values?: string[][] };
    const current = readData.values?.[0] ?? [];
    console.log(`\nCurrent row 1 (${current.length} col${current.length !== 1 ? "s" : ""}):`);
    current.forEach((v, i) => console.log(`  col ${i + 1}: ${v}`));
  }

  // Overwrite only row 1 (A1:K1). All other rows are unaffected.
  const updateRange = encodeURIComponent(`'${SHEET_NAME}'!A1:K1`);
  const updateUrl =
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}` +
    `/values/${updateRange}?valueInputOption=RAW`;

  console.log(`\nWriting ${HEADERS.length} headers to '${SHEET_NAME}'!A1:K1...`);

  const updateRes = await fetch(updateUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [HEADERS] }),
  });

  if (!updateRes.ok) {
    const body = await updateRes.text();
    throw new Error(`Header update failed ${updateRes.status}: ${body}`);
  }

  const updateData = (await updateRes.json()) as { updatedCells?: number };
  console.log(`\nDone. Updated ${updateData.updatedCells ?? HEADERS.length} cells.`);
  console.log("New row 1:");
  HEADERS.forEach((h, i) => console.log(`  col ${i + 1} (${String.fromCharCode(65 + i)}): ${h}`));
}

main().catch((err: unknown) => {
  console.error("\nError:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
