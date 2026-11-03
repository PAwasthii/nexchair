import Link from "next/link";

export default function ProductRangeCTA() {
  return (
    <section className="border-t border-black/10 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 rounded-3xl bg-[#f5f1ea] p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
              Not sure where to start?
            </p>

            <h2 className="mt-3 max-w-lg text-3xl font-bold tracking-tight">
              Not sure which model fits your team?
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-black/55">
              Share your team size and budget — we shortlist three options for
              you.
            </p>
          </div>

          <Link
            href="/contact"
            className="w-fit shrink-0 rounded-full bg-[#F26919] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d95e15]"
          >
            Get a shortlist →
          </Link>
        </div>
      </div>
    </section>
  );
}
