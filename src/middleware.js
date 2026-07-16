import { NextResponse } from "next/server";

export function middleware(req) {
  const session = req.cookies.get("session_id")?.value;
  const { pathname } = req.nextUrl;

  // Legacy files may still exist on disk, but must never be served publicly.
  if (pathname.startsWith("/uploads/")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard(.*)", "/login", "/register", "/uploads/:path*"],
};
