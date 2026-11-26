import type { Metadata } from "next";
import Link from "next/link";
import ContactQuoteForm from "@/components/contact/ContactQuoteForm";

export const metadata: Metadata = {
  title: "Contact Us | NexChair",
  description: "Request a quote for office chairs. Get a GST invoice, spec sheets and bulk pricing from the NexChair team.",
};
import {
  whatsappHref,
  contactPhone,
  contactPhoneHref,
  contactEmail,
  contactEmailHref,
  contactAddress1Label,
  contactAddress1,
  contactAddress1Href,
  contactAddress2Label,
  contactAddress2,
  contactAddress2Href,
  businessHours,
} from "@/lib/site";

const infoStrip = [
  {
    title: "Quick Response",
    desc: "We get back to you shortly.",
    icon: (
      <svg className="h-6 w-6 shrink-0 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Spec Sheets",
    desc: "Detailed product information.",
    icon: (
      <svg className="h-6 w-6 shrink-0 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: "GST Quote",
    desc: "Business-ready pricing.",
    icon: (
      <svg className="h-6 w-6 shrink-0 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    title: "Expert Guidance",
    desc: "Choose the right seating.",
    icon: (
      <svg className="h-6 w-6 shrink-0 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function Contact() {
  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-5 py-10 sm:px-9 lg:py-[52px]"
        style={{
          background:
            "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)",
        }}
      >
        {/* Radial ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 28% 55%, rgba(21,80,75,0.6) 0%, transparent 58%)",
          }}
        />
        {/* Decorative gold curves */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1360 230"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M -60 68 C 180 58 530 76 850 63 C 1080 55 1240 70 1420 60"
            stroke="#F0A52E"
            strokeWidth="1.6"
            opacity="0.28"
          />
          <path
            d="M 820 240 C 990 175 1180 200 1430 170"
            stroke="#F0A52E"
            strokeWidth="1.3"
            opacity="0.15"
          />
        </svg>

        <div className="relative mx-auto max-w-[1360px]">
          {/* Breadcrumb */}
          <p className="text-[13px] text-[#F5EBDD]/40">
            <Link href="/" className="transition hover:text-[#F5EBDD]/70">
              Home
            </Link>
            {" / "}
            <span className="text-[#F5EBDD]/70">Contact</span>
          </p>

          <div className="mt-5">
            <h1 className="font-display mt-3 text-[44px] font-bold leading-[1.05] text-white sm:text-[54px] lg:text-[64px]">
              Request a{" "}
              <em className="not-italic text-[#D85B13]">Quote</em>
            </h1>
            {/* Gold accent rule */}
            <div className="mt-4 h-[2px] w-14 rounded-full bg-[#F0A52E]/55" />
            <p className="mt-4 max-w-[560px] text-[15px] leading-[1.6] text-[#F7EDE1]/70 sm:text-[16px] lg:text-[17px]">
              Tell us what you need – we reply with a shortlist, spec sheets and
              a GST quote.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main two-column section ──────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-5 py-10 sm:px-9 lg:py-14"
        style={{ background: "#FBF2E8" }}
      >
        {/* Soft decorative background shapes */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -right-[8%] -top-[20%] h-[120%] w-[45%] rounded-full"
            style={{ background: "#F2E3D2", opacity: 0.55 }}
          />
          <div
            className="absolute"
            style={{
              left: "-4%",
              bottom: "5%",
              width: "32%",
              height: "60%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(242,227,210,0.5) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1360px]">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-8">

            {/* LEFT — Enquiry Form (60%) */}
            <div className="w-full lg:w-[60%]">
              <div className="rounded-[24px] border-2 border-[#073B38] bg-[#FFF9F1] p-7 shadow-[0_8px_28px_rgba(74,48,26,0.07)] sm:p-9">
                <h2 className="font-display text-[36px] font-bold leading-[1.1] text-[#103B39] sm:text-[40px]">
                  Share your requirements
                </h2>
                <div className="mt-2 h-[2px] w-10 rounded-full bg-[#F0A52E]/60" />
                <div className="mt-7">
                  <ContactQuoteForm />
                </div>
              </div>
            </div>

            {/* RIGHT — Contact Information (40%) */}
            <div className="w-full lg:w-[40%]">
              <div
                className="rounded-[24px] border border-[#E7D4C0] p-7 shadow-[0_8px_28px_rgba(74,48,26,0.07)] sm:p-9"
                style={{
                  background: "linear-gradient(160deg, #F5EAD8 0%, #EDD9C3 100%)",
                }}
              >
                <h2 className="font-display text-[36px] font-bold leading-[1.1] text-[#103B39] sm:text-[40px]">
                  Prefer to talk?
                </h2>
                <div className="mt-2 h-[2px] w-10 rounded-full bg-[#F0A52E]/60" />

                <div className="mt-7 flex flex-col gap-5">

                  {/* Phone */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-2.5">
                      <svg className="h-[22px] w-[22px] shrink-0 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.63 5.63l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-[#8A7768]">
                        Phone
                      </p>
                    </div>
                    <a
                      href={contactPhoneHref}
                      className="text-[16px] font-semibold text-[#292622] transition hover:text-[#D85B13]"
                    >
                      {contactPhone}
                    </a>
                  </div>

                  <div className="h-px bg-[#DCCAB7]/60" />

                  {/* Email */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-2.5">
                      <svg className="h-[22px] w-[22px] shrink-0 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-[#8A7768]">
                        Email
                      </p>
                    </div>
                    <a
                      href={contactEmailHref}
                      className="break-all text-[16px] font-semibold text-[#292622] transition hover:text-[#D85B13]"
                    >
                      {contactEmail}
                    </a>
                  </div>

                  <div className="h-px bg-[#DCCAB7]/60" />

                  {/* Locations */}
                  <div>
                    <div className="mb-2 flex items-center gap-2.5">
                      <svg className="h-[22px] w-[22px] shrink-0 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-[#8A7768]">
                        Locations
                      </p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#D85B13]">
                          {contactAddress1Label}
                        </p>
                        <a
                          href={contactAddress1Href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-[15px] leading-[1.65] text-[#292622] transition hover:text-[#D85B13]"
                        >
                          {contactAddress1}
                        </a>
                      </div>
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#D85B13]">
                          {contactAddress2Label}
                        </p>
                        <a
                          href={contactAddress2Href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-[15px] leading-[1.65] text-[#292622] transition hover:text-[#D85B13]"
                        >
                          {contactAddress2}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-[#DCCAB7]/60" />

                  {/* Hours */}
                  <div>
                    <div className="mb-2 flex items-center gap-2.5">
                      <svg className="h-[22px] w-[22px] shrink-0 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-[#8A7768]">
                        Hours
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {businessHours.map((h) => (
                        <p key={h.days} className="text-[15px] text-[#292622]">
                          <span className="font-semibold">{h.days}:</span>{" "}
                          {h.time}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#16BD60] px-6 py-[14px] text-[16px] font-bold text-white transition-all duration-200 hover:bg-[#13a854] hover:shadow-[0_4px_14px_rgba(22,189,96,0.30)]"
                  style={{ minHeight: 50 }}
                >
                  <svg
                    className="h-5 w-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* ── Quick-information strip ──────────────────────────────── */}
          <div className="mt-8 overflow-hidden rounded-[20px] border border-[#E7D4C0]">
            <div className="grid grid-cols-2 gap-px bg-[#E7D4C0] lg:grid-cols-4">
              {infoStrip.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 bg-[#FFF9F1] px-5 py-5 sm:px-6"
                >
                  {item.icon}
                  <div>
                    <p className="text-[15px] font-bold text-[#103B39]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[1.5] text-[#77716B]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
