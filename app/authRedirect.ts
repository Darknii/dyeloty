"use client";

const CANONICAL_PRODUCTION_ORIGIN = "https://www.dyeloty.pl";
const PRODUCTION_HOSTS = new Set(["dyeloty.pl", "www.dyeloty.pl"]);

export function getAuthCallbackRedirectTo(nextPath = "/account") {
  const origin = PRODUCTION_HOSTS.has(window.location.hostname)
    ? CANONICAL_PRODUCTION_ORIGIN
    : window.location.origin;
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}
