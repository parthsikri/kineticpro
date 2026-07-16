import { NextResponse } from "next/server";
import crypto from "crypto";

function appUrl(req) {
  if (process.env.APP_URL) return new URL(process.env.APP_URL).origin;
  // Always use the primary production URL to avoid Google OAuth redirect_uri_mismatch
  return "https://kineticpro.vercel.app";
}

export async function GET(req) {
  const domain = appUrl(req);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${domain}/api/auth/callback/google`;
  
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", "openid email profile");
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent");
  const state = crypto.randomBytes(32).toString("base64url");
  authUrl.searchParams.append("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/api/auth/callback/google",
  });
  return response;
}
