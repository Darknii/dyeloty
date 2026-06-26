"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../supabase";
import type { Session } from "@supabase/supabase-js";

type Props = {
  language: "en" | "pl";
};

export default function AddListingPage({ language }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [brand, setBrand] = useState("");
  const [yarnName, setYarnName] = useState("");
  const [color, setColor] = useState("");
  const [dyelot, setDyelot] = useState("");
  const [skeins, setSkeins] = useState("");
  const [country, setCountry] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!session?.user) {
      setMessage(t.authError);
      return;
    }

    const skeinsCount = Number.parseInt(skeins, 10);

    if (
      !brand.trim() ||
      !yarnName.trim() ||
      !color.trim() ||
      !dyelot.trim() ||
      !country.trim() ||
      !listingUrl.trim()
    ) {
      setMessage(t.requiredError);
      return;
    }

    if (!Number.isFinite(skeinsCount) || skeinsCount < 1) {
      setMessage(t.skeinsError);
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(listingUrl.trim());
    } catch {
      setMessage(t.urlError);
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setMessage(t.urlError);
      return;
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const type = hostname.includes("olx") ? "olx" : "vinted";

    setIsSubmitting(true);

    const { error } = await supabase.from("listings").insert({
      brand: brand.trim(),
      yarn_name: yarnName.trim(),
      color: color.trim(),
      dyelot: dyelot.trim(),
      skeins: skeinsCount,
      country: country.trim(),
      contact: parsedUrl.toString(),
      status: "active",
      type,
      user_id: session.user.id,
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message || t.genericError);
      return;
    }

    setBrand("");
    setYarnName("");
    setColor("");
    setDyelot("");
    setSkeins("");
    setCountry("");
    setListingUrl("");
    setMessage(t.success);
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
          listingUrl: "Link do ogłoszenia",
          listingUrlPlaceholder:
            "https://www.vinted.pl/... albo https://www.olx.pl/...",
          listingUrlHelp:
            "Wklej link do miejsca, gdzie kupująca może dokończyć zakup.",
          publish: "Opublikuj ogłoszenie",
          publishing: "Publikowanie...",
          requiredError: "Uzupełnij wszystkie pola formularza.",
          skeinsError: "Liczba motków musi być większa od zera.",
          urlError: "Podaj poprawny link do ogłoszenia.",
          authError: "Musisz być zalogowana lub zalogowany.",
          success: "Ogłoszenie zostało dodane.",
          genericError: "Nie udało się dodać ogłoszenia. Spróbuj ponownie.",
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
          listingUrl: "Listing link",
          listingUrlPlaceholder:
            "https://www.vinted.pl/... or https://www.olx.pl/...",
          listingUrlHelp:
            "Paste the link where the buyer can complete the purchase.",
          publish: "Publish listing",
          publishing: "Publishing...",
          requiredError: "Please fill in all form fields.",
          skeinsError: "Number of skeins must be greater than zero.",
          urlError: "Please enter a valid listing link.",
          authError: "You must be signed in.",
          success: "Your listing has been added.",
          genericError: "Could not add the listing. Please try again.",
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

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div>
            <label htmlFor="brand" className="mb-2 block font-medium">
              {t.brand}
            </label>
            <input
              id="brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className="w-full rounded-2xl border p-4"
              required
            />
          </div>

          <div>
            <label htmlFor="yarnName" className="mb-2 block font-medium">
              {t.yarn}
            </label>
            <input
              id="yarnName"
              value={yarnName}
              onChange={(event) => setYarnName(event.target.value)}
              className="w-full rounded-2xl border p-4"
              required
            />
          </div>

          <div>
            <label htmlFor="color" className="mb-2 block font-medium">
              {t.color}
            </label>
            <input
              id="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="w-full rounded-2xl border p-4"
              required
            />
          </div>

          <div>
            <label htmlFor="dyelot" className="mb-2 block font-medium">
              {t.dyelot}
            </label>
            <input
              id="dyelot"
              value={dyelot}
              onChange={(event) => setDyelot(event.target.value)}
              className="w-full rounded-2xl border p-4"
              required
            />
          </div>

          <div>
            <label htmlFor="skeins" className="mb-2 block font-medium">
              {t.skeins}
            </label>
            <input
              id="skeins"
              type="number"
              min="1"
              value={skeins}
              onChange={(event) => setSkeins(event.target.value)}
              className="w-full rounded-2xl border p-4"
              required
            />
          </div>

          <div>
            <label htmlFor="country" className="mb-2 block font-medium">
              {t.country}
            </label>
            <input
              id="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="w-full rounded-2xl border p-4"
              required
            />
          </div>

          <div>
            <label htmlFor="listingUrl" className="mb-2 block font-medium">
              {t.listingUrl}
            </label>
            <input
              id="listingUrl"
              type="url"
              value={listingUrl}
              onChange={(event) => setListingUrl(event.target.value)}
              placeholder={t.listingUrlPlaceholder}
              className="w-full rounded-2xl border p-4"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              {t.listingUrlHelp}
            </p>
          </div>

          {message ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-gray-600">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-[#90A885] px-8 py-4 text-white disabled:opacity-60"
          >
            {isSubmitting ? t.publishing : t.publish}
          </button>
        </form>
      </section>
    </main>
  );
}
