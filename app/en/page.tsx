import HomePage from "../HomePage";
import type { ListingFilters } from "../HomePage";

type Props = {
  searchParams: Promise<ListingFilters>;
};

export default async function Page({ searchParams }: Props) {
  const filters = await searchParams;

  return <HomePage language="en" filters={filters} />;
}
