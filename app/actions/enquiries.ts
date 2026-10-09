"use server";

import { prisma } from "@/lib/prisma";

export type CreateEnquiryInput = {
  type: "CONTACT" | "QUOTE" | "ORDER";
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  gstin?: string;
  city?: string;
  pincode?: string;
  orderType?: string;
  preferredContact?: string;
  neededBy?: string;
  message?: string;
  items?: {
    productId: string;
    colour?: string;
    quantity: number;
  }[];
};

export async function createEnquiry(input: CreateEnquiryInput) {
  if (!input.name.trim()) {
    return {
      success: false,
      message: "Name is required.",
    };
  }

  if (!input.email?.trim() && !input.phone?.trim()) {
    return {
      success: false,
      message: "Email or mobile number is required.",
    };
  }

  if (input.items?.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return {
      success: false,
      message: "Quantity must be at least 1.",
    };
  }

  if (input.items?.length) {
    const productIds = input.items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    const validProductIds = new Set(
      products.map((product) => product.id),
    );

    const hasInvalidProduct = productIds.some(
      (productId) => !validProductIds.has(productId),
    );

    if (hasInvalidProduct) {
      return {
        success: false,
        message: "One or more selected products are unavailable.",
      };
    }
  }

  try {
    const enquiry = await prisma.enquiry.create({
      data: {
        type: input.type,
        name: input.name.trim(),
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        whatsapp: input.whatsapp?.trim() || null,
        company: input.company?.trim() || null,
        gstin: input.gstin?.trim() || null,
        city: input.city?.trim() || null,
        pincode: input.pincode?.trim() || null,
        orderType: input.orderType?.trim() || null,
        preferredContact: input.preferredContact?.trim() || null,
        neededBy: input.neededBy?.trim() || null,
        message: input.message?.trim() || null,
        items: input.items?.length
          ? {
              create: input.items.map((item) => ({
                productId: item.productId,
                colour: item.colour?.trim() || null,
                quantity: item.quantity,
              })),
            }
          : undefined,
      },
    });

    return {
      success: true,
      message: "Enquiry submitted successfully.",
      enquiryId: enquiry.id,
    };
  } catch (error) {
    console.error("Failed to create enquiry:", error);

    return {
      success: false,
      message: "Unable to submit enquiry right now.",
    };
  }
}