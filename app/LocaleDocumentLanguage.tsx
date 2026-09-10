"use client";

import { useEffect } from "react";

export default function LocaleDocumentLanguage({ language }: { language: "en" | "pl" }) {
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
