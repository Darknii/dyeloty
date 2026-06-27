import Link from "next/link";

type Props = {
  language: "en" | "pl";
};

export default function About({ language }: Props) {
  const isPolish = language === "pl";
  const t = isPolish
    ? {
        eyebrow: "O projekcie",
        title: "Dyeloty powstały z potrzeby znalezienia brakującego motka.",
        intro:
          "Każda dziewiarka zna ten moment: projekt jest prawie gotowy, ale brakuje jednego motka, a właściwa partia farbowania zniknęła już ze sklepów.",
        storyTitle: "Dlaczego Dyeloty?",
        story:
          "Dyeloty pomaga zebrać w jednym miejscu ogłoszenia z włóczkami, które mogą uratować czyjś sweter, chustę albo koc. Najważniejsze są konkretne dane z etykiety: marka, nazwa, kolor i dye lot.",
        afterHoursTitle: "Projekt po godzinach",
        afterHours:
          "To mały projekt tworzony po pracy, krok po kroku. Bez wielkiego zespołu i bez obietnic ponad miarę. Najpierw budujemy prosty, użyteczny MVP dla osób, które naprawdę szukają konkretnej partii włóczki.",
        supportTitle: "Na co idzie wsparcie?",
        support:
          "Wpłaty pomagają pokrywać utrzymanie strony, domenę, infrastrukturę, testy i dalszy rozwój funkcji, które ułatwią dziewiarkom domykanie rozpoczętych projektów.",
        cta: "Wesprzyj Dyeloty",
        back: "Wróć do ogłoszeń",
      }
    : {
        eyebrow: "About",
        title: "Dyeloty was created to help find the missing skein.",
        intro:
          "Every knitter knows the feeling: the project is almost done, one skein is missing, and the right dye lot has disappeared from shops.",
        storyTitle: "Why Dyeloty?",
        story:
          "Dyeloty brings together yarn listings that may save someone's sweater, shawl, or blanket. The key details are simple: brand, yarn name, color, and dye lot.",
        afterHoursTitle: "Built after hours",
        afterHours:
          "This is a small after-hours project, developed step by step. No big team, no inflated promises. The first goal is a useful MVP for makers looking for a specific yarn batch.",
        supportTitle: "What support funds",
        support:
          "Support helps cover maintenance, domain, infrastructure, testing, and further development of features that make it easier to finish projects.",
        cta: "Support Dyeloty",
        back: "Back to listings",
      };

  const homeHref = isPolish ? "/pl" : "/en";
  const supportHref = "https://buymeacoffee.com/dyelotyapp";

  return (
    <section className="py-10 sm:py-16">
      <div className="overflow-hidden rounded-[28px] border border-[#E8E1F0] bg-white shadow-[0_22px_70px_rgba(51,36,82,0.10)]">
        <div className="bg-[linear-gradient(135deg,#FFFFFF_0%,#F9F2FC_100%)] p-6 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
            {t.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-[#17142E] sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#514A67] sm:text-lg">
            {t.intro}
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-3">
          <AboutCard title={t.storyTitle} text={t.story} />
          <AboutCard title={t.afterHoursTitle} text={t.afterHours} />
          <AboutCard title={t.supportTitle} text={t.support} />
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E8E1F0] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <Link
            href={homeHref}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F4EEF9] px-5 text-sm font-semibold text-[#7438B7] transition hover:bg-[#EDE2F8]"
          >
            {t.back}
          </Link>
          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2]"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </section>
  );
}

function AboutCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-[#FAF8FC] p-5">
      <h2 className="text-lg font-bold text-[#17142E]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#6E6582]">{text}</p>
    </article>
  );
}
