"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "./supabase";

type Props = {
  listingId: number | string;
  language?: "en" | "pl";
  className?: string;
};

export default function FavoriteButton({
  listingId,
  language = "pl",
  className = "",
}: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const normalizedListingId = String(listingId);
  const hasValidListingId = /^\d+$/.test(normalizedListingId);

  const t =
    language === "pl"
      ? {
          add: "Dodaj do ulubionych",
          remove: "Usuń z ulubionych",
          login: "Zaloguj się, aby dodać do ulubionych.",
          error: "Nie udało się zapisać ulubionych.",
        }
      : {
          add: "Add to favorites",
          remove: "Remove from favorites",
          login: "Sign in to add favorites.",
          error: "Could not save favorite.",
        };

  useEffect(() => {
    let isMounted = true;

    async function loadFavorite() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      const currentUserId = session?.user?.id ?? null;
      setUserId(currentUserId);

      if (!currentUserId || !hasValidListingId) {
        setIsFavorite(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", currentUserId)
        .eq("listing_id", normalizedListingId)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (!error) {
        setIsFavorite(Boolean(data));
      }
    }

    void loadFavorite();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadFavorite();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [hasValidListingId, normalizedListingId]);

  async function handleToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setMessage("");

    if (!userId) {
      setMessage(t.login);
      window.location.href = "/account";
      return;
    }

    if (!hasValidListingId) {
      setMessage(t.error);
      return;
    }

    setIsLoading(true);

    const { error } = isFavorite
      ? await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", normalizedListingId)
      : await supabase.from("favorites").insert({
          user_id: userId,
          listing_id: normalizedListingId,
        });

    setIsLoading(false);

    if (error) {
      setMessage(error.message || t.error);
      return;
    }

    setIsFavorite((current) => !current);
  }

  return (
    <span className={`inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? t.remove : t.add}
        title={message || (isFavorite ? t.remove : t.add)}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 shadow-[0_8px_20px_rgba(51,36,82,0.16)] transition hover:bg-[#F6F0FB] disabled:cursor-not-allowed disabled:opacity-70 ${
          isFavorite ? "text-[#7438B7]" : "text-[#6C5A86]"
        }`}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={17} />
        ) : (
          <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
        )}
      </button>
      {message ? (
        <span className="sr-only" role="status">
          {message}
        </span>
      ) : null}
    </span>
  );
}
