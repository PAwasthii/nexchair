import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "nexchair_admin_session";

const secret = process.env.ADMIN_SESSION_SECRET;

if (!secret) {
  throw new Error("ADMIN_SESSION_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(secret);

type AdminSession = {
  adminId: string;
  email: string;
};

export async function createAdminSession(
  adminId: string,
  email: string,
) {
  const token = await new SignJWT({
    adminId,
    email,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      typeof payload.adminId !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      adminId: payload.adminId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}

// Secure server-side guard for Server Components and Server Actions.
// Call this at the top of any admin page or sensitive action instead of
// relying solely on the proxy, which only performs an optimistic check.
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}