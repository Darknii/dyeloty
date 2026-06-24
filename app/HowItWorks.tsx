import { Search, MessageCircle, Heart } from "lucide-react";

type Props = {
  language: "en" | "pl";
};

export default function HowItWorks({ language }: Props) {
  const t =
    language === "pl"
      ? {
          title: "Jak to działa?",
          step1: "Znajdź włóczkę",
          text1: "Wyszukaj włóczkę, której potrzebujesz do swojego projektu.",
          step2: "Skontaktuj się z właścicielem",
          text2: "Napisz do osoby, która ma włóczkę, której szukasz.",
          step3: "Dokończ projekt",
          text3: "Zdobądź brakujący motek i ciesz się ukończoną robótką.",
        }
      : {
          title: "How it works?",
          step1: "Find yarn",
          text1: "Search for the yarn you need for your project.",
          step2: "Contact the owner",
          text2: "Message the person who has the yarn you're looking for.",
          step3: "Finish your project",
          text3: "Get your missing skein and enjoy your finished project.",
        };

  return (
    <section className="-mt-6 border-t border-[#ECE7DF] pt-8">
      <h2 className="mb-8 text-center text-2xl font-semibold text-[#1F2A24]">
        {t.title}
      </h2>

      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">

        {/* STEP 1 */}
        <div className="mx-auto w-full max-w-[380px] rounded-3xl border border-[#ECE7DF] bg-white px-5 py-4">
          <div className="flex items-center gap-5">

            <div className="flex w-20 shrink-0 items-center justify-center gap-3">
              <div className="text-lg font-semibold text-[#90A885]">
                1
              </div>

              <Search
                size={28}
                strokeWidth={1.5}
                className="text-[#90A885]"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1F2A24]">
                {t.step1}
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#6F6F6F]">
                {t.text1}
              </p>
            </div>

          </div>
        </div>

        {/* STEP 2 */}
        <div className="mx-auto w-full max-w-[380px] rounded-3xl border border-[#ECE7DF] bg-white px-5 py-4">
          <div className="flex items-center gap-5">

            <div className="flex w-20 shrink-0 items-center justify-center gap-3">
              <div className="text-lg font-semibold text-[#90A885]">
                2
              </div>

              <MessageCircle
                size={28}
                strokeWidth={1.5}
                className="text-[#90A885]"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1F2A24]">
                {t.step2}
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#6F6F6F]">
                {t.text2}
              </p>
            </div>

          </div>
        </div>

        {/* STEP 3 */}
        <div className="mx-auto w-full max-w-[380px] rounded-3xl border border-[#ECE7DF] bg-white px-5 py-4">
          <div className="flex items-center gap-5">

            <div className="flex w-20 shrink-0 items-center justify-center gap-3">
              <div className="text-lg font-semibold text-[#90A885]">
                3
              </div>

              <Heart
                size={28}
                strokeWidth={1.5}
                className="text-[#90A885]"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1F2A24]">
                {t.step3}
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#6F6F6F]">
                {t.text3}
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}