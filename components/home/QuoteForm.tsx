"use client";

import { FormEvent, useState, useTransition } from "react";

import { createEnquiry } from "@/app/actions/enquiries";

export default function QuoteForm() {
  const [preferredContact, setPreferredContact] = useState("WhatsApp");
  const [neededBy, setNeededBy] = useState("Within 2 weeks");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const pincode = String(formData.get("pincode") ?? "").trim();

    if (!name) {
      setStatus("Please enter your name.");
      return;
    }

    if (!email && !phone) {
      setStatus("Please provide your email or mobile number.");
      return;
    }

    if (!agreed) {
      setStatus("Please agree to be contacted about your enquiry.");
      return;
    }

    setStatus("");

    startTransition(async () => {
      const result = await createEnquiry({
        type: "QUOTE",
        name,
        email,
        phone,
        whatsapp: phone,
        company,
        city,
        pincode,
        preferredContact,
        neededBy,
        message,
      });

      setStatus(result.message);

      if (result.success) {
        form.reset();
        setPreferredContact("WhatsApp");
        setNeededBy("Within 2 weeks");
        setMessage("");
        setAgreed(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="name"
          type="text"
          placeholder="Full name"
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
        />

        <input
          name="phone"
          type="tel"
          placeholder="Mobile / WhatsApp"
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
        />

        <input
          name="company"
          type="text"
          placeholder="Company name"
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
        />

        <input
          name="city"
          type="text"
          placeholder="City"
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
        />

        <input
          name="pincode"
          type="text"
          placeholder="Pincode"
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <select
          value={neededBy}
          onChange={(event) => setNeededBy(event.target.value)}
          className="rounded-xl border border-white/20 bg-[#c44e18] px-4 py-3 text-sm text-white outline-none focus:border-white"
        >
          <option>Within 2 weeks</option>
          <option>Within 1 month</option>
          <option>Just exploring</option>
        </select>

        <select
          value={preferredContact}
          onChange={(event) =>
            setPreferredContact(event.target.value)
          }
          className="rounded-xl border border-white/20 bg-[#c44e18] px-4 py-3 text-sm text-white outline-none focus:border-white"
        >
          <option>WhatsApp</option>
          <option>Phone</option>
          <option>Email</option>
        </select>
      </div>

      <textarea
        rows={4}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Tell us what you need..."
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-white"
      />

      <label className="flex gap-3 text-xs text-white/70">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          className="mt-0.5"
        />

        <span>
          I agree to be contacted regarding this enquiry.
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Request a quote"}
      </button>

      {status && (
        <p className="text-sm text-white/80">{status}</p>
      )}
    </form>
  );
}