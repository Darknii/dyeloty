type Props = {
  language: "en" | "pl";
};

export default function PrivacyPolicy({ language }: Props) {
  return (
    <section className="mx-auto max-w-4xl py-16">
      <h1 className="text-4xl font-semibold text-[#1F2A24]">
        {language === "pl" ? "Polityka prywatności" : "Privacy Policy"}
      </h1>

      <div className="mt-10 space-y-8 text-lg leading-9 text-[#6F6F6F]">

        {language === "pl" ? (
          <>
            <p>
              Dyeloty szanują Twoją prywatność.
            </p>

            <p>
              Dane potrzebne do korzystania z serwisu są przetwarzane wyłącznie
              w celu umożliwienia działania platformy.
            </p>

            <p>
              Logowanie odbywa się za pomocą Google. Dane użytkowników są
              przechowywane przy użyciu Supabase.
            </p>

            <p>
              Dyeloty nie sprzedają danych użytkowników osobom trzecim.
            </p>

            <p>
              W razie pytań można skontaktować się pod adresem:
              <br />
              <a
                href="mailto:dyeloty.contact@gmail.com"
                className="text-[#90A885] hover:underline"
              >
                dyeloty.contact@gmail.com
              </a>
            </p>
          </>
        ) : (
          <>
            <p>
              Dyeloty respects your privacy.
            </p>

            <p>
              Personal data is processed only to provide the functionality of
              the platform.
            </p>

            <p>
              Authentication is provided via Google and data is stored using
              Supabase.
            </p>

            <p>
              Dyeloty does not sell user data to third parties.
            </p>

            <p>
              Questions may be sent to:
              <br />
              <a
                href="mailto:dyeloty.contact@gmail.com"
                className="text-[#90A885] hover:underline"
              >
                dyeloty.contact@gmail.com
              </a>
            </p>
          </>
        )}
      </div>
    </section>
  );
}