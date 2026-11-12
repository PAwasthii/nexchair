import { Suspense } from "react";

import { getEnquiries } from "@/app/actions/admin-enquiries";
import { requireAdminSession } from "@/lib/auth/admin";
import EnquiryList from "@/components/admin/EnquiryList";

export const metadata = { title: "Enquiries · NexChair Admin" };

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    type?: string;
    search?: string;
    page?: string;
  }>;
}) {
  await requireAdminSession();

  const params = await searchParams;
  const status = params.status ?? "";
  const type = params.type ?? "";
  const search = params.search ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const result = await getEnquiries({ status, type, search, page });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
          Management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Enquiries</h1>
        <p className="mt-1 text-sm text-black/50">
          View and manage contact, quote, and order enquiries.
        </p>
      </div>

      <Suspense>
        <EnquiryList
          enquiries={result.enquiries}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
          currentStatus={status}
          currentType={type}
          currentSearch={search}
        />
      </Suspense>
    </div>
  );
}
