"use client";
/* eslint-disable @next/next/no-img-element -- avatar and project images are signed Supabase Storage URLs */

import Link from "next/link";
import { Loader2, Package, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import StartConversationButton from "./StartConversationButton";
import { getAuthCallbackRedirectTo } from "./authRedirect";
import { getProfileAvatarUrl } from "./profileAvatars";
import { getProjectImageUrl } from "./projectImages";
import { PROFILE_FIBRE_OPTIONS, PROFILE_PREFERENCE_OPTIONS, PROFILE_VIBE_OPTIONS, profileOptionLabels, type ProfileDetails } from "./profileDetails";
import { supabase } from "./supabase";

type Profile = ProfileDetails & { user_id: string; username: string; avatar_url: string | null; bio: string | null; created_at: string };
type Listing = { id: number; brand: string | null; yarn_name: string | null; color: string | null; dyelot: string | null; skeins: number | null };
type Project = { id: number; title: string; description: string | null; yarn_name: string | null; yarn_brand: string | null; image_url: string; image_display_url?: string | null };
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;

export default function ProfilePage({ username, language }: { username: string; language: "en" | "pl" }) {
  const [profile, setProfile] = useState<Profile | null>(null); const [avatarUrl, setAvatarUrl] = useState<string | null>(null); const [offers, setOffers] = useState<Listing[]>([]); const [wanted, setWanted] = useState<Listing[]>([]); const [projects, setProjects] = useState<Project[]>([]); const [ownProfile, setOwnProfile] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const t = language === "pl" ? { title: "Profil", projects: "Moje projekty", offers: "Mam włóczkę", wanted: "Szukam włóczki", projectsEmpty: "Brak projektów do pokazania.", offersEmpty: "Brak aktywnych ofert.", wantedEmpty: "Brak aktywnych wpisów „Szukam”.", missing: "Nie znaleziono tego profilu.", login: "Przenosimy do logowania…", error: "Nie udało się pobrać profilu.", browse: "Szukaj użytkowników", open: "Zobacz ofertę", projectsStat: "projektów", offersStat: "ofert", wantedStat: "szuka", preferences: "Najchętniej dzierga", fibres: "Ulubione włókna", vibes: "Dziewiarski vibe", since: "Dzierga od", founder: "Założycielka Dyelotów", team: "Dyeloty Team", about: "O Dyelotach" } : { title: "Profile", projects: "My projects", offers: "Listings", wanted: "Looking for yarn", projectsEmpty: "No projects to show yet.", offersEmpty: "No active listings.", wantedEmpty: "No active yarn requests.", missing: "This profile was not found.", login: "Taking you to sign in…", error: "Could not load this profile.", browse: "Find users", open: "View listing", projectsStat: "projects", offersStat: "listings", wantedStat: "requests", preferences: "I love knitting", fibres: "Favourite fibres", vibes: "Knitting vibe", since: "Knitting since", founder: "Dyeloty Founder", team: "Dyeloty Team", about: "About Dyeloty" };
  const requestedUsername = username.trim(); const profileHref = language === "pl" ? `/profile/${encodeURIComponent(requestedUsername)}` : `/en/profile/${encodeURIComponent(requestedUsername)}`;

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!USERNAME_PATTERN.test(requestedUsername)) {
        if (mounted) {
          setError(t.missing);
          setLoading(false);
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        const { error: loginError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: getAuthCallbackRedirectTo(profileHref) },
        });
        if (mounted && loginError) {
          console.error("Could not start profile sign-in", loginError);
          setError(t.error);
          setLoading(false);
        }
        return;
      }

      const escapedUsername = requestedUsername.replace(/([\\%_])/g, "\\$1");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, bio, knitting_preferences, favorite_fibres, knitting_since, knitting_vibes, role, created_at")
        .ilike("username", escapedUsername)
        .maybeSingle<Profile>();

      if (!mounted) return;
      if (profileError || !profileData) {
        if (profileError) console.error("Could not load profile", { username: requestedUsername, error: profileError });
        setError(profileError ? t.error : t.missing);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setOwnProfile(session.user.id === profileData.user_id);
      setLoading(false);

      const [offersResult, wantedResult, projectsResult, signedAvatarUrl] = await Promise.all([
        supabase.from("listings").select("id, brand, yarn_name, color, dyelot, skeins").eq("user_id", profileData.user_id).eq("listing_type", "offer").eq("status", "available").order("created_at", { ascending: false }).returns<Listing[]>(),
        supabase.from("listings").select("id, brand, yarn_name, color, dyelot, skeins").eq("user_id", profileData.user_id).eq("listing_type", "wanted").eq("status", "available").order("created_at", { ascending: false }).returns<Listing[]>(),
        supabase.from("projects").select("id, title, description, yarn_name, yarn_brand, image_url").eq("user_id", profileData.user_id).order("created_at", { ascending: false }).returns<Project[]>(),
        getProfileAvatarUrl(profileData.avatar_url),
      ]);

      if (!mounted) return;
      setAvatarUrl(signedAvatarUrl);

      if (offersResult.error) {
        console.error("Could not load profile offers", { userId: profileData.user_id, error: offersResult.error });
      } else {
        setOffers(offersResult.data ?? []);
      }

      if (wantedResult.error) {
        console.error("Could not load profile yarn requests", { userId: profileData.user_id, error: wantedResult.error });
      } else {
        setWanted(wantedResult.data ?? []);
      }

      if (projectsResult.error) {
        console.error("Could not load profile projects", { userId: profileData.user_id, error: projectsResult.error });
        return;
      }

      const projectCards = await Promise.all(
        (projectsResult.data ?? []).map(async (project) => ({
          ...project,
          image_display_url: await getProjectImageUrl(project.image_url),
        })),
      );
      if (mounted) setProjects(projectCards);
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [profileHref, requestedUsername, t.error, t.missing]);

  if (loading) return <main className="min-h-screen bg-[#F7F4FB] px-4 py-10 text-[#17142E] sm:px-6"><section className="mx-auto flex max-w-5xl items-center gap-3 rounded-2xl bg-white p-6"><Loader2 className="animate-spin text-[#7438B7]" size={20} />{t.login}</section></main>;
  if (error || !profile) return <main className="min-h-screen bg-[#F7F4FB] px-4 py-10 text-[#17142E] sm:px-6"><section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center"><UserRound className="mx-auto text-[#7438B7]" size={30} /><p className="mt-4 text-[#6E6582]">{error || t.missing}</p><Link href={language === "pl" ? "/users" : "/en/users"} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white">{t.browse}</Link></section></main>;
  return <main className="min-h-screen bg-[#F7F4FB] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12"><section className="mx-auto max-w-5xl"><div className="rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-8"><div className="flex flex-wrap items-center gap-4">{avatarUrl ? <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover ring-4 ring-[#F4EEF9]" /> : <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F4EEF9] text-[#7438B7]"><UserRound size={32} /></span>}<div className="min-w-0 flex-1"><p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">{t.title}</p><div className="mt-1 flex flex-wrap items-center gap-2"><h1 className="break-words text-3xl font-bold">{profile.username}</h1>{profile.role !== "user" ? <span className="rounded-full bg-[#F4EEF9] px-3 py-1 text-xs font-semibold text-[#7438B7]">{profile.role === "founder" ? t.founder : t.team}</span> : null}</div>{profile.bio ? <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-[#6E6582]">{profile.bio}</p> : null}</div>{!ownProfile ? <StartConversationButton recipientId={profile.user_id} language={language} /> : null}</div><ProfileTags label={t.preferences} values={profileOptionLabels(profile.knitting_preferences ?? [], language, PROFILE_PREFERENCE_OPTIONS)} /><ProfileTags label={t.fibres} values={profileOptionLabels(profile.favorite_fibres ?? [], language, PROFILE_FIBRE_OPTIONS)} /><ProfileTags label={t.vibes} values={profileOptionLabels(profile.knitting_vibes ?? [], language, PROFILE_VIBE_OPTIONS)} />{profile.knitting_since ? <p className="mt-3 text-sm text-[#6E6582]"><span className="font-semibold text-[#514A67]">{t.since}:</span> {profile.knitting_since}</p> : null}{profile.role === "founder" ? <Link href={language === "pl" ? "/about" : "/en/about"} className="mt-4 inline-flex text-sm font-semibold text-[#7438B7]">{t.about}</Link> : null}<dl className="mt-6 grid grid-cols-3 gap-3"><Stat value={projects.length} label={t.projectsStat} /><Stat value={offers.length} label={t.offersStat} /><Stat value={wanted.length} label={t.wantedStat} /></dl></div><ProjectGallery title={t.projects} empty={t.projectsEmpty} items={projects} /><ListingSection title={t.offers} empty={t.offersEmpty} items={offers} language={language} actionLabel={t.open} /><ListingSection title={t.wanted} empty={t.wantedEmpty} items={wanted} language={language} actionLabel={t.open} wanted /></section></main>;
}

function ProfileTags({ label, values }: { label: string; values: string[] }) { if (!values.length) return null; return <div className="mt-4"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#8A7A9D]">{label}</p><div className="flex flex-wrap gap-2">{values.map((value) => <span key={value} className="rounded-full bg-[#F4EEF9] px-3 py-1.5 text-sm font-medium text-[#5E2D93]">{value}</span>)}</div></div>; }

function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-xl bg-[#FAF8FC] p-3 text-center"><dd className="text-xl font-bold">{value}</dd><dt className="text-xs text-[#6E6582]">{label}</dt></div>; }
function ProjectGallery({ title, empty, items }: { title: string; empty: string; items: Project[] }) { return <section className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)]"><h2 className="text-2xl font-bold">{title}</h2>{items.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-xl bg-[#FAF8FC]"><div className="h-44 bg-[#F4EEF9]">{item.image_display_url ? <img src={item.image_display_url} alt="" className="h-full w-full object-cover" /> : null}</div><div className="p-4"><h3 className="font-bold">{item.title}</h3>{item.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#6E6582]">{item.description}</p> : null}{item.yarn_brand || item.yarn_name ? <p className="mt-2 text-sm text-[#6E6582]">{[item.yarn_brand, item.yarn_name].filter(Boolean).join(" · ")}</p> : null}</div></article>)}</div> : <p className="mt-4 rounded-xl bg-[#FAF8FC] p-5 text-sm text-[#6E6582]">{empty}</p>}</section>; }
function ListingSection({ title, empty, items, language, actionLabel, wanted = false }: { title: string; empty: string; items: Listing[]; language: "en" | "pl"; actionLabel: string; wanted?: boolean }) { return <section className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)]"><h2 className="text-2xl font-bold">{title}</h2>{items.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-xl bg-[#FAF8FC] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.brand ?? "-"}</h3><p className="mt-1 text-sm font-semibold text-[#332B4D]">{item.yarn_name ?? "-"}</p></div><Package className="shrink-0 text-[#7438B7]" size={19} /></div><p className="mt-3 text-sm text-[#6E6582]">{item.color ?? "-"}{item.dyelot ? ` · ${item.dyelot}` : ""}{item.skeins ? ` · ${item.skeins}` : ""}</p>{wanted ? null : <Link href={language === "pl" ? `/listing/${item.id}` : `/en/listing/${item.id}`} className="mt-4 inline-flex text-sm font-semibold text-[#7438B7]">{actionLabel}</Link>}</article>)}</div> : <p className="mt-4 rounded-xl bg-[#FAF8FC] p-5 text-sm text-[#6E6582]">{empty}</p>}</section>; }
