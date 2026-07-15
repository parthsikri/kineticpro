import { NextResponse } from "next/server";

export async function GET(req) {
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host");
  const domain = `${protocol}://${host}`;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${domain}/api/auth/callback/google`;
  
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", "openid email profile");
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}
