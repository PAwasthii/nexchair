import Link from "next/link";

export default function HomeBottomCTA() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 rounded-3xl bg-[#e9e3d8] p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="max-w-lg text-3xl font-bold tracking-tight md:text-4xl">
              Kitting out a whole office?
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-black/60">
              Share seat count and budget — we shortlist three options with spec sheets.
            </p>
          </div>

          <Link
            href="/contact"
            className="w-fit shrink-0 rounded-full bg-[#c44e18] px-6 py-3 text-sm font-semibold text-white"
          >
            Request a quote
          </Link>
        </div>
      </div>
    </section>
  );
}
