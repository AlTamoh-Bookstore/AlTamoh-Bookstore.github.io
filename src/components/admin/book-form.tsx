"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { saveBook, type AdminResult } from "@/app/actions/admin";
import { uploadBookCover } from "@/app/actions/upload";
import { useLocale } from "@/components/providers/locale-provider";
import { BookCover } from "@/components/store/book-cover";
import { compressImage } from "@/lib/compress-image";
import type { Book, Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BookForm({
  categories,
  book,
}: {
  categories: Category[];
  book?: Book;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [coverUrl, setCoverUrl] = useState(book?.cover_url ?? "");
  const [gallery, setGallery] = useState<string[]>(book?.gallery ?? []);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [title, setTitle] = useState(book?.title ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const ids = new Set<string>(book?.category_ids ?? []);
    if (book?.category_id) ids.add(book.category_id);
    return Array.from(ids);
  });

  const [state, formAction, pending] = useActionState<AdminResult | null, FormData>(
    async (prev, formData) => {
      const result = await saveBook(prev, formData);
      if (result.success) {
        router.push("/host-console/books");
        router.refresh();
      }
      return result;
    },
    null
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", await compressImage(file));
    const result = await uploadBookCover(fd);
    if (result.success && result.url) {
      setCoverUrl(result.url);
    } else {
      setUploadError(result.message ?? "Upload failed.");
    }
    setUploading(false);
    e.target.value = ""; // allow re-picking the same file
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setGalleryUploading(true);
    setUploadError(null);
    const uploaded: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", await compressImage(file));
      const result = await uploadBookCover(fd);
      if (result.success && result.url) {
        uploaded.push(result.url);
      } else {
        setUploadError(result.message ?? "Upload failed.");
      }
    }
    if (uploaded.length > 0) setGallery((g) => [...g, ...uploaded]);
    setGalleryUploading(false);
    e.target.value = "";
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {book && <input type="hidden" name="id" value={book.id} />}
      <input type="hidden" name="cover_url" value={coverUrl} />

      <div className="space-y-6">
        <section className="card-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("adm.bookDetails")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title — العنوان (عربي)" required>
              <input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                dir="rtl"
                className="input-field"
              />
            </Field>
            <Field label="Title (English)">
              <input
                name="title_en"
                defaultValue={book?.title_en ?? ""}
                dir="ltr"
                placeholder="Shown when the store is in English"
                className="input-field"
              />
            </Field>
            <Field label="Author — المؤلف (عربي)" required>
              <input name="author" defaultValue={book?.author ?? ""} required dir="rtl" className="input-field" />
            </Field>
            <Field label="Author (English)">
              <input name="author_en" defaultValue={book?.author_en ?? ""} dir="ltr" className="input-field" />
            </Field>
            <Field label="Publisher — الناشر (عربي)">
              <input name="publisher" defaultValue={book?.publisher ?? ""} dir="rtl" className="input-field" />
            </Field>
            <Field label="Publisher (English)">
              <input name="publisher_en" defaultValue={book?.publisher_en ?? ""} dir="ltr" className="input-field" />
            </Field>
            <Field label="Language">
              <input name="language" defaultValue={book?.language ?? ""} placeholder="مثال: العربية" className="input-field" />
            </Field>
            <Field label="Pages — عدد الصفحات">
              <input name="pages" type="number" min="0" defaultValue={book?.pages ?? ""} className="input-field" />
            </Field>
            <Field label="Publication year — سنة النشر">
              <input
                name="publication_year"
                type="number"
                min="0"
                defaultValue={book?.publication_year ?? ""}
                className="input-field"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description — الوصف (عربي)">
                <textarea
                  name="description"
                  defaultValue={book?.description ?? ""}
                  rows={4}
                  dir="rtl"
                  className="input-field resize-y"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description (English)">
                <textarea
                  name="description_en"
                  defaultValue={book?.description_en ?? ""}
                  rows={4}
                  dir="ltr"
                  className="input-field resize-y"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="card-surface p-6">
          <h2 className="mb-1.5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("adm.categories")}
          </h2>
          <p className="mb-4 text-xs text-muted">
            {t("adm.categoriesPick")}
          </p>
          {categories.length === 0 ? (
            <p className="text-sm text-muted">{t("adm.noCatsYet")}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-navy-900/10 px-3 py-2 text-sm transition-colors hover:border-brand-500/50 dark:border-parchment-100/10"
                >
                  <input
                    type="checkbox"
                    name="category_ids"
                    value={c.id}
                    checked={selectedCategories.includes(c.id)}
                    onChange={(e) =>
                      setSelectedCategories((prev) =>
                        e.target.checked
                          ? [...prev, c.id]
                          : prev.filter((id) => id !== c.id)
                      )
                    }
                    className="h-4 w-4 rounded accent-[#ee7124]"
                  />
                  <span className="text-navy-950 dark:text-parchment-100">{c.name}</span>
                  {c.name_en && <span className="text-xs text-muted">· {c.name_en}</span>}
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="card-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("adm.pricingStock")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("adm.priceUsd")} required>
              <input
                name="price_usd"
                type="number"
                step="0.01"
                min="0"
                defaultValue={book?.price_usd ?? ""}
                required
                className="input-field"
              />
              <span className="mt-1 block text-xs text-muted">{t("adm.priceUsdHint")}</span>
            </Field>
            <Field label={t("adm.stock")} required>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={book?.stock ?? 0}
                required
                className="input-field"
              />
            </Field>
            <Field label={t("adm.discountPercent")}>
              <input
                name="discount_percent"
                type="number"
                min="0"
                max="95"
                step="1"
                defaultValue={book?.discount_percent ?? 0}
                placeholder="0"
                className="input-field"
              />
              <span className="mt-1 block text-xs text-muted">{t("adm.discountHint")}</span>
            </Field>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="card-surface p-6">
          <h2 className="mb-5 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("adm.coverImage")}
          </h2>
          <div className="mx-auto w-40">
            <BookCover title={title || "Untitled"} coverUrl={coverUrl || null} sizes="160px" />
          </div>
          <label htmlFor="cover-file" className="btn-outline mt-4 w-full cursor-pointer">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <Upload className="h-4 w-4" strokeWidth={1.75} />
            )}
            {uploading ? t("adm.uploading") : t("adm.uploadCover")}
          </label>
          <input
            id="cover-file"
            name="cover_file"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="sr-only"
          />
          {coverUrl && (
            <button
              type="button"
              onClick={() => setCoverUrl("")}
              className="mt-2 w-full text-xs font-medium text-red-600 hover:underline dark:text-red-400"
            >
              {t("adm.removeImage")}
            </button>
          )}
          {uploadError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{uploadError}</p>
          )}

          {/* Extra images — uploaded from the device, same as the cover. */}
          <div className="mt-6">
            <p className="label-field">{t("adm.galleryUrls")}</p>
            <input type="hidden" name="gallery" value={gallery.join("\n")} />
            {gallery.length > 0 && (
              <ul className="mb-3 grid grid-cols-3 gap-2">
                {gallery.map((url) => (
                  <li key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="aspect-[2/3] w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setGallery((g) => g.filter((u) => u !== url))}
                      aria-label={t("adm.removeImage")}
                      className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy-950/70 text-white transition-colors hover:bg-red-600"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label htmlFor="gallery-files" className="btn-outline w-full cursor-pointer">
              {galleryUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              ) : (
                <Upload className="h-4 w-4" strokeWidth={1.75} />
              )}
              {galleryUploading ? t("adm.uploading") : t("adm.addImages")}
            </label>
            <input
              id="gallery-files"
              name="gallery_files"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              disabled={galleryUploading}
              className="sr-only"
            />
          </div>
        </section>

        <section className="card-surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
            {t("adm.visibilityFlags")}
          </h2>
          <div className="space-y-3">
            <Toggle name="is_visible" label={t("adm.visibleOnStore")} defaultChecked={book?.is_visible ?? true} />
            <Toggle name="is_featured" label={t("adm.featured")} defaultChecked={book?.is_featured ?? false} />
            <Toggle name="is_bestseller" label={t("adm.bestseller")} defaultChecked={book?.is_bestseller ?? false} />
            <Toggle name="is_new_arrival" label={t("adm.newArrival")} defaultChecked={book?.is_new_arrival ?? false} />
          </div>
        </section>

        <div className="card-surface p-6">
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                {t("common.saving")}
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" strokeWidth={1.75} />
                {book ? t("adm.saveChanges") : t("adm.createBook")}
              </>
            )}
          </button>
          {state && !state.success && (
            <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
              {state.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-field">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-navy-900/80 dark:text-parchment-100/80">
      {label}
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className={cn("h-4 w-4 rounded accent-[#ee7124]")}
      />
    </label>
  );
}
