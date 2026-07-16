import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";
import { newStoragePath, parseImageDataUri } from "../../../lib/images";
import { getSignedImageUrl, uploadPrivateImage } from "../../../lib/storage";
import { checkRateLimit } from "../../../lib/rate-limit";
import { PLANS } from "../../../lib/plans";

class CreditError extends Error {}

async function reserveCredits(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new CreditError("Unauthorized");

  const isPro = user.subscriptionStatus === "active";
  const isElite = isPro && user.subscriptionTier === "elite";

  // Check subscription has not expired
  if (isPro && user.subscriptionExpiresAt && new Date() > user.subscriptionExpiresAt) {
    // Expire the subscription atomically
    await prisma.user.updateMany({
      where: { id: userId, subscriptionStatus: "active" },
      data: { subscriptionStatus: "expired" },
    });
    throw new CreditError("Your subscription has expired. Please renew to continue generating.");
  }

  const planKey = isElite ? "elite" : "pro";
  const plan = PLANS[planKey];
  // Each generation run consumes 1 slot regardless of variant count
  const weeklySlotCost = 1;
  const numGenerations = isPro ? plan.generations : 1;

  if (isPro) {
    const now = new Date();
    // Reset weekly counter if window has passed
    await prisma.user.updateMany({
      where: { id: userId, subscriptionStatus: "active", OR: [{ proCreditsResetAt: null }, { proCreditsResetAt: { lte: now } }] },
      data: { proCreditsUsed: 0, proCreditsResetAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    });
    // Atomically reserve one slot
    const weeklyLimit = plan.weeklyLimit;
    const reserved = await prisma.user.updateMany({
      where: { id: userId, subscriptionStatus: "active", proCreditsUsed: { lte: weeklyLimit - weeklySlotCost } },
      data: { proCreditsUsed: { increment: weeklySlotCost } },
    });
    if (reserved.count !== 1) throw new CreditError(`Weekly limit of ${weeklyLimit} thumbnails reached. Resets next week.`);
  } else {
    const reserved = await prisma.user.updateMany({
      where: { id: userId, subscriptionStatus: { not: "active" }, credits: { gte: 1 } },
      data: { credits: { decrement: 1 } },
    });
    if (reserved.count !== 1) throw new CreditError("Out of credits. Please upgrade to Pro.");
  }

  return { isPro, isElite, numGenerations };
}

async function refundCredits(userId, reservation) {
  if (!reservation) return;
  if (reservation.isPro) {
    await prisma.user.update({ where: { id: userId }, data: { proCreditsUsed: { decrement: 1 } } }).catch(() => {});
  } else {
    await prisma.user.update({ where: { id: userId }, data: { credits: { increment: 1 } } }).catch(() => {});
  }
}

export async function POST(request) {
  let reservation;
  let userId;
  try {
    const rateLimit = checkRateLimit(request, "generate", 30, 60 * 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ success: false, error: "Generation limit reached. Please try again later." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } });
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imagePrompt, subjectPhotoBase64, brandLogoBase64, hasLogo } = body;
    if (typeof imagePrompt !== "string" || imagePrompt.trim().length === 0 || imagePrompt.length > 8_000) {
      return NextResponse.json({ success: false, error: "Image prompt must be between 1 and 8,000 characters." }, { status: 400 });
    }
    const subjectImage = subjectPhotoBase64 ? parseImageDataUri(subjectPhotoBase64, "Subject photo") : null;
    const logoImage = hasLogo && brandLogoBase64 ? parseImageDataUri(brandLogoBase64, "Brand logo") : null;

    userId = sessionUser.id;

    // Reserve credits BEFORE any AI call — prevents concurrent bypass
    reservation = await reserveCredits(userId);
    const { isElite, numGenerations } = reservation;

    const apiKey = process.env.OPENAI_API_KEY;
    const modelName = process.env.IMAGE_MODEL_NAME || "gpt-image-2";

    /* ── Mock fallback (no API key) — refund credits, no real work done ── */
    if (!apiKey) {
      console.log("OpenAI key missing — returning mock image, refunding credits");
      await refundCredits(userId, reservation);
      reservation = null; // prevent double-refund in catch
      await new Promise(resolve => setTimeout(resolve, 2500));
      const mockUrls = [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1792&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1792&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1792&auto=format&fit=crop",
      ];
      const mockResults = Array.from({ length: numGenerations }).map(() =>
        mockUrls[Math.floor(Math.random() * mockUrls.length)]
      );
      return NextResponse.json({ success: true, imageUrls: mockResults, isMock: true });
    }

    let imageUrls = [];

    const generateVariant = async (index) => {
      let variantPrompt = imagePrompt;
      if (isElite && index > 0) {
        const variations = [
          "Variation B: Alter the text layout and graphic elements slightly. Use a cooler, high-contrast color palette. Adjust the subject's pose and camera angle slightly for a different emotional impact.",
          "Variation C: Keep the core concept, but use a bolder graphic design style with a warmer, intense color palette. Rearrange the text placement and background elements. The subject should have a slightly different dynamic pose."
        ];
        variantPrompt = `${imagePrompt}\n\n[Variant Variation]: ${variations[index - 1]}`;
      }

      if (subjectImage) {
        console.log(`Subject photo detected — using /v1/images/edits (Variant ${index})`);
        const formData = new FormData();
        formData.append("image", new Blob([subjectImage.buffer], { type: subjectImage.mimeType }), `subject.${subjectImage.extension}`);
        if (logoImage) {
          formData.append("image", new Blob([logoImage.buffer], { type: logoImage.mimeType }), `logo.${logoImage.extension}`);
        }
        const editPrompt = `${variantPrompt}\n\nCRITICAL: Use the person from the provided reference photo as the subject. Preserve their face, skin tone, and likeness with absolute accuracy. Style them dramatically for a high-production YouTube thumbnail.`;
        formData.append("prompt", editPrompt);
        formData.append("model", modelName);
        formData.append("size", "1792x1024");
        formData.append("quality", "low");
        formData.append("n", "1");

        const response = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}` },
          body: formData,
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("OpenAI edits error:", errText);
          console.log("Falling back to text-only generation...");
          return await generateFromText(apiKey, modelName, variantPrompt);
        } else {
          const data = await response.json();
          const item = data.data[0];
          return item.b64_json
            ? `data:image/png;base64,${item.b64_json}`
            : await fetchAsBase64(item.url);
        }
      } else {
        console.log(`No subject photo — using /v1/images/generations (Variant ${index})`);
        return await generateFromText(apiKey, modelName, variantPrompt);
      }
    };

    const promises = Array.from({ length: numGenerations }).map((_, i) => generateVariant(i));
    imageUrls = await Promise.all(promises);
    imageUrls = await saveImagesToStorageAndDB(imageUrls, userId);

    return NextResponse.json({ success: true, imageUrls });

  } catch (error) {
    await refundCredits(userId, reservation);
    console.error("Generate Route Error:", error);
    const status = error instanceof CreditError ? 403 : 500;
    return NextResponse.json({ success: false, error: error instanceof CreditError ? error.message : "Image generation failed. Please try again." }, { status });
  }
}

async function saveImagesToStorageAndDB(urls, userId) {
  if (!urls || urls.length === 0) return urls;
  const savedUrls = [];
  for (let i = 0; i < urls.length; i++) {
    const b64Data = urls[i];
    if (b64Data.startsWith("data:")) {
      const image = parseImageDataUri(b64Data, "Generated image");
      const storagePath = newStoragePath("generated", userId, image.extension);
      await uploadPrivateImage(storagePath, image.buffer, image.mimeType);
      await prisma.userImage.create({ data: { userId, filename: storagePath.split("/").at(-1), url: storagePath } });
      savedUrls.push(await getSignedImageUrl(storagePath));
    } else if (b64Data.startsWith("http")) {
      await prisma.userImage.create({ data: { userId, filename: `remote_${Date.now()}_${i}.jpg`, url: b64Data } });
      savedUrls.push(b64Data);
    } else {
      savedUrls.push(b64Data);
    }
  }
  return savedUrls;
}

async function generateFromText(apiKey, modelName, imagePrompt) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: modelName, prompt: imagePrompt, n: 1, size: "1792x1024", quality: "low" }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API failed ${response.status}: ${errText}`);
  }
  const data = await response.json();
  const item = data.data[0];
  if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item.url) return await fetchAsBase64(item.url);
  throw new Error("No image data returned from OpenAI.");
}

async function fetchAsBase64(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const b64 = Buffer.from(buffer).toString("base64");
  const mimeType = res.headers.get("content-type") || "image/png";
  return `data:${mimeType};base64,${b64}`;
}
