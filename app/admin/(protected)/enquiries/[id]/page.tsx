import Link from "next/link";
import { notFound } from "next/navigation";

import { getEnquiry } from "@/app/actions/admin-enquiries";
import { requireAdminSession } from "@/lib/auth/admin";
import EnquiryNotesForm from "@/components/admin/EnquiryNotesForm";
import EnquiryStatusForm from "@/components/admin/EnquiryStatusForm";

export const metadata = { title: "Enquiry · NexChair Admin" };

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-[#f5dfd4] text-[#c44e18]",
  CONTACTED: "bg-blue-50 text-blue-700",
  CLOSED: "bg-black/5 text-black/40",
};

const TYPE_LABELS: Record<string, string> = {
  CONTACT: "Contact enquiry",
  QUOTE: "Quote request",
  ORDER: "Order enquiry",
};

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 py-2.5 text-sm">
      <span className="text-black/40">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();

  const { id } = await params;
  const enquiry = await getEnquiry(id);

  if (!enquiry) notFound();

  const statusStyle = STATUS_STYLES[enquiry.status] ?? STATUS_STYLES.NEW;
  const typeLabel = TYPE_LABELS[enquiry.type] ?? enquiry.type;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back */}
      <Link
        href="/admin/enquiries"
        className="inline-flex items-center gap-1.5 text-sm text-black/40 transition hover:text-black/70"
      >
        ← Back to enquiries
      </Link>

      {/* Header */}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            {typeLabel}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {enquiry.name}
            {enquiry.company && (
              <span className="ml-2 text-lg font-normal text-black/40">
                · {enquiry.company}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-black/40">
            Received {formatDate(enquiry.createdAt)}
          </p>
        </div>

        <span
          className={`self-start rounded-full px-3 py-1 text-sm font-medium ${statusStyle}`}
        >
          {enquiry.status.charAt(0) + enquiry.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Contact details */}
          <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40">
              Contact details
            </h2>

            <div className="mt-4 divide-y divide-black/5">
              <Row label="Name" value={enquiry.name} />
              <Row label="Email" value={enquiry.email} />
              <Row label="Phone" value={enquiry.phone} />
              <Row label="WhatsApp" value={enquiry.whatsapp} />
              <Row label="Company" value={enquiry.company} />
              <Row label="GSTIN" value={enquiry.gstin} />
              <Row label="City" value={enquiry.city} />
              <Row label="Pincode" value={enquiry.pincode} />
              <Row label="Contact via" value={enquiry.preferredContact} />
              <Row label="Needed by" value={enquiry.neededBy} />
              <Row label="Order type" value={enquiry.orderType} />
            </div>
          </section>

          {/* Message */}
          {enquiry.message && (
            <section className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40">
                Message
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
                {enquiry.message}
              </p>
            </section>
          )}

          {/* Products */}
          {enquiry.items.length > 0 && (
            <section className="rounded-2xl border border-black/10 bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40">
                Requested products
              </h2>

              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wider text-black/40">
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4">Code</th>
                    <th className="pb-2 pr-4">Colour</th>
                    <th className="pb-2 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {enquiry.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-4 font-medium">
                        {item.productName}
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-black/40">
                        {item.productCode}
                      </td>
                      <td className="py-2.5 pr-4 text-black/60">
                        {item.colour ?? "—"}
                      </td>
                      <td className="py-2.5 text-right font-semibold">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status */}
          <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40">
              Status
            </h2>
            <div className="mt-4">
              <EnquiryStatusForm
                enquiryId={enquiry.id}
                currentStatus={enquiry.status}
              />
            </div>
          </section>

          {/* Admin notes */}
          <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-black/40">
              Internal notes
            </h2>
            <p className="mt-1 text-xs text-black/40">
              Never visible to customers.
            </p>
            <div className="mt-4">
              <EnquiryNotesForm
                enquiryId={enquiry.id}
                initialNotes={enquiry.adminNotes}
              />
            </div>
          </section>

          {/* Metadata */}
          <section className="rounded-2xl border border-black/10 bg-white p-6 text-xs text-black/40">
            <p>
              ID: <span className="font-mono">{enquiry.id}</span>
            </p>
            <p className="mt-1">Received: {formatDate(enquiry.createdAt)}</p>
            <p className="mt-1">Updated: {formatDate(enquiry.updatedAt)}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
