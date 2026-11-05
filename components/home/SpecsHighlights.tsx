import { prisma } from "@/lib/prisma";
import ProductShowcase from "@/components/home/ProductShowcase";
import type { Product } from "@/types/product";

function normalisedPrice(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes("[") || trimmed === "Price on request") {
    return "Price on request";
  }
  return trimmed;
}

export default async function SpecsHighlights() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      images: {
        where: { isPrimary: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: [{ isBestseller: "desc" }, { name: "asc" }],
  });

  const products: Product[] = dbProducts.map((product) => {
    const specs =
      typeof product.specs === "object" && product.specs !== null
        ? (product.specs as { lumbar?: string; back?: string })
        : {};

    return {
      name: product.name,
      slug: product.slug,
      code: product.code,
      category: product.category.name,
      price: normalisedPrice(product.price),
      description:
        product.description ??
        "A well-crafted chair designed for comfortable everyday use.",
      colour: product.colour ?? "-",
      seatWeight: product.seatWeight ?? "-",
      maxUserWeight: product.maxUserWeight ?? "-",
      armrests: product.armrests ?? "-",
      warranty: product.warranty ?? "-",
      isBestseller: product.isBestseller,
      imageUrl: product.images[0]?.storageKey,
      features: Array.isArray(product.features)
        ? product.features.filter((f): f is string => typeof f === "string")
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
    <section className="px-4 py-3 md:px-6 md:py-4">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#f5f1ea] p-8 md:p-10">
        <ProductShowcase products={products} />
      </div>
    </section>
  );
}
