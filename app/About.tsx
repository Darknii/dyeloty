type Props = {
  language: "en" | "pl";
};

export default function About({ language }: Props) {
  return (
    <section className="mx-auto max-w-4xl py-16">

      <h1 className="text-4xl font-semibold text-[#1F2A24]">
        {language === "pl" ? "O projekcie" : "About"}
      </h1>

      <div className="mt-10 space-y-8 text-lg leading-9 text-[#6F6F6F]">

        {language === "pl" ? (
          <>
            <p>
              Dyeloty powstały z bardzo prostego problemu:
              brakującego motka.
            </p>

            <p>
              Każda dziewiarka zna ten moment, gdy do ukończenia
              projektu brakuje jednego motka, a kolor lub partia
              farbowania są już niedostępne.
            </p>

            <p>
              Dyeloty powstały po to, aby połączyć osoby, które
              szukają włóczki z tymi, które mają pojedyncze motki
              zalegające w swoich zapasach.
            </p>

            <p>
              Projekt jest tworzony po godzinach i rozwijany z
              miłości do dziewiarstwa oraz społeczności.
            </p>

            <p>
              ☕ Jeśli Dyeloty pomagają Ci dokończyć projekty,
              możesz wesprzeć rozwój strony.
            </p>
          </>
        ) : (
          <>
            <p>
              Dyeloty was born from a simple problem:
              the missing skein.
            </p>

            <p>
              Every knitter knows the feeling of being one skein
              short when a color or dye lot is no longer available.
            </p>

            <p>
              Dyeloty connects people searching for yarn with
              those who have spare skeins hidden in their stash.
            </p>

            <p>
              The project is built after hours and developed with
              love for knitting and its community.
            </p>

            <p>
              ☕ If Dyeloty helps you finish your projects,
              you can support its growth.
            </p>
          </>
        )}

      </div>

    </section>
  );
}