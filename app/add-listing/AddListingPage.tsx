"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, UserRound } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { getAuthCallbackRedirectTo } from "../authRedirect";

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
      options: {
        redirectTo: getAuthCallbackRedirectTo(),
      },
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
          back: "Wróć do strony głównej",
          title: "Dodaj ogłoszenie",
          subtitle:
            "Wpisz dane włóczki, której szukasz lub którą chcesz oddać albo sprzedać.",
          loginTitle: "Aby dodać ogłoszenie, zaloguj się przez Google.",
          loginHint:
            "Po zalogowaniu wróć do formularza i uzupełnij szczegóły włóczki.",
          loginButton: "Zaloguj przez Google",
          brand: "Marka",
          yarn: "Nazwa włóczki",
          color: "Kolor",
          dyelot: "Dye lot",
          skeins: "Liczba motków",
          country: "Kraj / lokalizacja",
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
          back: "Back to homepage",
          title: "Add listing",
          subtitle:
            "Enter the yarn details you are looking for or want to pass on or sell.",
          loginTitle: "Sign in with Google to add a listing.",
          loginHint:
            "After signing in, return to the form and add your yarn details.",
          loginButton: "Continue with Google",
          brand: "Brand",
          yarn: "Yarn name",
          color: "Color",
          dyelot: "Dye lot",
          skeins: "Number of skeins",
          country: "Country / location",
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

  const homeHref = language === "pl" ? "/pl" : "/en";

  return (
    <main className="min-h-screen bg-[#F7F4FB] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12">
      <section className="mx-auto max-w-3xl">
        <Link
          href={homeHref}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#6C5A86] shadow-[0_10px_28px_rgba(51,36,82,0.07)] transition hover:text-[#7438B7]"
        >
          <ArrowLeft size={17} />
          {t.back}
        </Link>

        <div className="mt-5 rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
            Dyeloty
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6E6582] sm:text-base">
            {t.subtitle}
          </p>

          {!session ? (
            <div className="mt-8 rounded-2xl bg-[#FAF8FC] p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#7438B7] shadow-sm">
                <UserRound size={25} />
              </div>
              <h2 className="mt-4 text-xl font-bold">{t.loginTitle}</h2>
              <p className="mt-2 text-sm text-[#6E6582]">{t.loginHint}</p>
              <button
                onClick={handleLogin}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-6 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.28)] transition hover:bg-[#622CA2]"
              >
                {t.loginButton}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <FormField id="brand" label={t.brand} value={brand} onChange={setBrand} />
              <FormField id="yarnName" label={t.yarn} value={yarnName} onChange={setYarnName} />
              <FormField id="color" label={t.color} value={color} onChange={setColor} />
              <FormField id="dyelot" label={t.dyelot} value={dyelot} onChange={setDyelot} />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  id="skeins"
                  label={t.skeins}
                  value={skeins}
                  onChange={setSkeins}
                  type="number"
                  min="1"
                />
                <FormField id="country" label={t.country} value={country} onChange={setCountry} />
              </div>

              <div>
                <label htmlFor="listingUrl" className="mb-2 block text-sm font-semibold text-[#514A67]">
                  {t.listingUrl}
                </label>
                <input
                  id="listingUrl"
                  type="url"
                  value={listingUrl}
                  onChange={(event) => setListingUrl(event.target.value)}
                  placeholder={t.listingUrlPlaceholder}
                  className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition placeholder:text-[#9489AA] focus:border-[#A875D2]"
                  required
                />
                <p className="mt-2 text-sm text-[#6E6582]">{t.listingUrlHelp}</p>
              </div>

              {message ? (
                <p className="rounded-2xl bg-[#FAF8FC] p-4 text-sm text-[#514A67]">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#7438B7] px-8 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.28)] transition hover:bg-[#622CA2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {isSubmitting ? t.publishing : t.publish}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  type = "text",
  min,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#514A67]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition placeholder:text-[#9489AA] focus:border-[#A875D2]"
        required
      />
    </div>
  );
}
