"use client";
/* eslint-disable @next/next/no-img-element -- profile avatars are user-provided remote URLs */

import Link from "next/link";
import { Loader2, Package, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthCallbackRedirectTo } from "./authRedirect";
import { supabase } from "./supabase";

type PublicProfile = { user_id: string; username: string; avatar_url: string | null };
type Listing = { id: number; brand: string | null; yarn_name: string | null; color: string | null; dyelot: string | null; skeins: number | null; listing_type: "offer" | "wanted" | null };

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export default function ProfilePage({ username, language }: { username: string; language: "en" | "pl" }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [offers, setOffers] = useState<Listing[]>([]);
  const [wanted, setWanted] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const t = language === "pl"
    ? { title: "Profil użytkownika", offers: "Aktywne oferty", wanted: "Szukam włóczki", emptyOffers: "Brak aktywnych ofert.", emptyWanted: "Brak aktywnych wpisów „Szukam”.", missing: "Nie znaleziono tego profilu.", login: "Przenosimy do logowania…", error: "Nie udało się pobrać profilu.", browse: "Szukaj użytkowników", open: "Zobacz ofertę" }
    : { title: "User profile", offers: "Active listings", wanted: "Looking for yarn", emptyOffers: "No active listings yet.", emptyWanted: "No active yarn requests yet.", missing: "This profile was not found.", login: "Taking you to sign in…", error: "Could not load this profile.", browse: "Find users", open: "View listing" };
  const normalizedUsername = username.toLowerCase();
  const profileHref = language === "pl" ? `/profile/${normalizedUsername}` : `/en/profile/${normalizedUsername}`;

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!USERNAME_PATTERN.test(normalizedUsername)) {
        if (mounted) { setError(t.missing); setLoading(false); }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        const { error: loginError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: getAuthCallbackRedirectTo(profileHref) },
        });
        if (mounted && loginError) { setError(t.error); setLoading(false); }
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .eq("username", normalizedUsername)
        .maybeSingle<PublicProfile>();

      if (!mounted) return;
      if (profileError) { setError(t.error); setLoading(false); return; }
      if (!profileData) { setError(t.missing); setLoading(false); return; }

      const [offersResult, wantedResult] = await Promise.all([
        supabase.from("listings").select("id, brand, yarn_name, color, dyelot, skeins, listing_type").eq("user_id", profileData.user_id).eq("listing_type", "offer").eq("status", "available").order("created_at", { ascending: false }).returns<Listing[]>(),
        supabase.from("listings").select("id, brand, yarn_name, color, dyelot, skeins, listing_type").eq("user_id", profileData.user_id).eq("listing_type", "wanted").eq("status", "available").order("created_at", { ascending: false }).returns<Listing[]>(),
      ]);

      if (!mounted) return;
      if (offersResult.error || wantedResult.error) { setError(t.error); setLoading(false); return; }
      setProfile(profileData);
      setOffers(offersResult.data ?? []);
      setWanted(wantedResult.data ?? []);
      setLoading(false);
    }

    void load();
    return () => { mounted = false; };
  }, [normalizedUsername, profileHref, t.error, t.missing]);

  if (loading) return <main className="min-h-screen bg-[#F7F4FB] px-4 py-10 text-[#17142E] sm:px-6"><section className="mx-auto flex max-w-5xl items-center gap-3 rounded-2xl bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)]"><Loader2 className="animate-spin text-[#7438B7]" size={20} />{t.login}</section></main>;
  if (error || !profile) return <main className="min-h-screen bg-[#F7F4FB] px-4 py-10 text-[#17142E] sm:px-6"><section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-[0_18px_55px_rgba(51,36,82,0.09)]"><UserRound className="mx-auto text-[#7438B7]" size={30} /><p className="mt-4 text-[#6E6582]">{error || t.missing}</p><Link href={language === "pl" ? "/users" : "/en/users"} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white">{t.browse}</Link></section></main>;

  return <main className="min-h-screen bg-[#F7F4FB] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12"><section className="mx-auto max-w-5xl"><div className="rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-8"><div className="flex items-center gap-4">{profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4EEF9] text-[#7438B7]"><UserRound size={28} /></span>}<div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">{t.title}</p><h1 className="mt-1 text-3xl font-bold">{profile.username}</h1></div></div></div><ProfileListings title={t.offers} empty={t.emptyOffers} items={offers} language={language} actionLabel={t.open} /><ProfileListings title={t.wanted} empty={t.emptyWanted} items={wanted} language={language} actionLabel={t.open} wanted /></section></main>;
}

function ProfileListings({ title, empty, items, language, actionLabel, wanted = false }: { title: string; empty: string; items: Listing[]; language: "en" | "pl"; actionLabel: string; wanted?: boolean }) {
  return <section className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)]"><h2 className="text-2xl font-bold">{title}</h2>{items.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-xl bg-[#FAF8FC] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.brand ?? "-"}</h3><p className="mt-1 text-sm font-semibold text-[#332B4D]">{item.yarn_name ?? "-"}</p></div><Package className="shrink-0 text-[#7438B7]" size={19} /></div><p className="mt-3 text-sm text-[#6E6582]">{item.color ?? "-"}{item.dyelot ? ` · ${item.dyelot}` : ""}{item.skeins ? ` · ${item.skeins}` : ""}</p>{wanted ? null : <Link href={language === "pl" ? `/listing/${item.id}` : `/en/listing/${item.id}`} className="mt-4 inline-flex text-sm font-semibold text-[#7438B7]">{actionLabel}</Link>}</article>)}</div> : <p className="mt-4 rounded-xl bg-[#FAF8FC] p-5 text-sm text-[#6E6582]">{empty}</p>}</section>;
}
