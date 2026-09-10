import About from "../../About";
import SupportDyeloty from "../../SupportDyeloty";
import Footer from "../../Footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Dyeloty", description: "Learn how Dyeloty helps makers find matching yarn.", alternates: { canonical: "/en/about" } };

export default function Page() {
  return (
    <>
      <main className="mx-auto max-w-7xl px-6">
        <About language="en" />
        <SupportDyeloty language="en" />
      </main>

      <Footer language="en" />
    </>
  );
}
