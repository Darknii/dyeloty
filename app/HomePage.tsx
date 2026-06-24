import Header from "./Header";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Stats from "./Stats";
import Listings from "./Listings";
import SupportDyeloty from "./SupportDyeloty";
import Footer from "./Footer";

type Props = {
  language: "en" | "pl";
};

export default function HomePage({ language }: Props) {
  const t =
    language === "pl"
      ? {
          recent: "Ostatnio dodane",
        }
      : {
          recent: "Recently Added",
        };

  return (
    <main className="min-h-screen bg-[#F6F5F1] text-[#1F2A24]">
      <div className="mx-auto max-w-7xl px-8">

        <Header language={language} />

        <Hero language={language} />

        <HowItWorks language={language} />

        <Stats language={language} />

        <section className="mt-20">
          <h2 className="text-3xl font-semibold">
            {t.recent}
          </h2>

          <Listings />
        </section>

        <SupportDyeloty language={language} />

      </div>

      <Footer language={language} />
    </main>
  );
}