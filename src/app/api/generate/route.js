import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    // 1. Authenticate and check limits
    const dbUser = await getSessionUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const isPro = dbUser.subscriptionStatus === "active";
    const isElite = dbUser.subscriptionTier === "elite";
    const numGenerations = isElite ? 3 : 1;
    
    if (isPro) {
      const now = new Date();
      let used = dbUser.proCreditsUsed;
      
      if (!dbUser.proCreditsResetAt || now > dbUser.proCreditsResetAt) {
        used = 0;
        const nextReset = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { proCreditsUsed: 0, proCreditsResetAt: nextReset },
        });
      }

      if (used + numGenerations > 21) {
        return NextResponse.json({ success: false, error: `Not enough credits for ${numGenerations} generations. Weekly limit reached.` }, { status: 403 });
      }
    } else if (dbUser.credits < numGenerations) {
      return NextResponse.json({ success: false, error: "Out of credits. Please upgrade to Pro." }, { status: 403 });
    }

    const body = await request.json();
    const { imagePrompt, subjectPhotoBase64, brandLogoBase64, hasLogo } = body;

    const apiKey   = process.env.OPENAI_API_KEY;
    const modelName = process.env.IMAGE_MODEL_NAME || "gpt-image-2";

    /* ── Mock fallback ─────────────────────────────────────────── */
    if (!apiKey) {
      console.log("OpenAI key missing — returning mock image");
      await new Promise(resolve => setTimeout(resolve, 2500));
      const mockUrls = [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1792&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=1792&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1792&auto=format&fit=crop",
      ];
      // For mock, return numGenerations mock images
      let mockResults = Array.from({ length: numGenerations }).map(() => {
        return mockUrls[Math.floor(Math.random() * mockUrls.length)];
      });
      mockResults = await saveImagesToDiskAndDB(mockResults, dbUser.id);
      return NextResponse.json({ success: true, imageUrls: mockResults, isMock: true });
    }

    let imageUrls = [];

    // Helper to run generation once
    const generateVariant = async (index) => {
      let variantPrompt = imagePrompt;
      if (isElite && index > 0) {
        // Add subtle variations for Elite A/B testing
        const variations = [
          "Variation B: Alter the text layout and graphic elements slightly. Use a cooler, high-contrast color palette. Adjust the subject's pose and camera angle slightly for a different emotional impact.",
          "Variation C: Keep the core concept, but use a bolder graphic design style with a warmer, intense color palette. Rearrange the text placement and background elements. The subject should have a slightly different dynamic pose."
        ];
        variantPrompt = `${imagePrompt}\n\n[Variant Variation]: ${variations[index - 1]}`;
      }

      if (subjectPhotoBase64) {
        /* ── PATH A: Subject photo → /v1/images/edits ──────────── */
        console.log(`Subject photo detected — using /v1/images/edits (Variant ${index})`);

        const base64Data  = subjectPhotoBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");
        const mimeMatch   = subjectPhotoBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType    = mimeMatch ? mimeMatch[1] : "image/png";
        const ext         = mimeType.split("/")[1] || "png";

        const formData = new FormData();
        formData.append("image", new Blob([imageBuffer], { type: mimeType }), `subject.${ext}`);

        if (hasLogo && brandLogoBase64) {
          const logoBase64  = brandLogoBase64.replace(/^data:image\/\w+;base64,/, "");
          const logoBuffer  = Buffer.from(logoBase64, "base64");
          const logoMime    = (brandLogoBase64.match(/^data:(image\/\w+);base64,/) || [])[1] || "image/png";
          const logoExt     = logoMime.split("/")[1] || "png";
          formData.append("image", new Blob([logoBuffer], { type: logoMime }), `logo.${logoExt}`);
        }

        const editPrompt = `${variantPrompt}

CRITICAL: Use the person from the provided reference photo as the subject. Preserve their face, skin tone, and likeness with absolute accuracy. Style them dramatically for a high-production YouTube thumbnail.`;

        formData.append("prompt",   editPrompt);
        formData.append("model",    modelName);
        formData.append("size",     "1792x1024");
        formData.append("quality",  "low");
        formData.append("n",        "1");

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
        /* ── PATH B: No photo → /v1/images/generations ─────────── */
        console.log(`No subject photo — using /v1/images/generations (Variant ${index})`);
        return await generateFromText(apiKey, modelName, variantPrompt);
      }
    };

    // Run generations
    const promises = Array.from({ length: numGenerations }).map((_, i) => generateVariant(i));
    imageUrls = await Promise.all(promises);

    // Save images to disk and database
    imageUrls = await saveImagesToDiskAndDB(imageUrls, dbUser.id);

    // 2. Deduct credit if successful
    if (imageUrls.length > 0) {
      const incrementAmount = imageUrls.length;
      if (isPro) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { proCreditsUsed: { increment: incrementAmount } },
        });
      } else {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { credits: { decrement: incrementAmount } },
        });
      }
    }

    return NextResponse.json({ success: true, imageUrls });

  } catch (error) {
    console.error("Generate Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/* ── Save images to Supabase & DB helper ────────────────────────────── */
async function saveImagesToDiskAndDB(urls, userId) {
  if (!urls || urls.length === 0) return urls;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials, falling back to original URLs.");
    return urls;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const savedUrls = [];

  for (let i = 0; i < urls.length; i++) {
    const b64Data = urls[i];
    if (b64Data.startsWith("data:")) {
      const match = b64Data.match(/^data:image\/(\w+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === "jpeg" ? "jpg" : match[1];
        const base64String = match[2];
        const filename = `${userId}/thumb_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        
        const buffer = Buffer.from(base64String, "base64");
        
        const { data, error } = await supabase
          .storage
          .from("thumbnails")
          .upload(filename, buffer, {
            contentType: `image/${ext}`,
            upsert: false
          });

        if (error) {
          console.error("Supabase Storage Error:", error);
          savedUrls.push(b64Data); // Fallback
        } else {
          const { data: publicUrlData } = supabase.storage.from("thumbnails").getPublicUrl(filename);
          const urlToReturn = publicUrlData.publicUrl;

          await prisma.userImage.create({
            data: { userId, filename, url: urlToReturn }
          });
          savedUrls.push(urlToReturn);
        }
      } else {
        savedUrls.push(b64Data); // Fallback if match fails
      }
    } else if (b64Data.startsWith("http")) {
      await prisma.userImage.create({
        data: { userId, filename: `remote_${Date.now()}_${i}.jpg`, url: b64Data }
      });
      savedUrls.push(b64Data);
    } else {
      savedUrls.push(b64Data);
    }
  }
  return savedUrls;
}

/* ── Text-to-image ───────────────────────────────────────────────── */
async function generateFromText(apiKey, modelName, imagePrompt) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model:   modelName,
      prompt:  imagePrompt,
      n:       1,
      size:    "1792x1024",
      quality: "low",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API failed ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const item = data.data[0];
  if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item.url)      return await fetchAsBase64(item.url);
  throw new Error("No image data returned from OpenAI.");
}

/* ── Fetch remote URL → base64 data URI ─────────────────────────── */
async function fetchAsBase64(url) {
  const res      = await fetch(url);
  const buffer   = await res.arrayBuffer();
  const b64      = Buffer.from(buffer).toString("base64");
  const mimeType = res.headers.get("content-type") || "image/png";
  return `data:${mimeType};base64,${b64}`;
}
