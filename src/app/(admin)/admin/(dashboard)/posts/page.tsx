import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button, Card, EmptyState, StatusPill } from "@/components/admin/ui";
import { PostRowActions } from "@/components/admin/PostRowActions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { tags: { include: { tag: true } } },
  });

  return (
    <>
      <PageHeader
        title="Articles"
        description="Everything under /blog. Drafts are hidden from the public site."
        action={
          <Link href="/admin/posts/new">
            <Button>New article</Button>
          </Link>
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="Write your first article to fill the blog."
          action={
            <Link href="/admin/posts/new">
              <Button>New article</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <Card key={post.id}>
              <div
                data-testid="post-row"
                data-row-slug={post.slug}
                className="flex items-center gap-3 p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {post.title}
                    </p>
                    <StatusPill status={post.status} />
                  </div>
                  <p className="truncate text-xs text-neutral-500">
                    {post.description}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    /{post.slug} &middot; {post.readingMinutes} min &middot;{" "}
                    {post.tags.map((t) => t.tag.name).join(", ") || "no tags"}
                  </p>
                </div>
                <PostRowActions
                  id={post.id}
                  slug={post.slug}
                  title={post.title}
                  published={post.status === "PUBLISHED"}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
