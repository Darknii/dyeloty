type Props = {
  language: "en" | "pl";
};

export default function SupportDyeloty({ language }: Props) {
  return (
    <section id="support" className="mt-16 border-t border-[#ECE7DF] pt-8">

      <div className="flex flex-col items-center justify-center gap-3 text-center text-[#6F6F6F] md:flex-row">

        <span className="text-lg font-semibold text-[#17142E]">
          {language === "pl"
            ? "Podoba Ci się Dyeloty?"
            : "Enjoying Dyeloty?"}
        </span>

        <span>
          {language === "pl"
            ? "Wesprzyj rozwój projektu."
            : "Support the project."}
        </span>

        <a
          href={language === "pl" ? "/pl/about#support" : "/en/about#support"}
          className="font-semibold text-[#7438B7] transition hover:text-[#622CA2]"
        >
          {language === "pl"
            ? "Wesprzyj Dyeloty →"
            : "Support Dyeloty →"}
        </a>

      </div>

    </section>
  );
}
