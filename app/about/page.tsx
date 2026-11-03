import { whatsappHref } from "@/lib/site";

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
            About NexChair
          </p>

          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h1 className="max-w-xl text-5xl font-bold leading-[0.95] tracking-tight md:text-6xl">
                Chairs you can choose on facts.
              </h1>
            </div>

            <div>
              <p className="text-sm leading-7 text-black/60">
                [Company story — 2–3 lines from the client on who NexChair is,
                where it started, and who it builds seating for.]
              </p>

              {/* Showroom / factory image placeholder */}
              <div className="mt-8 flex min-h-[220px] items-end justify-center rounded-3xl bg-[#e9e3d8] p-4">
                <p className="text-xs text-black/40">
                  Showroom / factory photo / client supplies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-black/10 px-6 py-14">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["[X]+", "Years in seating"],
            ["[X]+", "Offices furnished"],
            ["[X] yrs", "Warranty on every chair"],
            ["[Coverage]", "Delivery & service cities"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-3xl border border-black/10 bg-white p-6"
            >
              <p className="text-4xl font-bold">{value}</p>
              <p className="mt-3 text-sm text-black/50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How we work */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
            How we work
          </p>

          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            From shortlist to seated
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Tell us the brief",
                text: "Seat count, budget and how long people sit — on WhatsApp, a call or the quote form.",
              },
              {
                title: "Get a spec shortlist",
                text: "Three options with full specification sheets, side by side, and a GST quote.",
              },
              {
                title: "Delivered & assembled",
                text: "Delivery and assembly across [coverage], with warranty service offer.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-3xl bg-white p-8"
              >
                <p className="text-5xl font-bold leading-none text-[#F26919]">
                  &ldquo;
                </p>

                <h3 className="mt-6 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-black/55">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk order CTA */}
      <section className="bg-[#0E3159] px-6 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl">
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
