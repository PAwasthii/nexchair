import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EnquiryEmailData = {
  enquiryId: string;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  city: string | null;
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

export function isEmailConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.EMAIL_FROM &&
    (process.env.SALES_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL)
  );
}

// ─── Label helpers ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  CONTACT: "Contact",
  QUOTE: "Quote request",
  ORDER: "Order enquiry",
};

function typeLabel(type: string) {
  return TYPE_LABELS[type] ?? type;
}

// ─── HTML builders ────────────────────────────────────────────────────────────

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDatetime(d: Date): string {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "long",
    timeStyle: "short",
  });
}

// The contact form packs three labelled lines into the message field:
//   "Model of interest: X\nNumber of seats: Y\nAdditional info: Z"
// Extract them so they appear as proper rows in the email.
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

function buildRow(
  label: string,
  value: string | null | undefined,
  required = false,
): string {
  if (!value) return "";
  const labelStyle = required
    ? "padding:5px 16px 5px 0;color:#374151;font-weight:600;vertical-align:top;white-space:nowrap;font-size:13px"
    : "padding:5px 16px 5px 0;color:#6b7280;vertical-align:top;white-space:nowrap;font-size:13px";
  return (
    `<tr>` +
    `<td style="${labelStyle}">${esc(label)}</td>` +
    `<td style="padding:5px 0;vertical-align:top;font-size:14px">${esc(value)}</td>` +
    `</tr>`
  );
}

function buildInternalHtml(data: EnquiryEmailData): string {
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");
  const adminLink = appUrl
    ? `<a href="${esc(appUrl)}/admin/enquiries/${esc(data.enquiryId)}" style="color:#0E3159;text-decoration:none">View in admin panel →</a>`
    : `Enquiry&nbsp;ID:&nbsp;<code>${esc(data.enquiryId)}</code>`;

  const isOrder = data.type === "ORDER";
  const parsed = isOrder ? null : parseContactMessage(data.message);

  // Show whatsapp separately only if it differs from phone
  const phoneDisplay =
    data.phone && data.whatsapp && data.phone !== data.whatsapp
      ? `${data.phone} (WhatsApp: ${data.whatsapp})`
      : (data.phone ?? data.whatsapp);

  const rows = [
    buildRow("Name *", data.name, true),
    buildRow("Company", data.company),
    buildRow("Phone / WhatsApp *", phoneDisplay, true),
    buildRow("Email", data.email),
    ...(parsed
      ? [
          buildRow("Model of interest", parsed.modelOfInterest),
          buildRow("Number of seats", parsed.numberOfSeats),
          buildRow("Anything else?", parsed.additionalInfo),
        ]
      : [
          buildRow("City", data.city),
          buildRow("Message", data.message),
        ]),
  ].join("");

  const itemsSection =
    data.items.length > 0
      ? `<h3 style="margin:24px 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Products requested</h3>
         <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;width:100%">
           <thead>
             <tr style="border-bottom:1px solid #e5e7eb">
               <th style="text-align:left;padding:4px 12px 4px 0;color:#6b7280;font-weight:500;font-size:12px">Product</th>
               <th style="text-align:left;padding:4px 12px 4px 0;color:#6b7280;font-weight:500;font-size:12px">Code</th>
               <th style="text-align:left;padding:4px 12px 4px 0;color:#6b7280;font-weight:500;font-size:12px">Colour</th>
               <th style="text-align:right;padding:4px 0;color:#6b7280;font-weight:500;font-size:12px">Qty</th>
             </tr>
           </thead>
           <tbody>
             ${data.items
               .map(
                 (item) =>
                   `<tr>
                     <td style="padding:5px 12px 5px 0">${esc(item.productName)}</td>
                     <td style="padding:5px 12px 5px 0;color:#6b7280;font-size:12px">${esc(item.productCode)}</td>
                     <td style="padding:5px 12px 5px 0;color:#6b7280">${esc(item.colour ?? "—")}</td>
                     <td style="padding:5px 0;text-align:right;font-weight:600">${item.quantity}</td>
                   </tr>`,
               )
               .join("")}
           </tbody>
         </table>`
      : "";

  const orderNotesSection =
    isOrder && data.message
      ? `<h3 style="margin:24px 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Notes</h3>
         <p style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:6px;font-size:14px;margin:0;color:#374151">${esc(data.message)}</p>`
      : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:15px;color:#111827;max-width:600px;margin:0 auto;padding:24px;background:#fff">
  <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px">NexChair &middot; Sales notification</p>
  <h2 style="margin:0 0 4px;font-size:22px;color:#0E3159;font-weight:700">New Website Enquiry</h2>
  <p style="margin:0 0 20px;font-size:13px;color:#6b7280">${esc(typeLabel(data.type))} &middot; ${esc(formatDatetime(data.createdAt))} IST</p>
  <table cellpadding="0" cellspacing="0" style="font-size:14px;width:100%;border-top:2px solid #0E3159;padding-top:12px">
    <tbody>${rows}</tbody>
  </table>
  ${itemsSection}
  ${orderNotesSection}
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
  <p style="font-size:12px;color:#9ca3af;margin:0">* Required &nbsp;&middot;&nbsp; ${adminLink}</p>
</body>
</html>`;
}

function buildCustomerHtml(data: EnquiryEmailData): string {
  const ref = data.enquiryId.slice(0, 8).toUpperCase();

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;font-size:15px;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <p style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.1em">NexChair</p>
  <h2 style="margin:4px 0 20px">We've received your enquiry</h2>
  <p>Hi ${esc(data.name)},</p>
  <p>Thank you for getting in touch. We've received your ${esc(typeLabel(data.type).toLowerCase())} and will be in touch shortly.</p>
  <p style="color:#666;font-size:13px">Reference: <strong>${esc(ref)}</strong></p>
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
  <p style="font-size:13px;color:#999">— The NexChair Team</p>
</body>
</html>`;
}

// ─── Transport ────────────────────────────────────────────────────────────────

type MailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

async function trySend(
  transporter: Transporter,
  payload: MailPayload,
  label: string,
): Promise<void> {
  try {
    await transporter.sendMail(payload);
  } catch (err) {
    console.error(`[email] ${label} failed:`, err);
  }
}

/**
 * Send internal sales notification and optional customer acknowledgement after
 * a successful enquiry DB write. Never throws — email failures are logged and
 * the enquiry is preserved regardless.
 *
 * Required env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM
 *   SALES_NOTIFICATION_EMAIL  — recipient for sales alerts (falls back to ADMIN_EMAIL)
 *
 * Example (Gmail SMTP with App Password):
 *   SMTP_HOST=smtp.gmail.com  SMTP_PORT=587  SMTP_SECURE=false
 *   SMTP_USER=nexchairsales@gmail.com  SMTP_PASSWORD=<16-char app password>
 *   EMAIL_FROM="NexChair <nexchairsales@gmail.com>"
 *   SALES_NOTIFICATION_EMAIL=nexchairsales@gmail.com
 *
 * Example (Hostinger custom domain):
 *   SMTP_HOST=smtp.hostinger.com  SMTP_PORT=465  SMTP_SECURE=true
 *   SMTP_USER=hello@yourdomain.com  SMTP_PASSWORD=<mailbox password>
 *   EMAIL_FROM="NexChair <hello@yourdomain.com>"
 *   SALES_NOTIFICATION_EMAIL=nexchairsales@gmail.com
 */
export async function sendEnquiryEmails(
  data: EnquiryEmailData,
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.EMAIL_FROM;
  const salesEmail =
    process.env.SALES_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;

  if (!host || !user || !pass || !from || !salesEmail) {
    console.warn(
      "[email] Notifications skipped — SMTP_HOST, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM, or SALES_NOTIFICATION_EMAIL not configured.",
    );
    return;
  }

  const port = parseInt(process.env.SMTP_PORT ?? "465", 10);
  // SMTP_SECURE defaults to true (SSL) when port is 465, false otherwise.
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const sends: Promise<void>[] = [];

  sends.push(
    trySend(
      transporter,
      {
        from,
        to: salesEmail,
        subject: `New Website Enquiry from ${data.name} – NexChair`,
        html: buildInternalHtml(data),
      },
      "sales notification",
    ),
  );

  if (data.email) {
    sends.push(
      trySend(
        transporter,
        {
          from,
          to: data.email,
          subject: "We've received your enquiry — NexChair",
          html: buildCustomerHtml(data),
        },
        "customer acknowledgement",
      ),
    );
  }

  await Promise.allSettled(sends);
}
