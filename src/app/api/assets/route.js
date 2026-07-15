import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";
import fs from "fs/promises";
import path from "path";

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const images = await prisma.userImage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("GET Assets error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageBase64, filename = "upload.png" } = body;
    
    if (!imageBase64) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    
    const uniqueFilename = `${user.id.slice(0,8)}_${Date.now()}_${filename.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    
    // Ensure dir exists
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, uniqueFilename);
    await fs.writeFile(filePath, imageBuffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    const newImage = await prisma.userImage.create({
      data: {
        userId: user.id,
        filename: uniqueFilename,
        url: publicUrl,
      },
    });

    return NextResponse.json({ success: true, image: newImage });
  } catch (error) {
    console.error("POST Assets error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
