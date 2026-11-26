/**
 * One-time script: insert (or update) Comfy HB.
 * Uploads the image to Cloudinary, creates/updates Product + ProductImage records.
 *
 * Run: npx tsx scripts/add-comfy-hb-product.ts
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

async function main() {
  console.log("\n=== Comfy HB ===");

  // ── Resolve category ───────────────────────────────────────────────────────
  const cat = await prisma.category.findFirst({
    where: { slug: "executive-chair" },
    select: { id: true },
  });
  if (!cat) throw new Error("Category 'executive-chair' not found.");

  // ── Upload image to Cloudinary (overwrite to replace any previous version) ─
  const imgPath = path.join(ROOT, "public", "images", "comfy Hb.png");
  console.log(`  Uploading ${imgPath} …`);
  const result = await cloudinary.uploader.upload(imgPath, {
    folder:    "nexchair/products",
    public_id: "comfy-hb",
    overwrite: true,
  });
  const { secure_url: url, public_id: publicId } = result;
  console.log(`  → ${url}`);
  console.log(`  → publicId: ${publicId}`);

  // ── Upsert product record ──────────────────────────────────────────────────
  const existing = await prisma.product.findFirst({
    where: { code: "NC-COMFYHB" },
    include: { images: true },
  });

  if (existing) {
    // Update product data
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        name:        "Comfy HB",
        slug:        "comfy-hb",
        categoryId:  cat.id,
        price:       "Price on request",
        description: "High-back ergonomic chair with a breathable mesh back and adjustable headrest, adjustable lumbar support and a fabric-cushioned seat. Adjustable armrests and a synchro-tilt mechanism with multi-lock on a five-star nylon base with castors. Available in black and grey.",
        armrests:    "Adjustable",
        warranty:    "1 year",
        specs:       { back: "Mesh", lumbar: "Adjustable" },
        isBestseller: false,
        isActive:    true,
      },
    });

    // Replace or create image record
    const primaryImg = existing.images.find((i) => i.isPrimary) ?? existing.images[0];
    if (primaryImg) {
      await prisma.productImage.update({
        where: { id: primaryImg.id },
        data: {
          storageKey: url,
          publicId,
          altText:    "Comfy HB ergonomic executive chair",
          sortOrder:  0,
          isPrimary:  true,
        },
      });
      console.log("  Updated existing ProductImage record.");
    } else {
      await prisma.productImage.create({
        data: {
          productId:  existing.id,
          storageKey: url,
          publicId,
          altText:    "Comfy HB ergonomic executive chair",
          sortOrder:  0,
          isPrimary:  true,
        },
      });
      console.log("  Created new ProductImage record.");
    }

    console.log("  Updated: NC-COMFYHB (Comfy HB)");
  } else {
    // Create product
    const product = await prisma.product.create({
      data: {
        name:        "Comfy HB",
        slug:        "comfy-hb",
        code:        "NC-COMFYHB",
        categoryId:  cat.id,
        price:       "Price on request",
        description: "High-back ergonomic chair with a breathable mesh back and adjustable headrest, adjustable lumbar support and a fabric-cushioned seat. Adjustable armrests and a synchro-tilt mechanism with multi-lock on a five-star nylon base with castors. Available in black and grey.",
        armrests:    "Adjustable",
        warranty:    "1 year",
        specs:       { back: "Mesh", lumbar: "Adjustable" },
        isBestseller: false,
        isActive:    true,
      },
    });

    await prisma.productImage.create({
      data: {
        productId:  product.id,
        storageKey: url,
        publicId,
        altText:    "Comfy HB ergonomic executive chair",
        sortOrder:  0,
        isPrimary:  true,
      },
    });

    console.log("  Created: NC-COMFYHB (Comfy HB)");
  }

  console.log("\nDone.");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
