export type ListingStatus = "available" | "reserved" | "sold" | "found";

export const LISTING_STATUS_OPTIONS: Array<{
  value: ListingStatus;
  label: string;
}> = [
  { value: "available", label: "Dostępne" },
  { value: "reserved", label: "Zarezerwowane" },
  { value: "sold", label: "Sprzedane / nieaktualne" },
  { value: "found", label: "Znaleziono" },
];

export function normalizeListingStatus(status: string | null): ListingStatus {
  if (status === "reserved" || status === "sold" || status === "found") {
    return status;
  }

  return "available";
}

export function getListingStatusLabel(status: string | null) {
  return getLocalizedListingStatusLabel(status, "pl");
}

export function getLocalizedListingStatusLabel(
  status: string | null,
  language: "en" | "pl",
) {
  const normalizedStatus = normalizeListingStatus(status);
  if (language === "en") {
    return ({ available: "Available", reserved: "Reserved", sold: "Sold / inactive", found: "Found" })[
      normalizedStatus
    ];
  }
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

  if (normalizedStatus === "found") {
    return "bg-[#E8E1F0] text-[#6E6582]";
  }

  return "bg-[#DDF7E9] text-[#287A4D]";
}
