import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

/**
 * Razorpay Webhook Handler
 *
 * Receives server-to-server events from Razorpay so payment state is
 * updated even if the user closes the browser before /api/verify-payment runs.
 *
 * Setup in Razorpay Dashboard → Webhooks → Add URL:
 *   https://yourdomain.com/api/webhook/razorpay
 * Events to subscribe: payment.captured, payment.failed, order.paid
 *
 * Set RAZORPAY_WEBHOOK_SECRET in your env to the secret Razorpay shows
 * when you create the webhook endpoint.
 */

function verifyWebhookSignature(body, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const sigBuf = Buffer.from(signature, "hex");
  return expectedBuf.length === sigBuf.length && crypto.timingSafeEqual(expectedBuf, sigBuf);
}

export async function POST(request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    // Webhook secret not configured — refuse to process to avoid spoofing.
    console.error("[RAZORPAY_WEBHOOK] RAZORPAY_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Read raw body for HMAC verification (must not parse JSON first).
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    console.warn("[RAZORPAY_WEBHOOK] Signature mismatch — rejecting");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event?.event;
  console.log("[RAZORPAY_WEBHOOK] Received event:", eventType);

  try {
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const payment = event?.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      const amountPaid = payment?.amount;
      const currency = payment?.currency;
      const paymentStatus = payment?.status;

      if (!orderId || !paymentId) {
        return NextResponse.json({ received: true }); // Not an order we care about
      }

      // Look up our internal order record
      const order = await prisma.paymentOrder.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (!order) {
        console.warn("[RAZORPAY_WEBHOOK] Order not found:", orderId);
        return NextResponse.json({ received: true });
      }

      if (order.status === "paid") {
        // Already processed (duplicate webhook delivery is normal — be idempotent)
        return NextResponse.json({ received: true });
      }

      // Validate the amount matches what we originally created the order for.
      if (amountPaid !== order.amount || currency !== order.currency || paymentStatus !== "captured") {
        console.error("[RAZORPAY_WEBHOOK] Payment details mismatch for order:", orderId, {
          expected: { amount: order.amount, currency: order.currency },
          received: { amount: amountPaid, currency, paymentStatus },
        });
        // Mark as failed so it can be investigated
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: { status: "failed" },
        });
        return NextResponse.json({ received: true });
      }

      // All checks passed — atomically mark order paid and upgrade user
      await prisma.$transaction([
        prisma.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: "paid",
            razorpayPaymentId: paymentId,
            paidAt: new Date(),
          },
        }),
        prisma.user.update({
          where: { id: order.userId },
          data: {
            subscriptionStatus: "active",
            subscriptionTier: order.tier,
          },
        }),
      ]);

      console.log(`[RAZORPAY_WEBHOOK] User ${order.userId} upgraded to ${order.tier}`);

    } else if (eventType === "payment.failed") {
      const payment = event?.payload?.payment?.entity;
      const orderId = payment?.order_id;
      if (orderId) {
        await prisma.paymentOrder.updateMany({
          where: { razorpayOrderId: orderId, status: "created" },
          data: { status: "failed" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[RAZORPAY_WEBHOOK] Processing error:", error);
    // Return 200 so Razorpay doesn't keep retrying for internal errors
    return NextResponse.json({ received: true });
  }
}
