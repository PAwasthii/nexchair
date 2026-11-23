import Image from "next/image";
import Link from "next/link";

import { whatsappHref } from "@/lib/site";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

function IconBack() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 4h14v13a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V4z" />
      <path d="M5 10h14" />
    </svg>
  );
}

function IconArmrests() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="3" width="8" height="7" rx="2" />
      <path d="M4 10h4v8H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" />
      <path d="M20 10h-4v8h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z" />
    </svg>
  );
}

function IconWeight() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="6" r="3" />
      <path d="M6.5 22 8 9h8l1.5 13" />
      <path d="M4 22h16" />
    </svg>
  );
}

function SpecBox({
  icon,
  label,
  value,
}: {
  icon: "back" | "armrests" | "weight";
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[12px] border border-white/10 bg-white/8 p-2.5">
      <div className="flex items-center gap-1.5 text-[#F0A52E]">
        {icon === "back" && <IconBack />}
        {icon === "armrests" && <IconArmrests />}
        {icon === "weight" && <IconWeight />}
        <span className="text-[11px] font-semibold text-white/50">{label}</span>
      </div>
      <p className="truncate text-[12px] font-semibold leading-snug text-white/90">
        {value && value !== "-" ? value : "—"}
      </p>
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const productLink = `/products/${product.slug}`;

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-[22px] border border-white/10 transition-all duration-[250ms] ease-out motion-safe:hover:-translate-y-[3px] hover:border-white/20 hover:shadow-[0_14px_36px_rgba(0,0,0,0.30)] sm:flex-row"
      style={{ background: "linear-gradient(145deg, #073B38 0%, #092F30 55%, #073B38 100%)" }}
    >

      {/* ── Image side ─────────────────────────────────────── */}
      <div className="shrink-0 sm:w-[36%]">
        <div className="relative m-3 h-[200px] overflow-hidden rounded-[18px] bg-[#F3E5D4] sm:m-3.5 sm:h-[calc(100%-28px)]">
          <Link href={productLink} className="absolute inset-0" tabIndex={-1} aria-hidden="true">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1360px) 36vw, 476px"
                className="object-contain p-5 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.025]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] font-semibold uppercase tracking-widest text-[#8B6914]/30">
                NC
              </div>
            )}
          </Link>

          {product.isBestseller && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#D85B13] px-2.5 py-1 text-[11px] font-bold text-white">
              Bestseller
            </span>
          )}
        </div>
      </div>

      {/* ── Info side ──────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:py-5 sm:pl-2 sm:pr-6">

        {/* Code + category badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#D85B13]">
              {product.code}
            </p>
            <Link href={productLink}>
              <h3 className="font-display mt-1 text-[26px] font-bold leading-[1.05] text-white transition-colors duration-200 group-hover:text-[#F0A52E] sm:text-[29px] lg:text-[33px]">
                {product.name}
              </h3>
            </Link>
          </div>
          <span className="mt-1 shrink-0 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[12px] font-semibold text-white/80">
            {product.category}
          </span>
        </div>

        {/* Price + warranty */}
        <p className="mt-2 text-[14px] font-semibold text-white/70">
          {product.price}
          {product.warranty && product.warranty !== "-" && (
            <span className="ml-2 font-normal text-white/40">
              · {product.warranty} warranty
            </span>
          )}
        </p>

        {/* Spec boxes */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <SpecBox icon="back" label="Back" value={product.specs.back} />
          <SpecBox icon="armrests" label="Armrests" value={product.armrests} />
          <SpecBox icon="weight" label="Max Load" value={product.maxUserWeight} />
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Link
            href={`${productLink}/order`}
            className="inline-flex items-center gap-2 rounded-full bg-[#D85B13] px-5 py-[10px] text-[14px] font-bold text-white transition-all duration-200 hover:bg-[#c0500f] hover:shadow-[0_4px_14px_rgba(216,91,19,0.38)]"
            style={{ minHeight: 42 }}
          >
            Enquire
            <svg
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 7h12M7.5 2.5 13 7 7.5 11.5" />
            </svg>
          </Link>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#16BD60] px-5 py-[10px] text-[14px] font-bold text-white transition-all duration-200 hover:bg-[#13a854]"
            style={{ minHeight: 42 }}
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp
          </a>

          <Link
            href={`/specifications?model=${product.code}`}
            className="text-[13px] font-semibold text-white/50 underline underline-offset-4 transition hover:text-white/80"
          >
            Full specs
          </Link>
        </div>
      </div>
    </article>
  );
}
