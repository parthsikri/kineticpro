import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key !== "boombastic10") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const email = "testuser@kineticpro.com";
    const password = "KineticTestUser2026!";
    const hashedPassword = hashPassword(password);

    // Delete existing if any
    await prisma.user.delete({
      where: { email }
    }).catch(() => {});

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        subscriptionStatus: "inactive",
        subscriptionTier: "free",
        credits: 1,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Test account created successfully!",
      email,
      password
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
