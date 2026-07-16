import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSessionUser } from "../../../../lib/auth";

// Check if user is admin (database flag or owner email)
function isAdminUser(user) {
  return user && (user.isAdmin || user.email === "apnaipuwallah@gmail.com");
}

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Auto-promote the owner to admin in the database if not already marked
    if (user.email === "apnaipuwallah@gmail.com" && !user.isAdmin) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true }
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        credits: true,
        proCreditsUsed: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getSessionUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, subscriptionStatus, subscriptionTier, subscriptionExpiresAt, credits, isAdmin } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing User ID" }, { status: 400 });
    }

    // Prevent removing admin status from the primary owner
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (targetUser.email === "apnaipuwallah@gmail.com" && isAdmin === false) {
      return NextResponse.json({ success: false, error: "Cannot remove admin permissions from primary owner" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus,
        subscriptionTier,
        subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null,
        credits: parseInt(credits) || 0,
        isAdmin: !!isAdmin,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionTier: updatedUser.subscriptionTier,
        subscriptionExpiresAt: updatedUser.subscriptionExpiresAt,
        credits: updatedUser.credits,
        isAdmin: updatedUser.isAdmin,
      }
    });
  } catch (error) {
    console.error("[ADMIN_USERS_PUT]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
