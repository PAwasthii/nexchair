import ContactEnquiryForm from "@/components/contact/ContactEnquiryForm";
import { whatsappHref } from "@/lib/site";

export default function Contact() {
  return (
    <main>
      {/* Header */}
      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            Contact
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
            Talk to a seating advisor
          </h1>
        </div>
      </section>

      {/* Contact methods */}
      <section className="px-6 pb-10">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* WhatsApp */}
          <a
            href={whatsappHref}
            className="flex flex-col gap-4 rounded-3xl bg-[#1f7650] p-6 text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold">WhatsApp</h2>
              <p className="mt-1 text-sm text-white/70">
                Fastest reply
              </p>
            </div>
          </a>

          {/* Send an enquiry */}
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Enquiry form</h2>
              <p className="mt-1 text-sm text-black/50">
                Use the form below — we respond within one business day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry + location */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr]">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold">Send an enquiry</h2>

            <div className="mt-6">
              <ContactEnquiryForm />
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex min-h-[240px] items-center justify-center rounded-3xl bg-[#e9e3d8]">
              <p className="text-sm text-black/40">
                Location map coming soon
              </p>
            </div>

            <div className="mt-6 space-y-1 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c44e18]">
                Experience Centre
              </p>

              <p className="mt-3 text-black/50">
                Address details will be displayed here once confirmed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
