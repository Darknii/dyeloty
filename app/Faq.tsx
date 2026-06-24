type Props = {
  language: "en" | "pl";
};

export default function Faq({ language }: Props) {
  return (
    <section className="mx-auto max-w-4xl py-16">

      <h1 className="text-4xl font-semibold text-[#1F2A24]">
        {language === "pl" ? "FAQ" : "FAQ"}
      </h1>

      <div className="mt-12 space-y-10">

        <div>
          <h2 className="text-xl font-semibold text-[#1F2A24]">
            {language === "pl"
              ? "Co to jest dyelot?"
              : "What is a dye lot?"}
          </h2>

          <p className="mt-3 leading-8 text-[#6F6F6F]">
            {language === "pl"
              ? "Dyelot (partia farbowania) oznacza serię włóczki o identycznym kolorze. Nawet ten sam numer koloru może różnić się między partiami."
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
              ? "Po zalogowaniu przez Google możesz dodać włóczkę wraz z numerem koloru, dyelotem i liczbą motków."
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
              ? "Możesz postawić kawę i pomóc w utrzymaniu oraz rozwoju Dyeloty."
              : "You can buy me a coffee and help maintain and improve Dyeloty."}
          </p>
        </div>

      </div>

    </section>
  );
}