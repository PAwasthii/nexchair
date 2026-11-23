import Link from "next/link";

export default function HomeBottomCTA() {
  return (
    <section className="bg-[#F1E5D6] px-5 pb-10 pt-5 sm:px-9 lg:pb-14 lg:pt-8">
      <div className="mx-auto max-w-[1360px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="max-w-xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#D85B13] mb-3 sm:text-[14px] lg:text-[16px]">Corporate solutions</p>
            <h2 className="font-display text-[34px] font-semibold leading-[1.1] text-[#102F32] lg:text-[50px]">
              Kitting out a whole office?
            </h2>
            <p className="mt-4 text-base leading-7 text-[#20292B]">
              Share seat count and budget - we shortlist three options with spec sheets.
            </p>
          </div>

          <Link
            href="/contact"
            className="w-fit shrink-0 rounded-full bg-[#D85B13] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#bf5010]"
          >
            Request a quote
          </Link>
        </div>
      </div>
    </section>
  );
}
