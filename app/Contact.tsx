type Props = {
  language: "en" | "pl";
};

export default function Contact({ language }: Props) {
  return (
    <section className="mx-auto max-w-4xl py-16">

      <h1 className="text-4xl font-semibold text-[#1F2A24]">
        {language === "pl" ? "Kontakt" : "Contact"}
      </h1>

      <div className="mt-10 space-y-8 text-lg leading-9 text-[#6F6F6F]">

        {language === "pl" ? (
          <>
            <p>
              Masz pytanie, pomysł lub znalazłeś błąd?
            </p>

            <p>
              Dyeloty są rozwijane po godzinach, ale każda wiadomość jest mile widziana.
            </p>

            <div>
              <div className="font-medium text-[#1F2A24]">
                E-mail
              </div>

              <a
                href="mailto:dyeloty.contact@gmail.com"
                className="text-[#90A885] hover:underline"
              >
                dyeloty.contact@gmail.com
              </a>
            </div>

          </>
        ) : (
          <>
            <p>
              Questions, suggestions or bug reports are always welcome.
            </p>

            <p>
              Dyeloty is built after hours, but every message is appreciated.
            </p>

            <div>
              <div className="font-medium text-[#1F2A24]">
                E-mail
              </div>

              <a
                href="mailto:dyeloty.contact@gmail.com"
                className="text-[#90A885] hover:underline"
              >
                dyeloty.contact@gmail.com
              </a>
            </div>

          </>
        )}

      </div>

    </section>
  );
}