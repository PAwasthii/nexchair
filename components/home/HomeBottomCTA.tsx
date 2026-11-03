import Link from "next/link";

export default function HomeBottomCTA() {
  return (
    <section className="px-4 py-3 pb-6 md:px-6 md:py-4 md:pb-8">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#0E3159] p-8 text-white md:p-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-lg text-3xl font-bold tracking-tight md:text-4xl">
              Kitting out a whole office?
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
              Share seat count and budget - we shortlist three options with spec sheets.
            </p>
          </div>

          <Link
            href="/contact"
            className="w-fit shrink-0 rounded-full bg-[#F26919] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d95e15]"
          >
            Request a quote
          </Link>
        </div>
      </div>
    </section>
  );
}
