"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const HEADERLESS_PATHS = ["/coming-soon", "/en/coming-soon", "/test-access", "/auth/callback"];

export default function AppHeader() {
  const pathname = usePathname();

  if (HEADERLESS_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  const language = pathname === "/en" || pathname.startsWith("/en/") || pathname === "/add-listing/en"
    ? "en"
    : "pl";

  return <Header language={language} />;
}
