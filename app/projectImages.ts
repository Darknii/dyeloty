import { supabase } from "./supabase";

export const PROJECT_IMAGES_BUCKET = "project-images";
export const PROJECT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROJECT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isProjectImageFile(file: File) {
  return PROJECT_IMAGE_TYPES.includes(file.type as (typeof PROJECT_IMAGE_TYPES)[number])
    && file.size <= PROJECT_IMAGE_MAX_BYTES;
}

export async function getProjectImageUrl(imagePath: string | null | undefined) {
  if (!imagePath) return null;
  const { data, error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .createSignedUrl(imagePath, 60 * 60);
  return error ? null : data.signedUrl;
}

export async function uploadProjectImage(userId: string, file: File) {
  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `projects/${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
  return error ? { path: null, error } : { path, error: null };
}

export async function removeProjectImage(imagePath: string | null | undefined, userId: string) {
  if (!imagePath || !imagePath.startsWith(`projects/${userId}/`)) return null;
  const { error } = await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([imagePath]);
  return error ?? null;
}
