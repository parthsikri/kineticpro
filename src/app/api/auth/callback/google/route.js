import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { createSession } from "../../../../../lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const domain = `${protocol}://${host}`;

    if (error || !code) {
      return NextResponse.redirect(`${domain}/login?error=${encodeURIComponent(error || "Google auth failed")}`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${domain}/api/auth/callback/google`;

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Google token exchange failed:", errText);
      return NextResponse.redirect(`${domain}/login?error=Failed+to+retrieve+Google+token`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google UserInfo endpoint
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      console.error("Google userinfo fetch failed");
      return NextResponse.redirect(`${domain}/login?error=Failed+to+fetch+user+profile`);
    }

    const profile = await profileResponse.json();
    const email = profile.email;

    if (!email) {
      return NextResponse.redirect(`${domain}/login?error=No+email+returned+from+Google`);
    }

    // Find or create the user in the database
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // For Google users, set a blank/random password hash since they authenticate via Google
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: "", // Not used
          credits: 1,
        },
      });
    }

    // Create session and set cookie
    await createSession(user.id);

    // Redirect to dashboard
    return NextResponse.redirect(`${domain}/dashboard`);
  } catch (err) {
    console.error("[GOOGLE_AUTH_CALLBACK_ERROR]", err);
    return NextResponse.redirect(`${domain}/login?error=Internal+Server+Error`);
  }
}
