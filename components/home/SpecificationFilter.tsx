"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const budgetRanges: Record<string, [number, number]> = {
  "Under ₹3,000":     [0,     3000],
  "₹3,000–₹5,000":   [3000,  5000],
  "₹5,000–₹8,000":   [5000,  8000],
  "₹8,000–₹12,000":  [8000,  12000],
  "Above ₹12,000":   [12000, Infinity],
};

const backOptions = ["Mesh", "Fabric", "Leatherette", "Leather"];

const armrestOptions = [
  "Fixed",
  "Adjustable",
  "2D Adjustable",
  "4D Adjustable",
  "No armrests",
];

function Chevron() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
      <svg className="h-[14px] w-[14px] text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

const pillSelect =
  "w-full appearance-none rounded-full bg-[#1C5450] border border-white/10 py-[11px] pl-[18px] pr-10 text-[13px] font-medium text-white/90 outline-none transition-all duration-200 hover:bg-[#235d58] focus:ring-2 focus:ring-[#D85B13]/50 cursor-pointer";

export default function SpecificationFilter() {
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [back, setBack]     = useState("");
  const [armrests, setArmrests] = useState("");

  function handleShowChairs() {
    const params = new URLSearchParams();
    if (budget) {
      const [lo, hi] = budgetRanges[budget] ?? [0, Infinity];
      if (lo > 0)        params.set("minPrice", String(lo));
      if (hi < Infinity) params.set("maxPrice", String(hi));
    }
    if (back)     params.set("back", back);
    if (armrests) params.set("armrests", armrests);
    const search = params.toString();
    router.push(search ? `/product-range?${search}` : "/product-range");
  }

  return (
    <section
      className="relative overflow-hidden border-y border-white/8"
      style={{
        background: "linear-gradient(145deg, #092F30 0%, #073B38 48%, #0a3c39 100%)",
      }}
    >
      {/* Radial glow — amber warmth left side */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 18% 55%, rgba(21,80,75,0.65) 0%, transparent 58%)",
        }}
      />

      {/* Faint decorative arc — top right */}
      <div
        className="pointer-events-none absolute -right-[6%] -top-[80%] h-[260%] w-[38%] rounded-full border border-white/[0.06]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1360px] px-5 py-10 sm:px-9 lg:py-[52px]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-20">

          {/* Left — overline + heading */}
          <div className="shrink-0 lg:w-[40%]">
            {/* Overline */}
            <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[#F0A52E] sm:text-[14px] lg:text-[16px]">
              Choose by specification
            </p>

            <h2 className="font-display mt-[14px] text-[30px] font-semibold leading-[1.1] tracking-tight text-white sm:text-[36px] lg:text-[44px]">
              Find the right chair by the numbers&nbsp;that&nbsp;matter.
            </h2>

            {/* Decorative bottom rule */}
            <div className="mt-5 h-px w-14 rounded-full bg-[#D85B13]/60 lg:mt-6" />
          </div>

          {/* Right — 3 filters in a row + button */}
          <div className="flex flex-1 flex-col gap-4">

            {/* Filter row */}
            <div className="flex flex-col gap-3 sm:flex-row">

              <div
                className="relative flex-1"
                style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.30))" }}
              >
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={pillSelect}
                >
                  <option value="" className="bg-[#1C5450] text-white">Any price range</option>
                  {Object.keys(budgetRanges).map((label) => (
                    <option key={label} className="bg-[#1C5450] text-white">{label}</option>
                  ))}
                </select>
                <Chevron />
              </div>

              <div
                className="relative flex-1"
                style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.30))" }}
              >
                <select
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  className={pillSelect}
                >
                  <option value="" className="bg-[#1C5450] text-white">Any back type</option>
                  {backOptions.map((o) => (
                    <option key={o} className="bg-[#1C5450] text-white">{o}</option>
                  ))}
                </select>
                <Chevron />
              </div>

              <div
                className="relative flex-1"
                style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.30))" }}
              >
                <select
                  value={armrests}
                  onChange={(e) => setArmrests(e.target.value)}
                  className={pillSelect}
                >
                  <option value="" className="bg-[#1C5450] text-white">Any armrests</option>
                  {armrestOptions.map((o) => (
                    <option key={o} className="bg-[#1C5450] text-white">{o}</option>
                  ))}
                </select>
                <Chevron />
              </div>
            </div>

            {/* CTA button */}
            <div>
              <button
                type="button"
                onClick={handleShowChairs}
                className="rounded-full bg-[#D85B13] px-7 py-[11px] text-[14px] font-bold text-white transition-all duration-200 hover:bg-[#c0500f] active:scale-[0.98] lg:text-[15px]"
                style={{
                  boxShadow: "0 4px 16px rgba(216,91,19,0.38), 0 1px 4px rgba(0,0,0,0.10)",
                  minHeight: 46,
                }}
              >
                Show matching chairs →
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
