import Faq from "../../Faq";
import SupportDyeloty from "../../SupportDyeloty";
import Footer from "../../Footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dyeloty FAQ", description: "Frequently asked questions about Dyeloty.", alternates: { canonical: "/en/faq" } };

export default function Page() {
  return (
    <>
      <main className="mx-auto max-w-7xl px-6">
        <Faq language="en" />
        <SupportDyeloty language="en" />
      </main>

      <Footer language="en" />
    </>
  );
}
