"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FilterState = {
  budget: string[];
  weight: string[];
  back: string[];
};

const filters = [
  {
    key: "budget" as const,
    label: "Budget",
    options: ["Under ₹10,000", "₹10,000–₹20,000", "₹20,000+"],
  },
  {
    key: "weight" as const,
    label: "User weight",
    options: ["Up to 100 kg", "101–120 kg", "121 kg and above"],
  },
  {
    key: "back" as const,
    label: "Back type",
    options: ["Mesh", "Fabric", "Leatherette"],
  },
];

const budgetRanges: Record<string, [number, number]> = {
  "Under ₹10,000": [0, 10000],
  "₹10,000–₹20,000": [10000, 20000],
  "₹20,000+": [20000, Infinity],
};

export default function SpecificationFilter() {
  const router = useRouter();
  const [selected, setSelected] = useState<FilterState>({
    budget: [],
    weight: [],
    back: [],
  });

  function toggle(group: keyof FilterState, value: string) {
    setSelected((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value],
    }));
  }

  function handleViewChairs() {
    const params = new URLSearchParams();

    if (selected.budget.length > 0 && selected.budget.length < 3) {
      let lower = Infinity;
      let upper = 0;

      for (const b of selected.budget) {
        const [lo, hi] = budgetRanges[b] ?? [0, Infinity];
        lower = Math.min(lower, lo);
        upper = Math.max(upper, hi);
      }

      if (lower > 0) params.set("minPrice", String(lower));
      if (upper < Infinity) params.set("maxPrice", String(upper));
    }

    for (const w of selected.weight) params.append("weight", w);
    for (const b of selected.back) params.append("back", b);

    const search = params.toString();
    router.push(search ? `/product-range?${search}` : "/product-range");
  }

  return (
    <section className="bg-[#171717] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
          Choose by specification
        </p>

        <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
          Find the right chair by the specs that matter.
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {filters.map((filter) => (
            <div
              key={filter.label}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-lg font-semibold">
                {filter.label}
              </h3>

              <div className="mt-5 space-y-3">
                {filter.options.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 text-sm text-white/70"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#c44e18]"
                      checked={selected[filter.key].includes(option)}
                      onChange={() => toggle(filter.key, option)}
                    />

                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleViewChairs}
          className="mt-8 rounded-full bg-[#c44e18] px-6 py-3 text-sm font-semibold text-white"
        >
          View matching chairs
        </button>
      </div>
    </section>
  );
}
