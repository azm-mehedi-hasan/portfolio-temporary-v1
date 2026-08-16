import type { Metadata } from "next";
import { Blogs } from "@/components/Blogs";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { MdxLead } from "@/components/Mdx";
import { getPage, getPosts } from "@/lib/queries";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("blog");
  return { title: page?.seoTitle, description: page?.seoDescription };
}

export default async function Blog() {
  const [page, posts] = await Promise.all([getPage("blog"), getPosts()]);

  const cards = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    coverImageUrl: post.coverImageUrl,
    tags: post.tags.map((t) => t.tag.name),
  }));

  return (
    <Container>
      {page?.emoji && <span className="text-4xl">{page.emoji}</span>}
      <Heading className="font-black pb-4">{page?.heading}</Heading>
      <MdxLead source={page?.introMdx ?? ""} className="pb-10" />
      <Blogs blogs={cards} />
    </Container>
  );
}
