"use client";

import {
  Hash,
  ImageIcon,
  MapPin,
  Package,
  RotateCcw,
  Scale,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import FavoriteButton from "./FavoriteButton";
import {
  getListingStatusClassName,
  getListingStatusLabel,
  normalizeListingStatus,
  type ListingStatus,
} from "./listingStatus";

export type ListingSearchItem = {
  id: number;
  created_at: string | null;
  brand: string | null;
  yarn_name: string | null;
  color: string | null;
  color_name?: string | null;
  color_code?: string | null;
  dyelot: string | null;
  dye_lot?: string | null;
  skeins: number | null;
  country: string | null;
  location?: string | null;
  description?: string | null;
  notes?: string | null;
  status: string | null;
  image_url?: string | null;
  photo_url?: string | null;
  photos?: unknown;
  images?: unknown;
};

type Props = {
  listings: ListingSearchItem[];
  language: "en" | "pl";
  initialFilters?: {
    q?: string;
    brand?: string;
    color?: string;
    dyelot?: string;
    location?: string;
    status?: string;
  };
};

type StatusFilter = "all" | ListingStatus;

export default function ListingSearchResults({
  listings,
  language,
  initialFilters = {},
}: Props) {
  const [query, setQuery] = useState(
    [
      initialFilters.q,
      initialFilters.brand,
      initialFilters.color,
      initialFilters.location,
    ]
      .filter(Boolean)
      .join(" ")
      .trim(),
  );
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState<StatusFilter>(
    isStatusFilter(initialFilters.status) ? initialFilters.status : "all",
  );
  const [dyelot, setDyelot] = useState(initialFilters.dyelot?.trim() ?? "");

  const t =
    language === "pl"
      ? {
          searchLabel: "Szukaj ogłoszeń",
          searchPlaceholder:
            "Szukaj po marce, nazwie włóczki, kolorze lub dye lot…",
          status: "Status",
          allStatuses: "Wszystkie",
          available: "Dostępne",
          reserved: "Zarezerwowane",
          sold: "Sprzedane / nieaktualne",
          brand: "Marka",
          allBrands: "Wszystkie marki",
          dyelot: "Dye lot",
          dyelotPlaceholder: "Numer dye lotu",
          clear: "Wyczyść wyszukiwanie",
          backHome: "Wróć do głównej",
          foundOne: "Znaleziono 1 ogłoszenie",
          foundFew: "Znaleziono {count} ogłoszenia",
          foundMany: "Znaleziono {count} ogłoszeń",
          noResults: "Nie znaleziono ogłoszeń",
          noResultsTitle: "Nie znaleziono takiej partii",
          noResultsText:
            "Spróbuj wpisać samą markę, kolor albo numer dye lotu. Czasem ogłoszenia mają różnie zapisane nazwy włóczek.",
          noPhoto: "Zdjęcie niedostępne",
          newBadge: "NOWE",
          skeinOne: "motek",
          skeinFew: "motki",
          skeinMany: "motków",
          weight: "150 m / 50 g",
          lot: "Partia",
        }
      : {
          searchLabel: "Search listings",
          searchPlaceholder: "Search by brand, yarn name, color, or dye lot…",
          status: "Status",
          allStatuses: "All",
          available: "Available",
          reserved: "Reserved",
          sold: "Sold / inactive",
          brand: "Brand",
          allBrands: "All brands",
          dyelot: "Dye lot",
          dyelotPlaceholder: "Dye lot number",
          clear: "Clear search",
          backHome: "Back to homepage",
          foundOne: "Found 1 listing",
          foundFew: "Found {count} listings",
          foundMany: "Found {count} listings",
          noResults: "No listings found",
          noResultsTitle: "No matching dye lot found",
          noResultsText:
            "Try searching just the brand, color, or dye lot number. Yarn names are sometimes written in different ways.",
          noPhoto: "Photo unavailable",
          newBadge: "NEW",
          skeinOne: "skein",
          skeinFew: "skeins",
          skeinMany: "skeins",
          weight: "150 m / 50 g",
          lot: "Lot",
        };

  const brandOptions = useMemo(() => getBrandOptions(listings), [listings]);
  const filteredListings = useMemo(
    () =>
      listings.filter((listing) =>
        matchesListingFilters(listing, {
          query,
          brand,
          status,
          dyelot,
        }),
      ),
    [brand, dyelot, listings, query, status],
  );
  const hasActiveFilters = Boolean(
    query.trim() || brand.trim() || dyelot.trim() || status !== "all",
  );

  function clearFilters() {
    setQuery("");
    setBrand("");
    setStatus("all");
    setDyelot("");
  }

  return (
    <>
      <section className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-4 shadow-[0_14px_40px_rgba(51,36,82,0.08)] sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#514A67]">
              <Search size={17} className="text-[#7A3FC5]" />
              {t.searchLabel}
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition placeholder:text-[#9489AA] focus:border-[#A875D2]"
            />
          </label>

          {hasActiveFilters ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:items-center">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F4EEF9] px-5 text-sm font-semibold text-[#7438B7] transition hover:bg-[#EDE2F8] lg:w-auto"
              >
                <RotateCcw size={17} />
                {t.clear}
              </button>
              <Link
                href="/"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#D8CCE7] px-5 text-sm font-semibold text-[#6C5A86] transition hover:bg-[#F6F0FB] hover:text-[#7438B7] lg:w-auto"
              >
                {t.backHome}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#514A67]">
              {t.status}
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition focus:border-[#A875D2]"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="available">{t.available}</option>
              <option value="reserved">{t.reserved}</option>
              <option value="sold">{t.sold}</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#514A67]">
              {t.brand}
            </span>
            <select
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition focus:border-[#A875D2]"
            >
              <option value="">{t.allBrands}</option>
              {brandOptions.map((brandOption) => (
                <option key={brandOption} value={brandOption}>
                  {brandOption}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#514A67]">
              {t.dyelot}
            </span>
            <input
              type="text"
              value={dyelot}
              onChange={(event) => setDyelot(event.target.value)}
              placeholder={t.dyelotPlaceholder}
              className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition placeholder:text-[#9489AA] focus:border-[#A875D2]"
            />
          </label>
        </div>

        <p className="mt-4 text-sm font-medium text-[#6E6582]">
          {filteredListings.length > 0
            ? formatResultCount(filteredListings.length, t)
            : t.noResults}
        </p>
      </section>

      {filteredListings.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-8 text-center shadow-[0_14px_40px_rgba(51,36,82,0.08)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4EEF9] text-[#7A3FC5]">
            <Search size={24} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#17142E]">
            {t.noResultsTitle}
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#70677F]">
            {t.noResultsText}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2]"
          >
            {t.clear}
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:mt-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} language={language} labels={t} />
          ))}
        </div>
      )}
    </>
  );
}

function ListingCard({
  listing,
  language,
  labels,
}: {
  listing: ListingSearchItem;
  language: "en" | "pl";
  labels: {
    noPhoto: string;
    newBadge: string;
    skeinOne: string;
    skeinFew: string;
    skeinMany: string;
    weight: string;
    lot: string;
  };
}) {
  const imageUrl = getListingImageUrl(listing);
  const showNewBadge = isNewListing(listing.created_at);
  const normalizedStatus = normalizeListingStatus(listing.status);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block min-w-0 rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-[#7438B7] focus-visible:ring-offset-2"
    >
      <article
        className={`h-full overflow-hidden rounded-2xl border border-[#E5DDEC] bg-white shadow-[0_12px_34px_rgba(51,36,82,0.08)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_48px_rgba(51,36,82,0.13)] ${
          normalizedStatus === "sold" ? "opacity-80" : ""
        }`}
      >
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
                  {labels.noPhoto}
                </div>
              </div>
            </div>
          )}

          {showNewBadge ? (
            <span className="absolute left-3 top-3 rounded-md bg-[#8C5CCD] px-3 py-1 text-xs font-bold text-white">
              {labels.newBadge}
            </span>
          ) : null}
          <FavoriteButton
            listingId={listing.id}
            language={language}
            className="absolute right-3 top-3 z-20"
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
            {listing.color ?? listing.color_name ?? "-"}
          </p>

          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getListingStatusClassName(listing.status)}`}
          >
            {getListingStatusLabel(listing.status)}
          </span>

          <div className="mt-4 grid gap-2 text-xs font-medium text-[#6E6582]">
            <MetaItem
              icon={<Package size={14} />}
              value={formatSkeins(listing.skeins, labels)}
            />
            <MetaItem icon={<Scale size={14} />} value={labels.weight} />
            <MetaItem
              icon={<Hash size={14} />}
              value={`${labels.lot} ${listing.dyelot ?? listing.dye_lot ?? "-"}`}
            />
          </div>

          {listing.country || listing.location ? (
            <div className="mt-5 flex min-w-0 items-center gap-2 text-sm font-medium text-[#6E6582]">
              <MapPin size={16} className="shrink-0 text-[#7A3FC5]" />
              <span>{listing.country ?? listing.location}</span>
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

function matchesListingFilters(
  listing: ListingSearchItem,
  filters: {
    query: string;
    brand: string;
    status: StatusFilter;
    dyelot: string;
  },
) {
  const query = normalizeSearchText(filters.query);
  const brand = normalizeSearchText(filters.brand);
  const dyelot = normalizeSearchText(filters.dyelot);

  if (filters.status !== "all" && normalizeListingStatus(listing.status) !== filters.status) {
    return false;
  }

  if (brand && normalizeSearchText(listing.brand) !== brand) {
    return false;
  }

  if (
    dyelot &&
    ![listing.dyelot, listing.dye_lot].some((value) =>
      normalizeSearchText(value).includes(dyelot),
    )
  ) {
    return false;
  }

  if (!query) {
    return true;
  }

  const searchableText = getSearchableValues(listing)
    .map((value) => normalizeSearchText(value))
    .join(" ");

  return query.split(/\s+/).every((term) => searchableText.includes(term));
}

function getSearchableValues(listing: ListingSearchItem) {
  return [
    listing.brand,
    listing.yarn_name,
    listing.color,
    listing.color_name,
    listing.color_code,
    listing.dyelot,
    listing.dye_lot,
    listing.description,
    listing.notes,
    listing.country,
    listing.location,
  ];
}

function normalizeSearchText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getBrandOptions(listings: ListingSearchItem[]) {
  return Array.from(
    new Set(
      listings
        .map((listing) => listing.brand?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b, "pl"));
}

function isStatusFilter(value: string | undefined): value is StatusFilter {
  return value === "available" || value === "reserved" || value === "sold";
}

function formatResultCount(
  count: number,
  labels: { foundOne: string; foundFew: string; foundMany: string },
) {
  if (count === 1) {
    return labels.foundOne;
  }

  const template = count >= 2 && count <= 4 ? labels.foundFew : labels.foundMany;
  return template.replace("{count}", String(count));
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

  const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
  return Date.now() - createdTime <= fortyEightHoursInMs;
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

function getListingImageUrl(listing: ListingSearchItem) {
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
