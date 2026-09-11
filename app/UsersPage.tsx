"use client";
/* eslint-disable @next/next/no-img-element -- avatar URLs are short-lived Supabase Storage signed URLs */

import Link from "next/link";
import { Loader2, Search, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthCallbackRedirectTo } from "./authRedirect";
import { getProfileAvatarUrl } from "./profileAvatars";
import { supabase } from "./supabase";

type ProfileResult = { username: string; avatar_url: string | null; bio: string | null; avatar_display_url?: string | null };

export default function UsersPage({ language }: { language: "en" | "pl" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const t = language === "pl" ? { title: "Znajdź użytkownika", intro: "Szukaj po nazwie użytkownika.", placeholder: "np. Kinga_dzierga", login: "Przenosimy do logowania…", empty: "Wpisz co najmniej 2 znaki, aby wyszukać użytkownika.", noResults: "Nie znaleziono użytkowników.", error: "Nie udało się wyszukać użytkowników.", profile: "Zobacz profil" } : { title: "Find a user", intro: "Search by username.", placeholder: "e.g. Kinga_knits", login: "Taking you to sign in…", empty: "Type at least 2 characters to search users.", noResults: "No users found.", error: "Could not search users.", profile: "View profile" };
  const usersHref = language === "pl" ? "/users" : "/en/users";

  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { if (mounted) setLoading(false); return; }
      const { error: loginError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: getAuthCallbackRedirectTo(usersHref) } });
      if (mounted && loginError) { setError(t.error); setLoading(false); }
    }
    void checkSession();
    return () => { mounted = false; };
  }, [t.error, usersHref]);

  useEffect(() => {
    const term = query.trim().replace(/[^A-Za-z0-9_]/g, "");
    if (loading || term.length < 2) return;
    let mounted = true;
    const timeoutId = window.setTimeout(async () => {
      setSearching(true); setError("");
      const searchPattern = `%${term.replace(/_/g, "\\_")}%`;
      const { data, error: searchError } = await supabase.from("profiles").select("username, avatar_url, bio").ilike("username", searchPattern).order("username").limit(20).returns<ProfileResult[]>();
      if (!mounted) return;
      if (searchError) { setSearching(false); setError(t.error); return; }
      const profiles = await Promise.all((data ?? []).map(async (profile) => ({ ...profile, avatar_display_url: await getProfileAvatarUrl(profile.avatar_url) })));
      if (!mounted) return;
      setResults(profiles); setSearching(false);
    }, 200);
    return () => { mounted = false; window.clearTimeout(timeoutId); };
  }, [loading, query, t.error]);

  if (loading) return <main className="min-h-screen bg-[#F7F4FB] px-4 py-10 text-[#17142E] sm:px-6"><section className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)]"><Loader2 className="animate-spin text-[#7438B7]" size={20} />{t.login}</section></main>;
  return <main className="min-h-screen bg-[#F7F4FB] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12"><section className="mx-auto max-w-3xl rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-8"><h1 className="text-3xl font-bold">{t.title}</h1><p className="mt-2 text-[#6E6582]">{t.intro}</p><label className="mt-6 flex items-center gap-2 rounded-xl border border-[#DED6EA] px-4"><Search className="text-[#7438B7]" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.placeholder} className="min-h-12 w-full bg-transparent text-sm outline-none" /></label>{searching ? <p className="mt-5 flex items-center gap-2 text-sm text-[#6E6582]"><Loader2 className="animate-spin" size={16} />{language === "pl" ? "Szukamy…" : "Searching…"}</p> : error ? <p className="mt-5 text-sm text-red-700">{error}</p> : query.trim().length < 2 ? <p className="mt-5 text-sm text-[#6E6582]">{t.empty}</p> : results.length ? <div className="mt-5 grid gap-3">{results.map((profile) => <Link key={profile.username} href={language === "pl" ? `/profile/${encodeURIComponent(profile.username)}` : `/en/profile/${encodeURIComponent(profile.username)}`} className="flex items-center gap-3 rounded-xl bg-[#FAF8FC] p-4 transition hover:bg-[#F4EEF9]">{profile.avatar_display_url ? <img src={profile.avatar_display_url} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#7438B7]"><UserRound size={20} /></span>}<span className="min-w-0"><span className="block font-semibold">{profile.username}</span>{profile.bio ? <span className="mt-1 block truncate text-sm text-[#6E6582]">{profile.bio}</span> : null}</span><span className="ml-auto shrink-0 text-sm font-semibold text-[#7438B7]">{t.profile}</span></Link>)}</div> : <p className="mt-5 text-sm text-[#6E6582]">{t.noResults}</p>}</section></main>;
}
