import crypto from "crypto";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

const SCRYPT_N = 1 << 15;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

// Password hashing. Legacy PBKDF2 hashes remain verifiable and are upgraded on login.
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 128 * SCRYPT_N * SCRYPT_R + 1024 * 1024,
  }).toString("hex");
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}

export function verifyPassword(password, storedPassword) {
  if (!storedPassword) return false;

  if (storedPassword.startsWith("scrypt$")) {
    const [, n, r, p, salt, originalHash] = storedPassword.split("$");
    const params = { N: Number(n), r: Number(r), p: Number(p), maxmem: 128 * Number(n) * Number(r) + 1024 * 1024 };
    if (!salt || !originalHash || !Number.isSafeInteger(params.N) || !Number.isSafeInteger(params.r) || !Number.isSafeInteger(params.p)) return false;
    const hash = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH, params).toString("hex");
    return timingSafeEqual(hash, originalHash);
  }

  // Existing accounts created before this upgrade use this legacy format.
  if (!storedPassword.includes(":")) return false;
  const [salt, originalHash] = storedPassword.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return timingSafeEqual(hash, originalHash);
}

export function needsPasswordRehash(storedPassword) {
  return !storedPassword?.startsWith("scrypt$");
}

// 2. Session lifecycle
export async function createSession(userId) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  // One active session per account limits the blast radius of a stolen cookie.
  await prisma.session.deleteMany({ where: { userId } });
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("session_id", session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (sessionId) {
    try {
      await prisma.session.delete({
        where: { id: sessionId },
      });
    } catch (e) {
      // Session might already be deleted
    }
    cookieStore.delete("session_id");
  }
}

// 3. Auth Check (Server side helper)
export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return null;

  // Check expiration
  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    return null;
  }

  return session.user;
}
