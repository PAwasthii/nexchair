import Link from "next/link";

export default function ProductRangeHeader() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)" }}
    >
      {/* Radial ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 28% 55%, rgba(21,80,75,0.6) 0%, transparent 58%)",
        }}
      />

      {/* Decorative gold SVG curves */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1360 230"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M -60 68 C 180 58 530 76 850 63 C 1080 55 1240 70 1420 60"
          stroke="#F0A52E"
          strokeWidth="1.6"
          opacity="0.28"
        />
        <path
          d="M 820 240 C 990 175 1180 200 1430 170"
          stroke="#F0A52E"
          strokeWidth="1.3"
          opacity="0.15"
        />
      </svg>

      <div className="relative mx-auto max-w-[1360px] px-5 py-10 sm:px-9 lg:py-[52px]">
        {/* Breadcrumb */}
        <p className="text-[12px] text-[#F5EBDD]/40">
          <Link href="/" className="transition hover:text-[#F5EBDD]/70">
            Home
          </Link>
          {" / "}
          <span className="text-[#F5EBDD]/70">Product Range</span>
        </p>

        <div className="mt-5">
          {/* Heading */}
          <h1 className="font-display mt-3 text-[44px] font-bold leading-[1.05] text-white sm:text-[54px] lg:text-[64px]">
            The{" "}
            <em className="not-italic text-[#D85B13]">Range</em>
          </h1>

          {/* Gold accent rule */}
          <div className="mt-4 h-[2px] w-14 rounded-full bg-[#F0A52E]/55" />

          {/* Description */}
          <p className="mt-4 max-w-[680px] text-[14px] leading-[1.6] text-[#F7EDE1]/75 sm:text-[15px] lg:text-[17px]">
            Filter by category or by the numbers that matter - load rating,
            adjustability, back type and budget.
          </p>
        </div>
      </div>
    </section>
  );
}
