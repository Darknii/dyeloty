type Props = {
  language: "en" | "pl";
};

export default function Footer({ language }: Props) {
  return (
    <footer className="mt-24 border-t border-[#E8E3DB] py-16">
      <div className="mx-auto max-w-7xl text-center">

        <div className="text-2xl font-semibold text-[#1F2A24]">
          Dyeloty
        </div>

        <p className="mt-3 text-[#6F6F6F]">
          {language === "pl"
            ? "Znajdź swój brakujący motek."
            : "Find your missing skein."}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-10 text-[#6F6F6F]">

          <a
            href={language === "pl" ? "/pl/about" : "/en/about"}
            className="transition hover:text-[#90A885]"
          >
            {language === "pl" ? "O projekcie" : "About"}
          </a>

          <a
            href={language === "pl" ? "/add-listing/pl" : "/add-listing/en"}
            className="transition hover:text-[#90A885]"
          >
            {language === "pl" ? "Dodaj włóczkę" : "Add Yarn"}
          </a>

          <a
            href={language === "pl" ? "/pl/faq" : "/en/faq"}
            className="transition hover:text-[#90A885]"
          >
            FAQ
          </a>

          <a
            href={language === "pl" ? "/pl/contact" : "/en/contact"}
            className="transition hover:text-[#90A885]"
          >
            {language === "pl" ? "Kontakt" : "Contact"}
          </a>

          <a
            href={language === "pl" ? "/pl/privacy" : "/en/privacy"}
            className="transition hover:text-[#90A885]"
          >
            {language === "pl"
              ? "Polityka prywatności"
              : "Privacy Policy"}
          </a>

          <a
            href="#"
            className="transition hover:text-[#90A885]"
          >
            ☕ {language === "pl"
              ? "Wesprzyj Dyeloty"
              : "Support Dyeloty"}
          </a>

        </div>

        <div className="mt-12 text-sm text-[#A0A0A0]">
          © 2026 Dyeloty
        </div>

      </div>
    </footer>
  );
}