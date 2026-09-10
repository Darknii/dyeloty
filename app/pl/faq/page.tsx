import Faq from "../../Faq";
import SupportDyeloty from "../../SupportDyeloty";
import Footer from "../../Footer";

export default function Page() {
  return (
    <>
      <main className="mx-auto max-w-7xl px-6">
        <Faq language="pl" />
        <SupportDyeloty language="pl" />
      </main>

      <Footer language="pl" />
    </>
  );
}
