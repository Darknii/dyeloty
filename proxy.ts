import { NextResponse, type NextRequest } from "next/server";
import { hasValidTestAccess } from "./maintenanceAccess";

const PUBLIC_PATHS = ["/coming-soon", "/en/coming-soon", "/test-access", "/auth/callback", "/robots.txt", "/sitemap.xml", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  const maintenanceEnabled = process.env.MAINTENANCE_MODE === "true";
  const hasAccess = await hasValidTestAccess(
    request.cookies.get("dyeloty_test_access")?.value,
    process.env.TEST_ACCESS_KEY,
  );
  if (!maintenanceEnabled) return withDiagnostics(NextResponse.next(), maintenanceEnabled, hasAccess);
  const pathname = request.nextUrl.pathname;
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return withDiagnostics(response, maintenanceEnabled, hasAccess);
  }
  if (hasAccess) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return withDiagnostics(response, maintenanceEnabled, hasAccess);
  }
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/en" || pathname.startsWith("/en/") ? "/en/coming-soon" : "/coming-soon";
  url.search = "";
  url.searchParams.set("next", pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/");
  return withDiagnostics(NextResponse.redirect(url), maintenanceEnabled, hasAccess);
}

function withDiagnostics(response: NextResponse, maintenanceEnabled: boolean, hasAccess: boolean) {
  response.headers.set("X-Dyeloty-Proxy", "active");
  response.headers.set("X-Dyeloty-Maintenance", maintenanceEnabled ? "enabled" : "disabled");
  response.headers.set("X-Dyeloty-Test-Access", hasAccess ? "granted" : "denied");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|images/).*)"] };
