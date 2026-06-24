type Props = {
  language: "en" | "pl";
};

export default function SupportDyeloty({ language }: Props) {
  return (
    <section className="mt-16 border-t border-[#ECE7DF] pt-8">

      <div className="flex flex-col items-center justify-center gap-3 text-center text-[#6F6F6F] md:flex-row">

        <span className="text-lg">
          ☕ {language === "pl"
            ? "Podoba Ci się Dyeloty?"
            : "Enjoying Dyeloty?"}
        </span>

        <span>
          {language === "pl"
            ? "Wesprzyj rozwój projektu."
            : "Support the project."}
        </span>

        <button className="font-medium text-[#90A885] transition hover:text-[#7E9575]">
          {language === "pl"
            ? "Postaw kawę →"
            : "Buy me a coffee →"}
        </button>

      </div>

    </section>
  );
}