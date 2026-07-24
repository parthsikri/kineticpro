import { NextResponse } from "next/server";
import { razorpay } from "../../../lib/razorpay";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";
import { checkRateLimit } from "../../../lib/rate-limit";
import { PLANS } from "../../../lib/plans";

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(request, "checkout", 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ success: false, error: "Too many checkout attempts." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } });
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const tier = body?.tier;
    const interval = body?.interval === "yearly" ? "yearly" : "monthly";

    if (!Object.hasOwn(PLANS, tier)) {
      return NextResponse.json({ success: false, error: "Invalid plan." }, { status: 400 });
    }
    const plan = PLANS[tier];
    const amount = interval === "yearly" ? plan.yearlyAmount : plan.monthlyAmount;

    const options = {
      amount: amount,
      currency: plan.currency,
      receipt: "rcpt_" + user.id.slice(0, 10) + "_" + Date.now(),
      notes: { tier, userId: user.id },
    };

    const order = await razorpay.orders.create(options);

    await prisma.paymentOrder.create({
      data: {
        userId: user.id,
        razorpayOrderId: order.id,
        tier: `${tier}-${interval}`, // Encode interval into the tier field for verify-payment to read
        amount: amount,
        currency: plan.currency,
      },
    });
    return NextResponse.json({ success: true, order: { id: order.id, amount: amount, currency: plan.currency, key_id: process.env.RAZORPAY_KEY_ID } });
  } catch (error) {
    console.error("[RAZORPAY_CREATE_ORDER]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
