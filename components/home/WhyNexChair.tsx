const points = [
  {
    label: "SPEC FOR HANDOVER",
    title: "Every dimension, published",
    description:
      "Seat height range, depth, load rating, mechanism and materials are shown upfront.",
  },
  {
    label: "BUILT FOR THE CONDITIONS",
    title: "Breathable by design",
    description:
      "Materials chosen for long hours, humid working conditions and everyday use.",
  },
  {
    label: "SERVICE YOU CAN SEE",
    title: "Warranty terms in plain words",
    description:
      "Clear coverage, realistic expectations and straightforward support after purchase.",
  },
  {
    label: "NO GUESSES FOR BULK",
    title: "Corporate orders, handled",
    description:
      "Simple chair lists, quantities, coordinated delivery and on-site assembly for office fits.",
  },
];

export default function WhyNexChair() {
  return (
    <section className="bg-[#f5f1ea] px-6 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            Why NexChair
          </p>

          <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            What most chair sites leave out, we lead with.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {points.map((point) => (
            <article
              key={point.title}
              className="rounded-3xl bg-white p-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c44e18]">
                {point.label}
              </p>

              <h3 className="mt-5 text-xl font-semibold">
                {point.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-black/55">
                {point.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}