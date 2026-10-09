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
                Fastest reply · [NUMBER]
              </p>
            </div>
          </a>

          {/* Call */}
          <a
            href="tel:"
            className="flex flex-col gap-4 rounded-3xl bg-white p-6"
          >
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
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .14h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8a16 16 0 007.91 7.91l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2z" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Call</h2>
              <p className="mt-1 text-sm text-black/50">
                [NUMBER] · [Days, hours]
              </p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:"
            className="flex flex-col gap-4 rounded-3xl bg-white p-6"
          >
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
              <h2 className="text-lg font-semibold">Email</h2>
              <p className="mt-1 text-sm text-black/50">[EMAIL]</p>
            </div>
          </a>
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
                Google map / location image
              </p>
            </div>

            <div className="mt-6 space-y-1 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c44e18]">
                Experience Centre
              </p>

              <p className="mt-3 text-black/70">[Address line 1]</p>
              <p className="text-black/70">[City, State, Pincode]</p>
              <p className="mt-1 text-black/50">[Days] · [Opening hours]</p>

              <a
                href="#"
                className="mt-3 inline-block font-semibold underline underline-offset-4"
              >
                Get directions →
              </a>
            </div>

            <div className="mt-8 rounded-2xl bg-[#f5f1ea] p-5">
              <p className="text-sm font-semibold">Find a dealer near you</p>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter pincode"
                  className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                />

                <button
                  type="button"
                  className="rounded-lg bg-[#c44e18] px-4 py-2 text-sm font-semibold text-white"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
