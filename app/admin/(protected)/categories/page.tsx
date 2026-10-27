import { getCategories } from "@/app/actions/admin-categories";
import { requireAdminSession } from "@/lib/auth/admin";
import CategoryManager from "@/components/admin/CategoryManager";

export const metadata = { title: "Categories · NexChair Admin" };

export default async function AdminCategoriesPage() {
  await requireAdminSession();
  const categories = await getCategories();

  return <CategoryManager categories={categories} />;
}
