import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const DRY_RUN = process.argv.includes("--dry-run");

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not defined");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// ---------------------------------------------------------------------------
// Approved merge payload — 18 products, additive-only, exact source wording
// Gas lift: use exact source text. Back: frozen where flagged. Descriptions:
// frozen for NC-BOSS, NC-ELEGANZA, NC-HONDA (conflict / partial match).
// NC-ELANZO: fully frozen (conflict), zero changes.
// isActive, price, isBestseller, images, slug, id: never touched.
// ---------------------------------------------------------------------------

type SpecPatch = {
  lumbar?: string;
  back?: string;
  mechanism?: string;
  gasLift?: string;
  base?: string;
  castor?: string;
  armrests?: string;
};

type ProductPatch = {
  code: string;
  armrests?: string;          // only set if field currently null
  description?: string;       // only set if field currently null/empty
  specs: SpecPatch;
};

const PATCHES: ProductPatch[] = [
  // ── HB Ergonomic ──────────────────────────────────────────────────────────
  {
    code: "NC-BUTTERFLY-HB",
    armrests: "2D Adjustable",
    description: "Ergonomic high-back mesh chair with butterfly mechanism and adjustable lumbar support.",
    specs: {
      back: "High Back Mesh",
      mechanism: "Butterfly",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "PU",
    },
  },
  {
    code: "NC-HWACK-HB",
    armrests: "4D Adjustable",
    description: "High-back ergonomic mesh chair with advanced synchronised mechanism for all-day comfort.",
    specs: {
      back: "High Back Mesh",
      mechanism: "Synchronised",
      gasLift: "Class 4",
      base: "Aluminium",
      castor: "PU",
    },
  },
  {
    code: "NC-COMFY-HB",
    armrests: "2D Adjustable",
    description: "Comfortable high-back mesh chair with tilt mechanism and breathable back support.",
    specs: {
      back: "High Back Mesh",
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "PU",
    },
  },
  {
    code: "NC-LUKANO-HB",
    armrests: "2D Adjustable",
    description: "Ergonomic high-back chair with lumbar support and durable nylon base.",
    specs: {
      back: "High Back Mesh",
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "Nylon",
    },
  },
  {
    code: "NC-CAMBRY-HB",
    armrests: "2D Adjustable",
    description: "Ergonomic high-back mesh chair with tilt mechanism.",
    specs: {
      back: "High Back Mesh",
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "Nylon",
    },
  },
  {
    code: "NC-FEDO-HB",
    armrests: "2D Adjustable",
    description: "High-back ergonomic mesh chair with butterfly mechanism and nylon base.",
    specs: {
      back: "High Back Mesh",
      mechanism: "Butterfly",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "Nylon",
    },
  },
  {
    code: "NC-POSH-HB",
    armrests: "2D Adjustable",
    description: "High-back ergonomic chair with synchronised mechanism and aluminium base.",
    specs: {
      back: "High Back Mesh",
      mechanism: "Synchronised",
      gasLift: "Class 4",
      base: "Aluminium",
      castor: "PU",
    },
  },
  {
    code: "NC-OPTIMA-HB",
    armrests: "2D Adjustable",
    description: "Ergonomic high-back mesh chair with tilt mechanism and nylon base.",
    specs: {
      back: "High Back Mesh",
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "Nylon",
    },
  },

  // ── Executive (partial — back frozen, only add mechanism/gasLift/base) ───
  {
    code: "NC-BOSS",
    // description frozen — conflict (Leather vs Artificial Leather)
    specs: {
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Aluminium",
    },
  },
  {
    code: "NC-ELEGANZA",
    // description frozen — conflict
    specs: {
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Aluminium",
    },
  },

  // ── MB Ergonomic ──────────────────────────────────────────────────────────
  {
    code: "NC-HWACK-MB",
    armrests: "2D Adjustable",
    description: "Mid-back mesh chair with synchronised mechanism and aluminium base.",
    specs: {
      back: "Mid Back Mesh",
      mechanism: "Synchronised",
      gasLift: "Class 4",
      base: "Aluminium",
      castor: "PU",
    },
  },
  {
    code: "NC-LUKANO-MB",
    armrests: "2D Adjustable",
    description: "Mid-back mesh chair with tilt mechanism and nylon base.",
    specs: {
      back: "Mid Back Mesh",
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "Nylon",
    },
  },
  {
    code: "NC-POSH-MB",
    armrests: "2D Adjustable",
    description: "Mid-back mesh chair with synchronised mechanism and aluminium base.",
    specs: {
      back: "Mid Back Mesh",
      mechanism: "Synchronised",
      gasLift: "Class 4",
      base: "Aluminium",
      castor: "PU",
    },
  },
  {
    code: "NC-COMFY-MB",
    armrests: "2D Adjustable",
    description: "Mid-back mesh chair with tilt mechanism and nylon base.",
    specs: {
      back: "Mid Back Mesh",
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "Nylon",
    },
  },

  // ── Executive (partial — back frozen) ────────────────────────────────────
  {
    code: "NC-HONDA",
    // back frozen — Excel says Leatherette, DB may differ
    specs: {
      mechanism: "Tilt",
      gasLift: "Gas lift",   // exact source wording (no classification in Excel)
      base: "Nylon",
    },
  },

  // ── Staff ─────────────────────────────────────────────────────────────────
  {
    code: "NC-KABIL",
    armrests: "Fixed",
    description: "Sturdy staff chair with fixed armrests and nylon base.",
    specs: {
      back: "Mid Back Fabric",
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "Nylon",
    },
  },

  // ── Executive (partial — back frozen) ────────────────────────────────────
  {
    code: "NC-OMEGA",
    // back frozen
    specs: {
      mechanism: "Tilt",
      gasLift: "Gas lift",   // exact source wording
      base: "Nylon",
    },
  },

  // ── Inactive (specs enriched, isActive stays false) ───────────────────────
  {
    code: "NC-GLANZA",
    armrests: "2D Adjustable",
    description: "Staff chair with tilt mechanism and nylon base.",
    specs: {
      back: "Mid Back Fabric",
      mechanism: "Tilt",
      gasLift: "Class 4",
      base: "Nylon",
      castor: "Nylon",
    },
  },
];

// NC-ELANZO deliberately excluded — fully frozen.

type SpecsJson = Record<string, string | undefined>;

async function applyPatch(patch: ProductPatch): Promise<{ code: string; fields: string[] }> {
  const existing = await prisma.product.findUnique({
    where: { code: patch.code },
    select: {
      id: true,
      code: true,
      armrests: true,
      description: true,
      specs: true,
      isActive: true,
      price: true,
    },
  });

  if (!existing) {
    console.warn(`  SKIP ${patch.code} — not found in DB`);
    return { code: patch.code, fields: [] };
  }

  const updatedFields: string[] = [];
  const data: Record<string, unknown> = {};

  // armrests: only if currently null/empty
  if (patch.armrests && !existing.armrests) {
    data.armrests = patch.armrests;
    updatedFields.push(`armrests → "${patch.armrests}"`);
  }

  // description: only if currently null/empty
  if (patch.description && !existing.description) {
    data.description = patch.description;
    updatedFields.push(`description → "${patch.description.slice(0, 60)}…"`);
  }

  // specs: merge additively — only add keys that are absent or null
  const existingSpecs: SpecsJson =
    existing.specs && typeof existing.specs === "object" && !Array.isArray(existing.specs)
      ? (existing.specs as SpecsJson)
      : {};

  const mergedSpecs: SpecsJson = { ...existingSpecs };
  let specsChanged = false;

  for (const [key, value] of Object.entries(patch.specs)) {
    if (value === undefined) continue;
    const current = existingSpecs[key];
    if (current === undefined || current === null || current === "") {
      mergedSpecs[key] = value;
      updatedFields.push(`specs.${key} → "${value}"`);
      specsChanged = true;
    }
  }

  if (specsChanged) {
    data.specs = mergedSpecs;
  }

  if (updatedFields.length === 0) {
    console.log(`  SKIP ${patch.code} — all fields already populated`);
    return { code: patch.code, fields: [] };
  }

  if (DRY_RUN) {
    console.log(`  DRY-RUN ${patch.code}: ${updatedFields.join(", ")}`);
    return { code: patch.code, fields: updatedFields };
  }

  await prisma.product.update({
    where: { code: patch.code },
    data,
  });

  console.log(`  UPDATED ${patch.code}: ${updatedFields.join(", ")}`);
  return { code: patch.code, fields: updatedFields };
}

async function main() {
  console.log(`\nExcel-to-Neon merge — ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  const results: { code: string; fields: string[] }[] = [];

  for (const patch of PATCHES) {
    const result = await applyPatch(patch);
    results.push(result);
  }

  const updated = results.filter((r) => r.fields.length > 0);
  const skipped = results.filter((r) => r.fields.length === 0);
  const totalFields = updated.reduce((sum, r) => sum + r.fields.length, 0);

  console.log(`\n── Summary ──────────────────────────────────────────`);
  console.log(`Products patched : ${updated.length} / ${PATCHES.length}`);
  console.log(`Products skipped : ${skipped.length} (already populated)`);
  console.log(`Fields written   : ${totalFields}`);
  if (DRY_RUN) console.log(`\n⚠  Dry run — no changes written to DB`);
  else console.log(`\n✓  All changes committed to Neon DB`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
