export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Product Range | NexChair",
  description: "Browse NexChair's full range of ergonomic, executive and staff chairs. Filter by category, back type and armrests.",
};

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
  let dbProducts: Awaited<ReturnType<typeof prisma.product.findMany<{
    where: { isActive: boolean };
    include: {
      category: true;
      images: { where: { isPrimary: boolean }; orderBy: { sortOrder: "asc" }; take: 1 };
    };
    orderBy: { createdAt: "desc" };
  }>>> = [];
  let dbCategories: { name: string; slug: string }[] = [];

  try {
    [dbProducts, dbCategories] = await Promise.all([
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { name: true, slug: true },
      }),
    ]);
  } catch {
    // DB unreachable — render page with empty state
  }

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