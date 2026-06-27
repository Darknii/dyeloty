"use client";

import { use, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../supabase";
import {
  LISTING_STATUS_OPTIONS,
  normalizeListingStatus,
  type ListingStatus,
} from "../../listingStatus";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type Listing = {
  id: number;
  brand: string | null;
  yarn_name: string | null;
  color: string | null;
  dyelot: string | null;
  skeins: number | null;
  country: string | null;
  contact: string | null;
  type: string | null;
  status: string | null;
  image_url: string | null;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function EditListingPage({ params }: Props) {
  const { id } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isListingLoading, setIsListingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [savedListingId, setSavedListingId] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [yarnName, setYarnName] = useState("");
  const [color, setColor] = useState("");
  const [dyelot, setDyelot] = useState("");
  const [skeins, setSkeins] = useState("");
  const [country, setCountry] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [status, setStatus] = useState<ListingStatus>("available");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    async function loadListing(userId: string) {
      setIsListingLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("listings")
        .select("id, brand, yarn_name, color, dyelot, skeins, country, contact, type, status, image_url")
        .eq("id", id)
        .eq("user_id", userId)
        .single<Listing>();

      setIsListingLoading(false);

      if (error || !data) {
        setMessage("Nie znaleziono ogłoszenia albo nie masz uprawnień do edycji.");
        return;
      }

      setBrand(data.brand ?? "");
      setYarnName(data.yarn_name ?? "");
      setColor(data.color ?? "");
      setDyelot(data.dyelot ?? "");
      setSkeins(data.skeins === null ? "" : String(data.skeins));
      setCountry(data.country ?? "");
      setListingUrl(data.contact ?? "");
      setStatus(normalizeListingStatus(data.status));
      setCurrentImageUrl(data.image_url ?? "");
    }

    void loadListing(session.user.id);
  }, [id, session?.user]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!session?.user) {
      setMessage("Musisz być zalogowana lub zalogowany.");
      return;
    }

    const skeinsCount = Number.parseInt(skeins, 10);

    if (
      !brand.trim() ||
      !yarnName.trim() ||
      !color.trim() ||
      !dyelot.trim() ||
      !country.trim() ||
      !listingUrl.trim()
    ) {
      setMessage("Uzupełnij wszystkie pola formularza.");
      return;
    }

    if (!Number.isFinite(skeinsCount) || skeinsCount < 1) {
      setMessage("Liczba motków musi być większa od zera.");
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(listingUrl.trim());
    } catch {
      setMessage("Podaj poprawny link do ogłoszenia.");
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setMessage("Podaj poprawny link do ogłoszenia.");
      return;
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const type = hostname.includes("olx") ? "olx" : "vinted";

    setIsSubmitting(true);

    const uploadedImageUrl = await uploadListingImage(session.user.id);

    if (uploadedImageUrl === false) {
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("listings")
      .update({
        brand: brand.trim(),
        yarn_name: yarnName.trim(),
        color: color.trim(),
        dyelot: dyelot.trim(),
        skeins: skeinsCount,
        country: country.trim(),
        contact: parsedUrl.toString(),
        type,
        status,
        image_url: uploadedImageUrl ?? (currentImageUrl || null),
      })
      .eq("id", id)
      .eq("user_id", session.user.id);

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message || "Nie udało się zapisać zmian.");
      return;
    }

    if (uploadedImageUrl) {
      setCurrentImageUrl(uploadedImageUrl);
      setImageFile(null);
    }

    setSavedListingId(id);
    setMessage("Zmiany zostały zapisane.");
  }

  async function uploadListingImage(userId: string) {
    if (!imageFile) {
      return null;
    }

    const filePath = `listings/${userId}/${Date.now()}-${sanitizeFileName(imageFile.name)}`;

    const { error } = await supabase.storage
      .from("listing-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type,
      });

    if (error) {
      setMessage(error.message || "Nie udało się przesłać zdjęcia. Spróbuj ponownie.");
      return false;
    }

    const { data } = supabase.storage.from("listing-images").getPublicUrl(filePath);
    return data.publicUrl;
  }

  function handleImageChange(file: File | null) {
    setMessage("");

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageFile(null);
      setMessage("Dodaj plik w formacie JPG, PNG albo WebP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageFile(null);
      setMessage("Zdjęcie może mieć maksymalnie 5 MB.");
      return;
    }

    setImageFile(file);
  }

  if (isAuthLoading || isListingLoading) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#FBF9FF_0%,#F7F4FB_48%,#F4EFF8_100%)] px-4 py-12 text-[#17142E]">
        <section className="mx-auto max-w-3xl rounded-2xl border border-[#E8E1F0] bg-white p-8 shadow-[0_18px_55px_rgba(51,36,82,0.09)]">
          <div className="flex items-center gap-3 text-[#6E6582]">
            <Loader2 className="animate-spin text-[#7438B7]" size={22} />
            Ładowanie ogłoszenia...
          </div>
        </section>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#FBF9FF_0%,#F7F4FB_48%,#F4EFF8_100%)] px-4 py-12 text-[#17142E]">
        <section className="mx-auto max-w-2xl rounded-2xl border border-[#E8E1F0] bg-white p-8 text-center shadow-[0_18px_55px_rgba(51,36,82,0.09)]">
          <h1 className="text-3xl font-bold">Edytuj ogłoszenie</h1>
          <p className="mt-3 text-[#6E6582]">
            Zaloguj się, aby edytować swoje ogłoszenia.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white"
          >
            Przejdź do logowania
          </Link>
        </section>
      </main>
    );
  }

  if (message === "Zmiany zostały zapisane.") {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#FBF9FF_0%,#F7F4FB_48%,#F4EFF8_100%)] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12">
        <section className="mx-auto max-w-3xl rounded-[28px] border border-[#E8E1F0] bg-white p-8 text-center shadow-[0_22px_70px_rgba(51,36,82,0.10)]">
          <h1 className="text-3xl font-bold">{message}</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/account"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white"
            >
              Wróć do mojego konta
            </Link>
            {savedListingId ? (
              <Link
                href={`/listing/${savedListingId}?from=account`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F4EEF9] px-5 text-sm font-semibold text-[#7438B7]"
              >
                Zobacz ogłoszenie
              </Link>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FBF9FF_0%,#F7F4FB_48%,#F4EFF8_100%)] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/account"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#6C5A86] shadow-[0_10px_28px_rgba(51,36,82,0.07)] transition hover:text-[#7438B7]"
        >
          <ArrowLeft size={17} />
          Wróć do mojego konta
        </Link>

        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-5 overflow-hidden rounded-[28px] border border-[#E8E1F0] bg-white p-5 shadow-[0_22px_70px_rgba(51,36,82,0.10)] sm:p-8"
        >
          <div className="-m-5 mb-1 bg-[linear-gradient(135deg,#FFFFFF_0%,#F9F2FC_100%)] p-5 sm:-m-8 sm:mb-1 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
              Dyeloty
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Edytuj ogłoszenie</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6E6582] sm:text-base">
              Zaktualizuj tylko te dane, które się zmieniły. Zdjęcie zostanie bez zmian, jeśli nie dodasz nowego pliku.
            </p>
          </div>

          <QualityChecklist />

          <div>
            <label htmlFor="status" className="mb-2 block text-sm font-semibold text-[#514A67]">
              Status ogłoszenia
            </label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as ListingStatus)}
              className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition focus:border-[#A875D2]"
            >
              {LISTING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <EditField id="brand" label="Marka" value={brand} onChange={setBrand} />
            <EditField id="yarnName" label="Nazwa włóczki" value={yarnName} onChange={setYarnName} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <EditField id="color" label="Kolor" value={color} onChange={setColor} />
            <EditField id="dyelot" label="Dye lot" value={dyelot} onChange={setDyelot} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <EditField
              id="skeins"
              label="Liczba motków"
              value={skeins}
              onChange={setSkeins}
              type="number"
              min="1"
            />
            <EditField id="country" label="Kraj / lokalizacja" value={country} onChange={setCountry} />
          </div>

          <EditField
            id="listingUrl"
            label="Link do ogłoszenia"
            value={listingUrl}
            onChange={setListingUrl}
            type="url"
          />

          <div>
            <label htmlFor="listingImage" className="mb-2 block text-sm font-semibold text-[#514A67]">
              Zdjęcie włóczki / etykiety / numeru partii
            </label>
            <input
              id="listingImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
              className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 py-3 text-sm text-[#17142E] outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-[#F4EEF9] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#7438B7] hover:file:bg-[#EDE2F8] focus:border-[#A875D2]"
            />
            <p className="mt-2 text-sm text-[#6E6582]">
              Jeśli nie dodasz nowego zdjęcia, obecne zdjęcie zostanie bez zmian.
            </p>
            {imagePreviewUrl || currentImageUrl ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#E8E1F0] bg-[#FAF8FC]">
                <img
                  src={imagePreviewUrl || currentImageUrl}
                  alt=""
                  className="h-56 w-full object-cover"
                />
              </div>
            ) : null}
          </div>

          {message ? (
            <p className="rounded-2xl bg-[#FAF8FC] p-4 text-sm text-[#514A67]">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#7438B7] px-8 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.28)] transition hover:bg-[#622CA2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </form>
      </section>
    </main>
  );
}

function EditField({
  id,
  label,
  value,
  onChange,
  type = "text",
  min,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#514A67]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition placeholder:text-[#9489AA] focus:border-[#A875D2]"
        required
      />
    </div>
  );
}

function QualityChecklist() {
  const items = [
    "zdjęcie włóczki lub etykiety",
    "numer partii / dye lot",
    "liczbę motków",
    "metraż i gramaturę",
    "informację, czy włóczka jest nowa, napoczęta czy z odzysku",
  ];

  return (
    <div className="rounded-2xl border border-[#E8E1F0] bg-[#FAF8FC] p-5">
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#7438B7]">
        Dobre ogłoszenie zawiera:
      </h2>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#6E6582] sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B98BE0]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function sanitizeFileName(fileName: string) {
  const fallbackName = "listing-image";
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return normalized || fallbackName;
}
