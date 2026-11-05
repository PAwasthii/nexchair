import Image from "next/image";
import { whatsappHref } from "@/lib/site";
import CompanyStats from "@/components/CompanyStats";

export default function About() {
  return (
    <main>
      {/* Introduction */}
      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* Left: label + heading + paragraph */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
                About NexChair
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
                Chairs you can choose on facts.
              </h1>

              <p className="mt-6 text-sm leading-7 text-black/65 sm:text-[0.9375rem]">
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
      <section className="border-t border-black/10 px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <CompanyStats />
        </div>
      </section>

      {/* What we make */}
      <section className="bg-[#f5f1ea] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
            What we make
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
            <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Every seat in a modern workspace.
            </h2>

            <p className="text-sm leading-7 text-black/65 md:text-[0.9375rem]">
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
      <section className="px-6 py-14">
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
              <div key={p.n} className="rounded-3xl bg-white p-8 shadow-sm">
                <p className="text-4xl font-bold leading-none text-[#F26919]">
                  {p.n}
                </p>
                <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/60">{p.body}</p>
                {p.note && (
                  <p className="mt-3 text-xs italic text-black/35">{p.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing statement */}
      <section className="border-t border-black/10 bg-[#f5f1ea] px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xl font-semibold leading-9 tracking-tight text-[#0E3159] md:text-2xl md:leading-10">
            Whether you&rsquo;re furnishing a 200-seat office or a single home desk,
            NexChair gives you a chair you understand before you buy it, and one
            that holds up long after.
          </p>
        </div>
      </section>

      {/* Bulk order CTA */}
      <section className="bg-[#0E3159] px-6 py-16 text-white">
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
            className="w-fit shrink-0 rounded-full bg-[#F26919] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d95e15]"
          >
            Talk to the project desk
          </a>
        </div>
      </section>
    </main>
  );
}
