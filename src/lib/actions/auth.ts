"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
  signSession,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  clientIpHash,
  isRateLimited,
  rateLimit,
  resetRateLimit,
} from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password, next } = parsed.data;

  // Check before doing any work; only *failed* attempts consume the budget, so
  // a legitimate admin signing in repeatedly is never locked out.
  const key = `login:${clientIpHash()}`;
  const limit = await isRateLimited(key, 5, 300);
  if (!limit.ok) {
    return {
      error: `Too many attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
    };
  }

  const admin = await prisma.admin.findUnique({ where: { email } });

  // Compare against a dummy hash when the user doesn't exist so the response
  // time doesn't reveal which emails are registered.
  const hash =
    admin?.passwordHash ??
    "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const valid = await bcrypt.compare(password, hash);

  if (!admin || !valid) {
    await rateLimit(key, 5, 300);
    return { error: "Incorrect email or password." };
  }

  await resetRateLimit(key);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  await setSessionCookie(
    await signSession({ sub: admin.id, email: admin.email, name: admin.name })
  );

  redirect(next && next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const session = await getSession();
  if (session) {
    await prisma.auditLog.create({
      data: {
        adminId: session.sub,
        action: "logout",
        entity: "Session",
        summary: session.email,
      },
    });
  }
  await clearSessionCookie();
  redirect("/admin/login");
}
