import { requireAdminSession } from "@/lib/auth/admin";
import {
  contactPhone,
  contactEmail,
  contactAddress,
  contactAddress2,
  businessHours,
} from "@/lib/site";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const metadata = { title: "Settings · NexChair Admin" };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 py-2.5 text-sm">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35 pt-0.5">
        {label}
      </span>
      <span className="text-black/80 break-words">{value}</span>
    </div>
  );
}

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+91 77982 03669";

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
          Configuration
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-black/50">
          Manage your admin account and review site configuration.
        </p>
      </div>

      <div className="space-y-6">

        {/* ── Account ───────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            Account
          </h2>

          {/* Signed-in indicator */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f5f1ea] px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c44e18]/12 text-[#c44e18]">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-black/40">Signed in as</p>
              <p className="truncate text-sm font-semibold text-black">
                {session.email}
              </p>
            </div>
          </div>

          {/* Change password */}
          <div className="mt-7 border-t border-black/8 pt-6">
            <h3 className="text-sm font-semibold text-black">Change password</h3>
            <p className="mt-0.5 text-xs text-black/40">
              Must be at least 8 characters. Take effect immediately.
            </p>
            <div className="mt-5">
              <ChangePasswordForm />
            </div>
          </div>
        </section>

        {/* ── Site details ──────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                Site details
              </h2>
              <p className="mt-1 text-xs text-black/40">
                Hardcoded in source — ask your developer to update these values.
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-black/6 rounded-xl border border-black/8 bg-[#f5f1ea] px-4">
            <InfoRow label="Phone"      value={contactPhone} />
            <InfoRow label="WhatsApp"   value={whatsappNumber} />
            <InfoRow label="Email"      value={contactEmail} />
            <InfoRow label="Address 1"  value={contactAddress} />
            <InfoRow label="Address 2"  value={contactAddress2} />
          </div>
        </section>

        {/* ── Business hours ─────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            Business hours
          </h2>
          <div className="mt-4 divide-y divide-black/6 rounded-xl border border-black/8 bg-[#f5f1ea] px-4">
            {businessHours.map((row) => (
              <InfoRow key={row.days} label={row.days} value={row.time} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
