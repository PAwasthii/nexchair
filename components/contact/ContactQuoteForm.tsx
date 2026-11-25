"use client";

import { FormEvent, useState, useTransition } from "react";
import { createEnquiry } from "@/app/actions/enquiries";

const modelOptions = [
  "Not sure yet",
  "Ergonomic task",
  "Executive",
  "Lounge",
  "Visitor & training",
  "Drafting stools",
  "Work-from-home",
];

const seatOptions = ["1–5", "6–20", "21–50", "Custom"];

const inputCls =
  "w-full rounded-[12px] border border-[#DCCAB7] bg-[#FBF2E8] px-4 py-[11px] text-[15px] text-[#292622] placeholder:text-[#A89E96] outline-none transition-all duration-200 focus:border-[#D85B13] focus:ring-2 focus:ring-[#D85B13]/15 min-h-[48px]";

function ChevronDown() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
      <svg className="h-4 w-4 text-[#8A7768]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export default function ContactQuoteForm() {
  const [model, setModel] = useState("Not sure yet");
  const [seats, setSeats] = useState("1–5");
  const [customSeats, setCustomSeats] = useState("");
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
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
      setIsSuccess(false);
      return;
    }

    if (!email && !phone) {
      setStatus("Please provide your email or phone number.");
      setIsSuccess(false);
      return;
    }

    setStatus("");

    const seatsValue = seats === "Custom" ? (customSeats.trim() || "Custom") : seats;

    const message = [
      `Model of interest: ${model}`,
      `Number of seats: ${seatsValue}`,
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
      setIsSuccess(result.success);

      if (result.success) {
        form.reset();
        setModel("Not sure yet");
        setSeats("1–5");
        setCustomSeats("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Name *" />
        <Field name="company" label="Company" />
        <Field name="phone" label="Phone / WhatsApp *" type="tel" />
        <Field name="email" label="Email" type="email" />

        {/* Model of interest */}
        <div>
          <label htmlFor="model" className="block text-[15px] font-semibold text-[#292622] mb-1.5">
            Model of interest
          </label>
          <div className="relative">
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`${inputCls} appearance-none cursor-pointer pr-10`}
            >
              {modelOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>

        {/* Number of seats */}
        <div>
          <label htmlFor="seats" className="block text-[15px] font-semibold text-[#292622] mb-1.5">
            Number of seats
          </label>
          <div className="relative">
            <select
              id="seats"
              value={seats}
              onChange={(e) => { setSeats(e.target.value); setCustomSeats(""); }}
              className={`${inputCls} appearance-none cursor-pointer pr-10`}
            >
              {seatOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
          {seats === "Custom" && (
            <input
              type="number"
              min={1}
              value={customSeats}
              onChange={(e) => setCustomSeats(e.target.value)}
              placeholder="Enter exact number"
              className={`${inputCls} mt-2`}
            />
          )}
        </div>
      </div>

      {/* Anything else */}
      <div>
        <label htmlFor="anything" className="block text-[15px] font-semibold text-[#292622] mb-1.5">
          Anything else?
        </label>
        <textarea
          id="anything"
          name="anything"
          rows={4}
          placeholder="Budget per seat, delivery city, timelines..."
          className={`${inputCls} min-h-[90px] resize-y`}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#D85B13] px-6 py-[14px] text-[16px] font-bold text-white transition-all duration-200 hover:bg-[#c0500f] hover:shadow-[0_4px_16px_rgba(216,91,19,0.38)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ minHeight: 50 }}
      >
        {isPending ? (
          "Sending…"
        ) : (
          <>
            Send enquiry
            <svg className="h-4 w-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 7h12M7.5 2.5 13 7 7.5 11.5" />
            </svg>
          </>
        )}
      </button>

      {/* Status message */}
      {status && (
        <p className={`rounded-[12px] px-4 py-3 text-[14px] font-medium ${
          isSuccess
            ? "border border-[#A7DFC0] bg-[#E8F5EF] text-[#166534]"
            : "border border-red-200 bg-red-50 text-red-700"
        }`}>
          {status}
        </p>
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
      <label htmlFor={name} className="block text-[15px] font-semibold text-[#292622] mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={inputCls}
      />
    </div>
  );
}
