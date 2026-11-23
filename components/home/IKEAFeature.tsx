import Image from "next/image";

const PRODUCT_IMAGE_URL = "/images/IKEA-artifact.jpeg";

const IKEA_PRODUCT_URL =
  "https://www.ikea.com/in/en/p/glostad-2-seat-sofa-knisa-dark-grey-10489009/";

export default function IKEAFeature() {
  return (
    <section className="bg-[#F1E5D6] px-5 pb-5 pt-10 sm:px-9 lg:pb-8 lg:pt-16">
      <div className="mx-auto max-w-[1360px] overflow-hidden rounded-[24px] bg-[#0B3838] border border-[#E8AD4D]/20">
        <div className="grid min-h-[460px] md:grid-cols-[5fr_7fr] lg:min-h-[500px]">

          {/* Text block */}
          <div className="order-2 flex flex-col justify-center px-7 py-10 sm:px-10 md:order-1 md:px-12 lg:px-14 lg:py-14">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#F0A52E] mb-5 sm:text-[14px] lg:text-[16px]">Available at IKEA India</p>

            <h2 className="font-display mt-0 text-[34px] font-semibold leading-[1.1] text-[#FFF9F0] lg:text-[50px]">
              Clean lines,{" "}
              <span className="block">everyday comfort.</span>
            </h2>

            <div className="mt-5 border-l-2 border-[#F26919] pl-4">
              <p className="text-base font-semibold text-[#FFF9F0]">GLOSTAD</p>
              <p className="text-sm text-[#FFF9F0]/60">2-seat sofa · Knisa dark grey</p>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-[1.6] text-white">
              A compact two-seater designed for everyday living - a removable
              machine-washable cover and a clean silhouette that works in
              any room.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFF9F0]/40">
                  Seats
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#FFF9F0]">2 persons</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFF9F0]/40">
                  Cover
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#FFF9F0]">
                  Removable &amp; washable
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFF9F0]/40">
                  Material
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#FFF9F0]">Polyester</p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={IKEA_PRODUCT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-[#E8AD4D]/50 px-6 py-3 text-sm font-semibold text-[#FFF9F0] transition duration-200 hover:border-[#E8AD4D] hover:bg-[#E8AD4D]/10"
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

          {/* Image panel */}
          <div className="relative order-1 min-h-[260px] bg-[#0B3838]/80 md:order-2 md:min-h-0">
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
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FFF9F0]/30">
                  Product image pending
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
