import Link from "next/link";
import ContactQuoteForm from "@/components/contact/ContactQuoteForm";
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

export default function Contact() {
  return (
    <main>
      {/* Page header */}
      <section className="border-b border-black/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs text-black/40">
            <Link href="/" className="hover:text-black/70">Home</Link>
            {" / "}
            Contact
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-end">
            <h1 className="text-4xl font-bold leading-snug tracking-tight sm:text-5xl sm:leading-tight md:text-6xl md:leading-[1.1]">
              Request a quote
            </h1>

            <p className="max-w-sm text-sm leading-6 font-semibold text-black/55">
              Tell us what you need - we reply with a shortlist, spec sheets
              and a GST quote.
            </p>
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.65fr]">
          {/* Left: form */}
          <div>
            <ContactQuoteForm />
          </div>

          {/* Right: Prefer to talk? */}
          <div>
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="text-xl font-semibold">Prefer to talk?</h2>

              <div className="mt-6 space-y-5 text-sm">
                {/* Phone */}
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-[#F26919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.63 5.63l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">Phone</p>
                  </div>
                  <a href={contactPhoneHref} className="mt-1 block text-black/70 transition hover:text-black">
                    {contactPhone}
                  </a>
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-[#F26919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">Email</p>
                  </div>
                  <a href={contactEmailHref} className="mt-1 block break-all text-black/70 transition hover:text-black">
                    {contactEmail}
                  </a>
                </div>

                {/* Addresses */}
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-[#F26919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">Locations</p>
                  </div>
                  <div className="mt-2 space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F26919]">{contactAddress1Label}</p>
                      <a href={contactAddress1Href} target="_blank" rel="noopener noreferrer" className="mt-0.5 block leading-5 text-black/70 transition hover:text-black">
                        {contactAddress1}
                      </a>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F26919]">{contactAddress2Label}</p>
                      <a href={contactAddress2Href} target="_blank" rel="noopener noreferrer" className="mt-0.5 block leading-5 text-black/70 transition hover:text-black">
                        {contactAddress2}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-[#F26919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">Hours</p>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {businessHours.map((h) => (
                      <p key={h.days} className="text-black/70">
                        <span className="font-medium text-black/80">{h.days}:</span> {h.time}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#1aad4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#158a3c]"
              >
                <svg
                  className="h-4 w-4"
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
      </section>
    </main>
  );
}
