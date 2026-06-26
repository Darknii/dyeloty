"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Eye, Loader2, Package, Trash2, UserRound } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";

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
      setIsAuthLoading(false);

      if (session?.user) {
        void loadListings(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

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
    });
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

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-[#F7F4FB] px-4 py-12 text-[#17142E]">
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
        <div className="rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
            Dyeloty
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Moje konto</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6E6582] sm:text-base">
            Zarządzasz ogłoszeniami jako{" "}
            <span className="font-semibold text-[#332B4D]">
              {session.user.email ?? "zalogowany użytkownik"}
            </span>
            .
          </p>
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
                          <span className="rounded-full bg-[#F4EEF9] px-3 py-1 text-xs font-semibold text-[#7438B7]">
                            {listing.status === "active" ? "Aktywne" : listing.status}
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

                    <div className="grid grid-cols-2 gap-2 sm:flex lg:justify-end">
                      <Link
                        href={`/listing/${listing.id}?from=account`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#7438B7] transition hover:bg-[#F6F0FB]"
                      >
                        <Eye size={17} />
                        Zobacz
                      </Link>
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
