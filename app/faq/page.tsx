import type { Metadata } from "next";
import Footer from "../Footer";

export const metadata: Metadata = {
  title: "FAQ — Dyeloty",
  description:
    "Najczęstsze pytania o Dyeloty, dye loty, ogłoszenia i działanie serwisu.",
};

const faqItems = [
  {
    question: "Czym są Dyeloty?",
    answer:
      "Dyeloty to serwis ogłoszeniowo-wyszukiwarkowy dla osób, które szukają konkretnej włóczki po marce, nazwie, kolorze i numerze partii farbowania. To nie jest sklep.",
  },
  {
    question: "Czym jest dye lot / partia farbowania?",
    answer:
      "Dye lot to numer partii farbowania włóczki. Ten sam kolor z różnych partii może delikatnie się różnić, dlatego przy większych projektach często ważne jest znalezienie dokładnie tej samej partii.",
  },
  {
    question: "Czy mogę dodać ogłoszenie bez zdjęcia?",
    answer:
      "Tak. Zdjęcie pomaga innym szybciej sprawdzić włóczkę i etykietę, ale nie jest wymagane. Najważniejsze są marka, nazwa włóczki, kolor, dye lot i liczba motków.",
  },
  {
    question: "Czy Dyeloty sprzedają włóczkę?",
    answer:
      "Nie. Dyeloty pomagają znaleźć ogłoszenie lub dodać własne. Zakup, płatność i kontakt ze sprzedającą odbywają się poza Dyeloty, na przykład przez Vinted lub OLX.",
  },
  {
    question: "Czy muszę mieć konto?",
    answer:
      "Wyszukiwanie ogłoszeń jest publiczne. Konto Google jest potrzebne do dodawania ogłoszeń, zarządzania swoimi ogłoszeniami i zapisywania ulubionych.",
  },
  {
    question: "Czy ogłoszenia z Vinted/OLX są pobierane automatycznie?",
    answer:
      "Nie. Dyeloty nie pobierają automatycznie ogłoszeń ani zdjęć z zewnętrznych platform. Użytkowniczki dodają własne ogłoszenia i mogą wkleić link do miejsca, gdzie da się dokończyć zakup.",
  },
  {
    question: "Co oznacza status ogłoszenia?",
    answer:
      "Status pomaga ocenić aktualność ogłoszenia. Dostępne oznacza, że ogłoszenie powinno być aktualne. Zarezerwowane sugeruje, że ktoś już rozmawia o zakupie. Sprzedane / nieaktualne oznacza, że włóczka może nie być już dostępna.",
  },
  {
    question: "Jak zgłosić problem albo sugestię?",
    answer:
      "Napisz przez stronę kontaktu. Dyeloty są małym projektem MVP, więc konkretne uwagi po testach bardzo pomagają w dalszym rozwoju.",
  },
];

export default function Page() {
  return (
    <>
      <main className="bg-[#F7F4FB] px-4 py-10 text-[#17142E] sm:px-6 sm:py-16">
        <section className="mx-auto max-w-4xl">
          <div className="rounded-[28px] border border-[#E8E1F0] bg-white p-6 shadow-[0_22px_70px_rgba(51,36,82,0.10)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
              FAQ
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
              Najczęstsze pytania
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-[#6E6582]">
              Krótko i po ludzku: jak działa Dyeloty, do czego służy dye lot i czego możesz się spodziewać w wersji MVP.
            </p>

            <div className="mt-8 grid gap-4">
              {faqItems.map((item) => (
                <article
                  key={item.question}
                  className="rounded-2xl border border-[#E8E1F0] bg-[#FAF8FC] p-5"
                >
                  <h2 className="text-lg font-bold text-[#17142E]">
                    {item.question}
                  </h2>
                  <p className="mt-2 leading-7 text-[#6E6582]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer language="pl" />
    </>
  );
}
