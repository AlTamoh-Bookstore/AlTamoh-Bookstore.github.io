/**
 * Shrinks a picture in the browser before it is uploaded.
 *
 * Book covers come straight off a phone or a scanner and are often 3–6 MB,
 * which is far larger than any page needs. Resizing and re-encoding here means
 * Supabase stores a small file and the storefront can serve it directly from
 * the CDN, with no server-side image optimization (and no transformation quota)
 * involved at all.
 *
 * Falls back to the original file if anything goes wrong, so an upload never
 * fails just because compression did.
 */

const MAX_EDGE = 1200; // px on the longest side — plenty for a cover
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  // SVGs are already tiny and vector; re-encoding would rasterise them.
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;

  try {
    const bitmap = await loadBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

    const blob = await canvasToBlob(canvas, "image/webp", QUALITY);
    if (!blob) return file;
    // Keep the original if re-encoding somehow made it bigger.
    if (blob.size >= file.size && scale === 1) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp", lastModified: Date.now() });
  } catch {
    return file;
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to the <img> path
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode failed"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
