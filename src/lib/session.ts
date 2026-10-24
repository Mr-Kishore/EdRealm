import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "edrealm_session";

const secretKey =
  process.env.AUTH_SECRET ||
  "edrealm-super-secret-jwt-key-minimum-32-chars-long-for-hs256";
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: "super_admin" | "admin" | "coordinator";
  exp?: number;
}

/**
 * Encrypt session data into a signed JWT string.
 */
export async function encrypt(payload: Omit<SessionPayload, "exp">): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Decrypt and verify a signed JWT token string.
 */
export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
