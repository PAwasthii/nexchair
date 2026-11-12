"use client";

import { useActionState } from "react";

import {
  updateEnquiryStatus,
  type EnquiryActionState,
} from "@/app/actions/admin-enquiries";

const INITIAL: EnquiryActionState = { success: false };

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CLOSED", label: "Closed" },
] as const;

type Props = {
  enquiryId: string;
  currentStatus: string;
};

export default function EnquiryStatusForm({ enquiryId, currentStatus }: Props) {
  const [state, formAction, pending] = useActionState(updateEnquiryStatus, INITIAL);

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="id" value={enquiryId} />

      <select
        name="status"
        defaultValue={currentStatus}
        disabled={pending}
        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving…" : "Update status"}
      </button>

      {state.success && (
        <span className="text-sm text-green-700">Saved</span>
      )}
      {state.error && (
        <span className="text-sm text-red-600">{state.error}</span>
      )}
    </form>
  );
}
