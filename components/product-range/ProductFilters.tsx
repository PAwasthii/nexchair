"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/product-range/ProductGrid";
import type { Product } from "@/types/product";

const backTypes = ["Mesh", "Fabric", "Leatherette"];

const armrestOptions = [
  "Fixed",
  "2D / 3D",
  "4D",
  "Armless",
];

const weightOptions = [
  "Up to 100 kg",
  "101–120 kg",
  "121 kg and above",
];

const featureOptions = [
  "Adjustable lumbar",
  "Headrest",
  "Seat slider",
  "Synchro-tilt",
];

const colourOptions = [
  "Black",
  "Grey",
  "Brown",
  "Navy",
];

type ProductFiltersProps = {
  products: Product[];
  categories: { name: string; slug: string }[];
};

export default function ProductFilters({
  products,
  categories,
}: ProductFiltersProps) {
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const slug = searchParams.get("category");
    if (!slug) return "All";
    return categories.find((c) => c.slug === slug)?.name ?? "All";
  });
  const [selectedBackType, setSelectedBackType] = useState<string | null>(() => {
    const value = searchParams.get("back");
    return value && backTypes.includes(value) ? value : null;
  });
  const [selectedArmrest, setSelectedArmrest] = useState<string | null>(null);
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

  const minVal = parsePrice(minPrice);
  const maxVal = parsePrice(maxPrice);
  const budgetError = minVal !== null && maxVal !== null && minVal > maxVal;

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Back type
    if (selectedBackType !== null) {
      result = result.filter(
        (product) =>
          product.specs.back.toLowerCase() === selectedBackType.toLowerCase(),
      );
    }

    // Armrests
    if (selectedArmrest !== null) {
      result = result.filter((product) => {
        const value = product.armrests.toLowerCase();

        if (selectedArmrest === "2D / 3D") {
          return value.includes("2d") || value.includes("3d");
        }

        if (selectedArmrest === "4D") {
          return value.includes("4d");
        }

        return value.includes(selectedArmrest.toLowerCase());
      });
    }

    // Maximum user weight
    if (selectedWeight !== null) {
      result = result.filter((product) => {
        const weight = parseWeight(product.maxUserWeight);

        if (weight === null) return false;

        if (selectedWeight === "Up to 100 kg") return weight <= 100;
        if (selectedWeight === "101–120 kg") return weight >= 101 && weight <= 120;
        return weight >= 121;
      });
    }

    // Features
    if (selectedFeature !== null) {
      result = result.filter((product) =>
        product.features.includes(selectedFeature),
      );
    }

    // Colour
    if (selectedColour !== null) {
      result = result.filter((product) =>
        product.colour.toLowerCase().includes(selectedColour.toLowerCase()),
      );
    }

    // Budget — skip if min > max (invalid state)
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

    // Sorting
    if (sortBy === "Price: Low to high") {
      result.sort(
        (a, b) =>
          (parsePrice(a.price) ?? 0) - (parsePrice(b.price) ?? 0),
      );
    }

    if (sortBy === "Price: High to low") {
      result.sort(
        (a, b) =>
          (parsePrice(b.price) ?? 0) - (parsePrice(a.price) ?? 0),
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

  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", ...categories.map((c) => c.name)].map((category) => {
            const active = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition ${
                  active
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black hover:border-black/30"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-[#c44e18]"
              >
                Clear all
              </button>
            </div>

            {/* Budget */}
            <div className="mt-8 border-t border-black/10 pt-5">
              <h3 className="text-sm font-semibold">Budget</h3>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Min"
                  className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-black ${
                    budgetError ? "border-red-400" : "border-black/10"
                  }`}
                />

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Max"
                  className={`w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-black ${
                    budgetError ? "border-red-400" : "border-black/10"
                  }`}
                />
              </div>

              {budgetError && (
                <p className="mt-1.5 text-xs text-red-500">
                  Min must not exceed max
                </p>
              )}
            </div>

            <RadioFilterGroup
              title="Back type"
              options={backTypes}
              selected={selectedBackType}
              onChange={(value) =>
                selectSingle(value, selectedBackType, setSelectedBackType)
              }
            />

            <RadioFilterGroup
              title="Armrests"
              options={armrestOptions}
              selected={selectedArmrest}
              onChange={(value) =>
                selectSingle(value, selectedArmrest, setSelectedArmrest)
              }
            />

            <RadioFilterGroup
              title="Max user weight"
              options={weightOptions}
              selected={selectedWeight}
              onChange={(value) =>
                selectSingle(value, selectedWeight, setSelectedWeight)
              }
            />

            <RadioFilterGroup
              title="Features"
              options={featureOptions}
              selected={selectedFeature}
              onChange={(value) =>
                selectSingle(value, selectedFeature, setSelectedFeature)
              }
            />

            <RadioFilterGroup
              title="Colour"
              options={colourOptions}
              selected={selectedColour}
              onChange={(value) =>
                selectSingle(value, selectedColour, setSelectedColour)
              }
            />
          </aside>

          {/* Product area */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-black/50">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "chair" : "chairs"}
              </p>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs"
              >
                <option>Recommended</option>
                <option>Price: Low to high</option>
                <option>Price: High to low</option>
                <option>Newest</option>
              </select>
            </div>

            <div className="mt-6">
              <ProductGrid key={gridKey} products={filteredProducts} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type RadioFilterGroupProps = {
  title: string;
  options: string[];
  selected: string | null;
  onChange: (value: string) => void;
};

function RadioFilterGroup({
  title,
  options,
  selected,
  onChange,
}: RadioFilterGroupProps) {
  return (
    <div className="mt-7 border-t border-black/10 pt-5">
      <h3 className="text-sm font-semibold">{title}</h3>

      <div className="mt-3 space-y-3" role="radiogroup" aria-label={title}>
        {options.map((option) => {
          const isSelected = selected === option;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option)}
              className="flex w-full cursor-pointer items-center gap-3 text-left text-xs text-black/60"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                  isSelected
                    ? "border-black bg-black"
                    : "border-black/30 bg-white"
                }`}
              >
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>

              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function parsePrice(value: string): number | null {
  const number = Number(value.replace(/[^\d.]/g, ""));

  return Number.isNaN(number) || number === 0 ? null : number;
}

function parseWeight(value: string): number | null {
  const match = value.match(/\d+/);

  if (!match) {
    return null;
  }

  return Number(match[0]);
}
