const buckets = globalThis.__kineticRateLimitBuckets || new Map();
globalThis.__kineticRateLimitBuckets = buckets;

function clientAddress(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(request, name, limit, windowMs) {
  const now = Date.now();
  const key = `${name}:${clientAddress(request)}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [oldKey, value] of buckets) if (value.resetAt <= now) buckets.delete(oldKey);
    }
    return { allowed: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}
