import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EnquiryEmailData = {
  enquiryId: string;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  city: string | null;
  message: string | null;
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
    process.env.ADMIN_EMAIL
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

function buildInternalHtml(data: EnquiryEmailData): string {
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");
  const adminLink = appUrl
    ? `<p><a href="${esc(appUrl)}/admin/enquiries/${esc(data.enquiryId)}">View in admin panel →</a></p>`
    : `<p>Enquiry ID: <code>${esc(data.enquiryId)}</code></p>`;

  const rows = [
    ["Type", typeLabel(data.type)],
    ["Name", data.name],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Company", data.company],
    ["City", data.city],
  ]
    .filter(([, v]) => !!v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${esc(k)}</td>` +
        `<td style="padding:4px 0;vertical-align:top">${esc(v as string)}</td></tr>`,
    )
    .join("");

  const itemsSection =
    data.items.length > 0
      ? `<h3 style="margin:24px 0 8px">Products requested</h3>
         <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
           <thead>
             <tr>
               <th style="text-align:left;padding:4px 12px 4px 0;border-bottom:1px solid #e5e7eb">Product</th>
               <th style="text-align:left;padding:4px 12px 4px 0;border-bottom:1px solid #e5e7eb">Code</th>
               <th style="text-align:left;padding:4px 12px 4px 0;border-bottom:1px solid #e5e7eb">Colour</th>
               <th style="text-align:right;padding:4px 0;border-bottom:1px solid #e5e7eb">Qty</th>
             </tr>
           </thead>
           <tbody>
             ${data.items
               .map(
                 (item) =>
                   `<tr>
                     <td style="padding:4px 12px 4px 0">${esc(item.productName)}</td>
                     <td style="padding:4px 12px 4px 0;color:#666;font-size:12px">${esc(item.productCode)}</td>
                     <td style="padding:4px 12px 4px 0;color:#666">${esc(item.colour ?? "—")}</td>
                     <td style="padding:4px 0;text-align:right;font-weight:600">${item.quantity}</td>
                   </tr>`,
               )
               .join("")}
           </tbody>
         </table>`
      : "";

  const messageSection = data.message
    ? `<h3 style="margin:24px 0 8px">Message</h3>
       <p style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:6px;font-size:14px">${esc(data.message)}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;font-size:15px;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <p style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.1em">NexChair · New enquiry</p>
  <h2 style="margin:4px 0 20px">New ${esc(typeLabel(data.type))} from ${esc(data.name)}</h2>
  <table cellpadding="0" cellspacing="0" style="font-size:14px">${rows}</table>
  ${itemsSection}
  ${messageSection}
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
  ${adminLink}
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
 * Send internal notification and optional customer acknowledgement after a
 * successful enquiry DB write. Never throws — email failures are logged and
 * the enquiry is preserved regardless.
 *
 * Hostinger SMTP settings (verify in hPanel → Email → Manage):
 *   SMTP_HOST=smtp.hostinger.com
 *   SMTP_PORT=465   SMTP_SECURE=true   (SSL — recommended)
 *   SMTP_PORT=587   SMTP_SECURE=false  (STARTTLS — alternative)
 *   SMTP_USER=<full mailbox address, e.g. hello@yourdomain.com>
 *   SMTP_PASSWORD=<mailbox password — NOT your Hostinger account password>
 *   EMAIL_FROM="NexChair <hello@yourdomain.com>"
 *   ADMIN_EMAIL=admin@yourdomain.com
 */
export async function sendEnquiryEmails(
  data: EnquiryEmailData,
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.EMAIL_FROM;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!host || !user || !pass || !from || !adminEmail) {
    console.warn(
      "[email] Notifications skipped — SMTP_HOST, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM, or ADMIN_EMAIL not configured.",
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
        to: adminEmail,
        subject: `New ${typeLabel(data.type)} enquiry from ${data.name} — NexChair`,
        html: buildInternalHtml(data),
      },
      "internal notification",
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
