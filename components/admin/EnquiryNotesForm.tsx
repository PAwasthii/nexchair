"use client";

import { useActionState, useRef } from "react";

import {
  updateEnquiryNotes,
  type EnquiryActionState,
} from "@/app/actions/admin-enquiries";

const INITIAL: EnquiryActionState = { success: false };

type Props = {
  enquiryId: string;
  initialNotes: string | null;
};

export default function EnquiryNotesForm({ enquiryId, initialNotes }: Props) {
  const [state, formAction, pending] = useActionState(updateEnquiryNotes, INITIAL);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={enquiryId} />

      <textarea
        ref={textareaRef}
        name="adminNotes"
        defaultValue={initialNotes ?? ""}
        rows={5}
        maxLength={2000}
        placeholder="Private notes visible only to admins…"
        disabled={pending}
        className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-60"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save notes"}
        </button>

        {state.success && (
          <span className="text-sm text-green-700">Notes saved</span>
        )}
        {state.error && (
          <span className="text-sm text-red-600">{state.error}</span>
        )}
      </div>
    </form>
  );
}
