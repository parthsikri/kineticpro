/**
 * Shared plan configuration — single source of truth.
 * Import this in checkout, verify-payment, settings, pricing, layout, generate.
 */

export const PLANS = {
  pro: {
    label: "Kinetic Pro",
    amount: 29900,          // paise — ₹299
    currency: "INR",
    weeklyLimit: 7,         // thumbnails per week
    generations: 1,         // images per generation run
  },
  elite: {
    label: "Kinetic Elite",
    amount: 29900,          // paise — ₹299 (limited time offer, same as pro)
    currency: "INR",
    weeklyLimit: 21,        // thumbnails per week
    generations: 3,         // A/B variants per run
  },
};

/** How many weeks before a subscription expires (one billing cycle). */
export const SUBSCRIPTION_WEEKS = 4;

/** Derive display price string from paise amount. */
export function formatPrice(paise) {
  return "₹" + (paise / 100).toLocaleString("en-IN");
}
