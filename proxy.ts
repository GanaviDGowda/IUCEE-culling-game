import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getRoleRedirectUrl } from "./lib/auth/roleRedirect";

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
  "/home",
];

export async function proxy(request: NextRequest) {
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
    const isPendingRoute = pathname === "/auth/pending-approval";
    const isLegacyPendingRoute = pathname === "/auth/pending";
    const isRootRoute = pathname === "/";
    const isApiRoute = pathname.startsWith("/api");
    const isStudentRoute = pathname.startsWith("/student");
    const isAdminRoute = pathname.startsWith("/admin");
    const isRootAdminRoute = adminPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

    if (!user) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
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
    const userRole = profile?.role;

    if (!hasApprovedProfile) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Pending approval" }, { status: 403 });
      }
      if (!isPendingRoute) {
        return NextResponse.redirect(new URL("/auth/pending-approval", request.url));
      }
      return response;
    }

    if (isLegacyPendingRoute || isPendingRoute || isAuthRoute || isRootRoute) {
      const redirectUrl = getRoleRedirectUrl(userRole, hasApprovedProfile);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Admin Route Protection & Rewrites
    if (isAdminRoute) {
      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      let targetPath = pathname.replace(/^\/admin/, "");
      if (targetPath === "" || targetPath === "/") {
        targetPath = "/home";
      }
      const rewriteUrl = new URL(targetPath + request.nextUrl.search, request.url);
      const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: request.headers,
        },
      });
      response.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return rewriteResponse;
    }

    // Force /admin prefix on root admin paths
    if (isRootAdminRoute) {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL(`/admin${pathname}${request.nextUrl.search}`, request.url));
      } else {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // Student Route Protection
    if (isStudentRoute) {
      if (userRole !== "student" && userRole !== "nodal_officer") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      return response;
    }

    // Rewrite legacy admin api routes to the root API path (e.g. /api/admin/members -> /api/members)
    if (pathname.startsWith("/api/admin/")) {
      const newPathname = pathname.replace("/api/admin/", "/api/");
      const rewriteUrl = new URL(newPathname + request.nextUrl.search, request.url);
      
      const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: request.headers,
        },
      });

      response.cookies.getAll().forEach((cookie) => {
        rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
      });

      return rewriteResponse;
    }

  } catch (error) {
    console.error("Proxy error:", error);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
