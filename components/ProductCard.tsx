import Image from "next/image";
import Link from "next/link";

import { whatsappHref } from "@/lib/site";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const productLink = `/products/${product.slug}`;

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={productLink} className="block">
        {/* Image area — fixed aspect ratio, object-contain so full chair is visible */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f1ea]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-3"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-white/50 text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                NC
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium">
            {product.category}
          </div>

          {product.isBestseller && (
            <div className="absolute right-3 top-3 rounded-full bg-[#fde8d4] px-2.5 py-1 text-xs font-medium text-[#F26919]">
              Bestseller
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F26919]">
              {product.code}
            </p>
            <h3 className="mt-1 text-lg font-semibold leading-snug">
              {product.name}
            </h3>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-black/50">
                {product.description}
              </p>
            )}
          </div>
          <p className="shrink-0 whitespace-nowrap text-sm font-semibold">
            {product.price}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5 text-xs">
          <div className="rounded-xl bg-black/5 p-2.5">
            <p className="text-black/40">Lumbar</p>
            <p className="mt-0.5 font-medium">{product.specs.lumbar}</p>
          </div>
          <div className="rounded-xl bg-black/5 p-2.5">
            <p className="text-black/40">Armrests</p>
            <p className="mt-0.5 font-medium">{product.specs.armrests}</p>
          </div>
          <div className="rounded-xl bg-black/5 p-2.5">
            <p className="text-black/40">Back</p>
            <p className="mt-0.5 font-medium">{product.specs.back}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={`/specifications?model=${product.code}`}
            className="text-sm font-semibold underline underline-offset-4"
          >
            Full specs
          </Link>
          <Link
            href={`${productLink}/order`}
            className="rounded-full bg-[#0E3159] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a2647]"
          >
            Enquire
          </Link>
          <a
            href={whatsappHref}
            className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
