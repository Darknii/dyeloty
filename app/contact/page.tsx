import type { Metadata } from "next";
import Footer from "../Footer";

export const metadata: Metadata = {
  title: "Kontakt — Dyeloty",
  description:
    "Kontakt z Dyeloty w sprawie problemów, sugestii i pytań dotyczących MVP.",
};

export default function Page() {
  return (
    <>
      <main className="bg-[#F7F4FB] px-4 py-10 text-[#17142E] sm:px-6 sm:py-16">
        <section className="mx-auto max-w-3xl">
          <div className="rounded-[28px] border border-[#E8E1F0] bg-white p-6 shadow-[0_22px_70px_rgba(51,36,82,0.10)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
              Kontakt
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
              Napisz do Dyeloty
            </h1>
            <p className="mt-4 leading-7 text-[#6E6582]">
              Masz problem z ogłoszeniem, pomysł na usprawnienie albo chcesz podzielić się opinią po testach? Najprościej napisać maila.
            </p>

            <div className="mt-8 rounded-2xl border border-[#E8E1F0] bg-[#FAF8FC] p-5">
              <p className="text-sm font-semibold text-[#514A67]">
                Email kontaktowy
              </p>
              <a
                href="mailto:kontakt@dyeloty.pl"
                className="mt-2 inline-flex text-lg font-bold text-[#7438B7] transition hover:text-[#622CA2]"
              >
                kontakt@dyeloty.pl
              </a>
              <p className="mt-3 leading-7 text-[#6E6582]">
                Dyeloty są małym projektem rozwijanym po godzinach, więc odpowiedź może nie przyjść natychmiast, ale każda konkretna informacja zwrotna jest bardzo cenna.
              </p>
            </div>

            <a
              href="mailto:kontakt@dyeloty.pl"
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#7438B7] px-6 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.24)] transition hover:bg-[#622CA2]"
            >
              Napisz maila
            </a>
          </div>
        </section>
      </main>

      <Footer language="pl" />
    </>
  );
}
