import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/PostForm";
import { Button } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { tags: { include: { tag: true } } },
  });

  if (!post) notFound();

  return (
    <>
      <PageHeader
        title={post.title}
        description={`/blog/${post.slug}`}
        action={
          post.status === "PUBLISHED" ? (
            <Link href={`/blog/${post.slug}`} target="_blank">
              <Button variant="secondary">View live</Button>
            </Link>
          ) : undefined
        }
      />
      <PostForm
        initial={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          description: post.description,
          coverImageUrl: post.coverImageUrl,
          contentMdx: post.contentMdx,
          status: post.status,
          publishedAt: post.publishedAt
            ? post.publishedAt.toISOString().slice(0, 10)
            : "",
          tags: post.tags.map((t) => t.tag.name),
        }}
      />
    </>
  );
}
