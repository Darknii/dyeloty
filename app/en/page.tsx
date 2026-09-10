import HomePage from "../HomePage";
import type { ListingFilters } from "../HomePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dyeloty — find yarn from the same dye lot",
  description: "A place for makers looking for yarn from the same dye lot.",
  alternates: { canonical: "/en" },
  openGraph: {
    title: "Dyeloty — find yarn from the same dye lot",
    description: "A place for makers looking for yarn from the same dye lot.",
    url: "/en",
    locale: "en_GB",
  },
};

type Props = {
  searchParams: Promise<ListingFilters>;
};

export default async function Page({ searchParams }: Props) {
  const filters = await searchParams;

  return <HomePage language="en" filters={filters} />;
}
