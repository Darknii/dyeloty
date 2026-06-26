"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../../supabase";

export default function AuthCallbackPage() {
  useEffect(() => {
    let isMounted = true;

    async function finishLogin() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (!code) {
          throw new Error("Auth callback is missing the OAuth code parameter.");
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Auth callback code exchange failed:", error);
          throw error;
        }

        const session = await waitForPersistedSession();

        if (!session) {
          throw new Error("Auth callback finished without a persisted session.");
        }

        if (isMounted) {
          window.location.replace("/account");
        }
      } catch (error) {
        console.error("Auth callback failed:", error);
      }
    }

    void finishLogin();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F4FB] px-4 text-[#17142E]">
      <div className="flex items-center gap-3 rounded-2xl border border-[#E8E1F0] bg-white px-6 py-5 text-sm font-semibold text-[#6E6582] shadow-[0_18px_55px_rgba(51,36,82,0.09)]">
        <Loader2 className="animate-spin text-[#7438B7]" size={20} />
        Kończymy logowanie...
      </div>
    </main>
  );
}

async function waitForPersistedSession() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Auth callback session read failed:", error);
      throw error;
    }

    if (session) {
      return session;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }

  return null;
}
