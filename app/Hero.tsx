import Image from "next/image";

type Props = {
  language: "en" | "pl";
};

export default function Hero({ language }: Props) {
  const logo =
    language === "pl"
      ? "/images/logo-pl.svg"
      : "/images/logo-en.svg";

  const t =
    language === "pl"
      ? {
          placeholder:
            "Szukaj włóczki, np. Sandnes Sunday, Drops Air...",
          button: "Szukaj",
        }
      : {
          placeholder:
            "Search yarn, e.g. Sandnes Sunday, Drops Air...",
          button: "Search",
        };

  return (
    <section className="py-8">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">

        {/* Logo */}
        <div>
          <div className="relative mx-auto h-[180px] w-full max-w-[500px] lg:mx-0 lg:h-[260px]">
            <Image
              src={logo}
              alt="Dyeloty"
              fill
              priority
              className="object-contain lg:object-left"
            />
          </div>
        </div>

        {/* Wyszukiwarka */}
        <div className="flex justify-center">
          <div className="w-full max-w-[700px]">

            <div className="flex flex-col gap-2 rounded-3xl border border-[#ECE7DF] bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full">

              <input
                type="text"
                placeholder={t.placeholder}
                className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-[#8A8A8A] outline-none md:px-10 md:text-lg"
              />

              <button
                className="w-full rounded-full bg-[#90A885] px-6 py-3 text-base text-white transition hover:bg-[#809671] sm:w-auto md:px-12 md:py-4 md:text-lg"
              >
                {t.button}
              </button>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}