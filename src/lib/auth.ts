import { cookies } from "next/headers";
import {
  encrypt,
  decrypt,
  SESSION_COOKIE_NAME,
  type SessionPayload,
} from "./session";

export { SESSION_COOKIE_NAME, type SessionPayload, encrypt, decrypt };

/**
 * Create session cookie (7 days duration).
 */
export async function createSession(user: {
  id: string;
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "coordinator";
}): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Delete session cookie.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current session payload from cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await decrypt(token);
}

/**
 * Require valid session or throw error.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized. Please sign in to perform this action.");
  }
  return session;
}
