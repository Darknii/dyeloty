import { supabase } from "./supabase";

const LISTING_IMAGES_PUBLIC_MARKER = "/storage/v1/object/public/listing-images/";
const LISTING_IMAGES_ROOT = "listings/";

export function getListingImageStoragePath(
  imageUrl: string | null | undefined,
  userId?: string,
) {
  if (!imageUrl) {
    return null;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return null;
  }

  const markerIndex = parsedUrl.pathname.indexOf(LISTING_IMAGES_PUBLIC_MARKER);

  if (markerIndex === -1) {
    return null;
  }

  const encodedPath = parsedUrl.pathname.slice(
    markerIndex + LISTING_IMAGES_PUBLIC_MARKER.length,
  );
  const storagePath = decodeURIComponent(encodedPath);

  if (!storagePath.startsWith(LISTING_IMAGES_ROOT)) {
    return null;
  }

  if (userId && !storagePath.startsWith(`${LISTING_IMAGES_ROOT}${userId}/`)) {
    return null;
  }

  return storagePath;
}

export async function removeListingImageFromStorage(
  imageUrl: string | null | undefined,
  userId?: string,
) {
  const storagePath = getListingImageStoragePath(imageUrl, userId);

  if (!storagePath) {
    return null;
  }

  const { error } = await supabase.storage
    .from("listing-images")
    .remove([storagePath]);

  return error ?? null;
}
