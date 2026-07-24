import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Attempt to add the column safely using raw SQL
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "defaultLinks" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "youtubeChannelUrl" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;`);
    
    return NextResponse.json({ success: true, message: "Migration applied successfully: defaultLinks, youtubeChannelUrl, and logoUrl added." });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
