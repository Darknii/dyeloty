import Header from "../Header";
import PrivacyPolicy from "../PrivacyPolicy";
import Footer from "../Footer";

export default function Page() {
  return (
    <>
      <Header language="pl" />

      <main className="mx-auto max-w-7xl px-6">
        <PrivacyPolicy language="pl" />
      </main>

      <Footer language="pl" />
    </>
  );
}
