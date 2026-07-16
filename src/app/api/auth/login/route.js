import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyPassword, createSession, hashPassword, needsPasswordRehash } from "../../../../lib/auth";
import { checkRateLimit } from "../../../../lib/rate-limit";

export async function POST(req) {
  try {
    const rateLimit = checkRateLimit(req, "login", 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ success: false, error: "Too many attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } });
    const { email: rawEmail, password } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!email || typeof password !== "string") {
      return NextResponse.json({ success: false, error: "Missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 400 });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 400 });
    }

    if (needsPasswordRehash(user.password)) {
      await prisma.user.update({ where: { id: user.id }, data: { password: hashPassword(password) } });
    }

    // Create session and set cookie
    await createSession(user.id);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("[LOGIN_API]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
