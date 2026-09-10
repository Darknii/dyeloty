import About from "../../About";
import SupportDyeloty from "../../SupportDyeloty";
import Footer from "../../Footer";

export default function Page() {
  return (
    <>
      <main className="mx-auto max-w-7xl px-6">
        <About language="pl" />
        <SupportDyeloty language="pl" />
      </main>

      <Footer language="pl" />
    </>
  );
}
