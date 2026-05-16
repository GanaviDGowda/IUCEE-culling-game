import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const isAuthRoute = pathname.startsWith("/auth");
    const isRootRoute = pathname === "/";
    const isAdminRoute = pathname.startsWith("/admin");

    if (!user) {
      // If not logged in and not on an auth route, redirect to login
      if (!isAuthRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } else {
      // If logged in
      const role = user.user_metadata?.role;
      const roleHome = role === "admin" ? "/admin/home" : "/home";

      // If they try to access root or auth pages while logged in, redirect to their home
      if (isAuthRoute || isRootRoute) {
        return NextResponse.redirect(new URL(roleHome, request.url));
      }

      // Admin route protection
      if (isAdminRoute && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  } catch {
    // Do not block the page if session refresh fails
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
