import { getCategories } from "@/app/actions/admin-categories";
import { getProducts } from "@/app/actions/admin-products";
import { requireAdminSession } from "@/lib/auth/admin";
import ProductManager from "@/components/admin/ProductManager";

export const metadata = { title: "Products · NexChair Admin" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireAdminSession();

  const { category: categorySlug } = await searchParams;

  // Fetch all categories first — needed for the form dropdown and slug validation.
  const categories = await getCategories();

  // Validate the slug against real categories so an arbitrary URL param cannot
  // be used to probe the DB. Unknown slugs silently fall back to the full list.
  const found = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;
  const filterCategory = found
    ? { id: found.id, name: found.name, slug: found.slug }
    : null;

  // DB-level filter when a valid category is identified; fetches all otherwise.
  const products = await getProducts(filterCategory?.id);

  return (
    <ProductManager
      products={products}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      filterCategory={filterCategory}
    />
  );
}
