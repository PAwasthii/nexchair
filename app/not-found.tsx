import Link from "next/link";

export const metadata = { title: "Page not found · NexChair" };

export default function NotFound() {
  return (
    <main
      className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-6 py-20 text-center"
      style={{ background: "linear-gradient(180deg, #FBF2E8 0%, #F5EAD8 100%)" }}
    >
      <p className="text-[13px] font-bold uppercase tracking-[3px] text-[#D85B13]">
        404
      </p>
      <h1 className="font-display mt-4 text-[42px] font-bold leading-[1.08] text-[#103B39] sm:text-[54px]">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-[#77716B]">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[#D85B13] px-7 py-[13px] text-[15px] font-bold text-white transition hover:bg-[#c0500f] hover:shadow-[0_4px_16px_rgba(216,91,19,0.38)]"
        >
          Go home
        </Link>
        <Link
          href="/product-range"
          className="rounded-full border border-[#D9C6B1] bg-white px-7 py-[13px] text-[15px] font-semibold text-[#103B39] transition hover:border-[#D85B13]/50"
        >
          Browse chairs
        </Link>
      </div>
    </main>
  );
}
