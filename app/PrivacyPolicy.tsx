type Props = {
  language: "en" | "pl";
};

export default function PrivacyPolicy({ language }: Props) {
  const isPolish = language === "pl";

  return (
    <section className="mx-auto max-w-4xl py-16 text-[#17142E]">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7438B7]">
        Dyeloty
      </p>
      <h1 className="mt-3 text-4xl font-semibold">
        {isPolish ? "Prywatność" : "Privacy"}
      </h1>

      <div className="mt-8 rounded-[28px] border border-[#E8E1F0] bg-white p-6 leading-7 text-[#5F566F] shadow-[0_18px_55px_rgba(51,36,82,0.09)] sm:p-8">
        {isPolish ? (
          <div className="space-y-5">
            <p>
              Dyeloty to mały projekt tworzony po godzinach. Ta strona jest
              krótką informacją prywatności dla wersji MVP, a nie pełną
              polityką prawną.
            </p>
            <p>
              Logowanie w aplikacji działa przez Google i Supabase
              Authentication. Dzięki temu możesz dodać ogłoszenie, wrócić do
              swojego konta i zarządzać własnymi ogłoszeniami.
            </p>
            <p>
              Przechowujemy dane potrzebne do utworzenia i wyświetlenia
              ogłoszeń, takie jak marka włóczki, kolor, numer dye lotu,
              lokalizacja, status ogłoszenia oraz link do zewnętrznej oferty.
            </p>
            <p>
              Jeśli dodasz zdjęcie ogłoszenia, plik jest przechowywany w
              Supabase Storage i używany do pokazania ogłoszenia w Dyelotach.
            </p>
            <p>
              W sprawach dotyczących prywatności albo działania projektu możesz
              napisać na{" "}
              <a
                href="mailto:kontakt@dyeloty.pl"
                className="font-semibold text-[#7438B7] hover:underline"
              >
                kontakt@dyeloty.pl
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <p>
              Dyeloty is a small after-hours project. This page is a short MVP
              privacy note, not a full legal policy.
            </p>
            <p>
              Login uses Google and Supabase Authentication. The app stores the
              data needed to create, manage, and display listings.
            </p>
            <p>
              Uploaded listing photos are stored in Supabase Storage and used
              to display listings in Dyeloty.
            </p>
            <p>
              Questions can be sent to{" "}
              <a
                href="mailto:kontakt@dyeloty.pl"
                className="font-semibold text-[#7438B7] hover:underline"
              >
                kontakt@dyeloty.pl
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
