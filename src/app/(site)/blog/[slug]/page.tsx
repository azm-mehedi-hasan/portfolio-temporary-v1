import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogLayout } from "@/components/BlogLayout";
import { Mdx } from "@/components/Mdx";
import { getPostBySlug, getPostSlugs } from "@/lib/queries";

export const revalidate = 3600;

/**
 * Replaces the old one-folder-per-post routing. Slugs are unchanged, so every
 * previously published URL still resolves.
 */
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: [post.coverImageUrl],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <BlogLayout
      title={post.title}
      date={post.publishedAt}
      coverImageUrl={post.coverImageUrl}
      readingMinutes={post.readingMinutes}
    >
      <Mdx source={post.contentMdx} />
    </BlogLayout>
  );
}
