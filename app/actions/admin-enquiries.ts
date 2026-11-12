"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
const VALID_TYPES = ["CONTACT", "QUOTE", "ORDER"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];
type ValidType = (typeof VALID_TYPES)[number];

function isValidStatus(v: string): v is ValidStatus {
  return (VALID_STATUSES as readonly string[]).includes(v);
}

function isValidType(v: string): v is ValidType {
  return (VALID_TYPES as readonly string[]).includes(v);
}

const PAGE_SIZE = 20;

// ─── List ─────────────────────────────────────────────────────────────────────

export type EnquiryListItem = {
  id: string;
  type: ValidType;
  status: ValidStatus;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  itemCount: number;
  createdAt: string;
};

export type EnquiryListResult = {
  enquiries: EnquiryListItem[];
  total: number;
  page: number;
  pageCount: number;
};

export async function getEnquiries(opts?: {
  status?: string;
  type?: string;
  search?: string;
  page?: number;
}): Promise<EnquiryListResult> {
  await requireAdminSession();

  const page = Math.max(1, opts?.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.EnquiryWhereInput = {};

  if (opts?.status && isValidStatus(opts.status)) {
    where.status = opts.status;
  }
  if (opts?.type && isValidType(opts.type)) {
    where.type = opts.type;
  }
  if (opts?.search?.trim()) {
    const q = opts.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    prisma.enquiry.findMany({
      where,
      select: {
        id: true,
        type: true,
        status: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        city: true,
        _count: { select: { items: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.enquiry.count({ where }),
  ]);

  return {
    enquiries: rows.map((e) => ({
      id: e.id,
      type: e.type as ValidType,
      status: e.status as ValidStatus,
      name: e.name,
      company: e.company,
      email: e.email,
      phone: e.phone,
      city: e.city,
      itemCount: e._count.items,
      createdAt: e.createdAt.toISOString(),
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export type EnquiryDetail = {
  id: string;
  type: ValidType;
  status: ValidStatus;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  gstin: string | null;
  city: string | null;
  pincode: string | null;
  orderType: string | null;
  preferredContact: string | null;
  neededBy: string | null;
  message: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    productCode: string;
    colour: string | null;
    quantity: number;
  }[];
};

export async function getEnquiry(id: string): Promise<EnquiryDetail | null> {
  await requireAdminSession();

  if (!id.trim()) return null;

  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!enquiry) return null;

  return {
    id: enquiry.id,
    type: enquiry.type as ValidType,
    status: enquiry.status as ValidStatus,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    whatsapp: enquiry.whatsapp,
    company: enquiry.company,
    gstin: enquiry.gstin,
    city: enquiry.city,
    pincode: enquiry.pincode,
    orderType: enquiry.orderType,
    preferredContact: enquiry.preferredContact,
    neededBy: enquiry.neededBy,
    message: enquiry.message,
    adminNotes: enquiry.adminNotes,
    createdAt: enquiry.createdAt.toISOString(),
    updatedAt: enquiry.updatedAt.toISOString(),
    items: enquiry.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productCode: item.product.code,
      colour: item.colour,
      quantity: item.quantity,
    })),
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export type EnquiryActionState = {
  success: boolean;
  error?: string;
};

export async function updateEnquiryStatus(
  _prev: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id) return { success: false, error: "Enquiry ID is required." };
  if (!isValidStatus(status)) return { success: false, error: "Invalid status value." };

  const exists = await prisma.enquiry.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) return { success: false, error: "Enquiry not found." };

  await prisma.enquiry.update({ where: { id }, data: { status } });

  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);

  return { success: true };
}

export async function updateEnquiryNotes(
  _prev: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const adminNotes = String(formData.get("adminNotes") ?? "")
    .trim()
    .slice(0, 2000);

  if (!id) return { success: false, error: "Enquiry ID is required." };

  const exists = await prisma.enquiry.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) return { success: false, error: "Enquiry not found." };

  await prisma.enquiry.update({
    where: { id },
    data: { adminNotes: adminNotes || null },
  });

  revalidatePath(`/admin/enquiries/${id}`);

  return { success: true };
}
