import { notFound } from "next/navigation";

import OrderEnquiryForm from "@/components/order/OrderEnquiryForm";
import { prisma } from "@/lib/prisma";

export default async function OrderEnquiryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const dbProducts = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const currentProduct = dbProducts.find(
    (item) => item.slug === slug,
  );

  if (!currentProduct) {
    notFound();
  }

  const products = dbProducts.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    price: item.price,
    colour: item.colour,
  }));

  const selectedProduct = {
    id: currentProduct.id,
    name: currentProduct.name,
    code: currentProduct.code,
    price: currentProduct.price,
    colour: currentProduct.colour,
  };

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c44e18]">
            04 · Quote request
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Place an order enquiry
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">
            No payment now. We confirm stock, pricing and delivery before
            anything is invoiced.
          </p>
        </div>

        <div className="mt-10">
          <OrderEnquiryForm
            product={selectedProduct}
            products={products}
          />
        </div>
      </div>
    </main>
  );
}