import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { MdxLead } from "@/components/Mdx";
import { getPage } from "@/lib/queries";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact");
  return { title: page?.seoTitle, description: page?.seoDescription };
}

export default async function ContactPage() {
  const page = await getPage("contact");

  return (
    <Container>
      {page?.emoji && <span className="text-4xl">{page.emoji}</span>}
      <Heading className="font-black mb-2">{page?.heading}</Heading>
      <MdxLead source={page?.introMdx ?? ""} className="mb-10 max-w-xl" />
      <Contact />
    </Container>
  );
}
