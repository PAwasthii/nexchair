import Image from "next/image";
import { whatsappHref } from "@/lib/site";

/* ─────────────────────────── data ──────────────────────────── */

const stats = [
  {
    value: "13+",
    label: "Years in seating",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    value: "1500+",
    label: "Offices furnished",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    value: "1 year",
    label: "Warranty on every chair",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    value: <>Pan<span style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)" }}>-</span>India</>,
    label: "Delivery & service coverage",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const principles = [
  {
    img: "/images/principle/principle-specs.png",
    imgAlt: "Executive chair close-up",
    imgPos: "object-center",
    icon: (
      <svg className="h-5 w-5 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" /><path d="M12 16h4" />
        <path d="M8 11h.01" /><path d="M8 16h.01" />
      </svg>
    ),
    title: "Specs before sales talk.",
    body: "Every product page shows the numbers that matter: load rating, adjustability, back and seat material, and warranty.",
    note: null,
  },
  {
    img: "/images/principle/principle-fit.png",
    imgAlt: "Ergonomic mesh chair",
    imgPos: "object-center",
    icon: (
      <svg className="h-5 w-5 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "Fit for the person, not just the room.",
    body: "We help you match a chair to body weight, hours seated and budget, not just looks.",
    note: null,
  },
  {
    img: "/images/principle/principle-teams.png",
    imgAlt: "Office workspace with multiple chairs",
    imgPos: "object-center",
    icon: (
      <svg className="h-5 w-5 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Built for teams.",
    body: "For offices and bulk orders, share your seat count and budget. Our project desk will shortlist three options with spec sheets, with GST invoicing included.",
    note: null,
  },
  {
    img: "/images/principle/principle-support.png",
    imgAlt: "Chair product detail",
    imgPos: "object-right",
    icon: (
      <svg className="h-5 w-5 text-[#D85B13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
      </svg>
    ),
    title: "Support after delivery.",
    body: "Every chair is backed by a manufacturer warranty and our [delivery & service coverage] across [cities/regions].",
    note: "Coverage details pending — awaiting confirmation from client.",
  },
];

/* ─────────────────────── section label ─────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px w-7 shrink-0 bg-[#E8AD4D]" />
      <span className="text-[13px] font-bold uppercase tracking-[0.22em] text-[#D85B13] lg:text-[15px]">
        {children}
      </span>
    </div>
  );
}

/* ──────────────────────────── page ─────────────────────────── */

export default function About() {
  return (
    <main>

      {/* Thin green accent strip */}
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #073B38 0%, #0a5c56 50%, #073B38 100%)" }} />

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════ */}
      <section className="overflow-hidden bg-[#FBF7F0]">
        <div className="max-w-[1360px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:min-h-[420px]">

            {/* Left — text */}
            <div className="flex flex-col justify-center px-5 pb-7 pt-10 sm:px-9 lg:w-[43%] lg:px-[5%] lg:pb-8 lg:pt-[52px]">

              <SectionLabel>About NexChair</SectionLabel>

              <h1 className="font-display mt-5 text-[42px] font-semibold leading-[1.07] tracking-tight text-[#102F32] sm:text-[52px] lg:text-[72px]">
                Chairs you can choose{" "}
                <em className="italic text-[#D85B13]">on facts.</em>
              </h1>

              {/* Gold underline accent */}
              <div className="mt-4 h-[2px] w-14 rounded-full bg-[#E8AD4D] lg:mt-5" />

              <p className="mt-4 text-[15px] leading-[1.75] text-[#20292B] lg:mt-5 lg:text-[17px]">
                NexChair started from a simple frustration: buying a chair meant
                reading words like &ldquo;premium,&rdquo; &ldquo;ergonomic&rdquo; and
                &ldquo;ultra-comfortable&rdquo; with almost nothing behind them. We work
                the other way around. Every chair we sell comes with its full
                specification sheet, covering dimensions, mechanism, load rating,
                materials and warranty, so you can compare, shortlist and decide
                on facts.
              </p>
            </div>

            {/* Right — factory image, curved left boundary */}
            <div className="mx-5 h-[200px] flex-1 self-center sm:h-[260px] lg:mx-0 lg:h-[420px] lg:self-center">
              <div className="relative h-full overflow-hidden rounded-[60px] border-2 border-[#E8AD4D]/60 lg:rounded-[88px]">
                <Image
                  src="/images/factory-image.png"
                  alt="NexChair factory outlet"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Thin green accent strip */}
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #073B38 0%, #0a5c56 50%, #073B38 100%)" }} />

      {/* ══════════════════════════════════════════════
          SECTION 2 — COMPANY STATISTICS
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F8F2E9] px-5 py-6 sm:px-9 lg:py-10">
        <div className="max-w-[1360px] mx-auto">

          {/* ── Mobile & Tablet: 2×2 dark-teal tiles ── */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {stats.map(({ value, label, icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-[18px] bg-[#103F40] p-4"
              >
                {/* Icon */}
                <div className="shrink-0 text-[#E8AD4D]">{icon}</div>
                {/* Thin divider */}
                <div className="h-9 w-px shrink-0 bg-[#E8AD4D]/20" />
                {/* Value + label */}
                <div className="min-w-0">
                  <p className="font-display text-[29px] font-semibold leading-none text-white sm:text-[33px]">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase leading-tight tracking-wider text-white/45 sm:text-[11px]">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: single horizontal banner ── */}
          <div className="hidden lg:flex lg:divide-x lg:divide-[#E8AD4D]/20 lg:rounded-[22px] lg:bg-[#103F40] lg:px-4 lg:py-9">
            {stats.map(({ value, label, icon }) => (
              <div
                key={label}
                className="flex flex-1 flex-col items-center px-6 text-center"
              >
                <div className="mb-3 text-[#E8AD4D]">{icon}</div>
                <p className="font-display text-[48px] font-semibold leading-none text-white">
                  {value}
                </p>
                <p className="mt-2 text-[13px] uppercase tracking-wider text-white/45">
                  {label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — WHAT WE MAKE
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F1E5D6] px-5 py-6 sm:px-9 lg:py-10">
        <div className="max-w-[1360px] mx-auto">

          <SectionLabel>What we make</SectionLabel>

          <div className="mt-5 grid gap-6 lg:mt-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">

            <div className="relative pl-6">
              {/* Gradient green left border — fades from solid to transparent */}
              <div
                className="absolute left-0 top-0 h-full w-[3px] rounded-full"
                aria-hidden="true"
                style={{
                  background: "linear-gradient(to bottom, #073B38 0%, #15504B 55%, transparent 100%)",
                }}
              />
              <h2 className="font-display text-[38px] font-semibold leading-[1.1] tracking-tight text-[#102F32] lg:text-[56px]">
                Every seat in a{" "}
                <em className="italic text-[#D85B13]">modern workspace.</em>
              </h2>
            </div>

            <div className="lg:pt-3">
              <p className="text-[15px] leading-[1.75] text-[#20292B] lg:text-[17px]">
                From high-back ergonomic mesh chairs and executive leather seating
                to staff, visitor, lounge and canteen chairs, our range covers
                every seat in a modern workspace. Each model is built for long
                hours and matched to how it will actually be used: an eight-hour
                workstation, a boardroom, a reception area, or a home office.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Thin green accent strip */}
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #073B38 0%, #0a5c56 50%, #073B38 100%)" }} />

      {/* ══════════════════════════════════════════════
          SECTION 4 — HOW WE WORK  (image + text cards)
      ══════════════════════════════════════════════ */}
      <section className="bg-[#FBF7F0] px-5 pb-6 pt-6 sm:px-9 lg:pb-10 lg:pt-10">
        <div className="max-w-[1360px] mx-auto">

          <SectionLabel>How we work</SectionLabel>

          <h2 className="font-display mt-5 text-[34px] font-semibold leading-[1.1] tracking-tight text-[#102F32] lg:mt-7 lg:whitespace-nowrap lg:text-[50px]">
            Four principles behind every{" "}
            <em className="italic text-[#D85B13]">NexChair sale.</em>
          </h2>

          {/* 2 × 2 card grid — each card: image left + text right */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:gap-5">
            {principles.map((p) => (
              <div
                key={p.title}
                className="flex h-[220px] overflow-hidden rounded-[18px] border border-[#102F32]/40 bg-[#FBF7F0] lg:h-[260px] lg:rounded-[22px]"
              >
                {/* Left — photograph */}
                <div className="relative w-[38%] shrink-0 lg:w-[40%]">
                  <Image
                    src={p.img}
                    alt={p.imgAlt}
                    fill
                    className={`object-cover ${p.imgPos}`}
                  />
                </div>

                {/* Right — content */}
                <div className="flex flex-1 flex-col justify-center p-4 lg:p-6">
                  <div className="mb-2">{p.icon}</div>
                  <h3 className="font-display text-[19px] font-bold leading-tight text-[#102F32] lg:text-[23px]">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-[1.6] text-[#20292B] lg:mt-2 lg:text-[15px]">
                    {p.body}
                  </p>
                  {p.note && (
                    <p className="mt-2 text-[11px] italic text-[#716D68] lg:text-[12px]">
                      {p.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — CLOSING STATEMENT  (green bg)
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden px-5 py-7 sm:px-9 lg:py-10"
        style={{ background: "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)" }}
      >
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(21,80,75,0.55) 0%, transparent 65%)" }}
        />

        <div className="relative mx-auto max-w-[1000px]">
          <div className="relative px-7 py-5 text-center lg:px-14 lg:py-7">
            <div
              className="absolute bottom-4 left-0 top-4 w-[2px] rounded-full bg-[#F0A52E]/40"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-4 right-0 top-4 w-[2px] rounded-full bg-[#F0A52E]/40"
              aria-hidden="true"
            />
            <p className="font-display text-[26px] font-semibold leading-[1.35] text-white lg:text-[38px]">
              Whether you&rsquo;re furnishing a 200-seat office or a single home desk,
              NexChair gives you a chair you understand before you buy it, and one
              that holds up long after.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — BULK ORDER CTA  (light horizontal strip)
      ══════════════════════════════════════════════ */}
      <section className="px-5 py-10 sm:px-9 lg:py-12" style={{ background: "#F5EAD8" }}>
        <div className="mx-auto max-w-[1360px]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">

            <div>
              <h2 className="font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-[#103B39] lg:text-[48px]">
                Planning a bulk order?
              </h2>
              <p className="mt-2 max-w-[480px] text-[15px] leading-[1.7] text-[#77716B] lg:text-[16px]">
                Our project desk handles corporate and bulk orders end to end.
              </p>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit shrink-0 items-center gap-2.5 rounded-full bg-[#16B45A] px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#13a050]"
              style={{ minHeight: 48 }}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Talk to the project desk
            </a>

          </div>
        </div>
      </section>

    </main>
  );
}
