import Link from "next/link";

export default function ProductRangeHeader() {
  return (
    <section className="border-b border-black/10 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs text-black/40">
          <Link href="/" className="hover:text-black/70">Home</Link>
          {" / "}
          Product Range
        </p>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              The range
            </h1>
          </div>

          <p className="max-w-md text-sm leading-6 text-black/55">
            Filter by category or by the numbers that matter — load rating,
            adjustability, back type and budget.
          </p>
        </div>
      </div>
    </section>
  );
}