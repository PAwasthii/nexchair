export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { whatsappHref } from "@/lib/site";
import SpecGallery from "@/components/specifications/SpecGallery";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalisedPrice(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes("[") || trimmed === "Price on request") {
    return "Price on request";
  }
  return trimmed;
}

function getSpec(specs: unknown, key: string): string {
  if (typeof specs === "object" && specs !== null && key in specs) {
    const value = (specs as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "-";
}

// ─── Small icons ──────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-[#F0A52E]"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SpecificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { model, category } = await searchParams;
  const modelCode =
    typeof model === "string" ? model.trim().toUpperCase() : null;

  // ── Product detail view ────────────────────────────────────────────────────
  if (modelCode) {
    const product = await prisma.product.findFirst({
      where: { code: modelCode, isActive: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) notFound();

    const price = normalisedPrice(product.price);
    const galleryImages = product.images;
    const back = getSpec(product.specs, "back");
    const lumbar = getSpec(product.specs, "lumbar");

    // Build dynamic spec rows — only fields with real values
    const specRows: [string, string][] = (
      [
        ["Model code", product.code],
        ["Category", product.category.name],
        ["Back", back],
        ["Lumbar support", lumbar],
        ["Armrests", product.armrests ?? "-"],
        ["Max user weight", product.maxUserWeight ?? "-"],
        ["Seat weight", product.seatWeight ?? "-"],
        ["Colour", product.colour ?? "-"],
        ["Warranty", product.warranty ?? "-"],
      ] as [string, string][]
    ).filter(([, v]) => v !== "-");

    // Build feature badges from actual product data
    const badges: string[] = [];
    if (product.armrests && product.armrests !== "-") badges.push(product.armrests);
    if (back !== "-") badges.push(`${back} back`);
    if (product.warranty && product.warranty !== "-")
      badges.push(`${product.warranty} warranty`);
    if (product.maxUserWeight && product.maxUserWeight !== "-")
      badges.push(`Max ${product.maxUserWeight}`);

    return (
      <main>
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div
          className="border-b border-[#E7D4C0] px-5 py-3.5 sm:px-9"
          style={{ background: "#FBF2E8" }}
        >
          <p className="mx-auto max-w-[1360px] text-[13px] font-medium text-[#77716B]">
            <Link href="/" className="transition hover:text-[#103B39]">
              Home
            </Link>
            <span className="mx-2 text-[#D9C6B1]">/</span>
            <Link
              href="/specifications"
              className="transition hover:text-[#103B39]"
            >
              Specifications
            </Link>
            <span className="mx-2 text-[#D9C6B1]">/</span>
            <span className="text-[#103B39]">{product.name}</span>
          </p>
        </div>

        {/* ── Product hero ─────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden px-5 py-8 sm:px-9 lg:py-12"
          style={{
            background:
              "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)",
          }}
        >
          {/* Radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse at 20% 60%, rgba(21,80,75,0.55) 0%, transparent 55%)",
            }}
          />
          {/* Decorative gold curve */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1360 700"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M -40 500 C 200 445 500 540 800 480 C 1050 428 1200 500 1420 468"
              stroke="#F0A52E"
              strokeWidth="1.5"
              opacity="0.18"
            />
          </svg>

          <div className="relative mx-auto max-w-[1360px]">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">

              {/* Left — gallery (48%) */}
              <div className="w-full lg:w-[48%]">
                <SpecGallery
                  images={galleryImages}
                  productName={product.name}
                />
              </div>

              {/* Right — info panel */}
              <div className="flex flex-1 flex-col">

                {/* Code + category row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="pt-1 text-[14px] font-bold uppercase tracking-[2px] text-[#F0A52E]">
                    {product.code}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/90">
                      {product.category.name}
                    </span>
                    {product.isBestseller && (
                      <span className="rounded-full bg-[#D85B13] px-3 py-1.5 text-[12px] font-bold text-white">
                        Bestseller
                      </span>
                    )}
                  </div>
                </div>

                {/* Product name */}
                <h1 className="font-display mt-3 text-[48px] font-bold leading-[1.05] tracking-tight text-white sm:text-[60px] lg:text-[72px]">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="mt-5">
                  <p className="text-[30px] font-bold leading-none text-white sm:text-[32px]">
                    {price}
                  </p>
                  <p className="mt-1.5 text-[14px] text-white/50">
                    + GST · GST invoice available for businesses
                  </p>
                </div>

                {/* Feature badges */}
                {badges.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-white/15 bg-white/8 px-4 py-2.5 text-[14px] font-semibold text-white/90"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <p className="mt-5 max-w-[600px] text-[15px] leading-[1.7] text-white/65 lg:text-[16px]">
                    {product.description}
                  </p>
                )}

                {/* CTA buttons */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/products/${product.slug}/order`}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#D85B13] px-8 py-3.5 text-[16px] font-bold text-white transition-all duration-[250ms] ease-out hover:bg-[#c0500f] hover:shadow-[0_4px_18px_rgba(216,91,19,0.38)]"
                    style={{ minHeight: 50 }}
                  >
                    Enquire
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 7h12M7.5 2.5 13 7 7.5 11.5" />
                    </svg>
                  </Link>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#16BD60] px-8 py-3.5 text-[16px] font-bold text-white transition-all duration-[250ms] ease-out hover:bg-[#13a854] hover:shadow-[0_4px_14px_rgba(22,189,96,0.30)]"
                    style={{ minHeight: 50 }}
                  >
                    <svg
                      className="h-5 w-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>

                {/* Spec sheet */}
                {product.specSheetKey && (
                  <div className="mt-4">
                    <a
                      href={product.specSheetKey}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] font-semibold text-[#F0A52E] underline underline-offset-4 transition hover:text-[#F0A52E]/80"
                    >
                      Download spec sheet (PDF)
                    </a>
                  </div>
                )}

                {/* Trust / service items */}
                <div className="mt-5 flex flex-col gap-2.5">
                  {[
                    "Delivery & assembly",
                    "Bulk pricing available",
                    "GST invoice for businesses",
                  ].map((item) => (
                    <p
                      key={item}
                      className="flex items-center gap-2.5 text-[14px] font-medium text-white/60"
                    >
                      <CheckIcon />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Specifications table ─────────────────────────────────────────── */}
        <section
          className="px-5 py-12 sm:px-9 lg:py-16"
          style={{
            background: "linear-gradient(180deg, #EDE0CC 0%, #F5EAD8 100%)",
          }}
        >
          <div className="mx-auto max-w-[1360px]">
            <div
              className="rounded-[28px] border border-[#E7D4C0] p-7 shadow-[0_8px_24px_rgba(74,48,26,0.06)] sm:p-10"
              style={{ background: "#FFF9F1" }}
            >
              {/* Heading with gold accent line */}
              <div className="flex items-center gap-5">
                <h2 className="font-display shrink-0 text-[36px] font-bold text-[#103B39] sm:text-[46px]">
                  Specifications
                </h2>
                <div
                  className="h-[2px] flex-1 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(240,165,46,0.60) 0%, transparent 100%)",
                  }}
                />
              </div>

              {/* Spec rows */}
              <div className="mt-7 overflow-hidden rounded-[14px] border border-[#EAD8C5]">
                {specRows.map(([label, value], i) => (
                  <div
                    key={label}
                    className={`grid grid-cols-[1fr_1.5fr] gap-4 px-5 py-4 ${
                      i < specRows.length - 1
                        ? "border-b border-[#EAD8C5]"
                        : ""
                    } ${i % 2 === 0 ? "bg-[#FFF9F1]" : "bg-[#FDF5EC]"}`}
                  >
                    <span className="text-[14px] font-medium text-[#77716B] sm:text-[15px]">
                      {label}
                    </span>
                    <span className="text-[14px] font-semibold text-[#292622] sm:text-[15px]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Expert advice CTA ────────────────────────────────────────────── */}
        <section
          className="px-5 pb-14 pt-0 sm:px-9"
          style={{ background: "#F5EAD8" }}
        >
          <div className="mx-auto max-w-[1360px]">
            <div
              className="relative overflow-hidden rounded-[28px] p-8 md:p-12"
              style={{
                background:
                  "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)",
              }}
            >
              {/* Radial glow */}
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  background:
                    "radial-gradient(ellipse at 25% 55%, rgba(21,80,75,0.65) 0%, transparent 58%)",
                }}
              />
              {/* Decorative gold curves */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 1200 220"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M -40 55 C 160 10 440 90 720 42 C 920 5 1060 62 1240 28"
                  stroke="#F0A52E"
                  strokeWidth="1.5"
                  opacity="0.26"
                />
                <path
                  d="M 740 230 C 880 175 1040 198 1260 168"
                  stroke="#F0A52E"
                  strokeWidth="1.2"
                  opacity="0.14"
                />
              </svg>

              <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between md:gap-12">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[2px] text-[#F0A52E]">
                    Not sure where to start?
                  </p>
                  <h2 className="font-display mt-3 max-w-lg text-[32px] font-bold leading-[1.1] text-white/75 sm:text-[40px] lg:text-[44px]">
                    Get expert advice for your workspace.
                  </h2>
                  <p className="mt-3 max-w-md text-[15px] leading-[1.6] text-white/70">
                    Our team is here to help you find the perfect chair.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="w-fit shrink-0 rounded-full bg-[#D85B13] px-7 py-[14px] text-[15px] font-bold text-white transition-all duration-200 hover:bg-[#c0500f] hover:shadow-[0_4px_18px_rgba(216,91,19,0.42)]"
                >
                  Contact Us →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Index / listing view ───────────────────────────────────────────────────
  const selectedCategory = typeof category === "string" ? category : null;

  const [dbProducts, dbCategories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        images: {
          where: { isPrimary: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, slug: true },
    }),
  ]);

  const filtered = selectedCategory
    ? dbProducts.filter((p) => p.category.slug === selectedCategory)
    : dbProducts;

  return (
    <main>
      {/* Page hero */}
      <section
        className="relative overflow-hidden px-5 py-14 sm:px-9 lg:py-20"
        style={{
          background:
            "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 28% 55%, rgba(21,80,75,0.6) 0%, transparent 58%)",
          }}
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1360 220"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M -80 55 C 150 5 480 95 780 42 C 1020 5 1180 68 1440 28"
            stroke="#F0A52E"
            strokeWidth="1.8"
            opacity="0.25"
          />
        </svg>

        <div className="relative mx-auto max-w-[1360px]">
          <p className="text-[13px] font-medium text-white/40">
            <Link href="/" className="transition hover:text-white/70">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">Specifications</span>
          </p>
          <p className="mt-5 text-[13px] font-bold uppercase tracking-[2px] text-[#F0A52E]">
            Product Specifications
          </p>
          <h1 className="font-display mt-3 text-[42px] font-bold leading-[1.08] text-white sm:text-[52px] lg:text-[64px]">
            Find your chair{" "}
            <em className="italic text-[#F0A52E]">specifications.</em>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.65] text-white/55">
            Select a chair below to view its full specification sheet. Filter by
            category or browse all models.
          </p>
        </div>
      </section>

      {/* Category filter tabs */}
      <section
        className="sticky top-[61px] z-40 border-b border-[#E7D4C0] px-5 sm:px-9"
        style={{ background: "#FBF2E8" }}
      >
        <div className="mx-auto max-w-[1360px]">
          <div className="flex gap-2 overflow-x-auto py-3">
            <Link
              href="/specifications"
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                !selectedCategory
                  ? "border-[#D85B13] bg-[#D85B13] text-white"
                  : "border-[#E7D4C0] bg-white text-[#103B39] hover:border-[#D85B13]/50"
              }`}
            >
              All
            </Link>
            {dbCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/specifications?category=${cat.slug}`}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  selectedCategory === cat.slug
                    ? "border-[#D85B13] bg-[#D85B13] text-white"
                    : "border-[#E7D4C0] bg-white text-[#103B39] hover:border-[#D85B13]/50"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section
        className="px-5 py-10 sm:px-9"
        style={{
          background: "linear-gradient(180deg, #FBF2E8 0%, #F5EAD8 100%)",
        }}
      >
        <div className="mx-auto max-w-[1360px]">
          <p className="mb-6 text-[13px] font-medium text-[#77716B]">
            {filtered.length} {filtered.length === 1 ? "model" : "models"}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#E7D4C0] p-12 text-center">
              <p className="text-[14px] text-[#77716B]">
                No chairs in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => {
                const primaryImage = product.images[0];
                const price = normalisedPrice(product.price);

                return (
                  <Link
                    key={product.id}
                    href={`/specifications?model=${product.code}`}
                    className="group overflow-hidden rounded-[20px] border border-[#E7D4C0] bg-[#FFF9F1] transition duration-[250ms] hover:-translate-y-[2px] hover:border-[#D85B13]/30 hover:shadow-[0_8px_24px_rgba(74,48,26,0.10)]"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F3E5D4]">
                      {primaryImage ? (
                        <img
                          src={primaryImage.storageKey}
                          alt={primaryImage.altText ?? product.name}
                          className="h-full w-full object-contain p-4 transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B6914]/30">
                            NC
                          </span>
                        </div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full border border-[#E7D4C0] bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-[#103B39]">
                        {product.category.name}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#D85B13]">
                        {product.code}
                      </p>
                      <h3 className="font-display mt-1 text-[22px] font-bold text-[#103B39]">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-[13px] text-[#77716B]">{price}</p>
                      <p className="mt-3 text-[12px] font-semibold text-[#D85B13] opacity-0 transition duration-200 group-hover:opacity-100">
                        View specifications →
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
