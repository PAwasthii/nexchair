/**
 * One-time script: insert Posh HB and Fedo HB into the database.
 *
 * Both products are positioned immediately after "Amaze HB" in the
 * product-range page by using createdAt values 1–2 seconds earlier
 * than Amaze HB's timestamp (the page sorts by createdAt DESC).
 *
 * Run: npx tsx scripts/add-new-products.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const url = new URL(connectionString);
url.searchParams.delete("sslmode");

const pool = new Pool({ connectionString: url.toString(), ssl: { rejectUnauthorized: true } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // ── Verify Amaze HB exists ───────────────────────────────────────────────
  const amazeHb = await prisma.product.findFirst({
    where: { code: "NC-AMAZE-HB" },
    select: { id: true, createdAt: true },
  });
  if (!amazeHb) throw new Error("NC-AMAZE-HB not found — aborting.");

  const amazeTs = amazeHb.createdAt.getTime();
  const poshTs  = new Date(amazeTs - 1_232); // 1 s 232 ms earlier
  const fedoTs  = new Date(amazeTs - 2_464); // 2 s 464 ms earlier

  // ── Resolve category IDs ─────────────────────────────────────────────────
  const staffCat = await prisma.category.findFirst({
    where: { slug: "staff-chair" },
    select: { id: true },
  });
  const execCat = await prisma.category.findFirst({
    where: { slug: "executive-chair" },
    select: { id: true },
  });
  if (!staffCat) throw new Error("Category 'staff-chair' not found.");
  if (!execCat)  throw new Error("Category 'executive-chair' not found.");

  // ── Guard: skip if already inserted ─────────────────────────────────────
  const existing = await prisma.product.findMany({
    where: { code: { in: ["NC-POSHHB", "NC-FEDOHB"] } },
    select: { code: true },
  });
  if (existing.length > 0) {
    console.log("Already inserted:", existing.map((p) => p.code).join(", "));
    return;
  }

  // ── 1. Posh HB ──────────────────────────────────────────────────────────
  const poshHb = await prisma.product.create({
    data: {
      name:        "Posh HB",
      slug:        "posh-hb",
      code:        "NC-POSHHB",
      categoryId:  staffCat.id,
      price:       "Price on request",
      description: "Ergonomic high-back staff chair with a grey mesh back, adjustable headrest and arms, synchro-tilt mechanism and hydraulic height adjustment on a chrome five-star base.",
      armrests:    "Adjustable",
      warranty:    "1 year",
      specs:       { back: "Mesh", lumbar: "Fixed" },
      isBestseller: false,
      isActive:    true,
      createdAt:   poshTs,
    },
  });

  await prisma.productImage.create({
    data: {
      productId:  poshHb.id,
      storageKey: "/images/categories/Posh%20HB.jpg",
      altText:    "Posh HB ergonomic staff chair",
      sortOrder:  0,
      isPrimary:  true,
    },
  });

  console.log("Created:", poshHb.name, poshHb.code);

  // ── 2. Fedo HB ──────────────────────────────────────────────────────────
  const fedoHb = await prisma.product.create({
    data: {
      name:        "Fedo HB",
      slug:        "fedo-hb",
      code:        "NC-FEDOHB",
      categoryId:  execCat.id,
      price:       "Price on request",
      description: "High-back mesh executive/workstation chair in grey with a breathable mesh back, fabric-cushioned seat, adjustable arms and a tilt mechanism on a chrome five-star base. Tall mesh back, no separate headrest.",
      armrests:    "Adjustable",
      warranty:    "2 years",
      specs:       { back: "Mesh", lumbar: "Fixed" },
      dimensions:  { seat: "H 119 × W 69 × D 50 cm, seat height 45 cm" },
      isBestseller: false,
      isActive:    true,
      createdAt:   fedoTs,
    },
  });

  await prisma.productImage.create({
    data: {
      productId:  fedoHb.id,
      storageKey: "/images/categories/Fedo%20HB.jpg",
      altText:    "Fedo HB mesh executive chair",
      sortOrder:  0,
      isPrimary:  true,
    },
  });

  console.log("Created:", fedoHb.name, fedoHb.code);
  console.log("Done.");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
