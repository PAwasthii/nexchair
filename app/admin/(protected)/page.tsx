import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/admin";

export const metadata = { title: "Dashboard · NexChair Admin" };

type StatCardProps = {
  label: string;
  count: number;
  href: string;
  description: string;
};

function StatCard({ label, count, href, description }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-black/10 bg-white p-6 transition hover:border-black/20 hover:shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
        {label}
      </p>
      <p className="mt-3 text-4xl font-bold tracking-tight">{count}</p>
      <p className="mt-1 text-sm text-black/50">{description}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [totalProducts, activeProducts, totalCategories, newEnquiries] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.enquiry.count({ where: { status: "NEW" } }),
    ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-black/50">
          Live counts from the database.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          count={totalProducts}
          href="/admin/products"
          description="All products in the catalogue"
        />
        <StatCard
          label="Active Products"
          count={activeProducts}
          href="/admin/products"
          description="Visible on the public site"
        />
        <StatCard
          label="Categories"
          count={totalCategories}
          href="/admin/categories"
          description="Active product categories"
        />
        <StatCard
          label="New Enquiries"
          count={newEnquiries}
          href="/admin/enquiries"
          description="Awaiting a response"
        />
      </div>
    </div>
  );
}
