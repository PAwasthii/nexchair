export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            About NexChair
          </p>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
                We make one thing: the chair you forget you&apos;re sitting in.
              </h1>
            </div>

            <p className="max-w-lg text-sm leading-7 text-black/60">
              NexChair is built around a simple idea: good seating should be
              comfortable, durable and easy to understand.
            </p>
          </div>
        </div>
      </section>

      {/* Main image */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-[#e9e3d8] md:min-h-[520px]">
            <p className="text-sm text-black/40">
              About / factory image
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
              Why we exist
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Less guesswork.
              <br />
              Better seating.
            </h2>
          </div>

          <div className="space-y-5 text-sm leading-7 text-black/60">
            <p>
              Most chair websites make it difficult to compare products
              properly. NexChair takes the opposite approach.
            </p>

            <p>
              We put dimensions, materials, load ratings, mechanisms and
              warranty information where you can actually find them.
            </p>

            <p>
              Whether you are choosing one chair for a home office or
              outfitting an entire workplace, the goal is the same: help you
              make a confident decision.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["[—]", "Years of seating expertise"],
            ["[—]", "Chairs delivered"],
            ["[—]", "Business clients"],
            ["[—]", "Cities served"],
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

      {/* Manufacturing process */}
      <section className="bg-[#171717] px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            How a NexChair is made
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            From components to a chair built for the long day.
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Materials",
                text: "Components and materials selected for everyday commercial use.",
              },
              {
                number: "02",
                title: "Build",
                text: "Parts assembled and checked for fit, function and finish.",
              },
              {
                number: "03",
                title: "Testing",
                text: "Key performance and load requirements checked before dispatch.",
              },
              {
                number: "04",
                title: "Handover",
                text: "Packed and delivered with the product information you need.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <p className="text-sm font-semibold text-[#c44e18]">
                  {step.number}
                </p>

                <h3 className="mt-8 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
              Built differently
            </p>

            <h2 className="mt-4 max-w-md text-4xl font-bold tracking-tight md:text-5xl">
              The details matter.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Clear specifications",
                text: "Important product information is visible before purchase.",
              },
              {
                title: "Designed for long hours",
                text: "Ergonomics and practical comfort guide the range.",
              },
              {
                title: "Straightforward warranty",
                text: "Coverage and expectations are communicated clearly.",
              },
              {
                title: "Bulk support",
                text: "Corporate and institutional orders can be planned around actual requirements.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-6"
              >
                <h3 className="text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-black/50">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#c44e18] px-6 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Ready to choose?
            </p>

            <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
              Find the chair that fits your workday.
            </h2>
          </div>

          <a
            href="/product-range"
            className="w-fit rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Explore the range
          </a>
        </div>
      </section>
    </main>
  );
}