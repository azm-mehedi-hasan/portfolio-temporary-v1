import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { MdxLead } from "@/components/Mdx";
import { Products } from "@/components/Products";
import { getPage } from "@/lib/queries";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("projects");
  return { title: page?.seoTitle, description: page?.seoDescription };
}

export default async function Projects() {
  const page = await getPage("projects");

  return (
    <Container>
      {page?.emoji && <span className="text-4xl">{page.emoji}</span>}
      <Heading className="font-black mb-10">{page?.heading}</Heading>
      <MdxLead source={page?.introMdx ?? ""} className="max-w-xl mb-10" />
      <Products />
    </Container>
  );
}
