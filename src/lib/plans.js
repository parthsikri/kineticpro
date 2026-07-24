/**
 * Shared plan configuration — single source of truth.
 * Import this in checkout, verify-payment, settings, pricing, layout, generate.
 */

export const PLANS = {
  pro: {
    label: "Kinetic Pro",
    monthlyAmount: 19900,         // paise — ₹199
    yearlyAmount: 149900,         // paise — ₹1499 (assumed)
    slashedMonthly: 399,
    slashedYearly: 3999,
    currency: "INR",
    monthlyLimit: 10,             // thumbnails per month
    generations: 1,               // images per generation run
  },
  elite: {
    label: "Kinetic Elite",
    monthlyAmount: 29900,         // paise — ₹299
    yearlyAmount: 199900,         // paise — ₹1999
    slashedMonthly: 599,
    slashedYearly: 5999,
    currency: "INR",
    monthlyLimit: 30,             // thumbnails per month
    generations: 2,               // A/B variants per run
  },
  infinity: {
    label: "Kinetic Infinity",
    monthlyAmount: 39900,         // paise — ₹399
    yearlyAmount: 349900,         // paise — ₹3499
    slashedMonthly: 799,
    slashedYearly: 7999,
    currency: "INR",
    monthlyLimit: 90,             // thumbnails per month
    generations: 3,               // A/B variants per run
  },
};

/** How many days before a subscription expires (one billing cycle). */
export const SUBSCRIPTION_DAYS_MONTHLY = 30;
export const SUBSCRIPTION_DAYS_YEARLY = 365;

/** Derive display price string from paise amount. */
export function formatPrice(paise) {
  return "₹" + (paise / 100).toLocaleString("en-IN");
}
