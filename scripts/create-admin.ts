import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });

import bcrypt from "bcryptjs";

async function main() {
  // Dynamic import ensures lib/prisma.ts runs after dotenv has populated env vars.
  const { prisma } = await import("@/lib/prisma");

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be defined.");
  }

  if (password.length < 8) {
    throw new Error("Admin password must be at least 8 characters long.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      name: "NexChair Admin",
      email,
      password: hashedPassword,
    },
  });

  console.log(`Admin user created/updated: ${email}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
