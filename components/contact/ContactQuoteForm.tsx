"use client";

import { FormEvent, useState, useTransition } from "react";
import { createEnquiry } from "@/app/actions/enquiries";

const modelOptions = [
  "Not sure yet",
  "Ergonomic task",
  "Executive",
  "Gaming & streaming",
  "Visitor & training",
  "Drafting stools",
  "Work-from-home",
];

const seatOptions = ["1–5", "6–20", "21–50", "50+"];

export default function ContactQuoteForm() {
  const [model, setModel] = useState("Not sure yet");
  const [seats, setSeats] = useState("1–5");
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const anything = String(data.get("anything") ?? "").trim();

    if (!name) {
      setStatus("Please enter your name.");
      return;
    }

    if (!email && !phone) {
      setStatus("Please provide your email or phone number.");
      return;
    }

    setStatus("");

    const message = [
      `Model of interest: ${model}`,
      `Number of seats: ${seats}`,
      anything ? `Additional info: ${anything}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    startTransition(async () => {
      const result = await createEnquiry({
        type: "CONTACT",
        name,
        company,
        phone,
        whatsapp: phone,
        email,
        preferredContact: model,
        message,
      });

      setStatus(result.message);

      if (result.success) {
        form.reset();
        setModel("Not sure yet");
        setSeats("1–5");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Name *" />
        <Field name="company" label="Company" />
        <Field name="phone" label="Phone / WhatsApp *" type="tel" />
        <Field name="email" label="Email" type="email" />

        <div>
          <label htmlFor="model" className="text-sm font-medium">
            Model of interest
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            {modelOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="seats" className="text-sm font-medium">
            Number of seats
          </label>
          <select
            id="seats"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            {seatOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="anything" className="text-sm font-medium">
          Anything else?
        </label>
        <textarea
          id="anything"
          name="anything"
          rows={4}
          placeholder="Budget per seat, delivery city, timelines..."
          className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#c44e18] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send enquiry"}
        </button>
      </div>

      {status && (
        <p className="text-sm text-black/60">{status}</p>
      )}
    </form>
  );
}

function Field({
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
