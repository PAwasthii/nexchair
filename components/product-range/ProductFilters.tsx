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
  const [selectedBackTypes, setSelectedBackTypes] = useState<string[]>(() =>
    searchParams.getAll("back").filter((v) => backTypes.includes(v)),
  );
  const [selectedArmrests, setSelectedArmrests] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>(() =>
    searchParams.getAll("weight").filter((v) => weightOptions.includes(v)),
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") ?? "");
  const [sortBy, setSortBy] = useState("Recommended");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Back type
    if (selectedBackTypes.length > 0) {
      result = result.filter((product) =>
        selectedBackTypes.some(
          (type) =>
            product.specs.back.toLowerCase() === type.toLowerCase(),
        ),
      );
    }

    // Armrests
    if (selectedArmrests.length > 0) {
      result = result.filter((product) =>
        selectedArmrests.some((option) => {
          const value = product.armrests.toLowerCase();

          if (option === "2D / 3D") {
            return value.includes("2d") || value.includes("3d");
          }

          if (option === "4D") {
            return value.includes("4d");
          }

          return value.includes(option.toLowerCase());
        }),
      );
    }

    // Maximum user weight
    if (selectedWeights.length > 0) {
      result = result.filter((product) => {
        const weight = parseWeight(product.maxUserWeight);

        return selectedWeights.some((range) => {
          if (weight === null) {
            return false;
          }

          if (range === "Up to 100 kg") {
            return weight <= 100;
          }

          if (range === "101–120 kg") {
            return weight >= 101 && weight <= 120;
          }

          return weight >= 121;
        });
      });
    }

    // Features
    if (selectedFeatures.length > 0) {
      result = result.filter((product) =>
        selectedFeatures.every((feature) =>
          product.features.includes(feature),
        ),
      );
    }

    // Colour
    if (selectedColours.length > 0) {
      result = result.filter((product) => {
        const colour = product.colour.toLowerCase();

        return selectedColours.some(
          (selected) =>
            colour.includes(selected.toLowerCase()),
        );
      });
    }

    // Budget
    const minimum = parsePrice(minPrice);
    const maximum = parsePrice(maxPrice);

    if (minimum !== null || maximum !== null) {
      result = result.filter((product) => {
        const price = parsePrice(product.price);

        if (price === null) {
          return false;
        }

        if (minimum !== null && price < minimum) {
          return false;
        }

        if (maximum !== null && price > maximum) {
          return false;
        }

        return true;
      });
    }

    // Sorting
    if (sortBy === "Price: Low to high") {
      result.sort(
        (a, b) =>
          (parsePrice(a.price) ?? 0) -
          (parsePrice(b.price) ?? 0),
      );
    }

    if (sortBy === "Price: High to low") {
      result.sort(
        (a, b) =>
          (parsePrice(b.price) ?? 0) -
          (parsePrice(a.price) ?? 0),
      );
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedBackTypes,
    selectedArmrests,
    selectedWeights,
    selectedFeatures,
    selectedColours,
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
    setSelectedBackTypes([]);
    setSelectedArmrests([]);
    setSelectedWeights([]);
    setSelectedFeatures([]);
    setSelectedColours([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("Recommended");
  }

  function toggleValue(
    value: string,
    currentValues: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
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
              <h3 className="text-sm font-semibold">
                Budget
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(event.target.value)
                  }
                  placeholder="Min"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs outline-none focus:border-black"
                />

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(event.target.value)
                  }
                  placeholder="Max"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>
            </div>

            <FilterGroup
              title="Back type"
              options={backTypes}
              selected={selectedBackTypes}
              onChange={(value) =>
                toggleValue(
                  value,
                  selectedBackTypes,
                  setSelectedBackTypes,
                )
              }
            />

            <FilterGroup
              title="Armrests"
              options={armrestOptions}
              selected={selectedArmrests}
              onChange={(value) =>
                toggleValue(
                  value,
                  selectedArmrests,
                  setSelectedArmrests,
                )
              }
            />

            <FilterGroup
              title="Max user weight"
              options={weightOptions}
              selected={selectedWeights}
              onChange={(value) =>
                toggleValue(
                  value,
                  selectedWeights,
                  setSelectedWeights,
                )
              }
            />

            <FilterGroup
              title="Features"
              options={featureOptions}
              selected={selectedFeatures}
              onChange={(value) =>
                toggleValue(
                  value,
                  selectedFeatures,
                  setSelectedFeatures,
                )
              }
            />

            <FilterGroup
              title="Colour"
              options={colourOptions}
              selected={selectedColours}
              onChange={(value) =>
                toggleValue(
                  value,
                  selectedColours,
                  setSelectedColours,
                )
              }
            />
          </aside>

          {/* Product area */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-black/50">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "chair"
                  : "chairs"}
              </p>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
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

type FilterGroupProps = {
  title: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
};

function FilterGroup({
  title,
  options,
  selected,
  onChange,
}: FilterGroupProps) {
  return (
    <div className="mt-7 border-t border-black/10 pt-5">
      <h3 className="text-sm font-semibold">
        {title}
      </h3>

      <div className="mt-3 space-y-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-3 text-xs text-black/60"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onChange(option)}
              className="h-4 w-4"
            />

            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function parsePrice(value: string): number | null {
  const number = Number(value.replace(/[^\d.]/g, ""));

  return Number.isNaN(number) || number === 0
    ? null
    : number;
}

function parseWeight(value: string): number | null {
  const match = value.match(/\d+/);

  if (!match) {
    return null;
  }

  return Number(match[0]);
}