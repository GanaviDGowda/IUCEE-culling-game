import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const adminPaths = [
  "/members",
  "/events",
  "/projects",
  "/points",
  "/analytics",
  "/system",
  "/communication",
  "/leaderboards",
  "/more",
];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isAuthRoute = pathname.startsWith("/auth");
    const isPendingRoute = pathname === "/auth/pending";
    const isRootRoute = pathname === "/";
    const isAdminRoute = adminPaths.some((p) => pathname.startsWith(p));

    if (!user) {
      if (!isAuthRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      return response;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .maybeSingle();

    const hasApprovedProfile = Boolean(profile);

    if (!hasApprovedProfile) {
      if (!isPendingRoute) {
        return NextResponse.redirect(new URL("/auth/pending", request.url));
      }
      return response;
    }

    if (isPendingRoute || isAuthRoute || isRootRoute) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    if (isAdminRoute && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  } catch {
    // Do not block the page if session refresh fails.
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
