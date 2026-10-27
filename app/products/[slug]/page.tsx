import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { whatsappHref } from "@/lib/site";

const COLOUR_HEX: Record<string, string> = {
  Graphite: "#4a4543",
  Black: "#171717",
  Grey: "#b7b0a5",
  Brown: "#9d431b",
  Navy: "#2c3e6b",
  White: "#f5f1ea",
};

function colourHex(name: string): string {
  return COLOUR_HEX[name] ?? "#888888";
}

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
                  <span className="rounded-full bg-[#f5dfd4] px-3 py-1 text-xs text-[#c44e18]">
                    Bestseller
                  </span>
                )}
              </div>

              <p className="mt-5 text-xs uppercase tracking-widest text-black/40">
                {product.code}
              </p>

              <h1 className="mt-2 text-5xl font-bold tracking-tight">
                {product.name}
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-6 text-black/55">
                {product.description}
              </p>

              <p className="mt-8 text-3xl font-bold">
                {product.price}
              </p>

              <p className="mt-1 text-xs text-black/40">
                incl. GST · ask for pricing on bulk orders
              </p>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest">
                  Colour
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full border-2 border-white ring-1 ring-black/20"
                    style={{
                      backgroundColor: colourHex(
                        product.colour ?? "Graphite",
                      ),
                    }}
                  />
                  <span className="text-sm text-black/70">
                    {product.colour ?? "Graphite"}
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs text-black/40">
                    Seat weight
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {product.seatWeight ?? "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs text-black/40">
                    Max user weight
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {product.maxUserWeight ?? "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs text-black/40">
                    Armrests
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {product.armrests ?? "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs text-black/40">
                    Warranty
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {product.warranty ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/products/${product.slug}/order`}
                  className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
                >
                  Add to order enquiry
                </Link>

                <a
                  href={whatsappHref}
                  className="rounded-full border border-black px-6 py-3 text-sm font-semibold"
                >
                  Ask on WhatsApp
                </a>

                {product.specSheetKey ? (
                  <a
                    href={product.specSheetKey}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-black px-6 py-3 text-sm font-semibold"
                  >
                    Spec sheet (PDF)
                  </a>
                ) : (
                  <span
                    title="Spec sheet not yet available"
                    className="cursor-not-allowed rounded-full border border-black/20 px-6 py-3 text-sm text-black/30"
                  >
                    Spec sheet (PDF)
                  </span>
                )}
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
            className="shrink-0 border-b-2 border-[#c44e18] py-5 text-sm font-semibold"
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
            href="#compare"
            className="shrink-0 py-5 text-sm text-black/50 transition hover:text-black/80"
          >
            Compare
          </a>

          <a
            href="#warranty"
            className="shrink-0 py-5 text-sm text-black/50 transition hover:text-black/80"
          >
            Warranty & care
          </a>
        </div>
      </section>

      {/* Specifications */}
      <section
        id="specifications"
        className="scroll-mt-20 px-6 py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Dimensions */}
            <div id="dimensions" className="scroll-mt-20">
              <h2 className="text-4xl font-bold">
                Dimensions
              </h2>

              <div className="mt-8 flex min-h-[400px] items-center justify-center rounded-3xl bg-[#e9e3d8]">
                <p className="text-sm text-black/40">
                  Dimension diagram
                </p>
              </div>
            </div>

            {/* Full specification */}
            <div>
              <h2 className="text-4xl font-bold">
                Full specification
              </h2>

              <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
                {(
                  [
                    ["Overall height", getDim(product.dimensions, "overallHeight")],
                    ["Seat width × depth", getDim(product.dimensions, "seatWidthDepth")],
                    ["Seat height range", getDim(product.dimensions, "seatHeightRange")],
                    ["Product weight", product.seatWeight ?? "-"],
                    ["Tilt mechanism", getDim(product.dimensions, "tiltMechanism")],
                    ["Recline range & lock", getDim(product.dimensions, "reclineRange")],
                    ["Armrests", product.armrests ?? "-"],
                    ["Lumbar", getSpec(product.specs, "lumbar")],
                    ["Back", getSpec(product.specs, "back")],
                    ["Seat", getDim(product.dimensions, "seat")],
                    ["Gas lift", getDim(product.dimensions, "gasLift")],
                    ["Maximum user weight", product.maxUserWeight ?? "-"],
                    ["Warranty", product.warranty ?? "-"],
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

      {/* Compare */}
      <ProductComparison
        currentProduct={{
          name: product.name,
          category: product.category.name,
          price: product.price,
          maxUserWeight: product.maxUserWeight ?? "-",
          armrests: product.armrests ?? "-",
          warranty: product.warranty ?? "-",
          lumbar: getSpec(product.specs, "lumbar"),
          back: getSpec(product.specs, "back"),
        }}
        products={similarProducts.map((item) => ({
          name: item.name,
          category: item.category.name,
          price: item.price,
          maxUserWeight: item.maxUserWeight ?? "-",
          armrests: item.armrests ?? "-",
          warranty: item.warranty ?? "-",
          lumbar: getSpec(item.specs, "lumbar"),
          back: getSpec(item.specs, "back"),
        }))}
      />

      {/* Warranty & Care */}
      <section
        id="warranty"
        className="scroll-mt-20 bg-[#171717] px-6 py-16 text-white"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
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
    </main>
  );
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