"use client";

import { Globe2, Heart, Menu, Plus, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";
import { getAuthCallbackRedirectTo } from "./authRedirect";

type Props = {
  language: "en" | "pl";
};

export default function Header({ language }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      options: {
        redirectTo: getAuthCallbackRedirectTo(),
      },
    });
  }

  const t =
    language === "pl"
      ? {
          listings: "Ogłoszenia",
          how: "Jak to działa?",
          about: "O projekcie",
          favorites: "Ulubione",
          support: "Wesprzyj Dyeloty",
          login: "Zaloguj się",
          add: "Dodaj ogłoszenie",
          account: "Konto",
        }
      : {
          listings: "Listings",
          how: "How it works?",
          about: "About",
          favorites: "Favorites",
          support: "Support Dyeloty",
          login: "Sign in",
          add: "Add listing",
          account: "Account",
        };

  const homeHref = language === "pl" ? "/pl" : "/en";
  const addHref = language === "pl" ? "/add-listing/pl" : "/add-listing/en";
  const aboutHref = language === "pl" ? "/pl/about" : "/en/about";
  const listingsHref = `${homeHref}#listings`;
  const howItWorksHref = `${homeHref}#how-it-works`;
  const supportHref = "https://buymeacoffee.com/dyelotyapp";
  const accountLabel =
    session?.user?.user_metadata?.display_name ??
    session?.user?.user_metadata?.name ??
    session?.user?.email ??
    t.login;

  return (
    <header className="relative border-b border-[#E8E2EE] bg-white">
      <div className="mx-auto flex min-h-20 max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-[86px] lg:px-11">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <a href={homeHref} className="shrink-0" aria-label="Dyeloty">
            <Image
              src="/images/logos/Dyeloty.svg"
              alt="Dyeloty"
              width={147}
              height={44}
              priority
              className="h-[46px] w-auto md:h-[51px]"
            />
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#17142E] md:flex">
            <a href={listingsHref} className="transition hover:text-[#7438B7]">
              {t.listings}
            </a>
            <a href={howItWorksHref} className="transition hover:text-[#7438B7]">
              {t.how}
            </a>
            <a href={aboutHref} className="transition hover:text-[#7438B7]">
              {t.about}
            </a>
            <a
              href={supportHref}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[#7438B7]"
            >
              {t.support}
            </a>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <a
            href={language === "pl" ? "/en" : "/pl"}
            className="hidden min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[#332B4D] transition hover:bg-[#F6F0FB] md:inline-flex"
            title={language === "pl" ? "English" : "Polski"}
          >
            <Globe2 size={19} />
            {language.toUpperCase()}
          </a>

          <a
            href="/account?section=favorites"
            className="hidden min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-[#17142E] transition hover:bg-[#F6F0FB] lg:inline-flex"
          >
            <Heart size={21} />
            {t.favorites}
          </a>

          {session?.user ? (
            <a
              href="/account"
              className="hidden min-h-11 max-w-40 items-center gap-2 truncate rounded-full px-2 text-sm font-semibold text-[#17142E] transition hover:bg-[#F6F0FB] lg:inline-flex"
            >
              <UserRound size={20} />
              <span className="truncate">{accountLabel}</span>
            </a>
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
            <span className="hidden md:inline">{t.add}</span>
            <span className="md:hidden">Dodaj</span>
          </a>

          <button
            type="button"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#E8E2EE] text-[#17142E] transition hover:bg-[#F6F0FB] md:hidden"
            aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-[#E8E2EE] bg-white px-4 pb-4 shadow-[0_18px_38px_rgba(51,36,82,0.12)] md:hidden">
          <nav className="mx-auto flex max-w-[1480px] flex-col gap-1 pt-2 text-sm font-semibold text-[#17142E]">
            <a
              href={listingsHref}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-3 transition hover:bg-[#F6F0FB] hover:text-[#7438B7]"
            >
              {t.listings}
            </a>
            <a
              href={howItWorksHref}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-3 transition hover:bg-[#F6F0FB] hover:text-[#7438B7]"
            >
              {t.how}
            </a>
            <a
              href={aboutHref}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-3 transition hover:bg-[#F6F0FB] hover:text-[#7438B7]"
            >
              {t.about}
            </a>
            <a
              href="/account?section=favorites"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-3 transition hover:bg-[#F6F0FB] hover:text-[#7438B7]"
            >
              <Heart size={19} />
              {t.favorites}
            </a>
            <a
              href={supportHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-3 py-3 transition hover:bg-[#F6F0FB] hover:text-[#7438B7]"
            >
              {t.support}
            </a>
            {session?.user ? (
              <a
                href="/account"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-3 transition hover:bg-[#F6F0FB] hover:text-[#7438B7]"
              >
                <UserRound size={19} />
                <span className="truncate">{t.account}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  void handleLogin();
                }}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-left transition hover:bg-[#F6F0FB] hover:text-[#7438B7]"
              >
                <UserRound size={19} />
                {t.login}
              </button>
            )}
            <a
              href={language === "pl" ? "/en" : "/pl"}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-3 transition hover:bg-[#F6F0FB] hover:text-[#7438B7]"
            >
              <Globe2 size={19} />
              {language.toUpperCase()}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
