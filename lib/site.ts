const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "917798203669";
const digits = raw.replace(/[^\d]/g, "");

export const whatsappHref = `https://wa.me/${digits}`;

// ── Contact basics ────────────────────────────────────────────────────────────

export const contactPhone = "+91 77982 03669";
export const contactPhoneHref = "tel:+917798203669";

export const contactEmail = "sales.officemantra@gmail.com";
export const contactEmailHref = "mailto:sales.officemantra@gmail.com";

// ── Footer – short address ────────────────────────────────────────────────────

export const contactAddress = "Chakan Talegoan Road, Chakan, Pune, Maharashtra – 410501";
export const contactAddressHref =
  "https://maps.google.com/?q=Chakan+Talegoan+Road,+Chakan,+Pune,+Maharashtra+410501";

// ── Contact page – two branch locations ──────────────────────────────────────

export const contactAddress1Label = "Chakan";
export const contactAddress1 =
  "Chakan Talegoan Road, Opp HDFC Bank, Near Mahalunge Kaman/Gate, Mahalunge Ingle, Chakan, Pune, Maharashtra – 410501";
export const contactAddress1Href =
  "https://maps.google.com/?q=Chakan+Talegoan+Road+Opp+HDFC+Bank+Mahalunge+Ingle+Chakan+Pune+Maharashtra+410501";

export const contactAddress2Label = "Balewadi";
export const contactAddress2 =
  "Opposite PALAZZO APARTMENT, Balewadi, Pune, Maharashtra – 411045";
export const contactAddress2Href =
  "https://maps.google.com/?q=Opposite+PALAZZO+APARTMENT+Balewadi+Pune+Maharashtra+411045";

// ── Business hours ────────────────────────────────────────────────────────────

export const businessHours = [
  { days: "Monday – Saturday", time: "9:30 AM – 8:00 PM" },
  { days: "Sunday", time: "Closed" },
] as const;
