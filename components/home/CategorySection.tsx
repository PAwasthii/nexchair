import Image from "next/image";

import { prisma } from "@/lib/prisma";

const FALLBACK_CATEGORIES = [
  { id: "1", name: "Executive Chair",  slug: "executive-chair",  imageKey: "/images/hero-image.png" },
  { id: "2", name: "Ergonomic Chair",  slug: "ergonomic-chair",  imageKey: "/images/factory-image.png" },
  { id: "3", name: "Visitor Chair",    slug: "visitor-chair",    imageKey: "/images/hero-image.png" },
  { id: "4", name: "Lounge Chair",     slug: "lounge-chair",     imageKey: "/images/IKEA-artifact.jpeg" },
  { id: "5", name: "Canteen Chair",    slug: "canteen-chair",    imageKey: "/images/factory-image.png" },
  { id: "6", name: "Staff Chair",      slug: "staff-chair",      imageKey: "/images/factory-image.png" },
];

export default async function CategorySection() {
  let categories: { id: string; name: string; slug: string; imageKey: string | null }[];
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        imageKey: true,
      },
    });
    if (categories.length === 0) categories = FALLBACK_CATEGORIES;
  } catch {
    categories = FALLBACK_CATEGORIES;
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#FBF2E8" }}
    >
      {/* ── Decorative background curves ─────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Large warm arc — right side */}
        <div
          className="absolute"
          style={{
            right: "-8%",
            top: "-15%",
            width: "52%",
            height: "130%",
            borderRadius: "50%",
            background: "#F2E3D2",
            opacity: 0.7,
          }}
        />
        {/* Smaller overlapping arc — lower right */}
        <div
          className="absolute"
          style={{
            right: "-18%",
            bottom: "-8%",
            width: "38%",
            height: "75%",
            borderRadius: "50%",
            background: "#EDD9C3",
            opacity: 0.45,
          }}
        />
        {/* Soft warm radial glow behind heading area */}
        <div
          className="absolute"
          style={{
            left: "2%",
            top: "5%",
            width: "55%",
            height: "65%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(242,227,210,0.55) 0%, transparent 68%)",
          }}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-[1360px] px-5 pb-[68px] pt-[62px] sm:px-9">

        {/* Section label */}
        <p
          className="text-[12px] font-bold uppercase sm:text-[14px] lg:text-[16px]"
          style={{ letterSpacing: "3px", color: "#D85B13" }}
        >
          Explore our collections
        </p>

        {/* Heading row */}
        <div className="mt-[22px] flex items-end justify-between gap-6">
          <h2
            className="font-display max-w-3xl text-[36px] font-semibold leading-[1.1] tracking-tight sm:text-[46px] lg:text-[60px]"
            style={{ color: "#103B39" }}
          >
            Seating for the way you work.
          </h2>
          <a
            href="/product-range"
            className="hidden shrink-0 pb-1 text-[17px] font-semibold underline underline-offset-[5px] transition duration-200 hover:opacity-70 md:block"
            style={{ color: "#103B39" }}
          >
            View all chairs
          </a>
        </div>

        {/* ── Category card grid ─────────────────────────────── */}
        <div className="mt-[44px] grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-[17px]">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/product-range?category=${category.slug}`}
              className="group overflow-hidden rounded-[24px] border border-[#E7D4C0] bg-[#FFF9F1] shadow-[0_8px_22px_rgba(74,48,26,0.08)] transition-all duration-300 ease-out motion-safe:hover:-translate-y-[5px] hover:border-[#C8A87A] hover:shadow-[0_14px_30px_rgba(74,48,26,0.15)]"
            >
              {/* Image area */}
              <div
                className="relative aspect-[4/5] w-full overflow-hidden"
                style={{ background: "#F3E5D4" }}
              >
                {category.imageKey ? (
                  <Image
                    src={category.imageKey}
                    alt={category.name}
                    fill
                    className="object-cover object-center transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.035]"
                    sizes="(max-width: 639px) calc((100vw - 28px) / 2), (max-width: 1023px) calc((100vw - 56px) / 3), calc((1360px - 157px) / 6)"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: "#103B39", opacity: 0.3 }}
                    >
                      {category.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div className="flex items-center justify-between px-[17px] py-[14px]">
                <div className="min-w-0 pr-2">
                  <h3
                    className="truncate text-[14px] font-bold leading-snug lg:text-[17px]"
                    style={{ color: "#103B39" }}
                  >
                    {category.name}
                  </h3>
                  <p
                    className="mt-0.5 text-[12px] lg:text-[14px]"
                    style={{ color: "#77716B" }}
                  >
                    Explore collection
                  </p>
                </div>

                {/* Circular arrow button */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-hover:border-[#D85B13] group-hover:bg-[#D85B13] lg:h-[40px] lg:w-[40px]"
                  style={{ borderColor: "#D9C6B1" }}
                >
                  <svg
                    className="h-[16px] w-[16px] transition-all duration-300 group-hover:translate-x-[1px] group-hover:text-white lg:h-[18px] lg:w-[18px]"
                    style={{ color: "#103B39" }}
                    viewBox="0 0 18 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Mobile "View all" link */}
        <a
          href="/product-range"
          className="mt-7 block text-[14px] font-semibold underline underline-offset-4 transition hover:opacity-70 md:hidden"
          style={{ color: "#103B39" }}
        >
          View all chairs →
        </a>
      </div>
    </section>
  );
}
