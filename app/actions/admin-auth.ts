"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  clearAdminSession,
  createAdminSession,
} from "@/lib/auth/admin";
import { checkLoginRateLimit } from "@/lib/ratelimit";

export async function signInAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  // Rate-limit check runs before any validation or DB query so that throttled
  // callers cannot distinguish error types from successful probing.
  const rl = await checkLoginRateLimit(email);
  if (!rl.allowed) {
    const retry = rl.retryAfterSeconds ?? 60;
    return {
      success: false,
      message: `Too many login attempts. Please try again in ${retry} seconds.`,
    };
  }

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required.",
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: {
      email,
    },
  });

  if (!admin) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const passwordMatches = await bcrypt.compare(
    password,
    admin.password,
  );

  if (!passwordMatches) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  await createAdminSession(admin.id, admin.email);

  redirect("/admin");
}

export async function signOutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}