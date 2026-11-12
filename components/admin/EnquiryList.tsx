"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";

import type { EnquiryListItem } from "@/app/actions/admin-enquiries";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-[#f5dfd4] text-[#c44e18]" },
  CONTACTED: { label: "Contacted", className: "bg-blue-50 text-blue-700" },
  CLOSED: { label: "Closed", className: "bg-black/5 text-black/40" },
};

const TYPE_LABELS: Record<string, string> = {
  CONTACT: "Contact",
  QUOTE: "Quote",
  ORDER: "Order",
};

type Props = {
  enquiries: EnquiryListItem[];
  total: number;
  page: number;
  pageCount: number;
  currentStatus: string;
  currentType: string;
  currentSearch: string;
};

export default function EnquiryList({
  enquiries,
  total,
  page,
  pageCount,
  currentStatus,
  currentType,
  currentSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    startTransition(() => {
      router.push(`/admin/enquiries?${sp.toString()}`);
    });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, email, company…"
          defaultValue={currentSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate({ search: e.currentTarget.value, page: "1" });
            }
          }}
          className="w-56 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black"
        />

        <select
          value={currentStatus}
          onChange={(e) => navigate({ status: e.target.value, page: "1" })}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={currentType}
          onChange={(e) => navigate({ type: e.target.value, page: "1" })}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="CONTACT">Contact</option>
          <option value="QUOTE">Quote</option>
          <option value="ORDER">Order</option>
        </select>

        <span className="ml-auto text-sm text-black/40">
          {total} {total === 1 ? "enquiry" : "enquiries"}
        </span>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white">
        {enquiries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium">No enquiries found.</p>
            <p className="mt-1 text-sm text-black/40">
              {currentStatus || currentType || currentSearch
                ? "Try adjusting your filters."
                : "Customer enquiries will appear here."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/40">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Items</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {enquiries.map((e) => {
                const statusStyle =
                  STATUS_LABELS[e.status] ?? STATUS_LABELS.NEW;
                return (
                  <tr
                    key={e.id}
                    className="transition hover:bg-black/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/enquiries/${e.id}`}
                        className="block"
                      >
                        <span className="font-medium">{e.name}</span>
                        {e.company && (
                          <span className="ml-1.5 text-black/40">
                            · {e.company}
                          </span>
                        )}
                        <br />
                        <span className="text-xs text-black/40">
                          {e.email ?? e.phone ?? "—"}
                          {e.city ? ` · ${e.city}` : ""}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-black/60">
                      {TYPE_LABELS[e.type] ?? e.type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.className}`}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-black/60">
                      {e.itemCount > 0 ? e.itemCount : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-black/40">
                      {formatDate(e.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => navigate({ page: String(page - 1) })}
            className="rounded-lg border border-black/10 px-4 py-2 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-black/40">
            Page {page} of {pageCount}
          </span>

          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => navigate({ page: String(page + 1) })}
            className="rounded-lg border border-black/10 px-4 py-2 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
