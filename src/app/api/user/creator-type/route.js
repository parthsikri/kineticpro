import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSessionUser } from "../../../../lib/auth";

const ALLOWED_TYPES = ["education", "vlogs", "tech", "gaming", "finance", "fitness"];

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { creatorType: true },
    });

    return NextResponse.json({
      success: true,
      creatorType: dbUser?.creatorType || "education",
    });
  } catch (error) {
    console.error("GET Creator Type Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch creator profile." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { creatorType } = body;

    if (!creatorType || !ALLOWED_TYPES.includes(creatorType)) {
      return NextResponse.json(
        { success: false, error: "Invalid creator type selected." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { creatorType },
      select: { creatorType: true },
    });

    return NextResponse.json({
      success: true,
      creatorType: updatedUser.creatorType,
    });
  } catch (error) {
    console.error("POST Creator Type Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update creator profile." }, { status: 500 });
  }
}
