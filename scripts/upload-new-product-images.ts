/**
 * One-time script: upload Posh HB and Fedo HB images to Cloudinary
 * and update their ProductImage records with the returned URL + publicId.
 *
 * Run: npx tsx scripts/upload-new-product-images.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import * as fs from "fs";
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

async function uploadAndUpdate(
  imagePath: string,
  productCode: string,
  publicIdSlug: string,
) {
  const product = await prisma.product.findFirst({
    where: { code: productCode },
    include: { images: true },
  });
  if (!product) throw new Error(`Product ${productCode} not found`);

  const existing = product.images[0];
  if (existing?.publicId && !existing.publicId.startsWith("/")) {
    console.log(`${productCode}: already has a Cloudinary publicId — skipping`);
    return;
  }

  console.log(`Uploading ${imagePath} …`);
  const result = await cloudinary.uploader.upload(imagePath, {
    folder:    "nexchair/products",
    public_id: publicIdSlug,
    overwrite: false,
  });

  console.log(`  → ${result.secure_url}`);
  console.log(`  → publicId: ${result.public_id}`);

  if (existing) {
    await prisma.productImage.update({
      where: { id: existing.id },
      data: {
        storageKey: result.secure_url,
        publicId:   result.public_id,
      },
    });
    console.log(`  Updated existing ProductImage record`);
  } else {
    await prisma.productImage.create({
      data: {
        productId:  product.id,
        storageKey: result.secure_url,
        publicId:   result.public_id,
        altText:    product.name,
        sortOrder:  0,
        isPrimary:  true,
      },
    });
    console.log(`  Created new ProductImage record`);
  }
}

async function main() {
  const root = path.resolve(__dirname, "..");

  await uploadAndUpdate(
    path.join(root, "public", "images", "categories", "Posh HB.jpg"),
    "NC-POSHHB",
    "posh-hb",
  );

  await uploadAndUpdate(
    path.join(root, "public", "images", "categories", "Fedo HB.jpg"),
    "NC-FEDOHB",
    "fedo-hb",
  );

  console.log("Done.");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
