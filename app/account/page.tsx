"use client";
/* eslint-disable @next/next/no-img-element -- signed avatar URLs are user-provided Storage objects */

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Heart,
  LogOut,
  Loader2,
  Package,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { getAuthCallbackRedirectTo } from "../authRedirect";
import { removeListingImageFromStorage } from "../listingImages";
import AccountProjects from "../AccountProjects";
import {
  getProfileAvatarUrl,
  isProfileAvatarFile,
  PROFILE_AVATAR_TYPES,
  removeProfileAvatar,
  uploadProfileAvatar,
} from "../profileAvatars";
import {
  LISTING_STATUS_OPTIONS,
  getListingStatusClassName,
  getListingStatusLabel,
  normalizeListingStatus,
  type ListingStatus,
} from "../listingStatus";

type Listing = {
  id: number;
  created_at: string | null;
  brand: string | null;
  yarn_name: string | null;
  color: string | null;
  dyelot: string | null;
  skeins: number | null;
  country: string | null;
  status: string | null;
  image_url: string | null;
  listing_type?: "offer" | "wanted" | null;
};

type FavoriteRow = {
  listing_id: number | string | null;
};

type PublicProfile = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
};

type AccountSection = "listings" | "favorites";

export default function AccountPage({ language = "pl" }: { language?: "en" | "pl" }) {
  const t = language === "pl" ? accountCopy.pl : accountCopy.en;
  const profileT = language === "pl"
    ? { title: "Twój profil", intro: "Ta nazwa jest widoczna w aplikacji, wyszukiwarce i adresie Twojego profilu.", username: "Nazwa użytkownika", bio: "O mnie", addPhoto: "Dodaj zdjęcie", changePhoto: "Zmień zdjęcie", save: "Zapisz profil", view: "Zobacz mój profil", format: "3–30 znaków: małe lub duże litery, cyfry albo _.", invalid: "Nazwa użytkownika musi mieć 3–30 znaków i zawierać tylko litery, cyfry albo _.", taken: "Ta nazwa użytkownika jest już zajęta.", error: "Nie udało się zapisać profilu.", saved: "Profil został zapisany.", imageError: "Wybierz plik JPG, PNG lub WebP o rozmiarze do 2 MB.", uploadError: "Nie udało się przesłać zdjęcia." }
    : { title: "Your profile", intro: "This name appears in the app, search, and your profile URL.", username: "Username", bio: "About me", addPhoto: "Add photo", changePhoto: "Change photo", save: "Save profile", view: "View my profile", format: "3–30 characters: uppercase or lowercase letters, numbers, or _.", invalid: "Username must be 3–30 characters and contain only letters, numbers, or _.", taken: "This username is already taken.", error: "Could not save the profile.", saved: "Profile saved.", imageError: "Choose a JPG, PNG, or WebP file up to 2 MB.", uploadError: "Could not upload the photo." };
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<AccountSection>(() =>
    getInitialAccountSection(),
  );
  const [listings, setListings] = useState<Listing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState(false);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [removingFavoriteId, setRemovingFavoriteId] = useState<number | null>(null);
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSavingPublicProfile, setIsSavingPublicProfile] = useState(false);
  const [publicProfileMessage, setPublicProfileMessage] = useState("");

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const loadListings = useCallback(async (userId: string) => {
    setIsListingsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("listings")
      .select("id, created_at, brand, yarn_name, color, dyelot, skeins, country, status, image_url, listing_type")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<Listing[]>();

    setIsListingsLoading(false);

    if (error) {
      console.error("Could not load account listings", error);
      setErrorMessage(t.loadListingsError);
      return;
    }

    setListings(data ?? []);
  }, [t.loadListingsError]);

  const loadFavorites = useCallback(async (userId: string) => {
    setIsFavoritesLoading(true);
    setErrorMessage("");

    const { data: favoriteRows, error: favoritesError } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .returns<FavoriteRow[]>();

    if (favoritesError) {
      setIsFavoritesLoading(false);
      console.error("Could not load favorites", favoritesError);
      setErrorMessage(t.loadFavoritesError);
      return;
    }

    const favoriteIds = (favoriteRows ?? [])
      .map((favorite) => favorite.listing_id)
      .filter((listingId): listingId is number | string => listingId !== null)
      .map((listingId) => String(listingId));

    if (favoriteIds.length === 0) {
      setFavoriteListings([]);
      setIsFavoritesLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("id, created_at, brand, yarn_name, color, dyelot, skeins, country, status, image_url, listing_type")
      .in("id", favoriteIds)
      .returns<Listing[]>();

    setIsFavoritesLoading(false);

    if (error) {
      console.error("Could not load favorite listings", error);
      setErrorMessage(t.loadFavoritesError);
      return;
    }

    const listingsById = new Map((data ?? []).map((listing) => [String(listing.id), listing]));
    setFavoriteListings(
      favoriteIds
        .map((listingId) => listingsById.get(listingId))
        .filter((listing): listing is Listing => Boolean(listing)),
    );
  }, [t.loadFavoritesError]);

  const loadPublicProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url, bio")
      .eq("user_id", userId)
      .maybeSingle<PublicProfile>();

    setPublicProfile(data ?? null);
    setUsername(data?.username ?? "");
    setBio(data?.bio ?? "");
    setAvatarPreviewUrl(await getProfileAvatarUrl(data?.avatar_url));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);

      if (session?.user) {
        void loadListings(session.user.id);
        void loadFavorites(session.user.id);
        void loadPublicProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        void loadListings(session.user.id);
        void loadFavorites(session.user.id);
        void loadPublicProfile(session.user.id);
      } else {
        setListings([]);
        setFavoriteListings([]);
        setPublicProfile(null);
        setUsername("");
        setBio("");
        setAvatarPreviewUrl(null);
        setAvatarFile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadFavorites, loadListings, loadPublicProfile]);

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackRedirectTo(language === "pl" ? "/account" : "/en/account"),
      },
    });
  }

  function handleSectionChange(section: AccountSection) {
    setActiveSection(section);

    if (typeof window !== "undefined") {
      const basePath = language === "pl" ? "/account" : "/en/account";
      const url = section === "favorites" ? `${basePath}?section=favorites` : basePath;
      window.history.replaceState(null, "", url);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Could not sign out", error);
      setErrorMessage(t.logoutError);
      return;
    }

    setSession(null);
    setListings([]);
    setFavoriteListings([]);
    window.location.href = "/";
  }

  async function handleSavePublicProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.user) return;

    const normalizedUsername = username.trim();
    if (!/^[A-Za-z0-9_]{3,30}$/.test(normalizedUsername)) {
      setPublicProfileMessage(profileT.invalid);
      return;
    }

    setIsSavingPublicProfile(true);
    setPublicProfileMessage("");
    let avatarPath = publicProfile?.avatar_url ?? null;

    if (avatarFile) {
      const uploadResult = await uploadProfileAvatar(session.user.id, avatarFile);
      if (uploadResult.error || !uploadResult.path) {
        console.error("Could not upload profile avatar", uploadResult.error);
        setIsSavingPublicProfile(false);
        setPublicProfileMessage(profileT.uploadError);
        return;
      }
      avatarPath = uploadResult.path;
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert({ user_id: session.user.id, username: normalizedUsername, avatar_url: avatarPath, bio: bio.trim() || null }, { onConflict: "user_id" })
      .select("user_id, username, avatar_url, bio")
      .single<PublicProfile>();
    setIsSavingPublicProfile(false);

    if (error || !data) {
      if (avatarFile && avatarPath) await removeProfileAvatar(avatarPath, session.user.id);
      setPublicProfileMessage(error?.code === "23505" ? profileT.taken : profileT.error);
      return;
    }

    if (avatarFile && publicProfile?.avatar_url && publicProfile.avatar_url !== avatarPath) {
      const cleanupError = await removeProfileAvatar(publicProfile.avatar_url, session.user.id);
      if (cleanupError) console.warn("Profile was updated, but old avatar cleanup failed", cleanupError);
    }

    setPublicProfile(data);
    setUsername(data.username);
    setAvatarFile(null);
    setAvatarPreviewUrl(await getProfileAvatarUrl(data.avatar_url));
    setPublicProfileMessage(profileT.saved);
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;

    if (!isProfileAvatarFile(file)) {
      setPublicProfileMessage(profileT.imageError);
      return;
    }

    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setPublicProfileMessage("");
  }

  async function handleDelete(listingId: number) {
    if (!session?.user) {
      return;
    }

    const confirmed = window.confirm(t.deleteConfirm);

    if (!confirmed) {
      return;
    }

    setDeletingId(listingId);
    setErrorMessage("");
    const deletedListing = listings.find((listing) => listing.id === listingId);

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)
      .eq("user_id", session.user.id);

    setDeletingId(null);

    if (error) {
      console.error("Could not delete listing", error);
      setErrorMessage(t.deleteError);
      return;
    }

    const cleanupError = await removeListingImageFromStorage(
      deletedListing?.image_url,
      session.user.id,
    );

    if (cleanupError) {
      console.warn("Listing was deleted, but image cleanup failed", cleanupError);
    }

    await loadListings(session.user.id);
    await loadFavorites(session.user.id);
  }

  async function handleRemoveFavorite(listingId: number) {
    if (!session?.user) {
      return;
    }

    setRemovingFavoriteId(listingId);
    setErrorMessage("");

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", session.user.id)
      .eq("listing_id", String(listingId));

    setRemovingFavoriteId(null);

    if (error) {
      console.error("Could not remove favorite", error);
      setErrorMessage(t.removeFavoriteError);
      return;
    }

    setFavoriteListings((currentListings) =>
      currentListings.filter((listing) => listing.id !== listingId),
    );
  }

  async function handleUpdateStatus(listingId: number, status: ListingStatus) {
    if (!session?.user) {
      return;
    }

    setUpdatingStatusId(listingId);
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listingId)
      .eq("user_id", session.user.id);

    setUpdatingStatusId(null);

    if (error) {
      console.error("Could not update listing status", error);
      setErrorMessage(t.statusError);
      return;
    }

    await loadListings(session.user.id);
    await loadFavorites(session.user.id);
  }

  const isFavoritesSection = activeSection === "favorites";
  const offerListings = listings.filter((listing) => listing.listing_type !== "wanted");
  const wantedListings = listings.filter((listing) => listing.listing_type === "wanted");
  const organizedListings = [...offerListings, ...wantedListings];

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-[#F7F4FB] px-4 py-12 text-[#17142E]">
        <div className="mx-auto mb-5 max-w-5xl">
          <BackHomeLink language={language} />
        </div>
        <section className="mx-auto max-w-5xl rounded-2xl border border-[#E8E1F0] bg-white p-8 shadow-[0_18px_55px_rgba(51,36,82,0.09)]">
          <div className="flex items-center gap-3 text-[#6E6582]">
            <Loader2 className="animate-spin text-[#7438B7]" size={22} />
            {t.loadingAccount}
          </div>
        </section>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-[#F7F4FB] px-4 py-12 text-[#17142E]">
        <div className="mx-auto mb-5 max-w-2xl">
          <BackHomeLink language={language} />
        </div>
        <section className="mx-auto max-w-2xl rounded-2xl border border-[#E8E1F0] bg-white p-8 text-center shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4EEF9] text-[#7438B7]">
            <UserRound size={25} />
          </div>
          <h1 className="mt-5 text-3xl font-bold">{t.account}</h1>
          <p className="mt-3 text-[#6E6582]">
            {t.loginIntro}
          </p>
          <button
            onClick={handleLogin}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-6 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.28)] transition hover:bg-[#622CA2]"
          >
            {t.login}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F4FB] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-5">
          <BackHomeLink language={language} />
        </div>

        <div className="rounded-2xl border border-[#E8E1F0] bg-white p-6 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
            Dyeloty
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t.account}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6E6582] sm:text-base">
            {profileT.intro}
          </p>

          <form onSubmit={handleSavePublicProfile} className="mt-6 max-w-xl rounded-2xl bg-[#FAF8FC] p-5">
            <h2 className="text-lg font-bold">{profileT.title}</h2>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              {avatarPreviewUrl ? <img src={avatarPreviewUrl} alt="" className="h-20 w-20 rounded-full object-cover" /> : <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#7438B7]"><UserRound size={32} /></span>}
              <label htmlFor="profileAvatar" className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-[#D8CCE7] px-5 text-sm font-semibold text-[#7438B7] transition hover:bg-[#F6F0FB]">
                {publicProfile?.avatar_url ? profileT.changePhoto : profileT.addPhoto}
                <input id="profileAvatar" type="file" accept={PROFILE_AVATAR_TYPES.join(",")} onChange={handleAvatarChange} className="sr-only" />
              </label>
            </div>
            <label htmlFor="username" className="mt-5 block text-sm font-semibold text-[#514A67]">
              {profileT.username}
              <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={30} autoCapitalize="none" autoCorrect="off" className="mt-2 min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition focus:border-[#A875D2]" />
            </label>
            <p className="mt-1 text-xs text-[#8A7A9D]">{profileT.format}</p>
            <label htmlFor="bio" className="mt-5 block text-sm font-semibold text-[#514A67]">
              {profileT.bio}
              <textarea id="bio" value={bio} maxLength={300} onChange={(event) => setBio(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#DED6EA] bg-white p-4 text-sm text-[#17142E] outline-none transition focus:border-[#A875D2]" />
              <span className="mt-1 block text-right text-xs font-normal text-[#8A7A9D]">{bio.length}/300</span>
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSavingPublicProfile}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSavingPublicProfile ? <Loader2 className="animate-spin" size={17} /> : null}
                {profileT.save}
              </button>
              {publicProfile ? (
                <Link
                  href={language === "pl" ? `/profile/${publicProfile.username}` : `/en/profile/${publicProfile.username}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D8CCE7] px-5 text-sm font-semibold text-[#7438B7]"
                >
                  {profileT.view}
                </Link>
              ) : null}
            </div>
            {publicProfileMessage ? <p className="mt-3 text-sm text-[#6E6582]">{publicProfileMessage}</p> : null}
          </form>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#6C5A86] transition hover:bg-[#F6F0FB] hover:text-[#7438B7]"
          >
            <LogOut size={17} />
            {t.logout}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-4 shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {isFavoritesSection ? t.favorites : t.myListings}
              </h2>
              <p className="mt-1 text-sm text-[#6E6582]">
                {isFavoritesSection
                  ? t.favoritesIntro
                  : t.listingsIntro}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={language === "pl" ? "/messages" : "/en/messages"} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D8CCE7] px-5 text-sm font-semibold text-[#7438B7] transition hover:bg-[#F6F0FB]">{t.messages}</Link>
              <Link href={language === "pl" ? "/add-listing/pl" : "/add-listing/en"} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F4EEF9] px-5 text-sm font-semibold text-[#7438B7] transition hover:bg-[#EDE2F8]">{t.addListing}</Link>
            </div>
          </div>

          <div className="mt-5 grid gap-2 rounded-2xl bg-[#FAF8FC] p-1 sm:inline-grid sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSectionChange("listings")}
              className={`min-h-11 rounded-xl px-4 text-sm font-semibold transition ${
                activeSection === "listings"
                  ? "bg-white text-[#7438B7] shadow-sm"
                  : "text-[#6E6582] hover:bg-white/70 hover:text-[#7438B7]"
              }`}
            >
              {t.myListings}
            </button>
            <button
              type="button"
              onClick={() => handleSectionChange("favorites")}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                activeSection === "favorites"
                  ? "bg-white text-[#7438B7] shadow-sm"
                  : "text-[#6E6582] hover:bg-white/70 hover:text-[#7438B7]"
              }`}
            >
              <Heart size={17} />
              {t.favorites}
            </button>
          </div>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {isFavoritesSection ? (
            isFavoritesLoading ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#FAF8FC] p-5 text-sm text-[#6E6582]">
                <Loader2 className="animate-spin text-[#7438B7]" size={20} />
                {t.loadingFavorites}
              </div>
            ) : favoriteListings.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-[#FAF8FC] p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#7438B7] shadow-sm">
                  <Heart size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {t.noFavorites}
                </h3>
                <p className="mt-2 text-sm text-[#6E6582]">
                  {t.noFavoritesIntro}
                </p>
                <Link
                  href={language === "pl" ? "/#listings" : "/en#listings"}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2]"
                >
                  {t.browseListings}
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {favoriteListings.map((listing) => (
                  <article
                    key={listing.id}
                    className="rounded-2xl border border-[#E8E1F0] bg-[#FFFEFF] p-4 shadow-[0_10px_28px_rgba(51,36,82,0.06)] sm:p-5"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold text-[#17142E]">
                            {listing.brand ?? "-"}
                          </h3>
                          {listing.status ? (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getListingStatusClassName(listing.status)}`}
                            >
                              {getListingStatusLabel(listing.status)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-[#332B4D]">
                          {listing.yarn_name ?? "-"}
                        </p>

                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <AccountFact label={t.color} value={listing.color} />
                          <AccountFact label={t.dyelot} value={listing.dyelot} />
                          <AccountFact
                            label={t.skeins}
                            value={listing.skeins === null ? null : String(listing.skeins)}
                          />
                          <AccountFact label={t.location} value={listing.country} />
                        </dl>

                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#6E6582]">
                          <CalendarDays size={15} className="text-[#7438B7]" />
                          {t.added} {formatDate(listing.created_at, language)}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:flex lg:justify-end">
                        <Link
                          href={language === "pl" ? `/listing/${listing.id}?from=account` : `/en/listing/${listing.id}?from=account`}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#7438B7] transition hover:bg-[#F6F0FB]"
                        >
                          <Eye size={17} />
                          {t.view}
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleRemoveFavorite(listing.id)}
                          disabled={removingFavoriteId === listing.id}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#7438B7] transition hover:bg-[#F6F0FB] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {removingFavoriteId === listing.id ? (
                            <Loader2 className="animate-spin" size={17} />
                          ) : (
                            <Heart size={17} />
                          )}
                          {t.removeFavorite}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : isListingsLoading ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#FAF8FC] p-5 text-sm text-[#6E6582]">
              <Loader2 className="animate-spin text-[#7438B7]" size={20} />
              {t.loadingListings}
            </div>
          ) : listings.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-[#FAF8FC] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#7438B7] shadow-sm">
                <Package size={24} />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t.noListings}</h3>
              <p className="mt-2 text-sm text-[#6E6582]">
                {t.noListingsIntro}
              </p>
              <Link
                href={language === "pl" ? "/add-listing/pl" : "/add-listing/en"}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2]"
              >
                {t.addFirstListing}
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {organizedListings.map((listing, index) => (
                <div key={listing.id}>
                  {index === 0 || (listing.listing_type === "wanted" && organizedListings[index - 1]?.listing_type !== "wanted") ? (
                    <h3 className="pt-4 text-lg font-bold text-[#17142E]">{listing.listing_type === "wanted" ? t.looking : t.offers}</h3>
                  ) : null}
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
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getListingStatusClassName(listing.status)}`}
                          >
                            {getListingStatusLabel(listing.status)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#332B4D]">
                        {listing.yarn_name ?? "-"}
                      </p>

                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <AccountFact label={t.color} value={listing.color} />
                        <AccountFact label={t.dyelot} value={listing.dyelot} />
                        <AccountFact
                          label={t.skeins}
                          value={listing.skeins === null ? null : String(listing.skeins)}
                        />
                        <AccountFact label={t.location} value={listing.country} />
                      </dl>

                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#6E6582]">
                        <CalendarDays size={15} className="text-[#7438B7]" />
                        {t.added} {formatDate(listing.created_at, language)}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:flex lg:justify-end">
                      <Link
                        href={listing.listing_type === "wanted" ? (language === "pl" ? `/looking` : `/en/looking`) : (language === "pl" ? `/listing/${listing.id}?from=account` : `/en/listing/${listing.id}?from=account`)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#7438B7] transition hover:bg-[#F6F0FB]"
                      >
                        <Eye size={17} />
                        {t.view}
                      </Link>
                      <Link
                        href={listing.listing_type === "wanted" ? (language === "pl" ? `/looking/edit/${listing.id}` : `/en/looking/edit/${listing.id}`) : `/edit-listing/${listing.id}`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#7438B7] transition hover:bg-[#F6F0FB]"
                      >
                        <Pencil size={17} />
                        {t.edit}
                      </Link>
                      {listing.listing_type === "wanted" ? <button type="button" onClick={() => void handleUpdateStatus(listing.id, "found")} disabled={updatingStatusId === listing.id} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D8CCE7] px-4 text-sm font-semibold text-[#7438B7] disabled:opacity-60">{t.markFound}</button> : <label className="grid gap-1 text-xs font-semibold text-[#6E6582]">
                        {t.status}
                        <select
                          value={normalizeListingStatus(listing.status)}
                          onChange={(event) =>
                            void handleUpdateStatus(
                              listing.id,
                              event.target.value as ListingStatus,
                            )
                          }
                          disabled={updatingStatusId === listing.id}
                          className="min-h-11 rounded-xl border border-[#D8CCE7] bg-white px-3 text-sm font-semibold text-[#7438B7] outline-none transition hover:bg-[#F6F0FB] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {LISTING_STATUS_OPTIONS.filter((option) => option.value !== "found").map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>}
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
                        {t.delete}
                      </button>
                    </div>
                  </div>
                </article></div>
              ))}
            </div>
          )}
        </div>
        <AccountProjects userId={session.user.id} language={language} />
      </section>
    </main>
  );
}

function BackHomeLink({ language }: { language: "en" | "pl" }) {
  return (
    <Link
      href={language === "pl" ? "/" : "/en"}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#6C5A86] shadow-[0_10px_28px_rgba(51,36,82,0.07)] transition hover:text-[#7438B7]"
    >
      <ArrowLeft size={17} />
      {language === "pl" ? "Wróć do strony głównej" : "Back to home"}
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

function getInitialAccountSection(): AccountSection {
  if (typeof window === "undefined") {
    return "listings";
  }

  return new URLSearchParams(window.location.search).get("section") === "favorites"
    ? "favorites"
    : "listings";
}

function formatDate(value: string | null, language: "en" | "pl") {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

const accountCopy = {
  pl: { account: "Moje konto", login: "Zaloguj się", loginIntro: "Zaloguj się przez Google, aby zobaczyć i zarządzać swoimi ogłoszeniami.", logout: "Wyloguj się", favorites: "Ulubione", favoritesIntro: "Ogłoszenia zapisane przez Ciebie na później.", noFavorites: "Nie masz jeszcze ulubionych ogłoszeń.", noFavoritesIntro: "Gdy zapiszesz ogłoszenie serduszkiem, wrócisz do niego tutaj bez szukania od nowa.", browseListings: "Przejdź do ogłoszeń", messages: "Wiadomości", myListings: "Moje ogłoszenia", listingsIntro: "Widzisz tylko ogłoszenia przypisane do Twojego konta.", noListings: "Nie masz jeszcze ogłoszeń.", noListingsIntro: "Dodaj pierwszą włóczkę, żeby inni mogli znaleźć pasującą partię.", addFirstListing: "Dodaj pierwsze ogłoszenie", offers: "Moje oferty", looking: "Szukam włóczki", addListing: "Dodaj ogłoszenie", edit: "Edytuj", delete: "Usuń", markFound: "Oznacz jako znalezione", view: "Zobacz", status: "Status", color: "Kolor", dyelot: "Dye lot", skeins: "Motki", location: "Lokalizacja", added: "Dodane", removeFavorite: "Usuń z ulubionych", loadingAccount: "Ładowanie konta...", loadingFavorites: "Ładowanie ulubionych...", loadingListings: "Ładowanie ogłoszeń...", loadListingsError: "Nie udało się pobrać ogłoszeń. Odśwież stronę albo spróbuj ponownie za chwilę.", loadFavoritesError: "Nie udało się pobrać ulubionych. Spróbuj ponownie za chwilę.", logoutError: "Nie udało się wylogować. Spróbuj ponownie.", deleteConfirm: "Czy na pewno chcesz usunąć to ogłoszenie?", deleteError: "Nie udało się usunąć ogłoszenia. Spróbuj ponownie.", removeFavoriteError: "Nie udało się usunąć ogłoszenia z ulubionych. Spróbuj ponownie.", statusError: "Nie udało się zmienić statusu ogłoszenia. Spróbuj ponownie." },
  en: { account: "My account", login: "Sign in", loginIntro: "Sign in with Google to view and manage your listings.", logout: "Sign out", favorites: "Favorites", favoritesIntro: "Listings you saved for later.", noFavorites: "You do not have any favorite listings yet.", noFavoritesIntro: "Save a listing with the heart icon and it will be easy to find here.", browseListings: "Browse listings", messages: "Messages", myListings: "My listings", listingsIntro: "Only listings connected to your account are shown here.", noListings: "You do not have any listings yet.", noListingsIntro: "Add your first yarn listing so others can find a matching dye lot.", addFirstListing: "Add your first listing", offers: "My listings", looking: "Looking for yarn", addListing: "Add listing", edit: "Edit", delete: "Delete", markFound: "Mark as found", view: "View", status: "Status", color: "Color", dyelot: "Dye lot", skeins: "Skeins", location: "Location", added: "Added", removeFavorite: "Remove from favorites", loadingAccount: "Loading account...", loadingFavorites: "Loading favorites...", loadingListings: "Loading listings...", loadListingsError: "Could not load listings. Refresh the page or try again shortly.", loadFavoritesError: "Could not load favorites. Please try again shortly.", logoutError: "Could not sign out. Please try again.", deleteConfirm: "Are you sure you want to delete this listing?", deleteError: "Could not delete the listing. Please try again.", removeFavoriteError: "Could not remove the favorite. Please try again.", statusError: "Could not update the listing status. Please try again." },
} as const;
