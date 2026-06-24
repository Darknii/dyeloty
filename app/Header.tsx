"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";

type Props = {
  language: "en" | "pl";
};

export default function Header({ language }: Props) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <header className="border-b border-[#E3DDD2]">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-3">

        <div className="flex items-center gap-6 text-sm text-[#1F2A24]">

          <a
            href="/pl"
            className="text-xl transition hover:scale-110"
            title="Polski"
          >
            🇵🇱
          </a>

          <a
            href="/en"
            className="text-xl transition hover:scale-110"
            title="English"
          >
            🇬🇧
          </a>

          <a
            href={language === "pl" ? "/pl/about" : "/en/about"}
            className="transition hover:text-[#90A885]"
          >
            {language === "pl" ? "O projekcie" : "About"}
          </a>

          <a
            href={language === "pl" ? "/add-listing/pl" : "/add-listing/en"}
            className="transition hover:text-[#90A885]"
          >
            + {language === "pl" ? "Dodaj włóczkę" : "Add Yarn"}
          </a>

          <a
            href="#"
            className="rounded-full bg-[#90A885] px-4 py-2 text-white transition hover:bg-[#809671]"
          >
            ☕ {language === "pl" ? "Wesprzyj Dyeloty" : "Support Dyeloty"}
          </a>

        </div>

        {session?.user ? (
          <div className="flex items-center gap-5 text-sm">

            <span className="text-[#7E7E7E]">
              {session.user.user_metadata?.name ??
                session.user.email}
            </span>

            <button
              onClick={handleLogout}
              className="transition hover:text-[#90A885]"
            >
              {language === "pl" ? "Wyloguj" : "Sign out"}
            </button>

          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="rounded-full border border-[#DCE5D4] bg-[#F5F8F1] px-5 py-2 text-sm text-[#1F2A24] transition hover:border-[#90A885]"
          >
            {language === "pl"
              ? "Zaloguj przez Google"
              : "Continue with Google"}
          </button>
        )}

      </div>
    </header>
  );
}