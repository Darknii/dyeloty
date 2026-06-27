import {
  Hash,
  Heart,
  MapPin,
  Palette,
  Search,
  ShieldCheck,
  Spool,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import Header from "./Header";
import Listings, { ListingsLoading } from "./Listings";
import Footer from "./Footer";

type Props = {
  language: "en" | "pl";
  filters?: ListingFilters;
};

export type ListingFilters = {
  q?: string | string[];
  brand?: string | string[];
  color?: string | string[];
  dyelot?: string | string[];
  location?: string | string[];
};

export default function HomePage({ language, filters = {} }: Props) {
  const t =
    language === "pl"
      ? {
          titleOne: "Znajdź włóczkę.",
          titleTwoBefore: "Ten sam ",
          colorWord: "kolor",
          titleThreeBefore: "Ta sama ",
          lotWord: "partia",
          description:
            "Dyeloty pomaga dziewiarkom znaleźć włóczki z tej samej partii farbowania.",
          descriptionTwo: "Szybko. Wygodnie. Z miłości do dziergania.",
          heroPhoto: "Miejsce na zdjęcie włóczek",
          brand: "Marka",
          brandPlaceholder: "np. Drops Air",
          color: "Kolor",
          colorPlaceholder: "np. beżowy",
          dyelot: "Dye lot / Partia",
          dyelotPlaceholder: "np. 1234",
          location: "Lokalizacja",
          locationPlaceholder: "Cała Polska",
          search: "Szukaj",
          popular: "Popularne wyszukiwania:",
          recent: "Najnowsze ogłoszenia",
          seeAll: "Zobacz wszystkie",
          statsListings: "Ogłoszeń włóczek",
          statsListingsSub: "z różnych marek",
          statsLots: "Znalezione partie",
          statsLotsSub: "dzięki Dyelotom",
          statsUsers: "Zadowolonych dziewiarek",
          statsUsersSub: "dołączyło do nas",
          statsSafe: "Bezpieczne zakupy",
          statsSafeSub: "i kontakt ze sprzedającym",
          howTitle: "Jak to działa?",
          howIntro:
            "Najpierw sprawdź etykietę i numer partii farbowania. Potem Dyeloty pomaga znaleźć osoby, które mają właśnie ten brakujący motek.",
          howSteps: [
            {
              title: "Spisz dane z etykiety",
              text: "Marka, nazwa włóczki, kolor i dye lot wystarczą, żeby zacząć sensowne szukanie.",
            },
            {
              title: "Przejrzyj ogłoszenia",
              text: "Zobacz motki dodane przez inne dziewiarki i porównaj najważniejsze szczegóły partii.",
            },
            {
              title: "Dokończ zakup poza Dyeloty",
              text: "Gdy znajdziesz pasujący motek, przejdź do OLX albo Vinted i dogadaj szczegóły bezpośrednio ze sprzedającą.",
            },
          ],
        }
      : {
          titleOne: "Find yarn.",
          titleTwoBefore: "Same ",
          colorWord: "color",
          titleThreeBefore: "Same ",
          lotWord: "dye lot",
          description:
            "Dyeloty is a place for makers looking for yarn from the same dye lot.",
          descriptionTwo: "Fast. Simple. Made with love for knitting.",
          heroPhoto: "Yarn photo area",
          brand: "Brand",
          brandPlaceholder: "e.g. Drops Air",
          color: "Color",
          colorPlaceholder: "e.g. beige",
          dyelot: "Dye lot",
          dyelotPlaceholder: "e.g. 1234",
          location: "Location",
          locationPlaceholder: "All Poland",
          search: "Search",
          popular: "Popular searches:",
          recent: "Newest listings",
          seeAll: "See all",
          statsListings: "Yarn listings",
          statsListingsSub: "from many brands",
          statsLots: "Matched lots",
          statsLotsSub: "thanks to Dyeloty",
          statsUsers: "Happy makers",
          statsUsersSub: "joined us",
          statsSafe: "Safe buying",
          statsSafeSub: "with seller contact",
          howTitle: "How it works?",
          howIntro:
            "Start with the yarn label and dye lot number. Dyeloty helps you find people who may have the missing skein from that exact batch.",
          howSteps: [
            {
              title: "Read the label",
              text: "Brand, yarn name, color, and dye lot are enough to start a useful search.",
            },
            {
              title: "Browse listings",
              text: "Check skeins added by other makers and compare the details that matter for a matching batch.",
            },
            {
              title: "Finish outside Dyeloty",
              text: "When you find a match, open OLX or Vinted and complete the purchase directly with the seller.",
            },
          ],
        };

  const chips = ["Drops Air", "Alize Puffy", "Merino Extra Fine", "Baby Merino", "Kokonki"];
  const homeHref = language === "pl" ? "/pl" : "/en";
  const normalizedFilters = normalizeFilters(filters);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F4FB] text-[#17142E]">
      <Header language={language} />

      <section className="relative overflow-hidden border-b border-[#ECE5F3] bg-[linear-gradient(105deg,#FBF9FF_0%,#F8F3FC_45%,#F4EFF8_100%)]">
        <div className="mx-auto grid max-w-[1280px] gap-7 px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12 lg:grid-cols-[0.53fr_0.47fr] lg:px-8 lg:pb-0 lg:pt-14">
          <div className="relative z-10 lg:pb-36">
            <h1 className="max-w-[720px] text-[40px] font-bold leading-[1.12] tracking-normal text-[#17142E] sm:text-6xl lg:text-[64px]">
              {t.titleOne}
              <br />
              {t.titleTwoBefore}
              <span className="text-[#C83EBF]">{t.colorWord}</span>.
              <br />
              {t.titleThreeBefore}
              <span className="text-[#7438B7]">{t.lotWord}</span>.
            </h1>

            <p className="mt-5 max-w-[590px] text-base leading-7 text-[#514A67] sm:text-lg">
              {t.description}
              <br />
              {t.descriptionTwo}
            </p>
          </div>

          <HeroPhotoPlaceholder label={t.heroPhoto} />
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <section className="relative z-20 -mt-1 sm:-mt-4 lg:-mt-24">
          <form
            action={homeHref}
            className="rounded-2xl border border-[#E6DDEC] bg-white p-4 shadow-[0_18px_55px_rgba(51,36,82,0.11)] sm:p-6"
          >
            <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_0.95fr_auto] lg:items-end">
              <SearchField
                label={t.brand}
                placeholder={t.brandPlaceholder}
                icon={<Search size={17} />}
                name="brand"
                defaultValue={normalizedFilters.brand}
              />
              <SearchField
                label={t.color}
                placeholder={t.colorPlaceholder}
                icon={<Palette size={17} />}
                name="color"
                defaultValue={normalizedFilters.color}
              />
              <SearchField
                label={t.dyelot}
                placeholder={t.dyelotPlaceholder}
                icon={<Hash size={17} />}
                name="dyelot"
                defaultValue={normalizedFilters.dyelot}
              />
              <SearchField
                label={t.location}
                placeholder={t.locationPlaceholder}
                icon={<MapPin size={17} />}
                name="location"
                defaultValue={normalizedFilters.location}
              />

              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7438B7] px-8 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.28)] transition hover:bg-[#622CA2] lg:w-[156px]"
              >
                <Search size={18} />
                {t.search}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#6E6582]">
              <span className="mr-2 font-medium">{t.popular}</span>
              {chips.map((chip) => (
                <a
                  key={chip}
                  href={`${homeHref}?q=${encodeURIComponent(chip)}#listings`}
                  className="rounded-full bg-[#F2EFF8] px-4 py-2 font-medium text-[#342E47]"
                >
                  {chip}
                </a>
              ))}
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E8E1F0] bg-white p-5 shadow-[0_12px_38px_rgba(51,36,82,0.08)] sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatItem
              icon={<Spool size={28} />}
              value="1 248"
              title={t.statsListings}
              subtitle={t.statsListingsSub}
            />
            <StatItem
              icon={<Heart size={30} />}
              value="3 892"
              title={t.statsLots}
              subtitle={t.statsLotsSub}
            />
            <StatItem
              icon={<UsersRound size={30} />}
              value="2 156"
              title={t.statsUsers}
              subtitle={t.statsUsersSub}
            />
            <StatItem
              icon={<ShieldCheck size={31} />}
              value="100%"
              title={t.statsSafe}
              subtitle={t.statsSafeSub}
            />
          </div>
        </section>

        <section id="how-it-works" className="mt-6 overflow-hidden rounded-2xl border border-[#E8E1F0] bg-white shadow-[0_12px_38px_rgba(51,36,82,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[0.34fr_0.66fr]">
            <div className="bg-[linear-gradient(135deg,#F8F1FB_0%,#FFF8FB_100%)] p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
                Dyeloty
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-normal text-[#17142E] sm:text-3xl">
                {t.howTitle}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#6E6582] sm:text-base">
                {t.howIntro}
              </p>
            </div>

            <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-3">
            {t.howSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl bg-[#FAF8FC] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EAF8] text-sm font-bold text-[#7438B7]">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-base font-bold text-[#17142E]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#6E6582]">
                  {step.text}
                </p>
              </div>
            ))}
            </div>
          </div>
        </section>

        <section id="listings" className="pb-14 pt-9 sm:pb-20 sm:pt-11">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-normal text-[#17142E]">
              {t.recent}
            </h2>
            <a
              href="#listings"
              className="hidden min-h-11 items-center gap-2 text-sm font-bold text-[#7438B7] sm:inline-flex"
            >
              {t.seeAll}
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <Suspense fallback={<ListingsLoading />}>
            <Listings language={language} filters={normalizedFilters} />
          </Suspense>
        </section>
      </div>

      <Footer language={language} />
    </main>
  );
}

function normalizeFilters(filters: ListingFilters) {
  return {
    q: getFirstParam(filters.q),
    brand: getFirstParam(filters.brand),
    color: getFirstParam(filters.color),
    dyelot: getFirstParam(filters.dyelot),
    location: getFirstParam(filters.location),
  };
}

function getFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function SearchField({
  label,
  placeholder,
  icon,
  name,
  defaultValue,
}: {
  label: string;
  placeholder: string;
  icon: ReactNode;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#514A67]">
        <span className="text-[#7A3FC5]">{icon}</span>
        {label}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-xl border border-[#DED6EA] bg-white px-4 text-sm text-[#17142E] outline-none transition placeholder:text-[#9489AA] focus:border-[#A875D2]"
      />
    </label>
  );
}

function StatItem({
  icon,
  value,
  title,
  subtitle,
}: {
  icon: ReactNode;
  value: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F1EAF8] text-[#6E5B93]">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-tight text-[#17142E]">
          {value}
        </div>
        <div className="mt-1 font-bold leading-snug text-[#17142E]">
          {title}
        </div>
        <div className="text-sm leading-6 text-[#70677F]">{subtitle}</div>
      </div>
    </div>
  );
}

function HeroPhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative min-h-[240px] overflow-hidden rounded-[28px] border border-white/70 bg-[#F4EFF8] shadow-[0_24px_70px_rgba(76,45,103,0.14)] sm:min-h-[320px] lg:min-h-[470px] lg:rounded-b-none">
      <Image
        src="/images/hero-yarn-bowl.png"
        alt={label}
        fill
        priority
        sizes="(min-width: 1024px) 47vw, 100vw"
        className="scale-[1.18] object-cover object-[58%_58%] contrast-[1.04] saturate-[1.03] transition-transform"
      />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/45 to-transparent" />
    </div>
  );
}
