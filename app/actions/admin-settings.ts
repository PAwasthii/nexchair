"use server";

import bcrypt from "bcryptjs";

import { getAdminSession } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export type PasswordActionState = {
  success: boolean;
  error?: string;
};

export async function changeAdminPassword(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Not authenticated." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword     = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All three fields are required." };
  }
  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: session.email } });
  if (!admin) return { success: false, error: "Admin account not found." };

  const matches = await bcrypt.compare(currentPassword, admin.password);
  if (!matches) return { success: false, error: "Current password is incorrect." };

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.adminUser.update({ where: { id: admin.id }, data: { password: hashed } });

  return { success: true };
}
