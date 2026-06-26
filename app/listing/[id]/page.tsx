import { notFound } from "next/navigation";
import { supabase } from "../../supabase";

type Listing = {
  id: string;
  created_at: string | null;
  brand: string | null;
  yarn_name: string | null;
  color: string | null;
  dyelot: string | null;
  skeins: number | null;
  country: string | null;
  contact: string | null;
  type: string | null;
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

export default async function ListingDetailsPage({ params }: Props) {
  const { id } = await params;

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single<Listing>();

  if (error || !listing) {
    notFound();
  }

  const marketplace =
    listing.type === "olx"
      ? "OLX"
      : listing.type === "vinted"
        ? "Vinted"
        : listing.type;

  const imageUrl = getListingImageUrl(listing);
  const addedAt = formatDate(listing.created_at);

  const details = [
    { label: "Producent", value: listing.brand },
    { label: "Nazwa / kolekcja", value: listing.yarn_name },
    { label: "Kolor", value: listing.color },
    { label: "Dye lot", value: listing.dyelot },
    { label: "Ilość motków", value: listing.skeins },
    { label: "Lokalizacja", value: listing.country },
    { label: "Dodano", value: addedAt },
    { label: "Platforma", value: marketplace },
  ];

  return (
    <main className="min-h-screen bg-[#F6F5F1] text-[#1F2A24]">
      <section className="mx-auto max-w-3xl px-6 py-20">
        <a
          href="/"
          className="mb-10 inline-flex text-sm font-medium text-[#6F6F6F] transition hover:text-[#90A885]"
        >
          Wróć
        </a>

        <div className="overflow-hidden rounded-[32px] border border-[#ECE7DF] bg-white">
          <div className="aspect-[4/3] bg-[#EEF1EA]">
            {imageUrl ? (
              <div
                className="h-full w-full bg-cover bg-center"
                role="img"
                aria-label={`${listing.brand ?? ""} ${listing.yarn_name ?? ""}`.trim()}
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm font-medium text-[#90A885]">
                Brak zdjęcia
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="text-sm text-[#8E8E8E]">
              {listing.brand ?? "-"}
            </div>

            <h1 className="mt-1 text-4xl font-semibold text-[#1F2A24]">
              {listing.yarn_name ?? "-"}
            </h1>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-2xl border border-[#ECE7DF] bg-[#F6F5F1] px-5 py-4"
                >
                  <div className="text-sm text-[#8E8E8E]">
                    {detail.label}
                  </div>
                  <div className="mt-1 font-medium text-[#1F2A24]">
                    {detail.value ?? "-"}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#ECE7DF] bg-[#F6F5F1] px-5 py-4">
              <div className="text-sm text-[#8E8E8E]">
                Opis
              </div>
              <p className="mt-1 whitespace-pre-line text-[#1F2A24]">
                {listing.description || "-"}
              </p>
            </div>

            {listing.contact ? (
              <a
                href={listing.contact}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex rounded-2xl bg-[#90A885] px-7 py-4 font-medium text-white transition hover:bg-[#7E9575]"
              >
                Przejdź do ogłoszenia
              </a>
            ) : (
              <div className="mt-8 rounded-2xl border border-[#ECE7DF] bg-[#F6F5F1] px-5 py-4 text-[#6F6F6F]">
                Brak linku do ogłoszenia.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function formatDate(createdAt: string | null) {
  if (!createdAt) {
    return "-";
  }

  return new Intl.DateTimeFormat("pl-PL", {
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
