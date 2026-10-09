"use client";

import { FormEvent, useState, useTransition } from "react";

import { createEnquiry } from "@/app/actions/enquiries";

type Product = {
  id: string;
  name: string;
  code: string;
  price: string;
  colour: string | null;
};

type SelectedItem = {
  productId: string;
  name: string;
  code: string;
  price: string;
  colour: string;
  quantity: number;
};

type OrderEnquiryFormProps = {
  product: Product;
  products: Product[];
};

export default function OrderEnquiryForm({
  product,
  products,
}: OrderEnquiryFormProps) {
  const initialItem: SelectedItem = {
    productId: product.id,
    name: product.name,
    code: product.code,
    price: product.price,
    colour: product.colour ?? "Graphite",
    quantity: 1,
  };

  const [orderType, setOrderType] = useState("Business");
  const [items, setItems] = useState<SelectedItem[]>([initialItem]);
  const [preferredContact, setPreferredContact] = useState("WhatsApp");
  const [neededBy, setNeededBy] = useState("Within 2 weeks");
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateItem(
    index: number,
    updates: Partial<SelectedItem>,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, ...updates }
          : item,
      ),
    );
  }

  function addAnotherModel() {
    const nextProduct = products.find(
      (item) =>
        !items.some((selected) => selected.productId === item.id),
    );

    if (!nextProduct) {
      setStatus("All available models have already been added.");
      return;
    }

    setItems((current) => [
      ...current,
      {
        productId: nextProduct.id,
        name: nextProduct.name,
        code: nextProduct.code,
        price: nextProduct.price,
        colour: nextProduct.colour ?? "Graphite",
        quantity: 1,
      },
    ]);

    setStatus("");
  }

  function removeModel(index: number) {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function handleProductChange(
    index: number,
    productId: string,
  ) {
    const selectedProduct = products.find(
      (item) => item.id === productId,
    );

    if (!selectedProduct) {
      return;
    }

    updateItem(index, {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      code: selectedProduct.code,
      price: selectedProduct.price,
      colour: selectedProduct.colour ?? "Graphite",
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const gstin = String(formData.get("gstin") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();

    if (!name) {
      setStatus("Please enter your full name.");
      return;
    }

    if (!email && !phone) {
      setStatus("Please provide your email or mobile number.");
      return;
    }

    if (!agreed) {
      setStatus("Please agree to be contacted about this enquiry.");
      return;
    }

    if (items.length === 0) {
      setStatus("Please add at least one model.");
      return;
    }

    setStatus("");

    startTransition(async () => {
      const result = await createEnquiry({
        type: "ORDER",
        name,
        email,
        phone,
        whatsapp: phone,
        company,
        gstin,
        city,
        orderType,
        preferredContact,
        neededBy,
        message,
        items: items.map((item) => ({
          productId: item.productId,
          colour: item.colour,
          quantity: item.quantity,
        })),
      });

      setStatus(result.message);

      if (result.success) {
        form.reset();

        setItems([initialItem]);
        setOrderType("Business");
        setPreferredContact("WhatsApp");
        setNeededBy("Within 2 weeks");
        setAgreed(false);
        setMessage("");
      }
    });
  }

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order type */}
        <section className="rounded-3xl bg-white p-6">
          <h2 className="text-lg font-semibold">
            Who is this order for?
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setOrderType("Home")}
              className={`rounded-2xl p-4 text-left ${
                orderType === "Home"
                  ? "border-2 border-[#c44e18]"
                  : "border border-black/20"
              }`}
            >
              <p className="font-semibold">
                For myself / home office
              </p>

              <p className="mt-1 text-xs text-black/50">
                1–2 chairs
              </p>
            </button>

            <button
              type="button"
              onClick={() => setOrderType("Business")}
              className={`rounded-2xl p-4 text-left ${
                orderType === "Business"
                  ? "border-2 border-[#c44e18]"
                  : "border border-black/20"
              }`}
            >
              <p className="font-semibold">
                For a business / institution
              </p>

              <p className="mt-1 text-xs text-black/50">
                Bulk pricing / multiple chairs
              </p>
            </button>
          </div>
        </section>

        {/* Chairs */}
        <section className="rounded-3xl bg-white p-6">
          <h2 className="text-lg font-semibold">Chairs</h2>

          <div className="mt-5 space-y-4">
            {items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="rounded-2xl border border-black/10 p-4"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>

                      <p className="mt-1 text-xs text-black/50">
                        {item.code}
                      </p>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModel(index)}
                        className="w-fit text-xs font-semibold text-black/50 underline underline-offset-4"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <select
                      value={item.productId}
                      onChange={(event) =>
                        handleProductChange(
                          index,
                          event.target.value,
                        )
                      }
                      className="rounded-lg border border-black/10 px-3 py-2 text-sm"
                    >
                      {products.map((availableProduct) => (
                        <option
                          key={availableProduct.id}
                          value={availableProduct.id}
                          disabled={
                            availableProduct.id !== item.productId &&
                            items.some(
                              (selectedItem, selectedIndex) =>
                                selectedIndex !== index &&
                                selectedItem.productId ===
                                  availableProduct.id,
                            )
                          }
                        >
                          {availableProduct.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={item.colour}
                      onChange={(event) =>
                        updateItem(index, {
                          colour: event.target.value,
                        })
                      }
                      className="rounded-lg border border-black/10 px-3 py-2 text-sm"
                    >
                      <option>Graphite</option>
                      <option>Black</option>
                      <option>Brown</option>
                    </select>

                    <div className="flex items-center gap-2 rounded-lg border border-black/10 px-2 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateItem(index, {
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                        className="h-8 w-8 rounded-md border border-black/10"
                      >
                        −
                      </button>

                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateItem(index, {
                            quantity: item.quantity + 1,
                          })
                        }
                        className="h-8 w-8 rounded-md border border-black/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addAnotherModel}
            className="mt-4 text-sm font-semibold underline underline-offset-4"
          >
            + Add another model
          </button>
        </section>

        {/* Customer details */}
        <section className="rounded-3xl bg-white p-6">
          <h2 className="text-lg font-semibold">Your details</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Input name="name" label="Full name" />
            <Input name="phone" label="Mobile / WhatsApp" />
            <Input name="email" label="Email" type="email" />
            <Input name="city" label="City / pincode" />
            <Input name="company" label="Company name" />
            <Input name="gstin" label="GSTIN (optional)" />

            <Select
              label="Needed by"
              value={neededBy}
              onChange={setNeededBy}
              options={[
                "Within 2 weeks",
                "Within 1 month",
                "Just exploring",
              ]}
            />

            <Select
              label="Preferred contact"
              value={preferredContact}
              onChange={setPreferredContact}
              options={["WhatsApp", "Phone", "Email"]}
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="notes"
              className="text-sm font-medium"
            >
              Notes
            </label>

            <textarea
              id="notes"
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Site access, floor, assembly requirements..."
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <label className="mt-5 flex gap-3 text-xs text-black/60">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-0.5"
            />

            <span>I agree to be contacted about this enquiry.</span>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 rounded-full bg-[#c44e18] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Submit enquiry"}
          </button>

          {status && (
            <p className="mt-4 text-sm text-black/60">{status}</p>
          )}
        </section>
      </form>

      {/* Summary sidebar */}
      <aside className="h-fit rounded-3xl bg-[#171717] p-6 text-white lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Enquiry summary</h2>

        <div className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-white/50">Models</span>
            <span>{items.length}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/50">Order type</span>
            <span>{orderType}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/50">Total chairs</span>
            <span>{totalQuantity}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/50">Pricing</span>
            <span>On request</span>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-widest text-white/40">
            What happens next
          </p>

          <ol className="mt-4 space-y-4 text-sm text-white/70">
            <li>1. We confirm stock and pricing.</li>
            <li>2. A seating advisor contacts you.</li>
            <li>3. We finalise delivery and invoicing.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

function Input({
  name,
  label,
  type = "text",
}: {
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
