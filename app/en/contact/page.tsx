import Header from "../../Header";
import Contact from "../../Contact";
import SupportDyeloty from "../../SupportDyeloty";
import Footer from "../../Footer";

export default function Page() {
  return (
    <>
      <Header language="en" />

      <main className="mx-auto max-w-7xl px-6">
        <Contact language="en" />
        <SupportDyeloty language="en" />
      </main>

      <Footer language="en" />
    </>
  );
}