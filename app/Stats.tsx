import { Heart, BadgePlus, Sparkles } from "lucide-react";

type Props = {
  language: "en" | "pl";
};

export default function Stats({ language }: Props) {
  return (
    <section className="mt-14 border-y border-[#E8E3DB] py-12">
      <div className="grid gap-12 text-center md:grid-cols-3">

        {/* Users */}
        <div>
          <Heart
            size={42}
            strokeWidth={1.5}
            className="mx-auto text-[#90A885]"
          />

          <div className="mt-4 text-5xl font-bold text-[#1F2A24]">
            126
          </div>

          <div className="mt-2 text-[#6F6F6F]">
            {language === "pl" ? "Użytkowników" : "Users"}
          </div>
        </div>

        {/* Listings */}
        <div>
          <BadgePlus
            size={42}
            strokeWidth={1.5}
            className="mx-auto text-[#90A885]"
          />

          <div className="mt-4 text-5xl font-bold text-[#1F2A24]">
            478
          </div>

          <div className="mt-2 text-[#6F6F6F]">
            {language === "pl"
              ? "Aktywnych ogłoszeń"
              : "Active listings"}
          </div>
        </div>

        {/* Found skeins */}
        <div>
          <Sparkles
            size={42}
            strokeWidth={1.5}
            className="mx-auto text-[#90A885]"
          />

          <div className="mt-4 text-5xl font-bold text-[#1F2A24]">
            52
          </div>

          <div className="mt-2 text-[#6F6F6F]">
            {language === "pl"
              ? "Odnalezione motki"
              : "Found skeins"}
          </div>
        </div>

      </div>
    </section>
  );
}