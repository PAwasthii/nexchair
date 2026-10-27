import { getCatalogues } from "@/app/actions/admin-catalogues";
import { requireAdminSession } from "@/lib/auth/admin";
import CatalogueManager from "@/components/admin/CatalogueManager";

export const metadata = { title: "Catalogues · NexChair Admin" };

export default async function AdminCataloguesPage() {
  await requireAdminSession();

  const catalogues = await getCatalogues();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
          Management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Catalogues</h1>
        <p className="mt-1 text-sm text-black/50">
          Upload and manage downloadable product brochures and spec sheets.
        </p>
      </div>

      <CatalogueManager catalogues={catalogues} />
    </div>
  );
}
