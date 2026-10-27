"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import {
  createCatalogue,
  updateCatalogue,
  toggleCatalogueActive,
  deleteCatalogue,
  type CatalogueRow,
  type CatalogueActionState,
} from "@/app/actions/admin-catalogues";

const INITIAL: CatalogueActionState = { success: false };

// ─── Upload form ──────────────────────────────────────────────────────────────

function CatalogueUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createCatalogue, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
      onSuccess();
    }
  }, [state.success, router, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            Name <span className="text-[#c44e18]">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Product Catalogue 2026"
            className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Version</label>
          <input
            name="version"
            placeholder="e.g. v2, 2026-Q1"
            className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">
          PDF file <span className="text-[#c44e18]">*</span>
        </label>
        <input
          name="file"
          type="file"
          accept=".pdf,application/pdf"
          required
          className="mt-1.5 block text-sm"
        />
        <p className="mt-1 text-xs text-black/40">Max 25 MB · PDF only</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[#c44e18] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Uploading…" : "Upload catalogue"}
      </button>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function CatalogueEditForm({
  catalogue,
  onClose,
}: {
  catalogue: CatalogueRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateCatalogue, INITIAL);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onClose();
    }
  }, [state.success, router, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={catalogue.id} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            defaultValue={catalogue.name}
            required
            className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Version</label>
          <input
            name="version"
            defaultValue={catalogue.version ?? ""}
            className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:opacity-80 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-black/10 px-5 py-2 text-sm transition hover:bg-black/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function CatalogueRowActions({ catalogue }: { catalogue: CatalogueRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, startTransition] = useTransition();

  function handleToggle() {
    const formData = new FormData();
    formData.set("id", catalogue.id);
    startTransition(async () => {
      await toggleCatalogueActive(INITIAL, formData);
      router.refresh();
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("id", catalogue.id);
    startTransition(async () => {
      await deleteCatalogue(INITIAL, formData);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="mt-3 border-t border-black/5 pt-3">
        <CatalogueEditForm
          catalogue={catalogue}
          onClose={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={catalogue.storageKey}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs transition hover:bg-black/5"
      >
        Download PDF
      </a>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs transition hover:bg-black/5"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={handleToggle}
        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs transition hover:bg-black/5"
      >
        {catalogue.isActive ? "Deactivate" : "Activate"}
      </button>

      {confirmDelete ? (
        <>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white transition hover:bg-red-700"
          >
            Confirm delete
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs transition hover:bg-black/5"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  catalogues: CatalogueRow[];
};

export default function CatalogueManager({ catalogues }: Props) {
  const [showUpload, setShowUpload] = useState(false);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      {/* Upload toggle */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-black/50">
          {catalogues.length} {catalogues.length === 1 ? "catalogue" : "catalogues"}
        </p>
        <button
          type="button"
          onClick={() => setShowUpload((v) => !v)}
          className="rounded-full bg-[#c44e18] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {showUpload ? "Cancel" : "Upload new"}
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold">Upload catalogue PDF</h2>
          <CatalogueUploadForm onSuccess={() => setShowUpload(false)} />
        </div>
      )}

      {/* List */}
      {catalogues.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-12 text-center">
          <p className="text-sm font-medium">No catalogues yet.</p>
          <p className="mt-1 text-sm text-black/40">
            Upload a PDF to make it available for download.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {catalogues.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-2xl border border-black/10 bg-white p-5 ${
                cat.isActive ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="mt-0.5 text-sm text-black/40">
                    {cat.version ? `Version ${cat.version} · ` : ""}
                    Uploaded {formatDate(cat.createdAt)}
                    {!cat.isActive && (
                      <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs">
                        Inactive
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <CatalogueRowActions catalogue={cat} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
