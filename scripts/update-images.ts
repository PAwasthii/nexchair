import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });

import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const DRY_RUN = process.argv.includes("--dry-run");
const IMAGE_DIR = path.join(process.cwd(), "public", "Nex Chair_Product Range images");

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not defined in .env.local");
if (!process.env.CLOUDINARY_CLOUD_NAME) throw new Error("CLOUDINARY_CLOUD_NAME is not defined");
if (!process.env.CLOUDINARY_API_KEY) throw new Error("CLOUDINARY_API_KEY is not defined");
if (!process.env.CLOUDINARY_API_SECRET) throw new Error("CLOUDINARY_API_SECRET is not defined");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// Explicit mapping: filename → product code.
// "Fredo MB.png" maps to NC-FEDO-MB (typo in filename, DB uses "Fedo").
const IMAGE_MAP: Array<{ file: string; code: string }> = [
  { file: "Berlin HB.png",      code: "NC-BERLIN-HB" },
  { file: "Boat.png",           code: "NC-BOAT" },
  { file: "Boss chair.png",     code: "NC-BOSS" },
  { file: "Butterfly HB.png",   code: "NC-BUTTERFLY-HB" },
  { file: "Butterfly MB.png",   code: "NC-BUTTERFLY-MB" },
  { file: "Butterfly New.png",  code: "NC-BUTTERFLY-NEW" },
  { file: "Comfy HB.png",       code: "NC-COMFY-HB" },
  { file: "Elanzo.png",         code: "NC-ELANZO" },
  { file: "Eleganza chair.png", code: "NC-ELEGANZA" },
  { file: "Ergomax.png",        code: "NC-ERGOMAX" },
  { file: "Fredo MB.png",       code: "NC-FEDO-MB" },
  { file: "Honda.png",          code: "NC-HONDA" },
  { file: "Hwack HB.png",       code: "NC-HWACK-HB" },
  { file: "Hwack MB.png",       code: "NC-HWACK-MB" },
  { file: "Kabil.png",          code: "NC-KABIL" },
  { file: "Lukano HB.png",      code: "NC-LUKANO-HB" },
  { file: "Lukano MB.png",      code: "NC-LUKANO-MB" },
  { file: "Matrixo.png",        code: "NC-MATRIXO" },
  { file: "Matteo.png",         code: "NC-MATTEO" },
  { file: "Monarch.png",        code: "NC-MONARCH" },
  { file: "Omega.png",          code: "NC-OMEGA" },
  { file: "Optima HB.png",      code: "NC-OPTIMA-HB" },
  { file: "Posh MB.png",        code: "NC-POSH-MB" },
  { file: "Presidio.png",       code: "NC-PRESIDIO" },
  { file: "Queen.png",          code: "NC-QUEEN" },
  { file: "Scorpio HB.png",     code: "NC-SCORPIO-HB" },
  { file: "Scorpio MB.png",     code: "NC-SCORPIO-MB" },
  { file: "Spine HB.png",       code: "NC-SPINE-HB" },
  { file: "Titan.png",          code: "NC-TITAN" },
  { file: "Twister.png",        code: "NC-TWISTER" },
];

async function main() {
  if (DRY_RUN) {
    console.log("=== DRY RUN — no uploads or DB writes will be made ===\n");
  }

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of IMAGE_MAP) {
    const imagePath = path.join(IMAGE_DIR, entry.file);
    const publicId = `nexchair/products/${entry.code.toLowerCase()}`;

    // Find the product and its existing images
    const product = await prisma.product.findUnique({
      where: { code: entry.code },
      select: {
        id: true,
        name: true,
        slug: true,
        images: { select: { id: true, storageKey: true, publicId: true } },
      },
    });

    if (!product) {
      console.log(`  SKIP   | ${entry.code.padEnd(22)} | product not found in DB`);
      skipped++;
      continue;
    }

    const label = `${entry.code.padEnd(22)} | ${product.name.padEnd(24)}`;

    if (DRY_RUN) {
      const existingCount = product.images.length;
      console.log(
        `  UPLOAD | ${label} | would replace ${existingCount} image(s) with ${entry.file}`,
      );
      continue;
    }

    // Upload the new image to Cloudinary (overwrite existing asset at same public_id)
    let newUrl: string;
    let newPublicId: string;
    try {
      const result = await cloudinary.uploader.upload(imagePath, {
        public_id: publicId,
        overwrite: true,
        invalidate: true,
      });
      newUrl = result.secure_url;
      newPublicId = result.public_id;
    } catch (err) {
      console.error(
        `  FAIL   | ${label} | Cloudinary upload failed:`,
        err instanceof Error ? err.message : err,
      );
      failed++;
      continue;
    }

    // Replace all existing ProductImage records with the single new one
    try {
      await prisma.$transaction(async (tx) => {
        await tx.productImage.deleteMany({ where: { productId: product.id } });
        await tx.productImage.create({
          data: {
            productId: product.id,
            storageKey: newUrl,
            publicId: newPublicId,
            altText: product.name,
            isPrimary: true,
            sortOrder: 0,
          },
        });
      });
    } catch (err) {
      console.error(
        `  FAIL   | ${label} | DB update failed:`,
        err instanceof Error ? err.message : err,
      );
      failed++;
      continue;
    }

    console.log(`  OK     | ${label} | ${entry.file}`);
    uploaded++;
  }

  if (DRY_RUN) {
    console.log("\n=== DRY RUN complete — no changes were made ===");
  } else {
    console.log(`\n✓ Updated: ${uploaded}  Skipped: ${skipped}  Failed: ${failed}`);
    if (failed > 0) {
      console.log("⚠  Some images failed — check the errors above.");
      process.exit(1);
    }
    console.log('\nDone. Deploy the site to reflect the new images.');
  }
}

main()
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
