type ComparisonProduct = {
  name: string;
  category: string;
  price: string;
  maxUserWeight: string;
  armrests: string;
  warranty: string;
  lumbar: string;
  back: string;
};

type ProductComparisonProps = {
  currentProduct: ComparisonProduct;
  products: ComparisonProduct[];
};

export default function ProductComparison({
  currentProduct,
  products,
}: ProductComparisonProps) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div id="compare" className="scroll-mt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F26919]">
            Compare
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Compare with similar chairs
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-black/55">
            Compare the specifications that matter before making your
            decision.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-3xl bg-white">
          <table className="min-w-[760px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10">
                <th className="w-48 p-5 text-left font-medium text-black/50">
                  Specification
                </th>

                <th className="p-5 text-left">
                  <span className="block text-xs text-black/40">
                    Current product
                  </span>

                  <span className="mt-1 block font-semibold">
                    {currentProduct.name}
                  </span>
                </th>

                {products.map((product) => (
                  <th
                    key={product.name}
                    className="p-5 text-left"
                  >
                    <span className="block font-semibold">
                      {product.name}
                    </span>

                    <span className="mt-1 block text-xs text-black/40">
                      {product.category}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <ComparisonRow
                label="Price"
                current={currentProduct.price}
                products={products.map((product) => product.price)}
              />

              <ComparisonRow
                label="Maximum user weight"
                current={currentProduct.maxUserWeight}
                products={products.map(
                  (product) => product.maxUserWeight,
                )}
              />

              <ComparisonRow
                label="Armrests"
                current={currentProduct.armrests}
                products={products.map(
                  (product) => product.armrests,
                )}
              />

              <ComparisonRow
                label="Lumbar"
                current={currentProduct.lumbar}
                products={products.map(
                  (product) => product.lumbar,
                )}
              />

              <ComparisonRow
                label="Back"
                current={currentProduct.back}
                products={products.map(
                  (product) => product.back,
                )}
              />

              <ComparisonRow
                label="Warranty"
                current={currentProduct.warranty}
                products={products.map(
                  (product) => product.warranty,
                )}
              />
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

type ComparisonRowProps = {
  label: string;
  current: string;
  products: string[];
};

function ComparisonRow({
  label,
  current,
  products,
}: ComparisonRowProps) {
  return (
    <tr className="border-b border-black/10 last:border-b-0">
      <td className="p-5 text-black/50">
        {label}
      </td>

      <td className="p-5 font-medium">
        {current}
      </td>

      {products.map((value, index) => (
        <td
          key={`${label}-${index}`}
          className="p-5"
        >
          {value}
        </td>
      ))}
    </tr>
  );
}