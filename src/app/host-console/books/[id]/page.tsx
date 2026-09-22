import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { BookForm } from "@/components/admin/book-form";
import { createClient } from "@/lib/supabase/server";
import { getAllCategories } from "@/lib/admin-data";
import { ADMIN_PATH } from "@/lib/defaults";
import type { Book } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: book }, categories] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).maybeSingle(),
    getAllCategories(),
  ]);

  if (!book) notFound();

  return (
    <div>
      <Link
        href={`${ADMIN_PATH}/books`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand-600 dark:hover:text-brand-400"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        All books
      </Link>
      <PageHeader title="Edit book" description={(book as Book).title} />
      {/* key: remount when moving between books, otherwise React reuses the
          form and its uncontrolled inputs keep the previous book's text. */}
      <BookForm key={(book as Book).id} categories={categories} book={book as Book} />
    </div>
  );
}
