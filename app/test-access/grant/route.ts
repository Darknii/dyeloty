import { NextResponse } from "next/server";
import { getTestAccessSignature } from "../../../maintenanceAccess";

export async function POST(request: Request) {
  const form = await request.formData();
  const providedKey = String(form.get("key") ?? "");
  const destination = String(form.get("next") ?? "/");
  const secret = process.env.TEST_ACCESS_KEY;
  if (!secret || providedKey !== secret) return NextResponse.redirect(new URL("/test-access", request.url));
  const response = NextResponse.redirect(new URL(destination.startsWith("/") && !destination.startsWith("//") ? destination : "/", request.url));
  response.cookies.set("dyeloty_test_access", await getTestAccessSignature(secret), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
