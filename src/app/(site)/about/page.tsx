import type { Metadata } from "next";
import About from "@/components/About";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { getPage } from "@/lib/queries";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return { title: page?.seoTitle, description: page?.seoDescription };
}

export default async function AboutPage() {
  const page = await getPage("about");

  return (
    <Container>
      {page?.emoji && <span className="text-4xl">{page.emoji}</span>}
      <Heading className="font-black">{page?.heading}</Heading>
      <About />
    </Container>
  );
}
