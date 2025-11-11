import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  const response = NextResponse.next();

  const supabase = createSupabaseMiddlewareClient(request, response);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.warn("Failed to load Supabase user in middleware", error.message);
  }

  if (!user) {
    const { error: anonError } = await supabase.auth.signInAnonymously();
    if (anonError) {
      console.warn("Failed to create anonymous session", anonError.message);
    }
    return response;
  }

  const isGuest = Boolean(
    user.is_anonymous ?? user.app_metadata?.provider === "anonymous"
  );

  if (!isGuest && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
