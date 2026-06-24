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
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">

        {/* Logo */}
        <div>
          <div className="relative h-[260px] w-full">
            <Image
              src={logo}
              alt="Dyeloty"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
        </div>

        {/* Wyszukiwarka */}
        <div className="flex items-center justify-center">

          <div className="w-full max-w-[700px]">

            <div className="flex items-center rounded-full border border-[#ECE7DF] bg-white p-2 shadow-sm">

              <input
                type="text"
                placeholder={t.placeholder}
                className="flex-1 bg-transparent px-10 py-2 text-lg text-[#8A8A8A] outline-none"
              />

              <button
                className="rounded-full bg-[#90A885] px-12 py-4 text-lg text-white transition hover:bg-[#809671]"
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