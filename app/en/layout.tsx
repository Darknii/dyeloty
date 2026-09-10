import type { ReactNode } from "react";
import LocaleDocumentLanguage from "../LocaleDocumentLanguage";

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LocaleDocumentLanguage language="en" />
      {children}
    </>
  );
}
