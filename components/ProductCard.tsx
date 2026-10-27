import Link from "next/link";

import { whatsappHref } from "@/lib/site";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const productLink = `/products/${product.slug}`;

  return (
    <article className="overflow-hidden rounded-3xl bg-white">
      <Link href={productLink} className="block">
        <div
          className={`relative aspect-[4/3] ${
            product.imageUrl
              ? "bg-white bg-cover bg-center"
              : "bg-[#e9e3d8]"
          }`}
          style={
            product.imageUrl
              ? {
                  backgroundImage: `url("${product.imageUrl}")`,
                }
              : undefined
          }
          role={product.imageUrl ? "img" : undefined}
          aria-label={product.imageUrl ? product.name : undefined}
        >
          {!product.imageUrl && (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-black/10 bg-white/50 text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                NC
              </div>
            </div>
          )}

          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium">
            {product.category}
          </div>

          {product.isBestseller && (
            <div className="absolute right-4 top-4 rounded-full bg-[#f5dfd4] px-3 py-1 text-xs font-medium text-[#c44e18]">
              Bestseller
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c44e18]">
              {product.code}
            </p>

            <h3 className="mt-2 text-xl font-semibold">
              {product.name}
            </h3>
          </div>

          <p className="whitespace-nowrap text-sm font-semibold">
            {product.price}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl bg-black/5 p-3">
            <p className="text-black/40">Lumbar</p>
            <p className="mt-1 font-medium">
              {product.specs.lumbar}
            </p>
          </div>

          <div className="rounded-xl bg-black/5 p-3">
            <p className="text-black/40">Armrests</p>
            <p className="mt-1 font-medium">
              {product.specs.armrests}
            </p>
          </div>

          <div className="rounded-xl bg-black/5 p-3">
            <p className="text-black/40">Back</p>
            <p className="mt-1 font-medium">
              {product.specs.back}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={`${productLink}#specifications`}
            className="text-sm font-semibold underline underline-offset-4"
          >
            Full specs
          </Link>

          <Link
            href={`${productLink}/order`}
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
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
