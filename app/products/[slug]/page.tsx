import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { whatsappHref } from "@/lib/site";

import ProductComparison from "@/components/product-detail/ProductComparison";
import ProductGallery from "@/components/product-detail/ProductGallery";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: {
      slug,
      isActive: true,
    },
    include: {
      category: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const similarProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: {
        not: product.id,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 2,
  });

  return (
    <main>
      {/* Product header */}
      <section className="border-b border-black/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs text-black/40">
            <Link href="/" className="hover:text-black/70">Home</Link>
            {" / "}
            <Link href="/product-range" className="hover:text-black/70">Product Range</Link>
            {" / "}
            {product.name}
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Product gallery */}
            <ProductGallery
              productName={product.name}
              images={product.images.map((image) => ({
                id: image.id,
                storageKey: image.storageKey,
                altText: image.altText,
              }))}
            />

            {/* Product information */}
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs">
                  {product.category.name}
                </span>

                {product.isBestseller && (
                  <span className="rounded-full bg-[#fde8d4] px-3 py-1 text-xs text-[#F26919]">
                    Bestseller
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {product.name}
              </h1>

              <p className="mt-4 text-3xl font-bold">
                {normalisedProductPrice(product.price)}
              </p>

              <p className="mt-1 text-xs text-black/40">
                incl. GST · GST invoice available for businesses
              </p>

              {/* Inline spec tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {product.maxUserWeight && product.maxUserWeight !== "-" && (
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                    Max user weight: {product.maxUserWeight}
                  </span>
                )}
                {product.armrests && product.armrests !== "-" && (
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                    {product.armrests}
                  </span>
                )}
                {getSpec(product.specs, "back") !== "-" && (
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                    {getSpec(product.specs, "back")}
                  </span>
                )}
                {product.warranty && product.warranty !== "-" && (
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs">
                    {product.warranty} warranty
                  </span>
                )}
              </div>

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
                  className="flex items-center gap-2 rounded-full bg-[#1aad4b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#158a3c]"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Spec sheet link */}
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
                    Download spec sheet (PDF)
                  </span>
                )}
              </div>

              {/* Trust indicators */}
              <div className="mt-6 space-y-1.5">
                {[
                  "Manufacturer warranty included",
                  "Delivery & assembly",
                  "Bulk pricing available",
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
        </div>
      </section>

      {/* Product tabs */}
      <section className="sticky top-0 z-10 border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-6">
          <a
            href="#specifications"
            className="shrink-0 border-b-2 border-[#F26919] py-5 text-sm font-semibold"
          >
            Specifications
          </a>

          <a
            href="#dimensions"
            className="shrink-0 py-5 text-sm text-black/50 transition hover:text-black/80"
          >
            Dimensions
          </a>

          <a
            href="#mechanism"
            className="shrink-0 py-5 text-sm text-black/50 transition hover:text-black/80"
          >
            Mechanism
          </a>

          <a
            href="#warranty"
            className="shrink-0 py-5 text-sm text-black/50 transition hover:text-black/80"
          >
            Warranty & care
          </a>

          <a
            href="#compare"
            className="shrink-0 py-5 text-sm text-black/50 transition hover:text-black/80"
          >
            Compare
          </a>
        </div>
      </section>

      {/* Specifications */}
      <section
        id="specifications"
        className="scroll-mt-20 px-6 py-10"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold">Specifications</h2>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {/* Spec table */}
            <div className="divide-y divide-black/10 border-y border-black/10">
              {(
                [
                  ["Model code", product.code],
                  ["Category", product.category.name],
                  ["Back", getSpec(product.specs, "back")],
                  ["Seat", getDim(product.dimensions, "seat")],
                  ["Armrests", product.armrests ?? "-"],
                  ["Base", getDim(product.dimensions, "base")],
                  ["Casters", getDim(product.dimensions, "casters")],
                  ["Gas lift", getDim(product.dimensions, "gasLift")],
                  ["Max user weight", product.maxUserWeight ?? "-"],
                ] as [string, string][]
              )
                .filter(([, value]) => value !== "-")
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-2 gap-4 py-3 text-sm"
                  >
                    <span className="text-black/50">{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
            </div>

            {/* Mechanism & adjustments */}
            <div>
              <h3 className="text-xl font-semibold">Mechanism &amp; adjustments</h3>

              <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
                {(
                  [
                    ["Tilt mechanism", getDim(product.dimensions, "tiltMechanism")],
                    ["Recline range", getDim(product.dimensions, "reclineRange")],
                    ["Tilt lock", getDim(product.dimensions, "tiltLock")],
                    ["Seat slider", getDim(product.dimensions, "seatSlider")],
                    ["Headrest", getDim(product.dimensions, "headrest")],
                  ] as [string, string][]
                )
                  .filter(([, value]) => value !== "-")
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-2 gap-4 py-3 text-sm"
                    >
                      <span className="text-black/50">{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
              </div>

              <h3 className="mt-8 text-xl font-semibold">Warranty &amp; care</h3>

              <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
                {(
                  [
                    ["Frame & mechanism", getDim(product.dimensions, "warrantyFrame")],
                    ["Upholstery", getDim(product.dimensions, "warrantyUpholstery")],
                    ["Service", getDim(product.dimensions, "warrantyService")],
                  ] as [string, string][]
                )
                  .filter(([, value]) => value !== "-")
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-2 gap-4 py-3 text-sm"
                    >
                      <span className="text-black/50">{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dimensions */}
      <section
        id="dimensions"
        className="scroll-mt-20 border-t border-black/10 px-6 py-10"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold">Dimensions</h2>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div className="flex min-h-[400px] items-center justify-center rounded-3xl bg-[#e9e3d8]">
              <p className="text-sm text-black/40">
                Dimension diagram
              </p>
            </div>

            <div className="divide-y divide-black/10 border-y border-black/10">
              {(
                [
                  ["Overall height", getDim(product.dimensions, "overallHeight")],
                  ["Overall width", getDim(product.dimensions, "overallWidth")],
                  ["Overall depth", getDim(product.dimensions, "overallDepth")],
                  ["Seat height", getDim(product.dimensions, "seatHeight")],
                  ["Seat width × depth", getDim(product.dimensions, "seatWidthDepth")],
                  ["Backrest height", getDim(product.dimensions, "backrestHeight")],
                  ["Armrest height", getDim(product.dimensions, "armrestHeight")],
                  ["Net weight", product.seatWeight ?? "-"],
                ] as [string, string][]
              )
                .filter(([, value]) => value !== "-")
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-2 gap-4 py-3 text-sm"
                  >
                    <span className="text-black/50">{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism */}
      <section
        id="mechanism"
        className="scroll-mt-20 border-t border-black/10 px-6 py-10"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold">Mechanism</h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Tilt mechanism
              </p>
              <p className="mt-3 text-sm text-black/70">
                {getDim(product.dimensions, "tiltMechanism") !== "-"
                  ? getDim(product.dimensions, "tiltMechanism")
                  : "[Synchro / knee-tilt]"}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Recline range
              </p>
              <p className="mt-3 text-sm text-black/70">
                {getDim(product.dimensions, "reclineRange") !== "-"
                  ? getDim(product.dimensions, "reclineRange")
                  : "[–]° – [–]°"}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Seat slider
              </p>
              <p className="mt-3 text-sm text-black/70">
                {getDim(product.dimensions, "seatSlider") !== "-"
                  ? getDim(product.dimensions, "seatSlider")
                  : "[–] mm travel"}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Headrest
              </p>
              <p className="mt-3 text-sm text-black/70">
                {getDim(product.dimensions, "headrest") !== "-"
                  ? getDim(product.dimensions, "headrest")
                  : "[Height / angle]"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty & Care */}
      <section
        id="warranty"
        className="scroll-mt-20 bg-[#171717] px-6 py-10 text-white"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
                Warranty & care
              </p>

              <h2 className="mt-4 max-w-md text-4xl font-bold tracking-tight md:text-5xl">
                Clear coverage. Simple care.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/55">
                Your product information should be as straightforward after
                purchase as it is before it.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-6">
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Warranty
                </p>

                <p className="mt-4 text-2xl font-semibold">
                  {product.warranty ?? "-"}
                </p>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Warranty coverage applies according to the product warranty
                  terms supplied at the time of purchase.
                </p>
              </div>

              <div className="rounded-3xl bg-white/5 p-6">
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Everyday care
                </p>

                <p className="mt-4 text-2xl font-semibold">
                  Keep it simple
                </p>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Keep surfaces clean, avoid harsh chemicals and follow the
                  care instructions supplied with your chair.
                </p>
              </div>

              <div className="rounded-3xl bg-white/5 p-6">
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Support
                </p>

                <p className="mt-4 text-2xl font-semibold">
                  Need help?
                </p>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Contact the NexChair team for warranty, product or service
                  questions.
                </p>

                <a
                  href="/contact"
                  className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  Contact us →
                </a>
              </div>

              <div className="rounded-3xl bg-white/5 p-6">
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Product information
                </p>

                <p className="mt-4 text-2xl font-semibold">
                  Keep your details
                </p>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Keep your invoice, product code and specification sheet for
                  future reference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compare */}
      <ProductComparison
        currentProduct={{
          name: product.name,
          category: product.category.name,
          price: normalisedProductPrice(product.price),
          maxUserWeight: product.maxUserWeight ?? "-",
          armrests: product.armrests ?? "-",
          warranty: product.warranty ?? "-",
          lumbar: getSpec(product.specs, "lumbar"),
          back: getSpec(product.specs, "back"),
        }}
        products={similarProducts.map((item) => ({
          name: item.name,
          category: item.category.name,
          price: normalisedProductPrice(item.price),
          maxUserWeight: item.maxUserWeight ?? "-",
          armrests: item.armrests ?? "-",
          warranty: item.warranty ?? "-",
          lumbar: getSpec(item.specs, "lumbar"),
          back: getSpec(item.specs, "back"),
        }))}
      />
    </main>
  );
}

function normalisedProductPrice(raw: string): string {
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

function getDim(dimensions: unknown, key: string): string {
  return getSpec(dimensions, key);
}
