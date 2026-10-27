"use client";

import { signOutAdmin } from "@/app/actions/admin-auth";

export default function LogoutButton() {
  return (
    <form action={signOutAdmin}>
      <button
        type="submit"
        className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
      >
        Sign out
      </button>
    </form>
  );
}
