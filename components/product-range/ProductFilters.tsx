"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/product-range/ProductGrid";
import type { Product } from "@/types/product";

const backTypes = ["Mesh", "Fabric", "Leatherette", "Leather"];

const armrestOptions = [
  "Fixed",
  "Adjustable",
  "2D Adjustable",
  "4D Adjustable",
  "No armrests",
];

const weightOptions = ["Up to 100 kg", "101–120 kg", "121 kg and above"];

const featureOptions = [
  "Adjustable lumbar",
  "Headrest",
  "Seat slider",
  "Synchro-tilt",
];

type ProductFiltersProps = {
  products: Product[];
  categories: { name: string; slug: string }[];
};

/* ── Pill filter group ───────────────────────────────────────────── */
function PillFilterGroup({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: string[];
  selected: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h4 className="mb-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#77716B]">
        {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = selected === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all duration-150 ${
                isActive
                  ? "border-[#D85B13] bg-[#D85B13] text-white"
                  : "border-[#E7D4C0] bg-white text-[#103B39] hover:border-[#D85B13]/50"
              }`}
            >
              {option}
              {isActive && <span className="ml-1 text-white/70">×</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function ProductFilters({
  products,
  categories,
}: ProductFiltersProps) {
  const searchParams = useSearchParams();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const slug = searchParams.get("category");
    if (!slug) return "All";
    return categories.find((c) => c.slug === slug)?.name ?? "All";
  });

  const [selectedBackType, setSelectedBackType] = useState<string | null>(() => {
    const value = searchParams.get("back");
    return value && backTypes.includes(value) ? value : null;
  });

  const [selectedArmrest, setSelectedArmrest] = useState<string | null>(() => {
    const value = searchParams.get("armrests");
    return value && armrestOptions.includes(value) ? value : null;
  });

  const [selectedWeight, setSelectedWeight] = useState<string | null>(() => {
    const value = searchParams.get("weight");
    return value && weightOptions.includes(value) ? value : null;
  });

  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);

  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("minPrice") ?? "",
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("maxPrice") ?? "",
  );

  const [sortBy, setSortBy] = useState("Recommended");

  const availableColours = useMemo(() => {
    const colourSet = new Set<string>();
    for (const p of products) {
      if (p.colour && p.colour !== "-") {
        colourSet.add(p.colour.trim());
      }
    }
    return Array.from(colourSet).sort();
  }, [products]);

  const minVal = parsePrice(minPrice);
  const maxVal = parsePrice(maxPrice);
  const budgetError = minVal !== null && maxVal !== null && minVal > maxVal;

  /* ── Active filter count ─── */
  const activeFilterCount = [
    selectedBackType,
    selectedArmrest,
    selectedWeight,
    selectedFeature,
    selectedColour,
    minPrice || maxPrice ? "budget" : null,
  ].filter(Boolean).length;

  /* ── Filter logic (unchanged) ───── */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (selectedBackType !== null) {
      result = result.filter((product) => {
        const back = product.specs.back.toLowerCase();
        if (selectedBackType === "Leather") return back === "leather";
        return back.includes(selectedBackType.toLowerCase());
      });
    }

    if (selectedArmrest !== null) {
      result = result.filter((product) => {
        const v = product.armrests.toLowerCase();
        switch (selectedArmrest) {
          case "Fixed":
            return v.includes("fixed");
          case "Adjustable":
            return (
              v.includes("adjustable") &&
              !v.includes("2d") &&
              !v.includes("3d") &&
              !v.includes("4d") &&
              !v.includes("5d")
            );
          case "2D Adjustable":
            return v.includes("2d");
          case "4D Adjustable":
            return v.includes("4d") || v.includes("5d");
          case "No armrests":
            return v === "-" || v.includes("armless");
          default:
            return false;
        }
      });
    }

    if (selectedWeight !== null) {
      result = result.filter((product) => {
        const weight = parseWeight(product.maxUserWeight);
        if (weight === null) return false;
        if (selectedWeight === "Up to 100 kg") return weight <= 100;
        if (selectedWeight === "101–120 kg") return weight >= 101 && weight <= 120;
        return weight >= 121;
      });
    }

    if (selectedFeature !== null) {
      result = result.filter((product) =>
        product.features.includes(selectedFeature),
      );
    }

    if (selectedColour !== null) {
      result = result.filter((product) =>
        product.colour.toLowerCase().includes(selectedColour!.toLowerCase()),
      );
    }

    const min = parsePrice(minPrice);
    const max = parsePrice(maxPrice);
    const invalidBudget = min !== null && max !== null && min > max;

    if (!invalidBudget && (min !== null || max !== null)) {
      result = result.filter((product) => {
        const price = parsePrice(product.price);
        if (price === null) return false;
        if (min !== null && price < min) return false;
        if (max !== null && price > max) return false;
        return true;
      });
    }

    if (sortBy === "Price: Low to high") {
      result.sort(
        (a, b) => (parsePrice(a.price) ?? 0) - (parsePrice(b.price) ?? 0),
      );
    }

    if (sortBy === "Price: High to low") {
      result.sort(
        (a, b) => (parsePrice(b.price) ?? 0) - (parsePrice(a.price) ?? 0),
      );
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedBackType,
    selectedArmrest,
    selectedWeight,
    selectedFeature,
    selectedColour,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const gridKey = useMemo(
    () => filteredProducts.map((p) => p.code).join("|"),
    [filteredProducts],
  );

  function clearFilters() {
    setSelectedCategory("All");
    setSelectedBackType(null);
    setSelectedArmrest(null);
    setSelectedWeight(null);
    setSelectedFeature(null);
    setSelectedColour(null);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("Recommended");
  }

  function selectSingle(
    value: string,
    current: string | null,
    set: React.Dispatch<React.SetStateAction<string | null>>,
  ) {
    set(current === value ? null : value);
  }

  /* ── Chevron icon ─────────────── */
  const ChevronDown = () => (
    <svg className="h-4 w-4 text-[#103B39]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <section
      className="relative min-h-screen px-5 py-8 sm:px-9 lg:py-10"
      style={{ background: "linear-gradient(180deg, #FBF2E8 0%, #F5EAD8 100%)" }}
    >
      {/* Subtle radial depth */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 70% 20%, rgba(242,227,210,0.5) 0%, transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-[1360px]">

        {/* ── Category pills + sort row ─────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category pills */}
          <div className="flex flex-1 flex-wrap gap-2">
            {["All", ...categories.map((c) => c.name)].map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-full border px-5 py-[11px] text-[14px] font-semibold transition-all duration-150 ${
                    active
                      ? "border-[#D85B13] bg-[#D85B13] text-white shadow-[0_4px_12px_rgba(216,91,19,0.30)]"
                      : "border-[#D9C6B1] bg-[#FFF9F1] text-[#103B39] hover:border-[#D85B13]/50 hover:text-[#D85B13]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Sort control */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-full border border-[#D9C6B1] bg-[#FFF9F1] py-[11px] pl-4 pr-9 text-[14px] font-semibold text-[#103B39] outline-none transition hover:border-[#D85B13]/40 focus:ring-2 focus:ring-[#D85B13]/30"
            >
              <option>Recommended</option>
              <option>Price: Low to high</option>
              <option>Price: High to low</option>
              <option>Newest</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <ChevronDown />
            </div>
          </div>
        </div>

        {/* ── Advanced filters toggle ───────────────────────── */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-150 ${
              filtersOpen || activeFilterCount > 0
                ? "border-[#D85B13] bg-[#D85B13]/8 text-[#D85B13]"
                : "border-[#D9C6B1] bg-[#FFF9F1] text-[#103B39] hover:border-[#D85B13]/40"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Advanced filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D85B13] text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Advanced filter panel */}
          {filtersOpen && (
            <div className="mt-3 rounded-[20px] border border-[#E7D4C0] bg-[#FFF9F1] p-5 shadow-[0_4px_16px_rgba(74,48,26,0.07)]">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* Budget */}
                <div>
                  <h4 className="mb-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#77716B]">
                    Budget
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min ₹"
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] text-[#103B39] outline-none focus:border-[#D85B13] ${
                        budgetError ? "border-red-400" : "border-[#E7D4C0]"
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max ₹"
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] text-[#103B39] outline-none focus:border-[#D85B13] ${
                        budgetError ? "border-red-400" : "border-[#E7D4C0]"
                      }`}
                    />
                  </div>
                  {budgetError && (
                    <p className="mt-1 text-[12px] text-red-500">
                      Min must not exceed max
                    </p>
                  )}
                </div>

                <PillFilterGroup
                  title="Back Type"
                  options={backTypes}
                  selected={selectedBackType}
                  onChange={(v) =>
                    selectSingle(v, selectedBackType, setSelectedBackType)
                  }
                />

                <PillFilterGroup
                  title="Armrests"
                  options={armrestOptions}
                  selected={selectedArmrest}
                  onChange={(v) =>
                    selectSingle(v, selectedArmrest, setSelectedArmrest)
                  }
                />

                <PillFilterGroup
                  title="Max Weight"
                  options={weightOptions}
                  selected={selectedWeight}
                  onChange={(v) =>
                    selectSingle(v, selectedWeight, setSelectedWeight)
                  }
                />

                <PillFilterGroup
                  title="Features"
                  options={featureOptions}
                  selected={selectedFeature}
                  onChange={(v) =>
                    selectSingle(v, selectedFeature, setSelectedFeature)
                  }
                />

                {availableColours.length > 0 && (
                  <PillFilterGroup
                    title="Colour"
                    options={availableColours}
                    selected={selectedColour}
                    onChange={(v) =>
                      selectSingle(v, selectedColour, setSelectedColour)
                    }
                  />
                )}
              </div>

              {/* Clear all */}
              <div className="mt-5 flex justify-end border-t border-[#E7D4C0] pt-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[13px] font-semibold text-[#D85B13] transition hover:text-[#c0500f]"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Product count ─────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-[16px] font-bold text-[#103B39]">
            {filteredProducts.length}{" "}
            <span className="font-semibold text-[#77716B]">
              {filteredProducts.length === 1 ? "Product" : "Products"}
            </span>
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[13px] font-semibold text-[#D85B13] transition hover:text-[#c0500f]"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Product list ──────────────────────────────────── */}
        <div className="mt-5">
          <ProductGrid key={gridKey} products={filteredProducts} />
        </div>
      </div>
    </section>
  );
}

function parsePrice(value: string): number | null {
  const number = Number(value.replace(/[^\d.]/g, ""));
  return Number.isNaN(number) || number === 0 ? null : number;
}

function parseWeight(value: string): number | null {
  const match = value.match(/\d+/);
  if (!match) return null;
  return Number(match[0]);
}
