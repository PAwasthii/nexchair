"use client";

import { FormEvent, useState, useTransition } from "react";

import { signInAdmin } from "@/app/actions/admin-auth";

export default function AdminLoginPage() {
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("");

    startTransition(async () => {
      const result = await signInAdmin(formData);

      if (result?.success === false) {
        setStatus(result.message);
      }
    });
  }

  return (
    <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            NexChair · Admin
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Sign in
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/55">
            Sign in to manage products and customer enquiries.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-sm"
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@example.com"
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>
          </div>

          {status && (
            <p className="mt-5 rounded-xl bg-black/5 px-4 py-3 text-sm text-black/70">
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 w-full rounded-full bg-[#c44e18] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}