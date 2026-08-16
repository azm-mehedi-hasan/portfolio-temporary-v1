"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deletePost } from "@/lib/actions/content";
import { Button } from "./ui";

export function PostRowActions({
  id,
  slug,
  title,
  published,
}: {
  id: string;
  slug: string;
  title: string;
  published: boolean;
}) {
  const router = useRouter();

  async function remove() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const result = await deletePost({ id });
    if (result.ok) {
      toast.success(result.message ?? "Deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-1" data-row-slug={slug}>
      {published && (
        <Link href={`/blog/${slug}`} target="_blank">
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      )}
      <Link href={`/admin/posts/${id}`}>
        <Button variant="secondary" size="sm">
          Edit
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={remove}
        className="text-red-600 hover:bg-red-50"
      >
        Delete
      </Button>
    </div>
  );
}
