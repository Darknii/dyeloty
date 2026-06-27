export type ListingStatus = "available" | "reserved" | "sold";

export const LISTING_STATUS_OPTIONS: Array<{
  value: ListingStatus;
  label: string;
}> = [
  { value: "available", label: "Dostępne" },
  { value: "reserved", label: "Zarezerwowane" },
  { value: "sold", label: "Sprzedane / nieaktualne" },
];

export function normalizeListingStatus(status: string | null): ListingStatus {
  if (status === "reserved" || status === "sold") {
    return status;
  }

  return "available";
}

export function getListingStatusLabel(status: string | null) {
  const normalizedStatus = normalizeListingStatus(status);
  return (
    LISTING_STATUS_OPTIONS.find((option) => option.value === normalizedStatus)
      ?.label ?? "Dostępne"
  );
}

export function getListingStatusClassName(status: string | null) {
  const normalizedStatus = normalizeListingStatus(status);

  if (normalizedStatus === "reserved") {
    return "bg-[#FFF3D6] text-[#8A5B00]";
  }

  if (normalizedStatus === "sold") {
    return "bg-[#EEEAF3] text-[#6E6582]";
  }

  return "bg-[#DDF7E9] text-[#287A4D]";
}
