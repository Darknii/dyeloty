type Props = {
  language: "en" | "pl";
};

export default function Footer({ language }: Props) {
  return (
    <footer id="support" className="mt-24 border-t border-[#E8E1F0] bg-white py-16">
      <div className="mx-auto max-w-7xl text-center">
        <div className="text-2xl font-semibold text-[#17142E]">Dyeloty</div>

        <p className="mt-3 text-[#70677F]">
          {language === "pl"
            ? "Znajdź włóczkę z tej samej partii."
            : "Find yarn from the same dye lot."}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-10 text-[#70677F]">
          <a
            href={language === "pl" ? "/pl/about" : "/en/about"}
            className="transition hover:text-[#7438B7]"
          >
            {language === "pl" ? "O projekcie" : "About"}
          </a>

          <a
            href={language === "pl" ? "/add-listing/pl" : "/add-listing/en"}
            className="transition hover:text-[#7438B7]"
          >
            {language === "pl" ? "Dodaj włóczkę" : "Add Yarn"}
          </a>

          <a
            href={language === "pl" ? "/pl/faq" : "/en/faq"}
            className="transition hover:text-[#7438B7]"
          >
            FAQ
          </a>

          <a
            href={language === "pl" ? "/pl/contact" : "/en/contact"}
            className="transition hover:text-[#7438B7]"
          >
            {language === "pl" ? "Kontakt" : "Contact"}
          </a>

          <a
            href={language === "pl" ? "/pl/privacy" : "/en/privacy"}
            className="transition hover:text-[#7438B7]"
          >
            {language === "pl" ? "Polityka prywatności" : "Privacy Policy"}
          </a>

          <a href="#support" className="transition hover:text-[#7438B7]">
            ☕ {language === "pl" ? "Wesprzyj Dyeloty" : "Support Dyeloty"}
          </a>
        </div>

        <div className="mt-12 text-sm text-[#A0A0A0]">© 2026 Dyeloty</div>
      </div>
    </footer>
  );
}
