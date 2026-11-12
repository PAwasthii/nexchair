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
    <article className="flex flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition-shadow hover:shadow-md">
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

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F26919]">
              {product.code}
            </p>
            <h3 className="mt-1 text-lg font-semibold leading-snug">
              {product.name}
            </h3>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-black/60">
                {product.description}
              </p>
            )}
          </div>
          <p className="shrink-0 whitespace-nowrap text-sm font-semibold">
            {product.price}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs">
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

        <div className="mt-auto pt-3 space-y-3">
          <Link
            href={`/specifications?model=${product.code}`}
            className="block text-xs font-semibold underline underline-offset-4"
          >
            Full specs
          </Link>
          <div className="flex gap-2">
            <Link
              href={`${productLink}/order`}
              className="flex flex-1 items-center justify-center rounded-full bg-[#0E3159] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0a2647]"
            >
              Enquire
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1da851]"
            >
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
