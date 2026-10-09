import { whatsappHref } from "@/lib/site";

export default function Hero() {
  return (
    <section className="px-6 py-10 md:py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
        
        {/* Left side */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            Ergonomic seating · Made for long hours
          </p>

          <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
            Seating engineered
            <br />
            for the long day.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-black/60">
            Every NexChair ships with its full specification sheet —
            dimensions, materials, load rating and warranty — so you choose
            on facts, not adjectives.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/product-range"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
            >
              Explore the range
            </a>

            <a
              href={whatsappHref}
              className="rounded-full bg-[#1f7650] px-6 py-3 text-sm font-semibold text-white"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-black/10 pt-6">
            <div>
              <p className="text-lg font-bold">[—]</p>
              <p className="mt-1 text-xs text-black/50">Warranty</p>
            </div>

            <div>
              <p className="text-lg font-bold">[—]</p>
              <p className="mt-1 text-xs text-black/50">Tested standard</p>
            </div>

            <div>
              <p className="text-lg font-bold">[—]</p>
              <p className="mt-1 text-xs text-black/50">Delivery & service</p>
            </div>
          </div>
        </div>

        {/* Right side - image placeholder */}
        <div className="min-h-[300px] rounded-3xl bg-[#e9e3d8] p-6 md:min-h-[420px]">
          <div className="flex h-full min-h-[248px] items-center justify-center rounded-2xl border border-black/10 md:min-h-[370px]">
            <p className="text-sm text-black/40">
              Hero chair image
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}