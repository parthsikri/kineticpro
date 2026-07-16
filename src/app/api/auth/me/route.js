import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      credits: user.credits,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionTier: user.subscriptionTier,
    },
  });
}
