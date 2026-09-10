"use client";

export function getAuthCallbackRedirectTo(nextPath = "/account") {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}
