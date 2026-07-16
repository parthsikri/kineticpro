import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";
import { withSignedImageUrls } from "../../../lib/storage";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const images = await prisma.userImage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, images: await withSignedImageUrls(images) });
  } catch (error) {
    console.error("History Route Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load history." }, { status: 500 });
  }
}
