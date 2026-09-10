import { BadgePlus, Search, Sparkles } from "lucide-react";

type Props = {
  language: "en" | "pl";
};

export default function Stats({ language }: Props) {
  const cards =
    language === "pl"
      ? [
          {
            icon: <Sparkles size={32} strokeWidth={1.5} />,
            title: "Pierwsza wersja projektu",
            text: "Dyeloty są rozwijane krok po kroku z myślą o realnych potrzebach dziewiarek.",
          },
          {
            icon: <Search size={32} strokeWidth={1.5} />,
            title: "Wyszukiwanie po dye lot",
            text: "Szukaj ogłoszeń po marce, nazwie włóczki, kolorze i numerze partii.",
          },
          {
            icon: <BadgePlus size={32} strokeWidth={1.5} />,
            title: "Ogłoszenia od użytkowniczek",
            text: "Włóczki są dodawane ręcznie przez osoby, które chcą pomóc innym domknąć projekt.",
          },
        ]
      : [
          {
            icon: <Sparkles size={32} strokeWidth={1.5} />,
            title: "First project version",
            text: "Dyeloty is being developed step by step around real maker needs.",
          },
          {
            icon: <Search size={32} strokeWidth={1.5} />,
            title: "Search by dye lot",
            text: "Search listings by brand, yarn name, color, and dye lot number.",
          },
          {
            icon: <BadgePlus size={32} strokeWidth={1.5} />,
            title: "Listings from users",
            text: "Yarn listings are added manually by people who want to help others finish a project.",
          },
        ];

  return (
    <section className="mt-14 border-y border-[#E8E3DB] py-12">
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl bg-white p-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1EAF8] text-[#7438B7]">
              {card.icon}
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#1F2A24]">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6F6F6F]">
              {card.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
