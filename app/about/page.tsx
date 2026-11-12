import Image from "next/image";
import { whatsappHref } from "@/lib/site";
import CompanyStats from "@/components/CompanyStats";

const principles = [
  {
    icon: (
      <svg className="h-7 w-7 text-[#F26919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <path d="M12 11h4"/><path d="M12 16h4"/>
        <path d="M8 11h.01"/><path d="M8 16h.01"/>
      </svg>
    ),
    title: "Specs before sales talk.",
    body: "Every product page shows the numbers that matter: load rating, adjustability, back and seat material, and warranty.",
    note: null,
  },
  {
    icon: (
      <svg className="h-7 w-7 text-[#F26919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: "Fit for the person, not just the room.",
    body: "We help you match a chair to body weight, hours seated and budget, not just looks.",
    note: null,
  },
  {
    icon: (
      <svg className="h-7 w-7 text-[#F26919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Built for teams.",
    body: "For offices and bulk orders, share your seat count and budget. Our project desk will shortlist three options with spec sheets, with GST invoicing included.",
    note: null,
  },
  {
    icon: (
      <svg className="h-7 w-7 text-[#F26919]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    ),
    title: "Support after delivery.",
    body: "Every chair is backed by a manufacturer warranty and our [delivery & service coverage] across [cities/regions].",
    note: "Coverage details pending — awaiting confirmation from client.",
  },
];

export default function About() {
  return (
    <main>
      {/* Introduction */}
      <section className="px-6 py-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Left: label + heading + paragraph */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
                About NexChair
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-snug tracking-tight sm:text-5xl sm:leading-tight md:text-6xl md:leading-[1.1]">
                Chairs you can choose on facts.
              </h1>

              <p className="mt-5 text-sm leading-7 text-black sm:text-[0.9375rem]">
                NexChair started from a simple frustration: buying a chair meant
                reading words like &ldquo;premium,&rdquo; &ldquo;ergonomic&rdquo; and
                &ldquo;ultra-comfortable&rdquo; with almost nothing behind them. We work
                the other way around. Every chair we sell comes with its full
                specification sheet, covering dimensions, mechanism, load rating,
                materials and warranty, so you can compare, shortlist and decide
                on facts.
              </p>
            </div>

            {/* Right: image */}
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="/images/factory-image.png"
                alt="NexChair factory outlet"
                width={800}
                height={500}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company stats */}
      <section className="border-t border-black/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <CompanyStats />
        </div>
      </section>

      {/* What we make */}
      <section className="bg-[#f5f1ea] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
            What we make
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
            <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Every seat in a modern workspace.
            </h2>

            <p className="text-sm leading-7 text-black md:text-[0.9375rem]">
              From high-back ergonomic mesh chairs and executive leather seating
              to staff, visitor, lounge and canteen chairs, our range covers
              every seat in a modern workspace. Each model is built for long
              hours and matched to how it will actually be used: an eight-hour
              workstation, a boardroom, a reception area, or a home office.
            </p>
          </div>
        </div>
      </section>

      {/* How we work – 4 principles */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
            How we work
          </p>

          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Four principles behind every NexChair sale.
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="rounded-2xl bg-white p-6 shadow-sm">
                {p.icon}
                <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/80">{p.body}</p>
                {p.note && (
                  <p className="mt-3 text-xs italic text-black/35">{p.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing statement */}
      <section className="border-t border-black/10 bg-[#f5f1ea] px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xl font-semibold leading-9 tracking-tight text-[#0E3159] md:text-2xl md:leading-10">
            Whether you&rsquo;re furnishing a 200-seat office or a single home desk,
            NexChair gives you a chair you understand before you buy it, and one
            that holds up long after.
          </p>
        </div>
      </section>

      {/* Bulk order CTA */}
      <section className="bg-[#0E3159] px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
              Planning a bulk order?
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
              Our project desk handles corporate and bulk orders end to end.
            </p>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#1aad4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#158a3c]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Talk to the project desk
          </a>
        </div>
      </section>
    </main>
  );
}
