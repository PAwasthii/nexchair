import AdminShell from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/auth/admin";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#f5f1ea]">
      <AdminShell email={session.email}>{children}</AdminShell>
    </div>
  );
}
