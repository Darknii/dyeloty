import { connection } from "next/server";
import { supabase } from "./supabase";
import type { ListingSearchItem } from "./ListingSearchResults";

export type ListingsLoadResult = {
  listings: ListingSearchItem[];
  error: boolean;
};

export async function getHomepageListings(): Promise<ListingsLoadResult> {
  await connection();

  const query = supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: listings, error } = await query.returns<ListingSearchItem[]>();

  if (error) {
    console.error("Could not load listings", error);
    return { listings: [], error: true };
  }

  return { listings: listings ?? [], error: false };
}
