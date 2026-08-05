import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const authRoutes = ["/login", "/register"];

function isAuthRoute(pathname: string) {
  return authRoutes.includes(pathname);
}

function getUserRole(user: {
  user_metadata?: Record<string, unknown>;
}): "ADMIN" | "HR" | "CANDIDATE" | null {
  const role = user.user_metadata?.role;
  if (role === "ADMIN" || role === "HR" || role === "CANDIDATE") {
    return role;
  }
  return null;
}

function isProfileCompleted(user: { user_metadata?: Record<string, unknown> }) {
  return user.user_metadata?.profile_completed === true;
}

export async function middleware(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );
  supabaseResponse.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  const isAuthenticated = Boolean(user);
  const role = user ? getUserRole(user) : null;
  const profileCompleted = user ? isProfileCompleted(user) : false;

  if (isAuthenticated && isAuthRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    if (!profileCompleted) {
      redirectUrl.pathname = "/profile";
    } else if (role === "ADMIN") {
      redirectUrl.pathname = "/dashboard/admin";
    } else if (role === "HR") {
      redirectUrl.pathname = "/dashboard/hr";
    } else if (role === "CANDIDATE") {
      redirectUrl.pathname = "/dashboard/candidate";
    } else {
      redirectUrl.pathname = "/profile";
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!isAuthenticated && pathname === "/profile") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", "/profile");
    return NextResponse.redirect(redirectUrl);
  }

  if (
    isAuthenticated &&
    pathname.startsWith("/dashboard/admin") &&
    role !== "ADMIN"
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      role === "HR"
        ? "/dashboard/hr"
        : role === "CANDIDATE"
          ? "/dashboard/candidate"
          : "/profile";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    isAuthenticated &&
    pathname.startsWith("/dashboard/hr") &&
    role !== "HR"
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      role === "ADMIN"
        ? "/dashboard/admin"
        : role === "CANDIDATE"
          ? "/dashboard/candidate"
          : "/profile";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    isAuthenticated &&
    pathname.startsWith("/dashboard/candidate") &&
    role !== "CANDIDATE"
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      role === "ADMIN"
        ? "/dashboard/admin"
        : role === "HR"
          ? "/dashboard/hr"
          : "/profile";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    isAuthenticated &&
    !profileCompleted &&
    pathname.startsWith("/dashboard")
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/profile";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    isAuthenticated &&
    profileCompleted &&
    pathname === "/profile" &&
    request.nextUrl.searchParams.get("setup") !== "true"
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      role === "ADMIN"
        ? "/dashboard/admin"
        : role === "HR"
          ? "/dashboard/hr"
          : "/dashboard/candidate";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
