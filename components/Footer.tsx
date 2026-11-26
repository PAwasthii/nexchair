import Image from "next/image";
import Link from "next/link";

import {
  whatsappHref,
  contactPhone,
  contactPhoneHref,
  contactEmail,
  contactEmailHref,
  contactAddress,
  contactAddressHref,
} from "@/lib/site";

const shop = [
  { label: "Executive Chair", href: "/product-range?category=executive-chair" },
  { label: "Ergonomic Chair", href: "/product-range?category=ergonomic-chair" },
  { label: "Staff Chair",     href: "/product-range?category=staff-chair" },
  { label: "Visitor Chair",   href: "/product-range?category=visitor-chair" },
  { label: "Lounge Chair",    href: "/product-range?category=lounge-chair" },
  { label: "Canteen Chair",   href: "/product-range?category=canteen-chair" },
];

const company = [
  { label: "About",         href: "/about" },
  { label: "Product Range", href: "/product-range" },
  { label: "Bulk orders",   href: "/contact" },
  { label: "Contact",       href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="px-6 py-12 text-[#F5EBDD]" style={{ background: "linear-gradient(145deg, #092F30 0%, #073B38 48%, #0a3c39 100%)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/">
              <span className="inline-block rounded-xl bg-[#F5EBDD] px-3 py-2">
                <Image
                  src="/images/site/nexchair-logo.png"
                  alt="NexChair"
                  width={120}
                  height={30}
                  style={{ height: "30px", width: "auto" }}
                />
              </span>
            </Link>
            <p className="mt-4 text-[15px] font-medium leading-6 text-white/80">
              Office seating with the full specification sheet up front - for
              teams, offices and home setups.
            </p>
          </div>

          {/* Category */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D9BD91]">
              Category
            </p>
            <nav className="mt-4 flex flex-col gap-3">
              {shop.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[15px] font-semibold text-white transition hover:text-[#F5EBDD]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D9BD91]">
              Company
            </p>
            <nav className="mt-4 flex flex-col gap-3">
              {company.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[15px] font-semibold text-white transition hover:text-[#F5EBDD]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Get in touch */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D9BD91]">
              Get in touch
            </p>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              {/* Phone */}
              <a
                href={contactPhoneHref}
                className="flex items-start gap-3 text-[15px] font-semibold text-white transition hover:text-[#F5EBDD]"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#F26919]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.63 5.63l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {contactPhone}
              </a>

              {/* Email */}
              <a
                href={contactEmailHref}
                className="flex items-start gap-3 break-all text-[15px] font-semibold text-white transition hover:text-[#F5EBDD]"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#F26919]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {contactEmail}
              </a>

              {/* Address */}
              <a
                href={contactAddressHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-[15px] font-semibold text-white transition hover:text-[#F5EBDD]"
              >
                <svg
                  className="mt-0.5 h-6 w-6 shrink-0 text-[#F26919]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {contactAddress}
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="flex items-start gap-3 text-[15px] font-semibold text-white transition hover:text-[#F5EBDD]"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#F26919]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Connect on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs font-medium text-[#F5EBDD]/30">
          <span>© 2026 NexChair</span>
        </div>
      </div>
    </footer>
  );
}
