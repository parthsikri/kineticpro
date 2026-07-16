import crypto from "crypto";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DATA_URI_PATTERN = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

function hasExpectedSignature(buffer, mimeType) {
  if (mimeType === "image/png") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimeType === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/webp") return buffer.length >= 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  return false;
}

export function parseImageDataUri(value, label = "Image") {
  if (typeof value !== "string" || value.length === 0 || value.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 128) {
    throw new Error(`${label} must be a PNG, JPEG, or WebP image no larger than 5 MB.`);
  }
  const match = value.match(DATA_URI_PATTERN);
  if (!match) throw new Error(`${label} must be a valid PNG, JPEG, or WebP data URI.`);

  const [, mimeType, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES || !hasExpectedSignature(buffer, mimeType)) {
    throw new Error(`${label} failed image validation.`);
  }
  return {
    buffer,
    mimeType,
    extension: mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1],
  };
}

export function newStoragePath(prefix, userId, extension) {
  return `${prefix}/${userId}/${crypto.randomUUID()}.${extension}`;
}
