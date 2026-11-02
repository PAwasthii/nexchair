import { Suspense } from "react";

import { prisma } from "@/lib/prisma";

import ProductFilters from "@/components/product-range/ProductFilters";
import ProductRangeCTA from "@/components/product-range/ProductRangeCTA";
import ProductRangeHeader from "@/components/product-range/ProductRangeHeader";
import type { Product } from "@/types/product";

function normalisedPrice(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes("[") || trimmed === "Price on request") {
    return "Price on request";
  }
  return trimmed;
}

export default async function ProductRange() {
  const dbProducts = await prisma.product.findMany({
    where: {
      isActive: true,
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
  });

  const dbCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true, slug: true },
  });

  const products: Product[] = dbProducts.map((product) => {
    const specs =
      typeof product.specs === "object" && product.specs !== null
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

  return (
    <main>
      <ProductRangeHeader />
      <Suspense>
        <ProductFilters products={products} categories={dbCategories} />
      </Suspense>
      <ProductRangeCTA />
    </main>
  );
}