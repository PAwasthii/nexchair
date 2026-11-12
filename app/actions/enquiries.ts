"use server";

import { prisma } from "@/lib/prisma";
import { sendEnquiryEmails } from "@/lib/email";
import { checkEnquiryRateLimit } from "@/lib/ratelimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-()\[\]]{7,20}$/;
const VALID_TYPES = new Set(["CONTACT", "QUOTE", "ORDER"]);

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
  // Rate-limit check runs before all validation to prevent throttled callers
  // from distinguishing error types through repeated probing.
  const rl = await checkEnquiryRateLimit();
  if (!rl.allowed) {
    const retry = rl.retryAfterSeconds ?? 60;
    return {
      success: false,
      message: `Too many submissions. Please try again in ${retry} seconds.`,
    };
  }

  if (!VALID_TYPES.has(input.type)) {
    return { success: false, message: "Invalid enquiry type." };
  }

  const name = input.name?.trim() ?? "";
  if (!name) return { success: false, message: "Name is required." };
  if (name.length > 200) return { success: false, message: "Name is too long." };

  const email = input.email?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";

  if (!email && !phone) {
    return { success: false, message: "Email or mobile number is required." };
  }

  if (email && !EMAIL_RE.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  if (phone && !PHONE_RE.test(phone)) {
    return { success: false, message: "Please enter a valid phone number." };
  }

  const message = input.message?.trim() ?? "";
  if (message.length > 2000) {
    return { success: false, message: "Message must be 2000 characters or fewer." };
  }

  if (input.items && input.items.length > 50) {
    return { success: false, message: "Too many items in a single enquiry." };
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
      // Include product names so we can populate the notification email
      // without a second DB round-trip.
      include: {
        items: {
          include: {
            product: { select: { name: true, code: true } },
          },
        },
      },
    });

    // DB write succeeded — attempt email notifications. Any failure is caught
    // inside sendEnquiryEmails and logged; it will not affect the return value.
    await sendEnquiryEmails({
      enquiryId: enquiry.id,
      type: enquiry.type,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      company: enquiry.company,
      city: enquiry.city,
      message: enquiry.message,
      items: enquiry.items.map((item) => ({
        productName: item.product.name,
        productCode: item.product.code,
        colour: item.colour,
        quantity: item.quantity,
      })),
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