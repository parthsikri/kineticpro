import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hashPassword, createSession } from "../../../../lib/auth";
import { checkRateLimit } from "../../../../lib/rate-limit";

export async function POST(req) {
  try {
    const rateLimit = checkRateLimit(req, "register", 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ success: false, error: "Too many attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } });
    const { email: rawEmail, password } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!email || typeof password !== "string") {
      return NextResponse.json({ success: false, error: "Missing email or password" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ success: false, error: "Enter a valid email address" }, { status: 400 });
    }
    if (password.length < 12 || password.length > 128) {
      return NextResponse.json({ success: false, error: "Password must be 12 to 128 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "User already exists with this email" }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        credits: 1, // 1 free credit
      },
    });

    // Create session and set cookie
    await createSession(user.id);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("[REGISTER_API]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
