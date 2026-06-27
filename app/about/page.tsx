import Header from "../Header";
import About from "../About";
import SupportDyeloty from "../SupportDyeloty";
import Footer from "../Footer";

export default function Page() {
  return (
    <>
      <Header language="pl" />

      <main className="bg-[#F7F4FB] px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <About language="pl" />
          <SupportDyeloty language="pl" />
        </div>
      </main>

      <Footer language="pl" />
    </>
  );
}
