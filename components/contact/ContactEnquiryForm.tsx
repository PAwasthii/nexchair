"use client";

import { FormEvent, useState, useTransition } from "react";

import { createEnquiry } from "@/app/actions/enquiries";

const topics = [
  "Product advice",
  "Order enquiry",
  "Bulk / corporate",
  "Delivery",
  "Warranty & service",
  "Other",
];

export default function ContactEnquiryForm() {
  const [topic, setTopic] = useState("Product advice");
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

    if (!name) {
      setStatus("Please enter your name.");
      return;
    }

    if (!email && !phone) {
      setStatus("Please provide your email or mobile number.");
      return;
    }

    if (!message.trim()) {
      setStatus("Please enter your message.");
      return;
    }

    if (!agreed) {
      setStatus("Please agree to be contacted about your enquiry.");
      return;
    }

    setStatus("");

    startTransition(async () => {
      const result = await createEnquiry({
        type: "CONTACT",
        name,
        email,
        phone,
        whatsapp: phone,
        preferredContact: topic,
        message,
      });

      setStatus(result.message);

      if (result.success) {
        form.reset();
        setTopic("Product advice");
        setMessage("");
        setAgreed(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Name *" />
        <Input name="phone" label="Mobile / WhatsApp *" />
        <Input name="email" label="Email" type="email" />

        <div>
          <label htmlFor="topic" className="text-sm font-medium">
            Topic
          </label>

          <select
            id="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>

        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what you need..."
          className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
        />
      </div>

      <label className="flex gap-3 text-xs text-black/60">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          className="mt-0.5"
        />

        <span>I agree to be contacted about this enquiry.</span>
      </label>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#F26919] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d95e15] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send message"}
        </button>

        <p className="mt-2 text-xs text-black/40">
          Reply within [—] working hours
        </p>
      </div>

      {status && (
        <p className="text-sm text-black/60">{status}</p>
      )}
    </form>
  );
}

function Input({
  name,
  label,
  type = "text",
}: {
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
      />
    </div>
  );
}
