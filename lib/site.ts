const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const digits = raw.replace(/[^\d]/g, "");

export const whatsappHref = digits
  ? `https://wa.me/${digits}`
  : "https://wa.me/";
