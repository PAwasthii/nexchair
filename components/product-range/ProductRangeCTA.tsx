import Link from "next/link";

export default function ProductRangeCTA() {
  return (
    <section className="px-5 py-10 sm:px-9 lg:py-12" style={{ background: "#F5EAD8" }}>
      <div className="mx-auto max-w-[1360px]">
        <div
          className="relative overflow-hidden rounded-[28px] p-8 md:p-12"
          style={{
            background: "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)",
          }}
        >
          {/* Radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse at 25% 55%, rgba(21,80,75,0.65) 0%, transparent 58%)",
            }}
          />

          {/* SVG decorative gold curves */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1200 220"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M -40 55 C 160 10 440 90 720 42 C 920 5 1060 62 1240 28"
              stroke="#F0A52E"
              strokeWidth="1.5"
              opacity="0.26"
            />
            <path
              d="M 740 230 C 880 175 1040 198 1260 168"
              stroke="#F0A52E"
              strokeWidth="1.2"
              opacity="0.14"
            />
          </svg>

          {/* Content */}
          <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between md:gap-12">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[2px] text-[#F0A52E]">
                Not sure where to start?
              </p>

              <h2 className="font-display mt-3 max-w-lg text-[32px] font-bold leading-[1.1] text-white sm:text-[38px] lg:text-[44px]">
                Not sure which model fits your team?
              </h2>

              <p className="mt-3 max-w-md text-[15px] leading-[1.6] text-[#F7EDE1]/70">
                Share your team size and budget — we shortlist three options for you.
              </p>
            </div>

            <Link
              href="/contact"
              className="w-fit shrink-0 rounded-full bg-[#D85B13] px-7 py-[14px] text-[15px] font-bold text-white transition-all duration-200 hover:bg-[#c0500f] hover:shadow-[0_4px_18px_rgba(216,91,19,0.42)]"
            >
              Get a shortlist →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
