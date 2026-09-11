import { supabase } from "./supabase";

export const PROFILE_AVATAR_BUCKET = "profile-avatars";
export const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const PROFILE_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isProfileAvatarFile(file: File) {
  return PROFILE_AVATAR_TYPES.includes(file.type as (typeof PROFILE_AVATAR_TYPES)[number])
    && file.size <= PROFILE_AVATAR_MAX_BYTES;
}

export async function getProfileAvatarUrl(avatarPath: string | null | undefined) {
  if (!avatarPath) return null;

  // Keep any legacy URL displayable after the manual URL field is removed.
  if (/^https?:\/\//.test(avatarPath)) return avatarPath;

  const { data, error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .createSignedUrl(avatarPath, 60 * 60);

  return error ? null : data.signedUrl;
}

export async function uploadProfileAvatar(userId: string, file: File) {
  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  return error ? { path: null, error } : { path: filePath, error: null };
}

export async function removeProfileAvatar(avatarPath: string | null | undefined, userId: string) {
  if (!avatarPath || /^https?:\/\//.test(avatarPath) || !avatarPath.startsWith(`${userId}/`)) {
    return null;
  }

  const { error } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([avatarPath]);
  return error ?? null;
}
