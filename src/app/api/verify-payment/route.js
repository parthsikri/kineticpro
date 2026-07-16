import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";
import { razorpay } from "../../../lib/razorpay";
import { checkRateLimit } from "../../../lib/rate-limit";

function signaturesMatch(left, right) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(request, "payment-verify", 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ success: false, error: "Too many verification attempts." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } });
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (!signaturesMatch(generated_signature, razorpay_signature)) {
      return NextResponse.json({ success: false, error: "Signature mismatch" }, { status: 400 });
    }

    const order = await prisma.paymentOrder.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
    if (!order || order.userId !== user.id) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    if (order.status === "paid") {
      return NextResponse.json({ success: true, message: "Payment already verified" });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== order.razorpayOrderId || payment.amount !== order.amount || payment.currency !== order.currency || payment.status !== "captured") {
      return NextResponse.json({ success: false, error: "Payment details could not be verified" }, { status: 400 });
    }

    const subscriptionExpiresAt = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: "paid", razorpayPaymentId: razorpay_payment_id, paidAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: "active", subscriptionTier: order.tier, subscriptionExpiresAt },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("[RAZORPAY_VERIFY]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
