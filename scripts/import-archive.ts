import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });

import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const DRY_RUN = process.argv.includes("--dry-run");
const ARCHIVE_ROOT = path.join(process.cwd(), "_archive_inspect", "nexchair_archive");
const PLACEHOLDER_CODES = [
  "NX-T1", "NX-P2", "NX-H1", "NX-E1", "NX-B1",
  "NX-S1", "NX-N1", "NX-V2", "NX-D1",
];

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

interface ArchiveProduct {
  name: string;
  folder: string;
  code: string;
  category: "Executive Chair" | "Ergonomic Chair" | "Staff Chair";
  back: string | null;
  armrests: string | null;
  warranty: string | null;
  description: string;
  hasImage: boolean;
  isActive: boolean;
}

const PRODUCTS: ArchiveProduct[] = [
  {
    name: "Amaze HB",
    folder: "Amaze HB",
    code: "NC-AMAZE-HB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: "5 years",
    description:
      "High-back ergonomic chair with breathable mesh back, adjustable headrest and mesh seat. Height-adjustable seat and armrests with tilt mechanism.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Berlin HB",
    folder: "Berlin HB",
    code: "NC-BERLIN-HB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: null,
    description:
      "High-back ergonomic mesh chair with adjustable headrest and armrests, designed for sustained office use.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Boat",
    folder: "Boat",
    code: "NC-BOAT",
    category: "Executive Chair",
    back: "Leatherette",
    armrests: "Alloy fixed",
    warranty: "3 years",
    description:
      "Premium executive high-back chair upholstered in leatherette with alloy-fixed armrests and a five-star base.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Boss Chair",
    folder: "Boss chair",
    code: "NC-BOSS",
    category: "Executive Chair",
    back: "Leather",
    armrests: "Fixed chrome",
    warranty: "1 year",
    description:
      "High-back executive chair in genuine leather with chrome-finished fixed armrests and a polished five-star base.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Butterfly HB",
    folder: "Butterfly HB",
    code: "NC-BUTTERFLY-HB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: null,
    description:
      "High-back ergonomic mesh chair with adjustable headrest and armrests for long working sessions.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Butterfly MB",
    folder: "Butterfly MB",
    code: "NC-BUTTERFLY-MB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: null,
    description:
      "Mid-back ergonomic mesh chair with adjustable armrests, ideal for task-focused seating.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Butterfly New",
    folder: "Butterfly New",
    code: "NC-BUTTERFLY-NEW",
    category: "Executive Chair",
    back: "Leatherette",
    armrests: "Fixed curved",
    warranty: "1 year",
    description:
      "High-back executive leatherette chair with fixed curved armrests and a refined silhouette for boardrooms.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Cambry HB",
    folder: "Cambry HB",
    code: "NC-CAMBRY-HB",
    category: "Ergonomic Chair",
    back: null,
    armrests: null,
    warranty: null,
    description: "High-back ergonomic chair. Full specifications coming soon.",
    hasImage: false,
    isActive: false,
  },
  {
    name: "Comfy HB",
    folder: "Comfy HB",
    code: "NC-COMFY-HB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: null,
    description:
      "High-back ergonomic mesh chair with adjustable headrest and armrests for all-day comfort.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Comfy MB",
    folder: "Comfy MB",
    code: "NC-COMFY-MB",
    category: "Ergonomic Chair",
    back: null,
    armrests: null,
    warranty: null,
    description: "Mid-back ergonomic chair. Full specifications coming soon.",
    hasImage: false,
    isActive: false,
  },
  {
    name: "Elanzo",
    folder: "Elanzo",
    code: "NC-ELANZO",
    category: "Staff Chair",
    back: "Mesh",
    armrests: "Fixed white",
    warranty: "3 years",
    description:
      "Ergonomic staff chair with mesh back, fixed white armrests and a three-year warranty.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Eleganza",
    folder: "Eleganza chair",
    code: "NC-ELEGANZA",
    category: "Executive Chair",
    back: "Leather",
    armrests: "Fixed chrome",
    warranty: "1 year",
    description:
      "High-back executive chair in genuine leather with chrome-finished fixed armrests and a premium finish.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Ergomax",
    folder: "Ergomax",
    code: "NC-ERGOMAX",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "5D adjustable",
    warranty: "2 years",
    description:
      "Fully ergonomic high-back mesh chair with 5D adjustable armrests, lumbar support and advanced tilt control.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Fedo HB",
    folder: "Fedo HB",
    code: "NC-FEDO-HB",
    category: "Ergonomic Chair",
    back: null,
    armrests: null,
    warranty: null,
    description: "High-back ergonomic chair. Full specifications coming soon.",
    hasImage: false,
    isActive: false,
  },
  {
    name: "Fedo MB",
    folder: "Fedo MB",
    code: "NC-FEDO-MB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "4D adjustable",
    warranty: "2 years",
    description:
      "Mid-back ergonomic mesh chair with 4D adjustable armrests and lumbar support.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Glanza",
    folder: "Glanza",
    code: "NC-GLANZA",
    category: "Staff Chair",
    back: null,
    armrests: null,
    warranty: null,
    description: "Staff chair. Full specifications coming soon.",
    hasImage: false,
    isActive: false,
  },
  {
    name: "Green Soaul",
    folder: "Green soaul",
    code: "NC-GREEN-SOAUL",
    category: "Staff Chair",
    back: null,
    armrests: null,
    warranty: null,
    description: "Staff chair. Full specifications coming soon.",
    hasImage: false,
    isActive: false,
  },
  {
    name: "Honda",
    folder: "Honda",
    code: "NC-HONDA",
    category: "Staff Chair",
    back: "Mesh",
    armrests: "Fixed curved",
    warranty: null,
    description:
      "Compact staff chair with mesh back and fixed curved armrests, designed for general office use.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Hwack HB",
    folder: "Hwack HB",
    code: "NC-HWACK-HB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: "3 years",
    description:
      "High-back ergonomic mesh chair with adjustable headrest and armrests, built for executive-level comfort.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Hwack MB",
    folder: "Hwack MB",
    code: "NC-HWACK-MB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: null,
    description:
      "Mid-back ergonomic mesh chair with adjustable armrests and a lightweight frame.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Kabil",
    folder: "Kabil",
    code: "NC-KABIL",
    category: "Staff Chair",
    back: "Mesh",
    armrests: "Fixed PP",
    warranty: null,
    description:
      "Practical staff chair with mesh back, fixed PP armrests and a durable five-star base.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Lukano HB",
    folder: "Lukano HB",
    code: "NC-LUKANO-HB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: null,
    description:
      "High-back ergonomic mesh chair with adjustable headrest and armrests for long working hours.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Lukano MB",
    folder: "Lukano MB",
    code: "NC-LUKANO-MB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: null,
    description:
      "Mid-back ergonomic mesh chair with adjustable armrests, suited for everyday office use.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Matrixo",
    folder: "Matrixo",
    code: "NC-MATRIXO",
    category: "Executive Chair",
    back: "Leather",
    armrests: "Fixed loop",
    warranty: "1 year",
    description:
      "Premium executive high-back chair in genuine leather with fixed loop armrests and a substantial chrome base.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Matteo",
    folder: "Matteo",
    code: "NC-MATTEO",
    category: "Executive Chair",
    back: "Leather",
    armrests: "Fixed designer",
    warranty: "3 years",
    description:
      "High-back executive leather chair with designer fixed armrests and a three-year manufacturer warranty.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Monarch",
    folder: "Monarch",
    code: "NC-MONARCH",
    category: "Executive Chair",
    back: "Leatherette",
    armrests: "Fixed integrated",
    warranty: "3 years",
    description:
      "High-back executive leatherette chair with fixed integrated armrests and a refined aesthetic.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Moon PU",
    folder: "Moon PU",
    code: "NC-MOON-PU",
    category: "Executive Chair",
    back: null,
    armrests: null,
    warranty: null,
    description: "Executive PU chair. Full specifications coming soon.",
    hasImage: false,
    isActive: false,
  },
  {
    name: "Omega",
    folder: "Omega",
    code: "NC-OMEGA",
    category: "Staff Chair",
    back: "Mesh",
    armrests: "Fixed curved",
    warranty: null,
    description:
      "Ergonomic staff mesh chair with fixed curved armrests and a comfortable high-back design.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Optima HB",
    folder: "Optima HB",
    code: "NC-OPTIMA-HB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Adjustable PU",
    warranty: null,
    description:
      "High-back ergonomic mesh chair with adjustable PU-padded armrests and lumbar support.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Polo HB",
    folder: "Polo HB",
    code: "NC-POLO-HB",
    category: "Ergonomic Chair",
    back: null,
    armrests: null,
    warranty: null,
    description: "High-back ergonomic chair. Full specifications coming soon.",
    hasImage: false,
    isActive: false,
  },
  {
    name: "Polo MB",
    folder: "Polo MB",
    code: "NC-POLO-MB",
    category: "Ergonomic Chair",
    back: null,
    armrests: null,
    warranty: null,
    description: "Mid-back ergonomic chair. Full specifications coming soon.",
    hasImage: false,
    isActive: false,
  },
  {
    name: "Posh HB",
    folder: "Posh HB",
    code: "NC-POSH-HB",
    category: "Ergonomic Chair",
    back: null,
    armrests: null,
    warranty: null,
    description: "High-back ergonomic chair. Full specifications coming soon.",
    hasImage: false,
    isActive: false,
  },
  {
    name: "Posh MB",
    folder: "Posh MB",
    code: "NC-POSH-MB",
    category: "Staff Chair",
    back: "Mesh",
    armrests: "Adjustable",
    warranty: "1 year",
    description:
      "Mid-back staff mesh chair with adjustable armrests and a one-year warranty.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Presidio",
    folder: "Presidio",
    code: "NC-PRESIDIO",
    category: "Executive Chair",
    back: "Leatherette",
    armrests: "Alloy fixed",
    warranty: "3 years",
    description:
      "Premium executive high-back chair upholstered in leatherette with alloy-fixed armrests and a five-star base.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Queen",
    folder: "Queen",
    code: "NC-QUEEN",
    category: "Staff Chair",
    back: "Mesh",
    armrests: "Fixed white",
    warranty: null,
    description:
      "Compact staff mesh chair with fixed white armrests, ideal for reception and support areas.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Scorpio HB",
    folder: "Scorpio HB",
    code: "NC-SCORPIO-HB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "1-way height adjustable",
    warranty: "Mechanical warranty",
    description:
      "High-back ergonomic mesh chair with 1-way height-adjustable armrests and mechanical warranty coverage.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Scorpio MB",
    folder: "Scorpio MB",
    code: "NC-SCORPIO-MB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "1-way height adjustable",
    warranty: "Mechanical warranty",
    description:
      "Mid-back ergonomic mesh chair with 1-way height-adjustable armrests and mechanical warranty coverage.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Spine HB",
    folder: "Spine HB",
    code: "NC-SPINE-HB",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "4D PU gel",
    warranty: null,
    description:
      "High-back ergonomic mesh chair with 4D PU-gel-padded armrests designed for spinal support.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Titan",
    folder: "Titan",
    code: "NC-TITAN",
    category: "Executive Chair",
    back: "Leather",
    armrests: "Fixed curved",
    warranty: null,
    description:
      "Commanding executive high-back chair in genuine leather with fixed curved armrests and a polished base.",
    hasImage: true,
    isActive: true,
  },
  {
    name: "Twister",
    folder: "Twister",
    code: "NC-TWISTER",
    category: "Ergonomic Chair",
    back: "Mesh",
    armrests: "Fixed",
    warranty: "1 year",
    description:
      "High-back ergonomic mesh chair with fixed armrests and a one-year warranty.",
    hasImage: true,
    isActive: true,
  },
];

const CATEGORY_DEFS = [
  { name: "Executive Chair" as const, slug: "executive-chair", sortOrder: 1 },
  { name: "Ergonomic Chair" as const, slug: "ergonomic-chair", sortOrder: 2 },
  { name: "Staff Chair" as const, slug: "staff-chair", sortOrder: 6 },
];

async function main() {
  if (DRY_RUN) {
    console.log("=== DRY RUN — no writes will be made ===\n");
  }

  // Step 1: Ensure required categories exist
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORY_DEFS) {
    if (DRY_RUN) {
      const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
      if (existing) categoryMap.set(cat.name, existing.id);
    } else {
      const c = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, isActive: true },
        create: { name: cat.name, slug: cat.slug, isActive: true, sortOrder: cat.sortOrder },
      });
      categoryMap.set(cat.name, c.id);
    }
  }
  console.log(`Categories: ${categoryMap.size}/3 ready${DRY_RUN ? " (read-only check)" : ""}\n`);

  // Step 2: Process each product
  let createCount = 0;
  let updateCount = 0;
  let imagesUploaded = 0;
  let imagesAlreadyPresent = 0;

  for (const product of PRODUCTS) {
    const slug = product.code.toLowerCase();
    const publicId = `nexchair/products/${product.code.toLowerCase()}`;

    // Always read DB state even in dry-run (for accurate reporting)
    const existing = await prisma.product.findUnique({
      where: { code: product.code },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });

    const dbAction = existing ? "UPDATE" : "CREATE";
    const hasDbImage = (existing?.images?.length ?? 0) > 0;

    let imageStatus: string;
    let storageKey: string | null = null;
    let uploadedPublicId: string | null = null;

    if (!product.hasImage) {
      imageStatus = "NO_IMAGE";
    } else if (hasDbImage) {
      imageStatus = "SKIP_IN_DB";
      imagesAlreadyPresent++;
    } else if (DRY_RUN) {
      imageStatus = "WOULD_UPLOAD";
    } else {
      // Check Cloudinary before uploading
      let alreadyOnCloudinary = false;
      try {
        const res = await (cloudinary.api.resource(publicId) as unknown as Promise<{
          secure_url: string;
          public_id: string;
        }>);
        alreadyOnCloudinary = true;
        storageKey = res.secure_url;
        uploadedPublicId = res.public_id;
      } catch {
        // resource not found — proceed with upload
      }

      if (alreadyOnCloudinary) {
        imageStatus = "SKIP_ON_CLOUDINARY";
        imagesAlreadyPresent++;
      } else {
        const imagePath = path.join(ARCHIVE_ROOT, product.folder, `${product.folder}.jpg`);
        const result = await cloudinary.uploader.upload(imagePath, {
          public_id: publicId,
          overwrite: false,
        });
        imageStatus = "UPLOADED";
        storageKey = result.secure_url;
        uploadedPublicId = result.public_id;
        imagesUploaded++;
      }
    }

    const categoryId = categoryMap.get(product.category);
    if (!categoryId) {
      console.error(`  ✗ SKIP | ${product.code} — category "${product.category}" not in DB`);
      continue;
    }

    const specs: Record<string, string> = {};
    if (product.back) specs.back = product.back;
    if (product.armrests) specs.armrests = product.armrests;

    const activeLabel = product.isActive ? "active" : "inactive";
    const line = `  ${dbAction.padEnd(6)} | ${product.code.padEnd(22)} | ${product.name.padEnd(24)} | img: ${imageStatus.padEnd(22)} | ${activeLabel}`;

    if (DRY_RUN) {
      console.log(line);
      continue;
    }

    await prisma.product.upsert({
      where: { code: product.code },
      update: {
        name: product.name,
        slug,
        description: product.description,
        categoryId,
        armrests: product.armrests,
        warranty: product.warranty,
        specs,
        isActive: product.isActive,
        // price, isBestseller, features intentionally omitted — preserve admin edits
      },
      create: {
        name: product.name,
        slug,
        code: product.code,
        description: product.description,
        price: "Price on request",
        categoryId,
        armrests: product.armrests,
        warranty: product.warranty,
        specs,
        isActive: product.isActive,
        isBestseller: false,
        features: [],
      },
    });

    if (storageKey && uploadedPublicId) {
      const p = await prisma.product.findUnique({
        where: { code: product.code },
        select: { id: true },
      });
      if (p) {
        await prisma.productImage.create({
          data: {
            productId: p.id,
            storageKey,
            publicId: uploadedPublicId,
            altText: product.name,
            isPrimary: true,
            sortOrder: 0,
          },
        });
      }
    }

    if (dbAction === "CREATE") createCount++;
    else updateCount++;
    console.log(line);
  }

  // Step 3: Deactivate placeholder seed products
  if (DRY_RUN) {
    const placeholders = await prisma.product.findMany({
      where: { code: { in: PLACEHOLDER_CODES } },
      select: { code: true, name: true, isActive: true },
    });
    console.log(`\nPlaceholders to deactivate (${placeholders.length} found of ${PLACEHOLDER_CODES.length}):`);
    for (const p of placeholders) {
      const status = p.isActive ? "currently active → will deactivate" : "already inactive";
      console.log(`  DEACTIVATE | ${p.code.padEnd(10)} | ${p.name} — ${status}`);
    }
    const missing = PLACEHOLDER_CODES.filter(
      (c) => !placeholders.find((p) => p.code === c),
    );
    if (missing.length > 0) {
      console.log(`  Not found in DB: ${missing.join(", ")}`);
    }
    console.log("\n=== DRY RUN complete — no changes were made ===");
  } else {
    const deactivated = await prisma.product.updateMany({
      where: { code: { in: PLACEHOLDER_CODES } },
      data: { isActive: false },
    });
    console.log(`\n✓ Deactivated ${deactivated.count} placeholder seed products`);
    console.log(`✓ Products created: ${createCount}  updated: ${updateCount}`);
    console.log(`✓ Images uploaded: ${imagesUploaded}  already present: ${imagesAlreadyPresent}`);
    console.log("\nImport complete. Run \"npm run build\" to verify.");
  }
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
