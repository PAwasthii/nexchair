import { requireAdminSession } from "@/lib/auth/admin";

export const metadata = { title: "Settings · NexChair Admin" };

export default async function AdminSettingsPage() {
  await requireAdminSession();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
          Configuration
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-12 text-center">
        <p className="text-sm font-medium">Settings coming soon.</p>
        <p className="mt-1 text-sm text-black/50">
          Manage admin accounts and site configuration.
        </p>
      </div>
    </div>
  );
}
