"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { Session } from "@supabase/supabase-js";

type Props = {
  language: "en" | "pl";
};

export default function AddListingPage({ language }: Props) {
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  const t =
    language === "pl"
      ? {
          title: "Dodaj włóczkę",
          subtitle: "Dodaj włóczkę, która może pomóc komuś dokończyć projekt.",
          loginTitle: "❤️ Aby dodać włóczkę, zaloguj się przez Google.",
          loginButton: "Zaloguj przez Google",
          brand: "Marka",
          yarn: "Nazwa włóczki",
          color: "Kolor",
          dyelot: "Dyelot",
          skeins: "Liczba motków",
          country: "Kraj",
          contact: "Kontakt",
          publish: "Opublikuj ogłoszenie",
        }
      : {
          title: "Add Yarn",
          subtitle: "Add yarn that might help someone finish a project.",
          loginTitle: "❤️ Sign in with Google to add yarn.",
          loginButton: "Continue with Google",
          brand: "Brand",
          yarn: "Yarn name",
          color: "Color",
          dyelot: "Dyelot",
          skeins: "Number of skeins",
          country: "Country",
          contact: "Contact",
          publish: "Publish listing",
        };

  if (!session) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#2D2D2D]">
        <section className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold">{t.loginTitle}</h1>

          <button
            onClick={handleLogin}
            className="mt-10 rounded-2xl bg-[#90A885] px-8 py-4 text-white"
          >
            {t.loginButton}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#2D2D2D]">
      <section className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-5xl font-bold">{t.title}</h1>

        <p className="mt-4 text-gray-500">{t.subtitle}</p>

        <form className="mt-12 space-y-6">
          <div>
            <label className="mb-2 block font-medium">{t.brand}</label>
            <input className="w-full rounded-2xl border p-4" />
          </div>

          <div>
            <label className="mb-2 block font-medium">{t.yarn}</label>
            <input className="w-full rounded-2xl border p-4" />
          </div>

          <div>
            <label className="mb-2 block font-medium">{t.color}</label>
            <input className="w-full rounded-2xl border p-4" />
          </div>

          <div>
            <label className="mb-2 block font-medium">{t.dyelot}</label>
            <input className="w-full rounded-2xl border p-4" />
          </div>

          <div>
            <label className="mb-2 block font-medium">{t.skeins}</label>
            <input className="w-full rounded-2xl border p-4" />
          </div>

          <div>
            <label className="mb-2 block font-medium">{t.country}</label>
            <input className="w-full rounded-2xl border p-4" />
          </div>

          <div>
            <label className="mb-2 block font-medium">{t.contact}</label>
            <input className="w-full rounded-2xl border p-4" />
          </div>

          <button className="rounded-2xl bg-[#90A885] px-8 py-4 text-white">
            {t.publish}
          </button>
        </form>
      </section>
    </main>
  );
}