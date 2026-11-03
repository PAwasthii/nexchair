import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

function normalisedPrice(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes("[") || trimmed === "Price on request") {
    return "Price on request";
  }
  return trimmed;
}

export default async function Bestsellers() {
  const dbProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      isBestseller: true,
    },
    include: {
      category: true,
      images: {
        where: {
          isPrimary: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  const products: Product[] = dbProducts.map((product) => {
    const specs =
      typeof product.specs === "object" &&
      product.specs !== null
        ? (product.specs as {
            lumbar?: string;
            back?: string;
          })
        : {};

    return {
      name: product.name,
      slug: product.slug,
      code: product.code,
      category: product.category.name,
      price: normalisedPrice(product.price),
      description:
        product.description ??
        "A practical chair designed for comfortable everyday use.",
      colour: product.colour ?? "-",
      seatWeight: product.seatWeight ?? "-",
      maxUserWeight: product.maxUserWeight ?? "-",
      armrests: product.armrests ?? "-",
      warranty: product.warranty ?? "-",
      isBestseller: product.isBestseller,
      imageUrl: product.images[0]?.storageKey,
      features: Array.isArray(product.features)
        ? product.features.filter(
            (feature): feature is string =>
              typeof feature === "string",
          )
        : [],
      specs: {
        lumbar: specs.lumbar ?? "-",
        armrests: product.armrests ?? "-",
        back: specs.back ?? "-",
      },
    };
  });

  if (products.length === 0) return null;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
              Bestsellers
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              The chairs people keep coming back to.
            </h2>
          </div>

          <a
            href="/product-range"
            className="hidden text-sm font-semibold underline underline-offset-4 md:block"
          >
            View all
          </a>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.code}
              product={product}
            />
          ))}
        </div>

        <a
          href="/product-range"
          className="mt-6 block text-sm font-semibold underline underline-offset-4 md:hidden"
        >
          View all products →
        </a>
      </div>
    </section>
  );
}