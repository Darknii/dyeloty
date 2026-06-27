import { supabase } from "./supabase";
import {
  Hash,
  ImageIcon,
  MapPin,
  Package,
  Scale,
} from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";

type Props = {
  language: "en" | "pl";
  filters?: {
    q?: string;
    brand?: string;
    color?: string;
    dyelot?: string;
    location?: string;
  };
};

type Listing = {
  id: number;
  created_at: string | null;
  brand: string | null;
  yarn_name: string | null;
  color: string | null;
  dyelot: string | null;
  skeins: number | null;
  country: string | null;
  image_url?: string | null;
  photo_url?: string | null;
  photos?: unknown;
  images?: unknown;
};

export default async function Listings({ language, filters = {} }: Props) {
  const t =
    language === "pl"
      ? {
          empty: "Nie ma jeszcze ogłoszeń.",
          emptyHint: "Pierwsze ogłoszenia pojawią się tutaj po dodaniu włóczki.",
          searchEmpty: "Brak pasujących ogłoszeń.",
          searchEmptyHint: "Spróbuj wpisać inną markę, kolor albo dye lot.",
          errorTitle: "Nie udało się pobrać ogłoszeń",
          noPhoto: "Zdjęcie niedostępne",
          newBadge: "NOWE",
          skeinOne: "motek",
          skeinFew: "motki",
          skeinMany: "motków",
          weight: "150 m / 50 g",
          lot: "Partia",
        }
      : {
          empty: "No listings yet.",
          emptyHint: "The first listings will appear here after yarn is added.",
          searchEmpty: "No matching listings.",
          searchEmptyHint: "Try another brand, color, or dye lot.",
          errorTitle: "Could not load listings",
          noPhoto: "Photo unavailable",
          newBadge: "NEW",
          skeinOne: "skein",
          skeinFew: "skeins",
          skeinMany: "skeins",
          weight: "150 m / 50 g",
          lot: "Lot",
        };

  await connection();

  let query = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const q = filters.q?.trim();
  const brand = filters.brand?.trim();
  const color = filters.color?.trim();
  const dyelot = filters.dyelot?.trim();
  const location = filters.location?.trim();
  const hasSearch = Boolean(q || brand || color || dyelot || location);

  if (q) {
    const escapedQ = escapeSupabaseFilterValue(q);
    query = query.or(
      `brand.ilike.%${escapedQ}%,yarn_name.ilike.%${escapedQ}%,color.ilike.%${escapedQ}%,dyelot.ilike.%${escapedQ}%`,
    );
  }

  if (brand) {
    query = query.ilike("brand", `%${brand}%`);
  }

  if (color) {
    query = query.ilike("color", `%${color}%`);
  }

  if (dyelot) {
    query = query.ilike("dyelot", `%${dyelot}%`);
  }

  if (location) {
    query = query.ilike("country", `%${location}%`);
  }

  const { data: listings, error } = await query.returns<Listing[]>();

  if (error) {
    return (
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        <div className="font-semibold">{t.errorTitle}</div>
        <div className="mt-2 text-sm">{error.message}</div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-8 text-center shadow-[0_14px_40px_rgba(51,36,82,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4EEF9] text-[#7A3FC5]">
          <ImageIcon size={24} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#17142E]">
          {hasSearch ? t.searchEmpty : t.empty}
        </h3>
        <p className="mt-2 text-sm text-[#70677F]">
          {hasSearch ? t.searchEmptyHint : t.emptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-5 sm:mt-6 md:grid-cols-2 xl:grid-cols-4">
      {listings.map((listing) => {
        const imageUrl = getListingImageUrl(listing);
        const showNewBadge = isNewListing(listing.created_at);

        return (
          <Link
            key={listing.id}
            href={`/listing/${listing.id}`}
            className="group block min-w-0 rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-[#7438B7] focus-visible:ring-offset-2"
          >
            <article className="h-full overflow-hidden rounded-2xl border border-[#E5DDEC] bg-white shadow-[0_12px_34px_rgba(51,36,82,0.08)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_48px_rgba(51,36,82,0.13)]">
              <div className="relative h-36 overflow-hidden bg-[#F5F1FA] sm:h-40">
                {imageUrl ? (
                  <div
                    className="h-full w-full bg-cover bg-center transition duration-300 group-hover:scale-[1.03]"
                    role="img"
                    aria-label={`${listing.brand ?? ""} ${listing.yarn_name ?? ""}`.trim()}
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#FAF7FE_0%,#F1E8F8_48%,#EFE8E0_100%)] px-6 text-center">
                    <div>
                      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#7A3FC5] shadow-[0_10px_24px_rgba(76,45,103,0.10)]">
                        <ImageIcon size={18} />
                      </span>
                      <div className="mt-2 text-xs font-semibold text-[#756889]">
                        {t.noPhoto}
                      </div>
                    </div>
                  </div>
                )}

                {showNewBadge ? (
                  <span className="absolute left-3 top-3 rounded-md bg-[#8C5CCD] px-3 py-1 text-xs font-bold text-white">
                    {t.newBadge}
                  </span>
                ) : null}
                <FavoriteButton
                  listingId={listing.id}
                  language={language}
                  className="absolute right-3 top-3"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold leading-tight text-[#17142E]">
                  {listing.brand ?? "-"}
                </h3>
                <p className="mt-1 text-[15px] font-semibold text-[#332B4D]">
                  {listing.yarn_name ?? "-"}
                </p>
                <p className="mt-1 text-[15px] text-[#332B4D]">
                  {listing.color ?? "-"}
                </p>

                <div className="mt-4 grid gap-2 text-xs font-medium text-[#6E6582]">
                  <MetaItem
                    icon={<Package size={14} />}
                    value={formatSkeins(listing.skeins, t)}
                  />
                  <MetaItem icon={<Scale size={14} />} value={t.weight} />
                  <MetaItem
                    icon={<Hash size={14} />}
                    value={`${t.lot} ${listing.dyelot ?? "-"}`}
                  />
                </div>

                {listing.country ? (
                  <div className="mt-5 flex min-w-0 items-center gap-2 text-sm font-medium text-[#6E6582]">
                    <MapPin size={16} className="shrink-0 text-[#7A3FC5]" />
                    <span>{listing.country}</span>
                  </div>
                ) : null}
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}

function escapeSupabaseFilterValue(value: string) {
  return value.replace(/[%*,()]/g, "");
}

function MetaItem({ icon, value }: { icon: ReactNode; value: string | null }) {
  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <span className="shrink-0 text-[#7A3FC5]">{icon}</span>
      <span className="min-w-0 break-words">{value ?? "-"}</span>
    </div>
  );
}

function isNewListing(createdAt: string | null) {
  if (!createdAt) {
    return false;
  }

  const createdTime = new Date(createdAt).getTime();

  if (!Number.isFinite(createdTime)) {
    return false;
  }

  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - createdTime <= sevenDaysInMs;
}

function formatSkeins(
  value: number | null,
  labels: { skeinOne: string; skeinFew: string; skeinMany: string },
) {
  if (value === null) {
    return null;
  }

  const suffix =
    value === 1
      ? labels.skeinOne
      : value >= 2 && value <= 4
        ? labels.skeinFew
        : labels.skeinMany;

  return `${value} ${suffix}`;
}

function getListingImageUrl(listing: Listing) {
  if (listing.image_url) {
    return listing.image_url;
  }

  if (listing.photo_url) {
    return listing.photo_url;
  }

  const firstPhoto = getFirstStringFromUnknown(listing.photos);

  if (firstPhoto) {
    return firstPhoto;
  }

  return getFirstStringFromUnknown(listing.images);
}

function getFirstStringFromUnknown(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const first = value[0];

  if (typeof first === "string") {
    return first;
  }

  if (first && typeof first === "object" && "url" in first) {
    const url = (first as { url?: unknown }).url;
    return typeof url === "string" ? url : null;
  }

  return null;
}

export function ListingsLoading() {
  return (
    <div className="mt-5 grid gap-5 sm:mt-6 md:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-2xl border border-[#E5DDEC] bg-white shadow-[0_12px_34px_rgba(51,36,82,0.08)]"
        >
          <div className="h-36 animate-pulse bg-[#F5F1FA] sm:h-40" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-28 animate-pulse rounded-full bg-[#ECE7DF]" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#ECE7DF]" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#ECE7DF]" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="h-4 animate-pulse rounded-full bg-[#ECE7DF]" />
              <div className="h-4 animate-pulse rounded-full bg-[#ECE7DF]" />
              <div className="h-4 animate-pulse rounded-full bg-[#ECE7DF]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
