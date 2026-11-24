/**
 * One-time script:
 *   1. Upload Polo HB, Polo MB, Moon PU images to Cloudinary.
 *   2. Activate those three products with correct data + ProductImage records.
 *   3. Deactivate all products that still have no image.
 *
 * Run: npx tsx scripts/add-polo-moon-products.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import * as path from "path";
import { v2 as cloudinary } from "cloudinary";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const dbUrl = new URL(process.env.DATABASE_URL!);
dbUrl.searchParams.delete("sslmode");
const pool   = new Pool({ connectionString: dbUrl.toString(), ssl: { rejectUnauthorized: true } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ROOT = path.resolve(__dirname, "..");

// ── Upload helper (idempotent — skips if publicId already exists) ─────────────
async function upload(filename: string, publicIdSlug: string): Promise<{ url: string; publicId: string }> {
  const imgPath = path.join(ROOT, "public", "images", "categories", filename);
  console.log(`  Uploading ${filename} …`);
  const result = await cloudinary.uploader.upload(imgPath, {
    folder:    "nexchair/products",
    public_id: publicIdSlug,
    overwrite: false,
  });
  console.log(`  → ${result.secure_url}`);
  return { url: result.secure_url, publicId: result.public_id };
}

// ── Activate one product ──────────────────────────────────────────────────────
async function activateProduct(opts: {
  existingCode: string;
  newCode:      string;
  newSlug:      string;
  categorySlug: string;
  description:  string;
  armrests:     string;
  warranty:     string;
  specs:        Record<string, string>;
  dimensions?:  Record<string, string>;
  imageFile:    string;
  imageSlug:    string;
}) {
  const cat = await prisma.category.findFirst({
    where: { slug: opts.categorySlug },
    select: { id: true },
  });
  if (!cat) throw new Error(`Category not found: ${opts.categorySlug}`);

  const product = await prisma.product.findFirst({
    where: { code: opts.existingCode },
    include: { images: true },
  });
  if (!product) throw new Error(`Product not found: ${opts.existingCode}`);

  // Skip if already active + has a Cloudinary image
  const hasCloudinary = product.images.some(
    (i) => i.storageKey.startsWith("https://res.cloudinary.com"),
  );
  if (product.isActive && hasCloudinary) {
    console.log(`${opts.existingCode}: already active with Cloudinary image — skipping`);
    return;
  }

  const { url, publicId } = await upload(opts.imageFile, opts.imageSlug);

  // Update product record
  await prisma.product.update({
    where: { id: product.id },
    data: {
      code:        opts.newCode,
      slug:        opts.newSlug,
      categoryId:  cat.id,
      price:       "Price on request",
      description: opts.description,
      armrests:    opts.armrests,
      warranty:    opts.warranty,
      specs:       opts.specs,
      ...(opts.dimensions ? { dimensions: opts.dimensions } : {}),
      isActive:    true,
    },
  });

  // Replace placeholder image record if present, else create
  const placeholder = product.images.find(
    (i) => !i.storageKey.startsWith("https://"),
  );
  if (placeholder) {
    await prisma.productImage.update({
      where: { id: placeholder.id },
      data: { storageKey: url, publicId, altText: product.name, isPrimary: true, sortOrder: 0 },
    });
  } else if (product.images.length === 0) {
    await prisma.productImage.create({
      data: {
        productId:  product.id,
        storageKey: url,
        publicId,
        altText:    product.name,
        sortOrder:  0,
        isPrimary:  true,
      },
    });
  }

  console.log(`  Activated: ${opts.newCode} (${product.name})`);
}

async function main() {
  // ── 1. Polo HB ──────────────────────────────────────────────────────────────
  console.log("\n=== Polo HB ===");
  await activateProduct({
    existingCode: "NC-POLO-HB",
    newCode:      "NC-POLOHB",
    newSlug:      "polo-hb",
    categorySlug: "executive-chair",
    description:  "High-back ergonomic chair with a breathable black mesh back and adjustable headrest, contoured lumbar support, fabric-cushioned seat and fixed cantilever armrests. Tilt mechanism with gentle recline on a black five-star base.",
    armrests:     "Fixed (cantilever nylon)",
    warranty:     "1 year",
    specs:        { back: "Mesh", lumbar: "Fixed" },
    imageFile:    "Polo HB.jpg",
    imageSlug:    "polo-hb",
  });

  // ── 2. Polo MB ──────────────────────────────────────────────────────────────
  console.log("\n=== Polo MB ===");
  await activateProduct({
    existingCode: "NC-POLO-MB",
    newCode:      "NC-POLOMB",
    newSlug:      "polo-mb",
    categorySlug: "staff-chair",
    description:  "Mid-back ergonomic office chair with a breathable black mesh back, adjustable lumbar support and fabric seat, height-adjustable armrests and a gas-lift tilt mechanism on a black five-star base.",
    armrests:     "Adjustable",
    warranty:     "1 year",
    specs:        { back: "Mesh", lumbar: "Fixed" },
    dimensions:   { seat: "760 (W) × 760 (D) × 1035–1130 (H) mm" },
    imageFile:    "Polo MB.jpg",
    imageSlug:    "polo-mb",
  });

  // ── 3. Moon PU ──────────────────────────────────────────────────────────────
  console.log("\n=== Moon PU ===");
  await activateProduct({
    existingCode: "NC-MOON-PU",
    newCode:      "NC-MOONPU",
    newSlug:      "moon-pu",
    categorySlug: "staff-chair",
    description:  "Low-back office chair upholstered in black leatherette (PU) with contrast stitching, fixed curved loop armrests, pneumatic height adjustment and a tilt mechanism on a black five-star base.",
    armrests:     "Fixed (loop)",
    warranty:     "1 year",
    specs:        { back: "Leatherette (PU)" },
    imageFile:    "Moon PU.jpg",
    imageSlug:    "moon-pu",
  });

  // ── 4. Deactivate all remaining no-image products ───────────────────────────
  console.log("\n=== Deactivating no-image products ===");

  // Explicit removals + stale duplicates + NX products without images
  const codesToDeactivate = [
    "NC-CAMBRY-HB",   // Cambry HB (explicitly named)
    "NC-COMFY-MB",    // Comfy MB (explicitly named)
    "NC-GLANZA",      // Glanza (explicitly named)
    "NC-GREEN-SOAUL", // Green Soul/Soaul (explicitly named)
    "NC-FEDO-HB",     // stale duplicate of NC-FEDOHB
    "NC-POSH-HB",     // stale duplicate of NC-POSHHB
    "NX-B1",          // NX Board — no image
    "NX-D1",          // NX Draft Stool — no image
    "NX-E1",          // NX Executive — no image
    "NX-H1",          // NX Home Compact — no image
    "NX-N1",          // NX Nest — no image
    "NX-V2",          // NX Stack — no image
    "NX-S1",          // NX Studio — no image
    "NX-T1",          // NX Task Mesh — no image
  ];

  const { count } = await prisma.product.updateMany({
    where: { code: { in: codesToDeactivate } },
    data:  { isActive: false },
  });
  console.log(`  Deactivated ${count} products`);

  // Safety check: report any remaining active products with no image
  const stillNoImage = await prisma.product.findMany({
    where: {
      isActive: true,
      images:   { none: {} },
    },
    select: { name: true, code: true },
  });
  if (stillNoImage.length > 0) {
    console.warn("  WARNING — still active with no image:");
    stillNoImage.forEach((p) => console.warn(`    ${p.name} ${p.code}`));
  } else {
    console.log("  All active products now have at least one image.");
  }

  console.log("\nDone.");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
