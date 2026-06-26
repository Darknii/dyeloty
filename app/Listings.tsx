import { supabase } from "./supabase";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

type Props = {
  language: "en" | "pl";
};

type Listing = {
  id: string;
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

export default async function Listings({ language }: Props) {
  const t =
    language === "pl"
      ? {
          view: "Zobacz",
          empty: "Nie ma jeszcze ogłoszeń.",
          errorTitle: "Nie udało się pobrać ogłoszeń",
          color: "Kolor",
          dyelot: "Dye lot",
          skeins: "motków",
          date: "Dodano",
          noPhoto: "Brak zdjęcia",
        }
      : {
          view: "View",
          empty: "No listings yet.",
          errorTitle: "Could not load listings",
          color: "Color",
          dyelot: "Dye lot",
          skeins: "skeins",
          date: "Added",
          noPhoto: "No photo",
        };

  await connection();

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .returns<Listing[]>();

  if (error) {
    return (
      <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        <div className="font-semibold">
          {t.errorTitle}
        </div>

        <div className="mt-2 text-sm">
          {error.message}
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-[#ECE7DF] bg-white p-8 text-center text-[#6F6F6F]">
        {t.empty}
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => {
        const imageUrl = getListingImageUrl(listing);
        const addedAt = formatDate(listing.created_at, language);

        return (
          <article
            key={listing.id}
            className="overflow-hidden rounded-[32px] border border-[#ECE7DF] bg-white transition duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="aspect-[4/3] bg-[#EEF1EA]">
              {imageUrl ? (
                <div
                  className="h-full w-full bg-cover bg-center"
                  role="img"
                  aria-label={`${listing.brand ?? ""} ${listing.yarn_name ?? ""}`.trim()}
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#EEF1EA] px-6 text-center text-sm font-medium text-[#90A885]">
                  {t.noPhoto}
                </div>
              )}
            </div>

            <div className="p-7">
              <div className="text-sm text-[#8E8E8E]">
                {listing.brand ?? "-"}
              </div>

              <h3 className="mt-1 text-2xl font-semibold text-[#1F2A24]">
                {listing.yarn_name ?? "-"}
              </h3>

              <div className="mt-6 grid gap-3 text-sm text-[#6F6F6F]">
                <ListingDetail label={t.color} value={listing.color} />
                <ListingDetail label={t.dyelot} value={listing.dyelot} />
                <ListingDetail
                  label={t.date}
                  value={addedAt}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full bg-[#F5F8F1] px-4 py-2 text-sm font-medium text-[#90A885]">
                  {listing.skeins ?? "-"} {t.skeins}
                </div>

                {listing.country ? (
                  <div className="flex items-center gap-2 rounded-full bg-[#F6F5F1] px-4 py-2 text-sm font-medium text-[#6F6F6F]">
                    <MapPin size={15} />
                    <span>{listing.country}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-8 flex justify-end">
                <Link
                  href={`/listing/${listing.id}`}
                  className="flex items-center gap-2 text-sm font-medium text-[#90A885] transition hover:text-[#7E9575]"
                >
                  {t.view}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ListingDetail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <p>
      <span className="font-medium text-[#1F2A24]">{label}</span>{" "}
      {value || "-"}
    </p>
  );
}

function formatDate(createdAt: string | null, language: Props["language"]) {
  if (!createdAt) {
    return "-";
  }

  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
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
    <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-[32px] border border-[#ECE7DF] bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-[#EEF1EA]" />

          <div className="space-y-4 p-7">
            <div className="h-4 w-24 animate-pulse rounded-full bg-[#ECE7DF]" />
            <div className="h-7 w-3/4 animate-pulse rounded-full bg-[#ECE7DF]" />
            <div className="space-y-3 pt-3">
              <div className="h-4 w-full animate-pulse rounded-full bg-[#ECE7DF]" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#ECE7DF]" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#ECE7DF]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
