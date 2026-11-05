import Image from "next/image";
import { whatsappHref } from "@/lib/site";
import CompanyStats from "@/components/CompanyStats";

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

              <p className="mt-5 text-sm leading-7 text-black/70 sm:text-[0.9375rem]">
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

            <p className="text-sm leading-7 text-black/70 md:text-[0.9375rem]">
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
            {[
              {
                n: "1",
                title: "Specs before sales talk.",
                body: "Every product page shows the numbers that matter: load rating, adjustability, back and seat material, and warranty.",
                note: null,
              },
              {
                n: "2",
                title: "Fit for the person, not just the room.",
                body: "We help you match a chair to body weight, hours seated and budget, not just looks.",
                note: null,
              },
              {
                n: "3",
                title: "Built for teams.",
                body: "For offices and bulk orders, share your seat count and budget. Our project desk will shortlist three options with spec sheets, with GST invoicing included.",
                note: null,
              },
              {
                n: "4",
                title: "Support after delivery.",
                body: "Every chair is backed by a manufacturer warranty and our [delivery & service coverage] across [cities/regions].",
                note: "Coverage details pending — awaiting confirmation from client.",
              },
            ].map((p) => (
              <div key={p.n} className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-3xl font-bold leading-none text-[#F26919]">
                  {p.n}
                </p>
                <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/65">{p.body}</p>
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
            className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#20b957]"
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
