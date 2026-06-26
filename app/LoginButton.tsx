"use client";

import { supabase } from "./supabase";
import { getAuthCallbackRedirectTo } from "./authRedirect";

export default function LoginButton() {
  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackRedirectTo(),
      },
    });
  }

  return (
    <button
      onClick={handleLogin}
      className="rounded-2xl bg-[#90A885] px-8 py-4 text-white"
    >
      Continue with Google
    </button>
  );
}
