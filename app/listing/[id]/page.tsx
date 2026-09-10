import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Hash,
  ImageIcon,
  MapPin,
  Package,
  Palette,
  Tag,
} from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { supabase } from "../../supabase";
import FavoriteButton from "../../FavoriteButton";
import OwnerListingActions from "../../OwnerListingActions";
import {
  getListingStatusClassName,
  getLocalizedListingStatusLabel,
  normalizeListingStatus,
} from "../../listingStatus";
import { getSafeExternalListingUrl } from "../../marketplace";

type Listing = {
  id: number;
  created_at: string | null;
  brand: string | null;
  yarn_name: string | null;
  color: string | null;
  dyelot: string | null;
  skeins: number | null;
  country: string | null;
  contact: string | null;
  type: string | null;
  status: string | null;
  user_id: string | null;
  description: string | null;
  image_url?: string | null;
  photo_url?: string | null;
  photos?: unknown;
  images?: unknown;
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function ListingDetailsPage({
  params,
  language = "pl",
}: Props & { language?: "en" | "pl" }) {
  const { id } = await params;
  const t =
    language === "pl"
      ? {
          back: "Wróć do ogłoszeń", noPhoto: "Brak zdjęcia", noPhotoHint: "Szczegóły włóczki znajdziesz w opisie i pod linkiem do ogłoszenia.", added: "Dodane", brand: "Producent", color: "Kolor", skeins: "Ilość motków", location: "Lokalizacja", description: "Opis", noDescription: "Brak opisu.", soldHint: "To ogłoszenie jest oznaczone jako sprzedane lub nieaktualne. Link zewnętrzny może już nie prowadzić do dostępnej oferty.", openListing: "Przejdź do ogłoszenia", noLink: "Brak linku do ogłoszenia.", externalListing: "Ogłoszenie zewnętrzne",
        }
      : {
          back: "Back to listings", noPhoto: "No photo available", noPhotoHint: "Yarn details are available in the description and through the external listing.", added: "Added", brand: "Brand", color: "Color", skeins: "Skeins", location: "Location", description: "Description", noDescription: "No description.", soldHint: "This listing is marked as sold or inactive. The external link may no longer lead to an available offer.", openListing: "Open listing", noLink: "No external listing link is available.", externalListing: "External listing",
        };

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single<Listing>();

  if (error || !listing) {
    notFound();
  }

  const imageUrl = getListingImageUrl(listing);
  const addedAt = formatDate(listing.created_at, language);
  const marketplace = getMarketplaceName(listing.type);
  const externalListingUrl = getSafeExternalListingUrl(listing.contact);
  const normalizedStatus = normalizeListingStatus(listing.status);
  const statusLabel = getLocalizedListingStatusLabel(listing.status, language);

  return (
    <main className="min-h-screen bg-[#F8F6FB] text-[#1F1830]">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <Link
          href={language === "pl" ? "/" : "/en"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6C5A86] transition hover:text-[#6F36B9]"
        >
          <ArrowLeft size={17} />
          {t.back}
        </Link>

        <div className="mt-7 grid overflow-hidden rounded-2xl border border-[#E8E1F0] bg-white shadow-[0_18px_55px_rgba(51,36,82,0.10)] lg:grid-cols-[0.42fr_0.58fr]">
          <section className="order-2 border-[#E8E1F0] p-5 sm:p-6 lg:order-1 lg:border-r">
            <div className="flex h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-[#E8E1F0] bg-[#F5F1FA] sm:h-[280px] lg:max-h-[520px] lg:min-h-[360px]">
              {imageUrl ? (
                <div
                  className="h-full w-full bg-contain bg-center bg-no-repeat"
                  role="img"
                  aria-label={`${listing.brand ?? ""} ${listing.yarn_name ?? ""}`.trim()}
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-[linear-gradient(135deg,#FBF8FF_0%,#F1E9FA_52%,#E8F0E2_100%)] px-6 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#7A3FC5] shadow-sm">
                    <ImageIcon size={28} />
                  </span>
                  <div>
                    <div className="font-semibold text-[#4A3B62]">
                      {t.noPhoto}
                    </div>
                    <p className="mt-1 max-w-xs text-sm text-[#7B718A]">
                      {t.noPhotoHint}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="order-1 p-5 sm:p-7 lg:order-2 lg:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-[#7B718A]">
                <CalendarDays size={16} />
                {t.added} {addedAt}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${getListingStatusClassName(listing.status)}`}
                >
                  <CheckCircle2 size={16} />
                  {statusLabel}
                </span>
                <FavoriteButton listingId={listing.id} language={language} />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#7A3FC5]">
                {listing.brand ?? t.brand}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#1F1830] sm:text-4xl">
                {listing.yarn_name ?? "-"}
              </h1>

              {listing.country ? (
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#6C5A86]">
                  <MapPin size={17} />
                  {listing.country}
                </div>
              ) : null}

              <div className="mt-5 grid grid-cols-3 gap-2 lg:hidden">
                <QuickFact label={t.color} value={listing.color} />
                <QuickFact label="Dye lot" value={listing.dyelot} />
                <QuickFact label={t.skeins} value={listing.skeins} />
              </div>

              <OwnerListingActions listingId={listing.id} ownerId={listing.user_id} language={language} />

              {normalizedStatus === "sold" ? (
                <div className="mt-5 rounded-2xl border border-[#E8E1F0] bg-[#FAF8FC] p-4 text-sm leading-6 text-[#6E6582]">
                  {t.soldHint}
                </div>
              ) : null}
            </div>

            <div className="mt-7 hidden gap-3 sm:grid-cols-2 lg:grid">
              <DetailItem
                icon={<Tag size={20} />}
                label={t.brand}
                value={listing.brand}
              />
              <DetailItem
                icon={<Palette size={20} />}
                label={t.color}
                value={listing.color}
              />
              <DetailItem
                icon={<Hash size={20} />}
                label="Dye lot"
                value={listing.dyelot}
              />
              <DetailItem
                icon={<Package size={20} />}
                label={t.skeins}
                value={listing.skeins}
              />
              <DetailItem
                icon={<MapPin size={20} />}
                label={t.location}
                value={listing.country}
              />
              <DetailItem
                icon={<CheckCircle2 size={20} />}
                label="Status"
                value={statusLabel}
              />
            </div>

            <div className="mt-5 hidden rounded-2xl border border-[#E8E1F0] bg-[#FCFAFF] p-5 lg:block">
              <div className="text-sm font-semibold text-[#7A3FC5]">
                {t.description}
              </div>
              <p className="mt-2 whitespace-pre-line text-[#3C334D]">
                {listing.description || t.noDescription}
              </p>
            </div>

            {externalListingUrl ? (
              <a
                href={externalListingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 hidden w-full items-center justify-center gap-2 rounded-2xl bg-[#7438B7] px-7 py-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.25)] transition hover:bg-[#622CA2] sm:text-lg lg:inline-flex"
              >
                <ExternalLink size={20} />
                {t.openListing}
              </a>
            ) : (
              <div className="mt-6 hidden rounded-2xl border border-[#E8E1F0] bg-[#FCFAFF] px-5 py-4 text-[#6C5A86] lg:block">
                {t.noLink}
              </div>
            )}

            {marketplace ? (
              <p className="mt-3 hidden text-center text-sm font-medium text-[#7B718A] lg:block">
                {t.externalListing}: {marketplace}
              </p>
            ) : null}
          </section>

          <section className="order-3 border-t border-[#E8E1F0] p-5 lg:hidden">
            <div className="grid gap-3">
              <DetailItem
                icon={<Tag size={20} />}
                label={t.brand}
                value={listing.brand}
              />
              <DetailItem
                icon={<Palette size={20} />}
                label={t.color}
                value={listing.color}
              />
              <DetailItem
                icon={<Hash size={20} />}
                label="Dye lot"
                value={listing.dyelot}
              />
              <DetailItem
                icon={<Package size={20} />}
                label={t.skeins}
                value={listing.skeins}
              />
              <DetailItem
                icon={<MapPin size={20} />}
                label={t.location}
                value={listing.country}
              />
              <DetailItem
                icon={<CheckCircle2 size={20} />}
                label="Status"
                value={statusLabel}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-[#E8E1F0] bg-[#FCFAFF] p-5">
              <div className="text-sm font-semibold text-[#7A3FC5]">
                {t.description}
              </div>
              <p className="mt-2 whitespace-pre-line text-[#3C334D]">
                {listing.description || t.noDescription}
              </p>
            </div>

            {externalListingUrl ? (
              <a
                href={externalListingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#7438B7] px-7 py-4 text-base font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.25)] transition hover:bg-[#622CA2]"
              >
                <ExternalLink size={20} />
                {t.openListing}
              </a>
            ) : (
              <div className="mt-6 rounded-2xl border border-[#E8E1F0] bg-[#FCFAFF] px-5 py-4 text-[#6C5A86]">
                {t.noLink}
              </div>
            )}

            {marketplace ? (
              <p className="mt-3 text-center text-sm font-medium text-[#7B718A]">
                {t.externalListing}: {marketplace}
              </p>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

function QuickFact({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="rounded-2xl bg-[#F4EEF9] px-3 py-3">
      <div className="text-xs font-semibold text-[#7A3FC5]">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-[#1F1830]">
        {value ?? "-"}
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#E8E1F0] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(51,36,82,0.05)]">
      <div className="mt-0.5 text-[#7A3FC5]">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-[#7A3FC5]">{label}</div>
        <div className="mt-1 font-semibold text-[#1F1830]">
          {value ?? "-"}
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: Props) {
  return <ListingDetailsPage params={params} />;
}

function formatDate(createdAt: string | null, language: "en" | "pl") {
  if (!createdAt) {
    return "-";
  }

  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(createdAt));
}

function getMarketplaceName(type: string | null) {
  if (type === "olx") {
    return "OLX";
  }

  if (type === "vinted") {
    return "Vinted";
  }

  return type;
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
