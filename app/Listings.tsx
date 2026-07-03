import { ImageIcon } from "lucide-react";
import Link from "next/link";
import ListingSearchResults, { type ListingSearchItem } from "./ListingSearchResults";
import { getHomepageListings } from "./listingQueries";

type Props = {
  language: "en" | "pl";
  filters?: {
    q?: string;
    brand?: string;
    color?: string;
    dyelot?: string;
    location?: string;
    status?: string;
  };
  initialListings?: ListingSearchItem[];
  initialLoadError?: boolean;
};

export default async function Listings({
  language,
  filters = {},
  initialListings,
  initialLoadError = false,
}: Props) {
  const t =
    language === "pl"
      ? {
          empty: "Tu pojawią się pierwsze ogłoszenia",
          emptyHint:
            "Dyeloty są w pierwszej wersji. Ogłoszenia będą dodawane przez użytkowniczki, które chcą udostępnić własne motki i konkretne partie włóczek.",
          errorTitle: "Nie udało się pobrać ogłoszeń",
          errorHint: "Odśwież stronę albo spróbuj ponownie za chwilę.",
          addListing: "Dodaj pierwsze ogłoszenie",
        }
      : {
          empty: "The first listings will appear here",
          emptyHint:
            "Dyeloty is in its first version. Listings will be added by users who want to share their own skeins and specific yarn dye lots.",
          errorTitle: "Could not load listings",
          errorHint: "Refresh the page or try again in a moment.",
          addListing: "Add the first listing",
        };

  const loadResult =
    initialListings === undefined
      ? await getHomepageListings()
      : { listings: initialListings, error: initialLoadError };

  if (loadResult.error) {
    return (
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        <div className="font-semibold">{t.errorTitle}</div>
        <div className="mt-2 text-sm">{t.errorHint}</div>
      </div>
    );
  }

  const listings = loadResult.listings;

  if (listings.length === 0) {
    const addListingHref = language === "pl" ? "/add-listing/pl" : "/add-listing/en";

    return (
      <div className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-8 text-center shadow-[0_14px_40px_rgba(51,36,82,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4EEF9] text-[#7A3FC5]">
          <ImageIcon size={24} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-[#17142E]">
          {t.empty}
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#70677F]">
          {t.emptyHint}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={addListingHref}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2]"
          >
            {t.addListing}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ListingSearchResults
      listings={listings}
      language={language}
      initialFilters={filters}
    />
  );
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
