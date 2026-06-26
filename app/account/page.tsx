"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Eye,
  Loader2,
  Package,
  Trash2,
  UserRound,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { getAuthCallbackRedirectTo } from "../authRedirect";

type Listing = {
  id: string;
  created_at: string | null;
  brand: string | null;
  yarn_name: string | null;
  color: string | null;
  dyelot: string | null;
  skeins: number | null;
  country: string | null;
  status: string | null;
};

export default function AccountPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const loadListings = useCallback(async (userId: string) => {
    setIsListingsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("listings")
      .select("id, created_at, brand, yarn_name, color, dyelot, skeins, country, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<Listing[]>();

    setIsListingsLoading(false);

    if (error) {
      setErrorMessage(error.message || "Nie udało się pobrać ogłoszeń.");
      return;
    }

    setListings(data ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setDisplayName(getSessionDisplayName(session));
      setIsAuthLoading(false);

      if (session?.user) {
        void loadListings(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setDisplayName(getSessionDisplayName(session));

      if (session?.user) {
        void loadListings(session.user.id);
      } else {
        setListings([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadListings]);

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackRedirectTo(),
      },
    });
  }

  async function handleSaveDisplayName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSavingName(true);
    setProfileMessage("");

    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: displayName.trim(),
      },
    });

    setIsSavingName(false);

    if (error) {
      setProfileMessage(error.message || "Nie udało się zapisać nazwy.");
      return;
    }

    setSession((currentSession) =>
      currentSession && data.user
        ? {
            ...currentSession,
            user: data.user,
          }
        : currentSession,
    );
    setProfileMessage("Nazwa została zapisana.");
  }

  async function handleDelete(listingId: string) {
    if (!session?.user) {
      return;
    }

    const confirmed = window.confirm("Czy na pewno chcesz usunąć to ogłoszenie?");

    if (!confirmed) {
      return;
    }

    setDeletingId(listingId);
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)
      .eq("user_id", session.user.id);

    setDeletingId(null);

    if (error) {
      setErrorMessage(error.message || "Nie udało się usunąć ogłoszenia.");
      return;
    }

    await loadListings(session.user.id);
  }

  async function handleMarkAsSold(listingId: string) {
    if (!session?.user) {
      return;
    }

    const confirmed = window.confirm(
      "Czy na pewno chcesz oznaczyć to ogłoszenie jako sprzedane?",
    );

    if (!confirmed) {
      return;
    }

    setUpdatingStatusId(listingId);
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ status: "sold" })
      .eq("id", listingId)
      .eq("user_id", session.user.id);

    setUpdatingStatusId(null);

    if (error) {
      setErrorMessage(error.message || "Nie udało się zmienić statusu ogłoszenia.");
      return;
    }

    await loadListings(session.user.id);
  }

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-[#F7F4FB] px-4 py-12 text-[#17142E]">
        <div className="mx-auto mb-5 max-w-5xl">
          <BackHomeLink />
        </div>
        <section className="mx-auto max-w-5xl rounded-2xl border border-[#E8E1F0] bg-white p-8 shadow-[0_18px_55px_rgba(51,36,82,0.09)]">
          <div className="flex items-center gap-3 text-[#6E6582]">
            <Loader2 className="animate-spin text-[#7438B7]" size={22} />
            Ładowanie konta...
          </div>
        </section>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-[#F7F4FB] px-4 py-12 text-[#17142E]">
        <div className="mx-auto mb-5 max-w-2xl">
          <BackHomeLink />
        </div>
        <section className="mx-auto max-w-2xl rounded-2xl border border-[#E8E1F0] bg-white p-8 text-center shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4EEF9] text-[#7438B7]">
            <UserRound size={25} />
          </div>
          <h1 className="mt-5 text-3xl font-bold">Moje konto</h1>
          <p className="mt-3 text-[#6E6582]">
            Zaloguj się przez Google, aby zobaczyć i zarządzać swoimi ogłoszeniami.
          </p>
          <button
            onClick={handleLogin}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-6 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.28)] transition hover:bg-[#622CA2]"
          >
            Zaloguj się
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F4FB] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-5">
          <BackHomeLink />
        </div>

        <div className="rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
            Dyeloty
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Moje konto</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6E6582] sm:text-base">
            Zarządzasz ogłoszeniami jako{" "}
            <span className="font-semibold text-[#332B4D]">
              {displayName || session.user.email || "zalogowany użytkownik"}
            </span>
            .
          </p>

          <form onSubmit={handleSaveDisplayName} className="mt-6 max-w-xl">
            <label htmlFor="displayName" className="mb-2 block text-sm font-semibold text-[#514A67]">
              Nazwa widoczna w aplikacji
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                id="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="np. Kasia z Krakowa"
                className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition placeholder:text-[#9489AA] focus:border-[#A875D2]"
              />
              <button
                type="submit"
                disabled={isSavingName}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F4EEF9] px-5 text-sm font-semibold text-[#7438B7] transition hover:bg-[#EDE2F8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingName ? <Loader2 className="animate-spin" size={17} /> : null}
                Zapisz
              </button>
            </div>
            {profileMessage ? (
              <p className="mt-2 text-sm text-[#6E6582]">{profileMessage}</p>
            ) : null}
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-4 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Moje ogłoszenia</h2>
              <p className="mt-1 text-sm text-[#6E6582]">
                Widzisz tylko ogłoszenia przypisane do Twojego konta.
              </p>
            </div>
            <Link
              href="/add-listing/pl"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F4EEF9] px-5 text-sm font-semibold text-[#7438B7] transition hover:bg-[#EDE2F8]"
            >
              Dodaj ogłoszenie
            </Link>
          </div>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {isListingsLoading ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#FAF8FC] p-5 text-sm text-[#6E6582]">
              <Loader2 className="animate-spin text-[#7438B7]" size={20} />
              Ładowanie ogłoszeń...
            </div>
          ) : listings.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-[#FAF8FC] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#7438B7] shadow-sm">
                <Package size={24} />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Nie masz jeszcze ogłoszeń.</h3>
              <p className="mt-2 text-sm text-[#6E6582]">
                Po dodaniu włóczki pojawi się tutaj.
              </p>
              <Link
                href="/add-listing/pl"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2]"
              >
                Dodaj pierwsze ogłoszenie
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {listings.map((listing) => (
                <article
                  key={listing.id}
                  className="rounded-2xl border border-[#E8E1F0] bg-[#FFFEFF] p-4 shadow-[0_10px_28px_rgba(51,36,82,0.06)] sm:p-5"
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-xl font-bold text-[#17142E]">
                          {listing.brand ?? "-"}
                        </h3>
                        {listing.status ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(listing.status)}`}
                          >
                            {getStatusLabel(listing.status)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#332B4D]">
                        {listing.yarn_name ?? "-"}
                      </p>

                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <AccountFact label="Kolor" value={listing.color} />
                        <AccountFact label="Dye lot" value={listing.dyelot} />
                        <AccountFact
                          label="Motki"
                          value={listing.skeins === null ? null : String(listing.skeins)}
                        />
                        <AccountFact label="Lokalizacja" value={listing.country} />
                      </dl>

                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#6E6582]">
                        <CalendarDays size={15} className="text-[#7438B7]" />
                        Dodane {formatDate(listing.created_at)}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:flex lg:justify-end">
                      <Link
                        href={`/listing/${listing.id}?from=account`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#7438B7] transition hover:bg-[#F6F0FB]"
                      >
                        <Eye size={17} />
                        Zobacz
                      </Link>
                      {listing.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => void handleMarkAsSold(listing.id)}
                          disabled={updatingStatusId === listing.id}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#7438B7] transition hover:bg-[#F6F0FB] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingStatusId === listing.id ? (
                            <Loader2 className="animate-spin" size={17} />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}
                          Oznacz jako sprzedane
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void handleDelete(listing.id)}
                        disabled={deletingId === listing.id}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === listing.id ? (
                          <Loader2 className="animate-spin" size={17} />
                        ) : (
                          <Trash2 size={17} />
                        )}
                        Usuń
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function BackHomeLink() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#6C5A86] shadow-[0_10px_28px_rgba(51,36,82,0.07)] transition hover:text-[#7438B7]"
    >
      <ArrowLeft size={17} />
      Wróć do strony głównej
    </Link>
  );
}

function AccountFact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0 rounded-xl bg-[#FAF8FC] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8A7A9D]">
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-[#332B4D]">{value ?? "-"}</dd>
    </div>
  );
}

function getStatusLabel(status: string | null) {
  if (status === "active") {
    return "Aktywne";
  }

  if (status === "sold") {
    return "Sprzedane";
  }

  if (status === "found") {
    return "Znalezione";
  }

  if (status === "inactive") {
    return "Nieaktywne";
  }

  return status ?? "-";
}

function getStatusClassName(status: string | null) {
  if (status === "active") {
    return "bg-[#DDF7E9] text-[#287A4D]";
  }

  return "bg-[#F4EEF9] text-[#7438B7]";
}

function getSessionDisplayName(session: Session | null) {
  const value =
    session?.user?.user_metadata?.display_name ??
    session?.user?.user_metadata?.name ??
    "";

  return typeof value === "string" ? value : "";
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
