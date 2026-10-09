import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { products } from "../data/products";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const productFeatures: Record<string, string[]> = {
  "nx-task-mesh": [
    "Adjustable lumbar",
    "Seat slider",
    "Synchro-tilt",
  ],

  "nx-pro-mesh": [
    "Adjustable lumbar",
    "Headrest",
    "Seat slider",
    "Synchro-tilt",
  ],

  "nx-home-compact": [
    "Adjustable lumbar",
    "Seat slider",
  ],

  "nx-executive": [
    "Adjustable lumbar",
    "Headrest",
    "Seat slider",
    "Synchro-tilt",
  ],

  "nx-board": [
    "Adjustable lumbar",
    "Synchro-tilt",
  ],

  "nx-studio": [
    "Adjustable lumbar",
    "Headrest",
    "Seat slider",
    "Synchro-tilt",
  ],

  "nx-nest": [],

  "nx-stack": [],

  "nx-draft-stool": [
    "Adjustable lumbar",
  ],
};

async function main() {
  console.log("Starting NexChair seed...");

  const categoryNames = [
    "Ergonomic task",
    "Executive",
    "Gaming",
    "Visitor & training",
    "Drafting tools",
  ];

  const categoryMap = new Map<string, string>();

  for (const name of categoryNames) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const category = await prisma.category.upsert({
      where: {
        slug,
      },
      update: {
        name,
        isActive: true,
      },
      create: {
        name,
        slug,
        isActive: true,
      },
    });

    categoryMap.set(name, category.id);
  }

  for (const product of products) {
    const categoryId = categoryMap.get(product.category);

    if (!categoryId) {
      throw new Error(
        `Category not found for product: ${product.name}`,
      );
    }

    const features = productFeatures[product.slug] ?? [];

    await prisma.product.upsert({
      where: {
        slug: product.slug,
      },

      update: {
        name: product.name,
        code: product.code,
        description: product.description,
        price: product.price,
        categoryId,
        colour: product.colour,
        seatWeight: product.seatWeight,
        maxUserWeight: product.maxUserWeight,
        armrests: product.armrests,
        warranty: product.warranty,
        specs: product.specs,
        features,
        isBestseller: ["nx-task-mesh", "nx-pro-mesh", "nx-executive"].includes(product.slug),
        isActive: true,
      },

      create: {
        name: product.name,
        slug: product.slug,
        code: product.code,
        description: product.description,
        price: product.price,
        categoryId,
        colour: product.colour,
        seatWeight: product.seatWeight,
        maxUserWeight: product.maxUserWeight,
        armrests: product.armrests,
        warranty: product.warranty,
        specs: product.specs,
        features,
        isBestseller: ["nx-task-mesh", "nx-pro-mesh", "nx-executive"].includes(product.slug),
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${products.length} products.`);
  console.log(`Seeded ${categoryNames.length} categories.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });