import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

export default async function SpecsHighlights() {
  const dbProducts = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 4,
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
      price: product.price,
      description:
        product.description ??
        "A practical chair designed for comfortable everyday use.",
      colour: product.colour ?? "-",
      seatWeight: product.seatWeight ?? "-",
      maxUserWeight: product.maxUserWeight ?? "-",
      armrests: product.armrests ?? "-",
      warranty: product.warranty ?? "-",
      isBestseller: product.isBestseller,
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

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
              Best specs first
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Specs up front, every card.
            </h2>
          </div>

          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20"
            >
              ←
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
            >
              →
            </button>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.code}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-black/20 p-12 text-center">
            <p className="text-sm text-black/50">
              No products available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}