import Header from "../../Header";
import PrivacyPolicy from "../../PrivacyPolicy";
import SupportDyeloty from "../../SupportDyeloty";
import Footer from "../../Footer";

export default function Page() {
  return (
    <>
      <Header language="en" />

      <main className="mx-auto max-w-7xl px-6">
        <PrivacyPolicy language="en" />
        <SupportDyeloty language="en" />
      </main>

      <Footer language="en" />
    </>
  );
}