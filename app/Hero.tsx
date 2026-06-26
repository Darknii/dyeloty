import Image from "next/image";

type Props = {
  language: "en" | "pl";
};

export default function Hero({ language }: Props) {
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
    <section className="pt-3 pb-4 md:py-8">

      <div className="grid items-center gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">

        {/* LOGO */}
        <div className="flex justify-center lg:justify-start">

       {/* MOBILE */}
<div className="flex justify-center md:hidden">
  <Image
    src="/images/logos/Dyeloty.svg"
    alt="Dyeloty"
    width={147}
    height={44}
    priority
    className="h-11 w-auto max-w-full"
  />
</div>

          {/* Desktop */}
          <div className="relative hidden h-[260px] w-full max-w-[700px] md:block">
            <Image
              src="/images/logos/Dyeloty.svg"
              alt="Dyeloty"
              width={320}
              height={96}
              priority
              className="h-auto w-full max-w-[320px]"
            />
          </div>

        </div>

        {/* SEARCH */}
        <div className="flex justify-center lg:justify-end">

          <div className="w-full max-w-[700px]">

            <div className="flex flex-col gap-2 rounded-3xl border border-[#ECE7DF] bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full">

              <input
                type="text"
                placeholder={t.placeholder}
                className="min-h-11 min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#8A8A8A] outline-none md:px-10 md:text-lg"
              />

              <button
                className="min-h-11 w-full rounded-full bg-[#90A885] px-6 py-3 text-base text-white transition hover:bg-[#809671] sm:w-auto md:px-12 md:py-4 md:text-lg"
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
