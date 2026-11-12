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

const chevron = (
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
    <svg
      className="h-4 w-4 text-white/60"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
);

const selectBase =
  "w-full appearance-none rounded-full border border-white/20 bg-white/10 pl-4 pr-8 py-3 text-sm text-white outline-none focus:border-white/50";

const selectDisabled =
  "w-full appearance-none rounded-full border border-white/10 bg-white/5 pl-4 pr-8 py-3 text-sm text-white/40 outline-none cursor-not-allowed";

export default function SpecificationFilter() {
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [back, setBack] = useState("");
  const [armrests, setArmrests] = useState("");

  function handleShowChairs() {
    const params = new URLSearchParams();

    if (budget) {
      const [lo, hi] = budgetRanges[budget] ?? [0, Infinity];
      if (lo > 0) params.set("minPrice", String(lo));
      if (hi < Infinity) params.set("maxPrice", String(hi));
    }

    if (back) params.set("back", back);
    if (armrests) params.set("armrests", armrests);

    const search = params.toString();
    router.push(search ? `/product-range?${search}` : "/product-range");
  }

  return (
    <section className="px-4 py-3 md:px-6 md:py-4">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#0E3159] p-8 text-white md:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#F26919]">
          Choose by specification
        </p>

        <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
          Find the right chair by the numbers that matter.
        </h2>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Price range */}
          <div className="relative w-full sm:w-auto">
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={selectBase}
            >
              <option value="" className="text-[#0E3159]">Any price range</option>
              {Object.keys(budgetRanges).map((label) => (
                <option key={label} className="text-[#0E3159]">{label}</option>
              ))}
            </select>
            {chevron}
          </div>

          {/* User weight — disabled: weight data not available in catalogue */}
          <div className="relative w-full sm:w-auto">
            <select disabled className={selectDisabled}>
              <option className="text-[#0E3159]">Any user weight</option>
            </select>
            {chevron}
          </div>

          {/* Back type — functional */}
          <div className="relative w-full sm:w-auto">
            <select
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className={selectBase}
            >
              <option value="" className="text-[#0E3159]">Any back type</option>
              {backOptions.map((o) => (
                <option key={o} className="text-[#0E3159]">{o}</option>
              ))}
            </select>
            {chevron}
          </div>

          {/* Armrests — functional */}
          <div className="relative w-full sm:w-auto">
            <select
              value={armrests}
              onChange={(e) => setArmrests(e.target.value)}
              className={selectBase}
            >
              <option value="" className="text-[#0E3159]">Any armrests</option>
              {armrestOptions.map((o) => (
                <option key={o} className="text-[#0E3159]">{o}</option>
              ))}
            </select>
            {chevron}
          </div>

          <button
            type="button"
            onClick={handleShowChairs}
            className="w-full rounded-full bg-[#F26919] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d95e15] sm:w-auto"
          >
            Show matching chairs
          </button>
        </div>
      </div>
    </section>
  );
}
