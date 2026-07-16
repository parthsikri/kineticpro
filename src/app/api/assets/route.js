import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";
import { newStoragePath, parseImageDataUri } from "../../../lib/images";
import { uploadPrivateImage, withSignedImageUrls } from "../../../lib/storage";
import { checkRateLimit } from "../../../lib/rate-limit";

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

    return NextResponse.json({ success: true, images: await withSignedImageUrls(images) });
  } catch (error) {
    console.error("GET Assets error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(request, "asset-upload", 20, 60 * 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ success: false, error: "Upload limit reached. Please try again later." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } });
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageBase64 } = body;
    
    if (!imageBase64) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }

    const image = parseImageDataUri(imageBase64, "Upload");
    const storagePath = newStoragePath("assets", user.id, image.extension);
    await uploadPrivateImage(storagePath, image.buffer, image.mimeType);

    const newImage = await prisma.userImage.create({
      data: {
        userId: user.id,
        filename: storagePath.split("/").at(-1),
        url: storagePath,
      },
    });

    return NextResponse.json({ success: true, image: (await withSignedImageUrls([newImage]))[0] });
  } catch (error) {
    console.error("POST Assets error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
