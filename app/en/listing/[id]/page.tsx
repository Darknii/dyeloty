import { ListingDetailsPage } from "../../../listing/[id]/page";

type Props = { params: Promise<{ id: string }> };

export default function EnglishListingDetailsPage({ params }: Props) {
  return <ListingDetailsPage params={params} language="en" />;
}
