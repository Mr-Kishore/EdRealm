"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { LoginSchema, type LoginInput } from "@/lib/validations/auth";
import { createSession, deleteSession, getSession, type SessionPayload } from "@/lib/auth";

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: SessionPayload;
}

/**
 * Authenticate admin user with email and password.
 */
export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  try {
    const validated = LoginSchema.parse(input);

    const user = await db.query.users.findFirst({
      where: eq(users.email, validated.email.toLowerCase().trim()),
    });

    if (!user || !user.isActive) {
      return {
        success: false,
        error: "Invalid email or password. Please try again.",
      };
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      return {
        success: false,
        error: "Invalid email or password. Please try again.",
      };
    }

    await createSession({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    return {
      success: true,
      user: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Sign out current admin user.
 */
export async function logoutUser(): Promise<{ success: boolean }> {
  await deleteSession();
  return { success: true };
}

/**
 * Get current session user.
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  return await getSession();
}
