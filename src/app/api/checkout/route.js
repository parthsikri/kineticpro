import { NextResponse } from "next/server";
import { razorpay } from "../../../lib/razorpay";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";
import { checkRateLimit } from "../../../lib/rate-limit";

const PLANS = {
  pro: { amount: 29900, currency: "INR" },
  elite: { amount: 99900, currency: "INR" },
};

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
    if (!Object.hasOwn(PLANS, tier)) {
      return NextResponse.json({ success: false, error: "Invalid plan." }, { status: 400 });
    }
    const plan = PLANS[tier];

    const options = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: "rcpt_" + user.id.slice(0, 10) + "_" + Date.now(),
      notes: {
        tier,
        userId: user.id,
      }
    };

    const order = await razorpay.orders.create(options);
    
    await prisma.paymentOrder.create({
      data: {
        userId: user.id,
        razorpayOrderId: order.id,
        tier,
        amount: plan.amount,
        currency: plan.currency,
      },
    });
    return NextResponse.json({ success: true, order: { id: order.id, amount: plan.amount, currency: plan.currency } });
  } catch (error) {
    console.error("[RAZORPAY_CREATE_ORDER]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
