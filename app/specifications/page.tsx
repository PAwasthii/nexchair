export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { whatsappHref } from "@/lib/site";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SpecificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { model, category } = await searchParams;
  const modelCode = typeof model === "string" ? model.trim().toUpperCase() : null;

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
    const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
    const galleryImages = product.images;
    const back = getSpec(product.specs, "back");
    const lumbar = getSpec(product.specs, "lumbar");

    return (
      <main>
        {/* Breadcrumb */}
        <div className="border-b border-black/10 px-6 py-3">
          <p className="mx-auto max-w-7xl text-xs text-black/40">
            <Link href="/" className="hover:text-black/70">Home</Link>
            {" / "}
            <Link href="/specifications" className="hover:text-black/70">Specifications</Link>
            {" / "}
            <span className="text-black/70">{product.name}</span>
          </p>
        </div>

        {/* Product detail */}
        <section className="px-6 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">

              {/* Left: image gallery */}
              <div>
                {/* Main image */}
                <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#e9e3d8]">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.storageKey}
                      alt={primaryImage.altText ?? product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1023px) calc(100vw - 48px), 50vw"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-black/10 bg-white/50 text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                        NC
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {galleryImages.map((img) => (
                      <div
                        key={img.id}
                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 ${
                          img.id === (primaryImage?.id ?? "") ? "border-black" : "border-black/10"
                        }`}
                      >
                        <Image
                          src={img.storageKey}
                          alt={img.altText ?? product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: product info */}
              <div className="flex flex-col justify-start">
                {/* Category + Bestseller badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs">
                    {product.category.name}
                  </span>
                  {product.isBestseller && (
                    <span className="rounded-full bg-[#f5dfd4] px-3 py-1 text-xs text-[#F26919]">
                      Bestseller
                    </span>
                  )}
                </div>

                {/* Model code */}
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#F26919]">
                  {product.code}
                </p>

                {/* Name */}
                <h1 className="mt-2 text-4xl font-bold tracking-tight lg:text-5xl">
                  {product.name}
                </h1>

                {/* Price */}
                <p className="mt-5 text-3xl font-bold">{price}</p>
                <p className="mt-1 text-xs text-black/40">
                  + GST · GST invoice available for businesses
                </p>

                {/* Quick spec tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.maxUserWeight && product.maxUserWeight !== "-" && (
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                      Max {product.maxUserWeight}
                    </span>
                  )}
                  {product.armrests && product.armrests !== "-" && (
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                      {product.armrests}
                    </span>
                  )}
                  {back !== "-" && (
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                      {back} back
                    </span>
                  )}
                  {product.warranty && product.warranty !== "-" && (
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                      {product.warranty} warranty
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="mt-5 text-sm leading-6 text-black/60">
                    {product.description}
                  </p>
                )}

                {/* Action buttons */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/products/${product.slug}/order`}
                    className="rounded-full bg-[#0E3159] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a2647]"
                  >
                    Enquire
                  </Link>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-[#0E3159] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a2647]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>

                {/* Spec sheet download */}
                <div className="mt-4">
                  {product.specSheetKey ? (
                    <a
                      href={product.specSheetKey}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold underline underline-offset-4"
                    >
                      Download spec sheet (PDF)
                    </a>
                  ) : (
                    <span className="cursor-not-allowed text-sm text-black/30">
                      Spec sheet not available yet
                    </span>
                  )}
                </div>

                {/* Trust indicators */}
                <div className="mt-6 space-y-1.5">
                  {[
                    "Delivery & assembly",
                    "Bulk pricing available",
                    "GST invoice for businesses",
                  ].map((item) => (
                    <p key={item} className="flex items-center gap-2 text-xs text-black/60">
                      <svg className="h-3.5 w-3.5 shrink-0 text-[#F26919]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Specifications table */}
            <div className="mt-16 border-t border-black/10 pt-10">
              <h2 className="text-2xl font-bold">Specifications</h2>

              <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
                {(
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
                )
                  .filter(([, value]) => value !== "-")
                  .map(([label, value]) => (
                    <div key={label} className="grid grid-cols-2 gap-4 py-3 text-sm">
                      <span className="text-black/50">{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Index view ─────────────────────────────────────────────────────────────

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
      {/* Page header */}
      <section className="border-b border-black/10 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
            Specifications
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Find your chair specifications.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-black/50">
            Select a chair below to view its full specification sheet. You can filter by category or browse all models.
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <section className="sticky top-[61px] z-40 border-b border-black/10 bg-white px-6 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/specifications"
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition ${
                !selectedCategory
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black hover:border-black/30"
              }`}
            >
              All
            </Link>
            {dbCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/specifications?category=${cat.slug}`}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition ${
                  selectedCategory === cat.slug
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black hover:border-black/30"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-sm text-black/40">
            {filtered.length} {filtered.length === 1 ? "model" : "models"}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/20 p-12 text-center">
              <p className="text-sm text-black/50">No chairs in this category yet.</p>
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
                    className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e3d8]">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.storageKey}
                          alt={primaryImage.altText ?? product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) calc(50vw - 40px), (max-width: 1279px) calc(33vw - 32px), calc(25vw - 32px)"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-black/10 bg-white/50 text-xs font-semibold uppercase tracking-[0.2em] text-black/30">
                            NC
                          </div>
                        </div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium">
                        {product.category.name}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#F26919]">
                        {product.code}
                      </p>
                      <h3 className="mt-1 font-semibold">{product.name}</h3>
                      <p className="mt-1 text-sm text-black/50">{price}</p>
                      <p className="mt-3 text-xs font-medium text-[#F26919] opacity-0 transition group-hover:opacity-100">
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
