import { createClient } from "@supabase/supabase-js";

const BUCKET = "thumbnails";

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Private storage is not configured.");
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function uploadPrivateImage(path, buffer, mimeType) {
  const { error } = await getStorageClient().storage.from(BUCKET).upload(path, buffer, {
    contentType: mimeType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error("Image storage failed.");
}

export async function getSignedImageUrl(path) {
  const { data, error } = await getStorageClient().storage.from(BUCKET).createSignedUrl(path, 60 * 15);
  if (error || !data?.signedUrl) throw new Error("Could not create an image URL.");
  return data.signedUrl;
}

export function isPrivateStoragePath(value) {
  return typeof value === "string" && (value.startsWith("assets/") || value.startsWith("generated/"));
}

export async function withSignedImageUrls(images) {
  if (!images || images.length === 0) return images;

  // Split images into those needing signed URLs vs public/external URLs
  const privatePaths = images
    .map((img, i) => ({ index: i, path: img.url }))
    .filter(({ path }) => isPrivateStoragePath(path));

  if (privatePaths.length === 0) return images;

  // Single batch request for all private paths
  const { data, error } = await getStorageClient()
    .storage
    .from(BUCKET)
    .createSignedUrls(privatePaths.map(p => p.path), 60 * 15);

  if (error || !data) {
    // Fallback: return images as-is rather than failing completely
    console.error("Batch signed URL error:", error);
    return images;
  }

  // Map signed URLs back to the correct image records
  const result = [...images];
  privatePaths.forEach(({ index }, i) => {
    if (data[i]?.signedUrl) {
      result[index] = { ...result[index], url: data[i].signedUrl };
    }
  });

  return result;
}
