type Props = {
  language: "en" | "pl";
};

export default function Faq({ language }: Props) {
  return (
    <section className="mx-auto max-w-4xl py-16">
      <h1 className="text-4xl font-semibold text-[#1F2A24]">FAQ</h1>

      <div className="mt-12 space-y-10">
        <div>
          <h2 className="text-xl font-semibold text-[#1F2A24]">
            {language === "pl" ? "Co to jest dye lot?" : "What is a dye lot?"}
          </h2>

          <p className="mt-3 leading-8 text-[#6F6F6F]">
            {language === "pl"
              ? "Dye lot, czyli partia farbowania, oznacza serię włóczki o możliwie spójnym kolorze. Nawet ten sam numer koloru może różnić się między partiami."
              : "A dye lot is a batch of yarn dyed together. Even the same color number may vary between batches."}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F2A24]">
            {language === "pl"
              ? "Czy korzystanie z Dyeloty jest darmowe?"
              : "Is Dyeloty free to use?"}
          </h2>

          <p className="mt-3 leading-8 text-[#6F6F6F]">
            {language === "pl"
              ? "Tak. Dodawanie i wyszukiwanie ogłoszeń jest bezpłatne."
              : "Yes. Searching and adding listings is free."}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F2A24]">
            {language === "pl"
              ? "Jak dodać ogłoszenie?"
              : "How do I add a listing?"}
          </h2>

          <p className="mt-3 leading-8 text-[#6F6F6F]">
            {language === "pl"
              ? "Po zalogowaniu przez Google możesz dodać włóczkę wraz z numerem koloru, dye lotem i liczbą motków."
              : "After signing in with Google you can add your yarn together with color, dye lot and number of skeins."}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#1F2A24]">
            {language === "pl"
              ? "Jak wesprzeć projekt?"
              : "How can I support the project?"}
          </h2>

          <p className="mt-3 leading-8 text-[#6F6F6F]">
            {language === "pl"
              ? "Możesz wesprzeć utrzymanie strony, domeny i dalszy rozwój funkcji."
              : "You can support maintenance, domain costs, and future feature development."}
          </p>
        </div>
      </div>
    </section>
  );
}
