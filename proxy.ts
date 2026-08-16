import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import { safeRedirectPath } from "@/lib/supabase/auth";

export async function proxy(request: NextRequest) {
  const config = getSupabasePublicConfig();
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const protectedRoute = request.nextUrl.pathname === "/profile" || request.nextUrl.pathname.startsWith("/profile/") || request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/");
  if (protectedRoute && !data.user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", safeRedirectPath(`${request.nextUrl.pathname}${request.nextUrl.search}`, "/"));
    return NextResponse.redirect(login);
  }
  if (data.user && request.nextUrl.pathname.startsWith("/admin")) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (profile?.role !== "admin") return NextResponse.redirect(new URL("/", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*"],
};
