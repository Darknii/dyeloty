"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, UserRound } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { getAuthCallbackRedirectTo } from "../authRedirect";

type Props = {
  language: "en" | "pl";
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AddListingPage({ language }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [brand, setBrand] = useState("");
  const [yarnName, setYarnName] = useState("");
  const [color, setColor] = useState("");
  const [dyelot, setDyelot] = useState("");
  const [skeins, setSkeins] = useState("");
  const [country, setCountry] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackRedirectTo(),
      },
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!session?.user) {
      setMessage(t.authError);
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
      setMessage(t.requiredError);
      return;
    }

    if (!Number.isFinite(skeinsCount) || skeinsCount < 1) {
      setMessage(t.skeinsError);
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(listingUrl.trim());
    } catch {
      setMessage(t.urlError);
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setMessage(t.urlError);
      return;
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const type = hostname.includes("olx") ? "olx" : "vinted";

    setIsSubmitting(true);

    const imageUrl = await uploadListingImage(session.user.id);

    if (imageUrl === false) {
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        brand: brand.trim(),
        yarn_name: yarnName.trim(),
        color: color.trim(),
        dyelot: dyelot.trim(),
        skeins: skeinsCount,
        country: country.trim(),
        contact: parsedUrl.toString(),
        status: "available",
        type,
        user_id: session.user.id,
        image_url: imageUrl,
      })
      .select("id")
      .single();

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message || t.genericError);
      return;
    }

    setPublishedListingId(typeof data?.id === "number" ? data.id : null);
    setMessage(t.success);
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
      setMessage(error.message || t.imageUploadError);
      return false;
    }

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

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
      setMessage(t.imageTypeError);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageFile(null);
      setMessage(t.imageSizeError);
      return;
    }

    setImageFile(file);
  }

  function handleAddAnother() {
    setBrand("");
    setYarnName("");
    setColor("");
    setDyelot("");
    setSkeins("");
    setCountry("");
    setListingUrl("");
    setImageFile(null);
    setMessage("");
    setPublishedListingId(null);
  }

  const t =
    language === "pl"
      ? {
          back: "Wróć do strony głównej",
          title: "Dodaj ogłoszenie",
          subtitle:
            "Wpisz dane włóczki, której szukasz lub którą chcesz oddać albo sprzedać.",
          formHintTitle: "Dane z etykiety są najważniejsze",
          formHint:
            "Wpisz dokładnie markę, nazwę, kolor i dye lot. To pomaga innym dziewiarkom szybko sprawdzić, czy motek pasuje do ich projektu.",
          checklistTitle: "Dobre ogłoszenie zawiera:",
          checklistItems: [
            "zdjęcie włóczki lub etykiety",
            "numer partii / dye lot",
            "liczbę motków",
            "metraż i gramaturę",
            "informację, czy włóczka jest nowa, napoczęta czy z odzysku",
          ],
          loginTitle: "Aby dodać ogłoszenie, zaloguj się przez Google.",
          loginHint:
            "Po zalogowaniu wróć do formularza i uzupełnij szczegóły włóczki.",
          loginButton: "Zaloguj przez Google",
          brand: "Marka",
          yarn: "Nazwa włóczki",
          color: "Kolor",
          dyelot: "Dye lot",
          skeins: "Liczba motków",
          country: "Kraj / lokalizacja",
          listingUrl: "Link do ogłoszenia",
          listingUrlPlaceholder:
            "https://www.vinted.pl/... albo https://www.olx.pl/...",
          listingUrlHelp:
            "Wklej link do miejsca, gdzie kupująca może dokończyć zakup.",
          image: "Zdjęcie włóczki / etykiety / numeru partii",
          imageHelp:
            "Możesz dodać zdjęcie włóczki, etykiety albo numeru partii. Jeśli masz już zdjęcie z Vinted lub OLX, możesz wrzucić je tutaj ponownie.",
          imageTypeError: "Dodaj plik w formacie JPG, PNG albo WebP.",
          imageSizeError: "Zdjęcie może mieć maksymalnie 5 MB.",
          imageUploadError: "Nie udało się przesłać zdjęcia. Spróbuj ponownie.",
          publish: "Opublikuj ogłoszenie",
          publishing: "Publikowanie...",
          requiredError: "Uzupełnij wszystkie pola formularza.",
          skeinsError: "Liczba motków musi być większa od zera.",
          urlError: "Podaj poprawny link do ogłoszenia.",
          authError: "Musisz być zalogowana lub zalogowany.",
          success: "Ogłoszenie zostało opublikowane.",
          genericError: "Nie udało się dodać ogłoszenia. Spróbuj ponownie.",
          addAnother: "Dodaj kolejne ogłoszenie",
          goToAccount: "Przejdź do mojego konta",
          viewListing: "Zobacz ogłoszenie",
        }
      : {
          back: "Back to homepage",
          title: "Add listing",
          subtitle:
            "Enter the yarn details you are looking for or want to pass on or sell.",
          formHintTitle: "Label details matter most",
          formHint:
            "Add the exact brand, name, color, and dye lot. It helps other makers quickly check whether the skein matches their project.",
          checklistTitle: "A good listing includes:",
          checklistItems: [
            "a photo of the yarn or label",
            "the dye lot number",
            "number of skeins",
            "length and weight",
            "whether the yarn is new, started, or reclaimed",
          ],
          loginTitle: "Sign in with Google to add a listing.",
          loginHint:
            "After signing in, return to the form and add your yarn details.",
          loginButton: "Continue with Google",
          brand: "Brand",
          yarn: "Yarn name",
          color: "Color",
          dyelot: "Dye lot",
          skeins: "Number of skeins",
          country: "Country / location",
          listingUrl: "Listing link",
          listingUrlPlaceholder:
            "https://www.vinted.pl/... or https://www.olx.pl/...",
          listingUrlHelp:
            "Paste the link where the buyer can complete the purchase.",
          image: "Yarn / label / dye lot photo",
          imageHelp:
            "You can add a photo of the yarn, label, or dye lot number. If you already have a photo from Vinted or OLX, you can upload it here again.",
          imageTypeError: "Upload a JPG, PNG, or WebP file.",
          imageSizeError: "The photo can be up to 5 MB.",
          imageUploadError: "Could not upload the photo. Please try again.",
          publish: "Publish listing",
          publishing: "Publishing...",
          requiredError: "Please fill in all form fields.",
          skeinsError: "Number of skeins must be greater than zero.",
          urlError: "Please enter a valid listing link.",
          authError: "You must be signed in.",
          success: "Your listing has been published.",
          genericError: "Could not add the listing. Please try again.",
          addAnother: "Add another listing",
          goToAccount: "Go to my account",
          viewListing: "View listing",
        };

  const homeHref = language === "pl" ? "/pl" : "/en";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FBF9FF_0%,#F7F4FB_48%,#F4EFF8_100%)] px-4 py-8 text-[#17142E] sm:px-6 sm:py-12">
      <section className="mx-auto max-w-4xl">
        <Link
          href={homeHref}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#6C5A86] shadow-[0_10px_28px_rgba(51,36,82,0.07)] transition hover:text-[#7438B7]"
        >
          <ArrowLeft size={17} />
          {t.back}
        </Link>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-[#E8E1F0] bg-white shadow-[0_22px_70px_rgba(51,36,82,0.10)]">
          <div className="bg-[linear-gradient(135deg,#FFFFFF_0%,#F9F2FC_100%)] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
            Dyeloty
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6E6582] sm:text-base">
            {t.subtitle}
          </p>
          </div>

          {!session ? (
            <div className="m-5 rounded-2xl bg-[#FAF8FC] p-6 text-center sm:m-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#7438B7] shadow-sm">
                <UserRound size={25} />
              </div>
              <h2 className="mt-4 text-xl font-bold">{t.loginTitle}</h2>
              <p className="mt-2 text-sm text-[#6E6582]">{t.loginHint}</p>
              <button
                onClick={handleLogin}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-6 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.28)] transition hover:bg-[#622CA2]"
              >
                {t.loginButton}
              </button>
            </div>
          ) : message === t.success ? (
            <div className="m-5 rounded-2xl bg-[#FAF8FC] p-6 text-center sm:m-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#7438B7] shadow-sm">
                <Plus size={25} />
              </div>
              <h2 className="mt-4 text-xl font-bold">{t.success}</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAddAnother}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2]"
                >
                  {t.addAnother}
                </button>
                <Link
                  href="/account"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#7438B7] shadow-sm transition hover:bg-[#F4EEF9]"
                >
                  {t.goToAccount}
                </Link>
                {publishedListingId ? (
                  <Link
                    href={`/listing/${publishedListingId}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D8CCE7] px-5 text-sm font-semibold text-[#7438B7] transition hover:bg-white sm:col-span-2"
                  >
                    {t.viewListing}
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5 p-5 sm:p-8">
              <div className="rounded-2xl border border-[#E8E1F0] bg-[#FAF8FC] p-5">
                <h2 className="text-lg font-bold text-[#17142E]">
                  {t.formHintTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6E6582]">
                  {t.formHint}
                </p>
              </div>

              <QualityChecklist title={t.checklistTitle} items={t.checklistItems} />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="brand" label={t.brand} value={brand} onChange={setBrand} />
                <FormField id="yarnName" label={t.yarn} value={yarnName} onChange={setYarnName} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="color" label={t.color} value={color} onChange={setColor} />
                <FormField id="dyelot" label={t.dyelot} value={dyelot} onChange={setDyelot} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  id="skeins"
                  label={t.skeins}
                  value={skeins}
                  onChange={setSkeins}
                  type="number"
                  min="1"
                />
                <FormField id="country" label={t.country} value={country} onChange={setCountry} />
              </div>

              <div>
                <label htmlFor="listingUrl" className="mb-2 block text-sm font-semibold text-[#514A67]">
                  {t.listingUrl}
                </label>
                <input
                  id="listingUrl"
                  type="url"
                  value={listingUrl}
                  onChange={(event) => setListingUrl(event.target.value)}
                  placeholder={t.listingUrlPlaceholder}
                  className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition placeholder:text-[#9489AA] focus:border-[#A875D2]"
                  required
                />
                <p className="mt-2 text-sm text-[#6E6582]">{t.listingUrlHelp}</p>
              </div>

              <div>
                <label htmlFor="listingImage" className="mb-2 block text-sm font-semibold text-[#514A67]">
                  {t.image}
                </label>
                <input
                  id="listingImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
                  className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 py-3 text-sm text-[#17142E] outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-[#F4EEF9] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#7438B7] hover:file:bg-[#EDE2F8] focus:border-[#A875D2]"
                />
                <p className="mt-2 text-sm text-[#6E6582]">{t.imageHelp}</p>
                {imagePreviewUrl ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-[#E8E1F0] bg-[#FAF8FC]">
                    <img
                      src={imagePreviewUrl}
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
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {isSubmitting ? t.publishing : t.publish}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function FormField({
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

function QualityChecklist({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-[#E8E1F0] bg-white p-5 shadow-[0_8px_22px_rgba(51,36,82,0.05)]">
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#7438B7]">
        {title}
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
