"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const budgetRanges: Record<string, [number, number]> = {
  "Under ₹10,000": [0, 10000],
  "₹10,000–₹20,000": [10000, 20000],
  "₹20,000+": [20000, Infinity],
};

export default function SpecificationFilter() {
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [weight, setWeight] = useState("");
  const [back, setBack] = useState("");

  function handleShowChairs() {
    const params = new URLSearchParams();

    if (budget) {
      const [lo, hi] = budgetRanges[budget] ?? [0, Infinity];
      if (lo > 0) params.set("minPrice", String(lo));
      if (hi < Infinity) params.set("maxPrice", String(hi));
    }

    if (weight) params.set("weight", weight);
    if (back) params.set("back", back);

    const search = params.toString();
    router.push(search ? `/product-range?${search}` : "/product-range");
  }

  return (
    <section className="px-4 py-3 md:px-6 md:py-4">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#0E3159] p-8 text-white md:p-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
          Choose by specification
        </p>

        <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
          Find the right chair by the numbers that matter.
        </h2>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/50"
          >
            <option value="">Any budget</option>
            <option>Under ₹10,000</option>
            <option>₹10,000–₹20,000</option>
            <option>₹20,000+</option>
          </select>

          <select
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/50"
          >
            <option value="">Any rating</option>
            <option>Up to 100 kg</option>
            <option>101–120 kg</option>
            <option>121 kg and above</option>
          </select>

          <select
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/50"
          >
            <option value="">Mesh, foam or leat…</option>
            <option>Mesh</option>
            <option>Fabric</option>
            <option>Leatherette</option>
          </select>

          <button
            type="button"
            onClick={handleShowChairs}
            className="rounded-full bg-[#F26919] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d95e15]"
          >
            Show matching chairs
          </button>
        </div>
      </div>
    </section>
  );
}
