-- Add subscription expiry date for billing cycle tracking
-- This is a nullable column so existing rows are unaffected

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionExpiresAt" TIMESTAMP(3);
