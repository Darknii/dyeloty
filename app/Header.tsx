"use client";

import { Globe2, Heart, Plus, UserRound } from "lucide-react";
import Image from "next/image";
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

  const t =
    language === "pl"
      ? {
          listings: "Ogłoszenia",
          how: "Jak to działa?",
          about: "O projekcie",
          favorites: "Ulubione",
          login: "Zaloguj się",
          add: "Dodaj ogłoszenie",
          account: "Konto",
        }
      : {
          listings: "Listings",
          how: "How it works?",
          about: "About",
          favorites: "Favorites",
          login: "Sign in",
          add: "Add listing",
          account: "Account",
        };

  const homeHref = language === "pl" ? "/pl" : "/en";
  const addHref = language === "pl" ? "/add-listing/pl" : "/add-listing/en";
  const aboutHref = language === "pl" ? "/pl/about" : "/en/about";
  const accountLabel =
    session?.user?.user_metadata?.name ?? session?.user?.email ?? t.login;

  return (
    <header className="border-b border-[#E8E2EE] bg-white">
      <div className="mx-auto flex min-h-20 max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-[86px] lg:px-11">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <a href={homeHref} className="shrink-0" aria-label="Dyeloty">
            <Image
              src="/images/logos/Dyeloty.svg"
              alt="Dyeloty"
              width={147}
              height={44}
              priority
              className="h-[51px] w-auto"
            />
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#17142E] md:flex">
            <a href="#listings" className="transition hover:text-[#7438B7]">
              {t.listings}
            </a>
            <a href="#how-it-works" className="transition hover:text-[#7438B7]">
              {t.how}
            </a>
            <a href={aboutHref} className="transition hover:text-[#7438B7]">
              {t.about}
            </a>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <a
            href={language === "pl" ? "/en" : "/pl"}
            className="hidden min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[#332B4D] transition hover:bg-[#F6F0FB] sm:inline-flex"
            title={language === "pl" ? "English" : "Polski"}
          >
            <Globe2 size={19} />
            {language.toUpperCase()}
          </a>

          <a
            href="#"
            className="hidden min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[#17142E] transition hover:bg-[#F6F0FB] lg:inline-flex"
          >
            <Heart size={21} />
            {t.favorites}
          </a>

          {session?.user ? (
            <span className="hidden min-h-11 max-w-40 items-center gap-2 truncate rounded-full px-2 text-sm font-semibold text-[#17142E] lg:inline-flex">
              <UserRound size={20} />
              <span className="truncate">{accountLabel}</span>
            </span>
          ) : (
            <button
              onClick={handleLogin}
              className="hidden min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[#17142E] transition hover:bg-[#F6F0FB] lg:inline-flex"
            >
              <UserRound size={20} />
              {t.login}
            </button>
          )}

          <a
            href={addHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7438B7] px-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2] sm:px-5"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t.add}</span>
            <span className="sm:hidden">Dodaj</span>
          </a>
        </div>
      </div>
    </header>
  );
}
