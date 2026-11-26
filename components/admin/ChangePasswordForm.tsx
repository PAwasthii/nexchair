"use client";

import { useActionState } from "react";

import {
  changeAdminPassword,
  type PasswordActionState,
} from "@/app/actions/admin-settings";

const INITIAL: PasswordActionState = { success: false };

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeAdminPassword, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      {state.success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
          Password updated successfully.
        </div>
      )}

      <div>
        <label
          htmlFor="cp-current"
          className="block text-sm font-medium text-black"
        >
          Current password <span className="text-[#c44e18]">*</span>
        </label>
        <input
          id="cp-current"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          disabled={pending || state.success}
          className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#c44e18] focus:ring-2 focus:ring-[#c44e18]/20 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="cp-new"
          className="block text-sm font-medium text-black"
        >
          New password <span className="text-[#c44e18]">*</span>
        </label>
        <input
          id="cp-new"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={pending || state.success}
          className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#c44e18] focus:ring-2 focus:ring-[#c44e18]/20 disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-black/40">Minimum 8 characters.</p>
      </div>

      <div>
        <label
          htmlFor="cp-confirm"
          className="block text-sm font-medium text-black"
        >
          Confirm new password <span className="text-[#c44e18]">*</span>
        </label>
        <input
          id="cp-confirm"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          disabled={pending || state.success}
          className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#c44e18] focus:ring-2 focus:ring-[#c44e18]/20 disabled:opacity-50"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={pending || state.success}
          className="rounded-full bg-[#c44e18] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Saving…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
