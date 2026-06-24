import { supabase } from "./supabase";
import { ArrowRight } from "lucide-react";

export default async function Listings() {
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*");

  if (error) {
    return (
      <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        <div className="font-semibold">
          Supabase error
        </div>

        <div className="mt-2 text-sm">
          {error.message}
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-[#ECE7DF] bg-white p-8 text-center text-[#6F6F6F]">
        No listings yet.
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="rounded-[32px] border border-[#ECE7DF] bg-white p-7 transition duration-200 hover:-translate-y-1 hover:shadow-md"
        >
          {/* Brand */}
          <div className="text-sm text-[#8E8E8E]">
            {listing.brand}
          </div>

          {/* Yarn name */}
          <h3 className="mt-1 text-2xl font-semibold text-[#1F2A24]">
            {listing.yarn_name}
          </h3>

          {/* Details */}
          <div className="mt-6 space-y-2 text-[#6F6F6F]">
            <p>
              <span className="font-medium text-[#1F2A24]">
                Color
              </span>{" "}
              {listing.color}
            </p>

            <p>
              <span className="font-medium text-[#1F2A24]">
                Dyelot
              </span>{" "}
              {listing.dyelot}
            </p>
          </div>

          {/* Bottom */}
          <div className="mt-8 flex items-center justify-between">

            <div className="rounded-full bg-[#F5F8F1] px-4 py-2 text-sm font-medium text-[#90A885]">
              {listing.skeins} skeins
            </div>

            <button className="flex items-center gap-2 text-sm font-medium text-[#90A885] transition hover:text-[#7E9575]">
              View
              <ArrowRight size={16} />
            </button>

          </div>

        </div>
      ))}
    </div>
  );
}