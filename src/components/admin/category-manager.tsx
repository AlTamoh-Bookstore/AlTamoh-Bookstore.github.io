"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteCategory, saveCategory, type AdminResult } from "@/app/actions/admin";
import { useLocale } from "@/components/providers/locale-provider";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const { t } = useLocale();
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-navy-900/10 text-start text-xs uppercase tracking-wider text-muted dark:border-parchment-100/10">
                <th className="px-5 py-3 text-start font-semibold">{t("adm.colName")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("adm.colOrderNum")}</th>
                <th className="px-3 py-3 text-start font-semibold">{t("adm.colStatus")}</th>
                <th className="px-5 py-3 text-end font-semibold">{t("adm.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5 dark:divide-parchment-100/5">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted">
                    {t("adm.noCategories")}
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-navy-900/[0.02] dark:hover:bg-parchment-100/[0.02]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy-950 dark:text-parchment-100">
                        {category.name}
                        {category.name_en ? <span className="text-xs text-muted"> · {category.name_en}</span> : null}
                      </p>
                      <p className="text-xs text-muted">/{category.slug}</p>
                    </td>
                    <td className="px-3 py-3 text-muted">{category.sort_order}</td>
                    <td className="px-3 py-3">
                      {category.is_active ? (
                        <span className="badge bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          {t("adm.statusActive")}
                        </span>
                      ) : (
                        <span className="badge bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          {t("adm.statusInactive")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(category);
                            setShowForm(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-900/60 hover:bg-navy-900/5 hover:text-brand-600 dark:text-parchment-100/60 dark:hover:bg-parchment-100/10"
                          aria-label={t("adm.edit")}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={category.id} />
                          <button
                            type="submit"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-900/60 hover:bg-navy-900/5 hover:text-red-600 dark:text-parchment-100/60 dark:hover:bg-parchment-100/10"
                            aria-label={t("adm.delete")}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="btn-primary w-full"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            {t("adm.newCategory")}
          </button>
        ) : (
          <CategoryForm
            // Remount when switching records: the inputs are uncontrolled, so
            // without a key React keeps the previously edited category's text.
            key={editing?.id ?? "new"}
            category={editing}
            onDone={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}

function CategoryForm({
  category,
  onDone,
  onCancel,
}: {
  category: Category | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<AdminResult | null, FormData>(
    async (prev, formData) => {
      const result = await saveCategory(prev, formData);
      if (result.success) onDone();
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="card-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-navy-950 dark:text-parchment-50">
          {category ? t("adm.editCategory") : t("adm.newCategory")}
        </h2>
        <button type="button" onClick={onCancel} aria-label={t("common.cancel")} className="text-navy-900/40 dark:text-parchment-100/40">
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="space-y-4">
        <label className="block">
          <span className="label-field">Name — الاسم (عربي) *</span>
          <input name="name" defaultValue={category?.name ?? ""} required dir="rtl" className="input-field" />
        </label>
        <label className="block">
          <span className="label-field">Name (English)</span>
          <input
            name="name_en"
            defaultValue={category?.name_en ?? ""}
            dir="ltr"
            placeholder="Shown when the store is in English"
            className="input-field"
          />
        </label>
        <label className="block">
          <span className="label-field">{t("adm.descriptionL")} — العربية</span>
          <textarea name="description" defaultValue={category?.description ?? ""} rows={3} dir="rtl" className="input-field resize-y" />
        </label>
        <label className="block">
          <span className="label-field">{t("adm.descriptionL")} (English)</span>
          <textarea
            name="description_en"
            defaultValue={category?.description_en ?? ""}
            rows={3}
            dir="ltr"
            placeholder="Shown when the store is in English"
            className="input-field resize-y"
          />
        </label>
        <label className="block">
          <span className="label-field">{t("adm.colOrderNum")}</span>
          <input name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} className="input-field" />
        </label>
        <label className="flex cursor-pointer items-center justify-between text-sm text-navy-900/80 dark:text-parchment-100/80">
          {t("adm.visibleOnStore")}
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={category?.is_active ?? true}
            className="h-4 w-4 rounded accent-[#ee7124]"
          />
        </label>
      </div>
      <button type="submit" disabled={pending} className="btn-primary mt-5 w-full">
        {pending ? t("common.saving") : t("adm.saveCategory")}
      </button>
      {state && !state.success && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
