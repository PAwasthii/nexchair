import QuoteForm from "@/components/home/QuoteForm";

export default function QuoteSection() {
  return (
    <section className="bg-[#0E3159] px-6 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Get a quote
          </p>

          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Outfitting a floor? Get a seating quote.
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">
            Tell us what you need and our team will help with product
            selection, quantity, pricing and delivery.
          </p>
        </div>

        <div className="rounded-3xl bg-black/10 p-6 md:p-8">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}