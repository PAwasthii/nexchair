import Image from "next/image";

const PRODUCT_IMAGE_URL = "/images/IKEA-artifact.jpeg";

const IKEA_PRODUCT_URL =
  "https://www.ikea.com/in/en/p/glostad-2-seat-sofa-knisa-dark-grey-10489009/";

export default function IKEAFeature() {
  return (
    <section className="px-4 py-3 md:px-6 md:py-4">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#0E3159]">
        <div className="grid min-h-[480px] md:grid-cols-[5fr_7fr] lg:min-h-[540px]">

          {/* Text block — below image on mobile, left column on desktop */}
          <div className="order-2 flex flex-col justify-center px-10 py-12 md:order-1 md:px-14 lg:px-16 lg:py-16">

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F26919]">
              Available at IKEA India
            </p>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Clean lines,{" "}
              <span className="block">everyday comfort.</span>
            </h2>

            <div className="mt-5 border-l-2 border-[#F26919] pl-4">
              <p className="text-base font-bold text-white">GLOSTAD</p>
              <p className="text-sm text-white/50">2-seat sofa · Knisa dark grey</p>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              A compact two-seater designed for everyday living — a removable
              machine-washable cover and a clean silhouette that works in
              any room.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Seats
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white">2 persons</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Cover
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white">
                  Removable &amp; washable
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Material
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white">Polyester</p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={IKEA_PRODUCT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:border-white hover:bg-white hover:text-[#0E3159]"
              >
                View on IKEA
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 7h12M7.5 2.5 13 7 7.5 11.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Image panel — above text on mobile, right column on desktop */}
          <div className="relative order-1 min-h-[260px] bg-[#e9e3d8] md:order-2 md:min-h-0">
            {PRODUCT_IMAGE_URL ? (
              <Image
                src={PRODUCT_IMAGE_URL}
                alt="GLOSTAD 2-seat sofa in Knisa dark grey, available at IKEA India"
                fill
                className="object-contain p-8 md:p-12"
                sizes="(max-width: 767px) 100vw, 58vw"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-black/25">
                  Product image pending
                </span>
                <span className="text-xs text-black/20">
                  Set PRODUCT_IMAGE_URL in IKEAFeature.tsx
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
