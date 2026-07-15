import { NextResponse } from "next/server";
import { razorpay } from "../../../lib/razorpay";
import { prisma } from "../../../lib/prisma";
import { getSessionUser } from "../../../lib/auth";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const tier = body.tier || "pro";

    const amount = tier === "elite" ? 99900 : 29900; // 999 INR vs 299 INR

    const options = {
      amount,
      currency: "INR",
      receipt: "rcpt_" + user.id.slice(0, 10) + "_" + Date.now(),
      notes: {
        tier: tier
      }
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("[RAZORPAY_CREATE_ORDER]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
