import { NextResponse, type NextRequest } from "next/server";
import { hasValidTestAccess } from "./maintenanceAccess";

const PUBLIC_PATHS = ["/coming-soon", "/en/coming-soon", "/test-access", "/auth/callback", "/robots.txt", "/sitemap.xml", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "true") return NextResponse.next();
  const pathname = request.nextUrl.pathname;
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  const hasAccess = await hasValidTestAccess(request.cookies.get("dyeloty_test_access")?.value, process.env.TEST_ACCESS_KEY);
  if (hasAccess) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/en" || pathname.startsWith("/en/") ? "/en/coming-soon" : "/coming-soon";
  url.search = "";
  url.searchParams.set("next", pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/");
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|images/).*)"] };
