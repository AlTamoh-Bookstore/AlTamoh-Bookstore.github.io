"use server";

import { createClient } from "@/lib/supabase/server";

export interface UploadResult {
  success: boolean;
  url?: string;
  message?: string;
}

const BUCKET = "book-covers";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Storage keys must be plain ASCII, so the extension comes from the MIME type. */
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Uploads a book cover to Supabase Storage and returns its public URL. Admin-only. */
export async function uploadBookCover(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authorized." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_suspended")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin" || profile.is_suspended) {
    return { success: false, message: "Not authorized." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Please choose an image." };
  }
  if (file.size > MAX_BYTES) {
    return { success: false, message: "Image must be 8 MB or smaller." };
  }
  if (!ALLOWED.includes(file.type)) {
    return { success: false, message: "Use a JPG, PNG, WebP, or AVIF image." };
  }

  // The object key is generated, never derived from the uploaded file's name:
  // Supabase Storage rejects keys containing non-ASCII characters, so an
  // Arabic file name (very common here) used to fail the upload outright.
  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `covers/${unique}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) {
    // Surface the real reason — hiding it behind a generic string made this
    // impossible to diagnose from the outside.
    return { success: false, message: `Upload failed: ${error.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { success: true, url: publicUrl };
}
