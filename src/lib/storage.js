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
  return Promise.all(images.map(async (image) => ({
    ...image,
    url: isPrivateStoragePath(image.url) ? await getSignedImageUrl(image.url) : image.url,
  })));
}
