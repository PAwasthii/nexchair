import Image from "next/image";

import { prisma } from "@/lib/prisma";

export default async function CategorySection() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      imageKey: true,
    },
  });

  return (
    <section className="px-4 py-3 md:px-6 md:py-4">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#f5f1ea] p-8 md:p-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
          Find your category
        </p>

        <div className="mt-4 flex items-end justify-between gap-6">
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Seating for the way you work.
          </h2>

          <a
            href="/product-range"
            className="hidden text-sm font-semibold underline underline-offset-4 md:block"
          >
            View all chairs
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`/product-range?category=${category.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e3d8]">
                {category.imageKey && (
                  <Image
                    src={category.imageKey}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 767px) calc((100vw - 112px) / 2), (max-width: 1023px) calc((100vw - 176px) / 2), (max-width: 1279px) calc((100vw - 192px) / 3), 379px"
                  />
                )}
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="mt-1 text-sm text-black/50 transition group-hover:text-black/70">
                  Explore →
                </p>
              </div>
            </a>
          ))}
        </div>

        <a
          href="/product-range"
          className="mt-6 block text-sm font-semibold underline underline-offset-4 md:hidden"
        >
          View all chairs →
        </a>
      </div>
    </section>
  );
}
