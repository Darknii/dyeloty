import Header from "../../Header";
import Contact from "../../Contact";
import SupportDyeloty from "../../SupportDyeloty";
import Footer from "../../Footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Dyeloty", description: "Contact the Dyeloty project team.", alternates: { canonical: "/en/contact" } };

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
