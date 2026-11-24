/**
 * One-time script: insert Rio MB, Oscar MB, Oscar HB.
 * Uploads each image to Cloudinary, creates Product + ProductImage records.
 *
 * Run: npx tsx scripts/add-rio-oscar-products.ts
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

async function uploadImage(filename: string, publicIdSlug: string) {
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

async function createProduct(opts: {
  code:         string;
  name:         string;
  slug:         string;
  categorySlug: string;
  description:  string;
  armrests:     string;
  warranty:     string;
  specs:        Record<string, string>;
  dimensions?:  Record<string, string>;
  imageFile:    string;
  imageSlug:    string;
}) {
  // Guard: skip if already inserted
  const existing = await prisma.product.findFirst({ where: { code: opts.code } });
  if (existing) {
    console.log(`  ${opts.code} already exists — skipping`);
    return;
  }

  const cat = await prisma.category.findFirst({
    where: { slug: opts.categorySlug },
    select: { id: true },
  });
  if (!cat) throw new Error(`Category not found: ${opts.categorySlug}`);

  const { url, publicId } = await uploadImage(opts.imageFile, opts.imageSlug);

  const product = await prisma.product.create({
    data: {
      name:        opts.name,
      slug:        opts.slug,
      code:        opts.code,
      categoryId:  cat.id,
      price:       "Price on request",
      description: opts.description,
      armrests:    opts.armrests,
      warranty:    opts.warranty,
      specs:       opts.specs,
      ...(opts.dimensions ? { dimensions: opts.dimensions } : {}),
      isBestseller: false,
      isActive:    true,
    },
  });

  await prisma.productImage.create({
    data: {
      productId:  product.id,
      storageKey: url,
      publicId,
      altText:    opts.name,
      sortOrder:  0,
      isPrimary:  true,
    },
  });

  console.log(`  Created: ${opts.code} (${opts.name})`);
}

async function main() {
  console.log("\n=== Rio MB ===");
  await createProduct({
    code:         "NC-RIOMB",
    name:         "Rio MB",
    slug:         "rio-mb",
    categorySlug: "staff-chair",
    description:  "Mid-back mesh task chair with a breathable perforated grey back on a white/grey frame, adjustable lumbar support, moulded-foam fabric seat and 1D height-adjustable armrests with PU pads. Synchro-tilt mechanism, 100 mm gas lift and twin-wheel castors on a nylon base.",
    armrests:     "Adjustable (1D)",
    warranty:     "1 year",
    specs:        { back: "Mesh", lumbar: "Adjustable" },
    imageFile:    "Rio MB.jpg",
    imageSlug:    "rio-mb",
  });

  console.log("\n=== Oscar MB ===");
  await createProduct({
    code:         "NC-OSCARMB",
    name:         "Oscar MB",
    slug:         "oscar-mb",
    categorySlug: "staff-chair",
    description:  "Mid-back mesh workstation chair in black with a breathable mesh back, attached lumbar support and fabric-cushioned seat, height-adjustable armrests and a synchro mechanism with multilock. Rated to 130 kg, on a black five-star nylon base.",
    armrests:     "Adjustable",
    warranty:     "1 year",
    specs:        { back: "Mesh", lumbar: "Adjustable" },
    imageFile:    "Oscar MB.jpg",
    imageSlug:    "oscar-mb",
  });

  console.log("\n=== Oscar HB ===");
  await createProduct({
    code:         "NC-OSCARHB",
    name:         "Oscar HB",
    slug:         "oscar-hb",
    categorySlug: "executive-chair",
    description:  "High-back executive chair with a breathable black mesh back on a PP frame, height-and-angle adjustable headrest, fabric seat and adjustable armrests. Multi-angle locking synchronous tilt on a chrome five-star base.",
    armrests:     "Adjustable",
    warranty:     "1 year",
    specs:        { back: "Mesh", lumbar: "Fixed" },
    dimensions:   { seat: `H 124 cm (49"); W 62 cm (24.5"); seat height 48–58 cm (19–23"); back 19" W × 29" H (incl. headrest); seat 20" × 20"` },
    imageFile:    "Oscar HB.jpg",
    imageSlug:    "oscar-hb",
  });

  console.log("\nDone.");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
