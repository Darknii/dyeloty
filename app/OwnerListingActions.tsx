"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, UserRound } from "lucide-react";
import { supabase } from "./supabase";

type Props = {
  listingId: number | string;
  ownerId: string | null;
};

export default function OwnerListingActions({ listingId, ownerId }: Props) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkOwner() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setIsOwner(Boolean(ownerId && session?.user?.id === ownerId));
    }

    void checkOwner();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkOwner();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [ownerId]);

  if (!isOwner) {
    return null;
  }

  return (
    <div className="mt-5 rounded-2xl border border-[#E8E1F0] bg-[#FAF8FC] p-4">
      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#7438B7] shadow-sm">
        <UserRound size={16} />
        To Twoje ogłoszenie
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          href={`/edit-listing/${listingId}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7438B7] px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(116,56,183,0.20)] transition hover:bg-[#622CA2]"
        >
          <Pencil size={17} />
          Edytuj ogłoszenie
        </Link>
        <Link
          href="/account"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#7438B7] shadow-sm transition hover:bg-[#F4EEF9]"
        >
          Moje ogłoszenia
        </Link>
      </div>
    </div>
  );
}
