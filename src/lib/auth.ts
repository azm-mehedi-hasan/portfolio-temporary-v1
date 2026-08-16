import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// `jose` is used rather than `jsonwebtoken` because middleware runs on the Edge
// runtime, which has no Node crypto. jose uses Web Crypto and works in both.

export const SESSION_COOKIE = "portfolio_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = { sub: string; email: string; name: string };

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "AUTH_SECRET is missing or too short (needs >= 32 chars). Generate one with: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(value);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

/** Verify a raw token. Safe to call from Edge middleware. */
export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null; // expired, tampered, or signed with a rotated secret
  }
}

/** Read the session from cookies. Server Components and Server Actions. */
export async function getSession(): Promise<SessionPayload | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

/**
 * Authorization check for every mutating action.
 *
 * This is NOT redundant with middleware: middleware is routing, and a Server
 * Action can be invoked directly without passing through the matcher.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}
